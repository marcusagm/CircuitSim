import Shape from '../shapes/Shape.js';
import Terminal from './Terminal.js';
import HandleBox from './HandleBox.js';

/**
 * Description:
 *  Represents an electronic component placed on the canvas. A Component has an SVG
 *  visual (optional), a rectangular bounding box, terminals (connection points),
 *  and supports rotation and horizontal/vertical flipping. The visual transformation
 *  (rotation + flips) is applied *mathematically* into an internal offscreen canvas
 *  to avoid mutating the global canvas transform state at draw time.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier.
 *  - positionX {number} (inherited): top-left X coordinate of the component (pixels).
 *  - positionY {number} (inherited): top-left Y coordinate of the component (pixels).
 *  - width {number} : width of the component (pixels).
 *  - height {number} : height of the component (pixels).
 *  - svgContent {string} : raw SVG XML/text used to render the visual (optional).
 *  - image {HTMLImageElement|null} : internal Image created from svgContent (not serialized).
 *  - loaded {boolean} : whether the image loaded successfully.
 *  - terminals {Array<Terminal>} : list of Terminal objects (positions are relative).
 *  - rotation {number} : rotation in degrees (clockwise).
 *  - flipH {boolean} : horizontal mirror flag.
 *  - flipV {boolean} : vertical mirror flag.
 *  - terminalsFollowTransform {boolean} : when true terminals are drawn using the same math transform.
 *  - hitMargin {number} (inherited) : extra pixels for hit-testing.
 *  - isSelected {boolean} (inherited) : selection state.
 *  - zIndex {number} (inherited) : rendering order.
 *
 * Typical usage:
 *   const c = new Component(10, 20, 48, 16, '<svg>...</svg>');
 *   c.addTerminal('A', 4, 8);
 *   canvas.addShape(c);
 *   canvas.render();
 *
 * Notes:
 *  - The offscreen transformed image is recomputed only when relevant properties change (rotation, flips, size, source).
 *  - The offscreen image is sized to contain the rotated bounding box so no clipping occurs.
 *  - dispose() clears internal caches and object URLs; call it when permanently removing the component.
 *
 * @class Component
 */
export default class Component extends Shape {
    /**
     * Internal width backing field.
     * @type {number}
     * @private
     */
    _width = 0;

    /**
     * Internal height backing field.
     * @type {number}
     * @private
     */
    _height = 0;

    /**
     * Internal svgContent backing field.
     * @type {string}
     * @private
     */
    _svgContent = '';

    /**
     * Internal image backing field.
     * @type {HTMLImageElement|null}
     * @private
     */
    _image = null;

    /**
     * Internal loaded state backing field.
     * @type {boolean}
     * @private
     */
    _loaded = false;

    /**
     * Terminals array (Terminal instances).
     * @type {Array<Terminal>}
     * @private
     */
    _terminals = [];

    /**
     * Rotation in degrees (clockwise).
     * @type {number}
     * @private
     */
    _rotation = 0;

    /**
     * Flip horizontally flag.
     * @type {boolean}
     * @private
     */
    _flipH = false;

    /**
     * Flip vertically flag.
     * @type {boolean}
     * @private
     */
    _flipV = false;

    /**
     * Whether terminals are drawn with the same transform as the component visual.
     * Defaults to false to preserve existing behavior.
     * @type {boolean}
     * @private
     */
    _terminalsFollowTransform = false;

    /**
     * Optional object URL used for the image created from svgContent.
     * @type {string|null}
     * @private
     */
    _objectUrl = null;

    /**
     * Offscreen canvas used to cache transformed (rotated/flipped) image.
     * @type {HTMLCanvasElement|null}
     * @private
     */
    _transformedCanvas = null;

    /**
     * Rotated bounding box width (CSS pixels) of the transformed image.
     * @type {number}
     * @private
     */
    _transformedBBoxWidth = 0;

    /**
     * Rotated bounding box height (CSS pixels) of the transformed image.
     * @type {number}
     * @private
     */
    _transformedBBoxHeight = 0;

    /**
     * Dirty flag indicating transformed cache must be refreshed.
     * @type {boolean}
     * @private
     */
    _transformedDirty = true;

    /**
     * Creates a new Component.
     *
     * @param {number} positionX - Top-left X coordinate in pixels.
     * @param {number} positionY - Top-left Y coordinate in pixels.
     * @param {number} width - Width in pixels.
     * @param {number} height - Height in pixels.
     * @param {string} [svgContent=''] - Optional raw SVG content to render.
     */
    constructor(positionX, positionY, width, height, svgContent = '') {
        super(positionX, positionY);

        const me = this;
        me.width = width;
        me.height = height;
        me.terminals = [];
        me.rotation = 0;
        me.flipH = false;
        me.flipV = false;
        me.terminalsFollowTransform = false;
        me.svgContent = svgContent;
    }

    /**
     * width getter.
     * @returns {number} Width in pixels.
     */
    get width() {
        return this._width;
    }

    /**
     * width setter with validation.
     *
     * @param {number} value - New width in pixels.
     * @returns {void}
     */
    set width(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 0) {
            console.warn(
                `[Component] invalid width assignment (${value}). Width must be a non-negative number. Keeping previous value: ${me._width}`
            );
            return;
        }
        me._width = v;
        me._transformedDirty = true;
    }

    /**
     * height getter.
     * @returns {number} Height in pixels.
     */
    get height() {
        return this._height;
    }

    /**
     * height setter with validation.
     *
     * @param {number} value - New height in pixels.
     * @returns {void}
     */
    set height(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 0) {
            console.warn(
                `[Component] invalid height assignment (${value}). Height must be a non-negative number. Keeping previous value: ${me._height}`
            );
            return;
        }
        me._height = v;
        me._transformedDirty = true;
    }

    /**
     * svgContent getter.
     * @returns {string} SVG XML/text.
     */
    get svgContent() {
        return this._svgContent;
    }

    /**
     * svgContent setter. Recreates internal Image (blob URL) and starts loading.
     *
     * @param {string} value - Raw SVG text.
     * @returns {void}
     */
    set svgContent(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Component] invalid svgContent assignment (${value}). Keeping previous value.`
            );
            return;
        }

        if (value === me._svgContent) return; // no-op

        if (me._objectUrl) {
            try {
                URL.revokeObjectURL(me._objectUrl);
            } catch (e) {
                /* ignore */
            }
            me._objectUrl = null;
        }

        me._svgContent = value;
        me._loaded = false;
        me._transformedDirty = true;

        if (!value) {
            me._image = null;
            return;
        }

        const blob = new Blob([value], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        me._objectUrl = url;
        const img = new Image();

        img.onload = function () {
            try {
                if (me._width === 0) me.width = this.naturalWidth || me.width || 0;
                if (me._height === 0) me.height = this.naturalHeight || me.height || 0;
            } catch (err) {
                console.error('[Component] error applying natural size after load', err);
            }
            me._loaded = true;
            me._transformedDirty = true;
            if (
                me.drawingManager &&
                me.drawingManager.canvas &&
                typeof me.drawingManager.canvas.requestRender === 'function'
            ) {
                me.drawingManager.canvas.requestRender();
            }
            try {
                URL.revokeObjectURL(url);
            } catch (e) {
                /* ignore revoke errors */
            }
            me._objectUrl = null;
        };

        img.onerror = function (ev) {
            const maxLenght = 200;
            console.error(
                `[Component] error loading SVG content (truncated): ${(value || '').substring(0, maxLenght)}`,
                ev
            );
            me._loaded = false;
            me._transformedDirty = true;
            try {
                URL.revokeObjectURL(url);
            } catch (e) {
                /* ignore */
            }
            me._objectUrl = null;
        };

        img.src = url;
        me._image = img;
    }

    /**
     * image getter.
     * @returns {HTMLImageElement|null} Internal image element or null.
     */
    get image() {
        return this._image;
    }

    /**
     * loaded getter.
     * @returns {boolean} True if internal image finished loading successfully.
     */
    get loaded() {
        return this._loaded;
    }

    /**
     * terminals getter.
     * @returns {Array<Terminal>} Terminals array.
     */
    get terminals() {
        return this._terminals;
    }

    /**
     * terminals setter.
     * @param {Array<Terminal>} value - New terminals array.
     * @returns {void}
     */
    set terminals(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[Component] invalid terminals assignment (${value}). Keeping previous value.`
            );
            return;
        }
        me._terminals = value;
    }

    /**
     * rotation getter.
     * @returns {number} Rotation in degrees.
     */
    get rotation() {
        return this._rotation;
    }

    /**
     * rotation setter - normalizes to [0,360).
     *
     * @param {number} value - Rotation in degrees.
     * @returns {void}
     */
    set rotation(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[Component] invalid rotation assignment (${value}). Keeping previous value: ${me._rotation}`
            );
            return;
        }
        me._rotation = ((v % 360) + 360) % 360;
        me._transformedDirty = true;
    }

    /**
     * flipH getter.
     * @returns {boolean} Horizontal flip flag.
     */
    get flipH() {
        return this._flipH;
    }

    /**
     * flipH setter.
     *
     * @param {boolean} value - New flipH value.
     * @returns {void}
     */
    set flipH(value) {
        const me = this;
        me._flipH = Boolean(value);
        me._transformedDirty = true;
    }

    /**
     * flipV getter.
     * @returns {boolean} Vertical flip flag.
     */
    get flipV() {
        return this._flipV;
    }

    /**
     * flipV setter.
     *
     * @param {boolean} value - New flipV value.
     * @returns {void}
     */
    set flipV(value) {
        const me = this;
        me._flipV = Boolean(value);
        me._transformedDirty = true;
    }

    /**
     * Whether terminals should be drawn inside the component transform.
     * @returns {boolean}
     */
    get terminalsFollowTransform() {
        return this._terminalsFollowTransform;
    }

    /**
     * Set whether terminals should be drawn inside the component transform.
     *
     * @param {boolean} value - True to draw terminals inside transform, false to draw them untransformed.
     * @returns {void}
     */
    set terminalsFollowTransform(value) {
        const me = this;
        me._terminalsFollowTransform = Boolean(value);
    }

    /**
     * Adds a terminal to the component at coordinates relative to the component origin.
     *
     * @param {string} id - Terminal identifier.
     * @param {number} x - X coordinate relative to component top-left.
     * @param {number} y - Y coordinate relative to component top-left.
     * @returns {Terminal} The created Terminal instance.
     */
    addTerminal(id, x, y) {
        const me = this;
        const terminal = new Terminal(id, x, y, me);
        me._terminals.push(terminal);
        return terminal;
    }

    /**
     * Internal: compute rotated bounding-box size for rectangle (w,h) rotated by theta radians.
     * Uses formula: bboxW = |w * cosθ| + |h * sinθ|; bboxH = |w * sinθ| + |h * cosθ|
     *
     * @param {number} w - width in CSS pixels.
     * @param {number} h - height in CSS pixels.
     * @param {number} theta - rotation in radians.
     * @returns {{bboxW:number,bboxH:number}} Bounding box dimensions.
     * @private
     */
    _computeRotatedBBox(w, h, theta) {
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const bboxW = Math.abs(w * cos) + Math.abs(h * sin);
        const bboxH = Math.abs(w * sin) + Math.abs(h * cos);
        return { bboxW, bboxH };
    }

    /**
     * Internal: updates the offscreen transformed canvas with the current image,
     * applying rotation (degrees) and flips. The offscreen canvas is sized to contain the
     * rotated bounding box (no clipping) and respects devicePixelRatio for crisp results.
     *
     * @returns {void}
     * @private
     */
    _updateTransformedImage() {
        const me = this;

        // If there's no source image or no size, clear transformed cache
        if (!me._image || !me.loaded || me.width <= 0 || me.height <= 0) {
            me._transformedCanvas = null;
            me._transformedBBoxWidth = 0;
            me._transformedBBoxHeight = 0;
            me._transformedDirty = false;
            return;
        }

        const outW = Number(me.width) || 0; // CSS pixels
        const outH = Number(me.height) || 0; // CSS pixels

        // rotation (radians)
        const thetaDeg = Number(me.rotation) || 0;
        const theta = (thetaDeg * Math.PI) / 180;

        // compute rotated bounding box (CSS pixels)
        const { bboxW, bboxH } = me._computeRotatedBBox(outW, outH, theta);

        // record bbox sizes in CSS pixels
        me._transformedBBoxWidth = bboxW;
        me._transformedBBoxHeight = bboxH;

        // device pixel ratio support
        const dpr =
            typeof window !== 'undefined' && window.devicePixelRatio
                ? Number(window.devicePixelRatio) || 1
                : 1;

        // create offscreen canvas sized to bounding box * dpr
        if (!me._transformedCanvas) {
            me._transformedCanvas = document.createElement('canvas');
        }
        const tcan = me._transformedCanvas;

        // choose integer pixel dimensions for backing store
        tcan.width = Math.max(1, Math.ceil(bboxW * dpr));
        tcan.height = Math.max(1, Math.ceil(bboxH * dpr));

        const ctx = tcan.getContext('2d');

        // Clear backing store
        ctx.clearRect(0, 0, tcan.width, tcan.height);

        // Map coordinate system to CSS pixels (account for DPR)
        ctx.save();
        ctx.scale(dpr, dpr);

        // Translate to center of bounding box in CSS pixels
        const cx = bboxW / 2;
        const cy = bboxH / 2;
        ctx.translate(cx, cy);

        // Apply rotation (theta) and flips (scale). IMPORTANT: apply flips (scale) then rotation
        // so the visual matches Component.draw() mathematical order we use for terminals.
        // To render the source image (which represents the untransformed rectangle of size outW x outH),
        // we need to position it so its center maps to origin: drawImage at (-outW/2, -outH/2)
        // Steps: scale(flips) -> rotate(theta) -> drawImage centered.

        const scaleX = me.flipH ? -1 : 1;
        const scaleY = me.flipV ? -1 : 1;
        // Apply scale first
        ctx.scale(scaleX, scaleY);
        // Then rotation
        if (theta !== 0) ctx.rotate(theta);

        // Draw source image scaled to outW/outH centered at origin
        try {
            ctx.drawImage(me._image, -outW / 2, -outH / 2, outW, outH);
        } catch (err) {
            // If drawImage fails (image not ready), ignore; _transformedDirty remains true to retry later
            console.error('[Component] _updateTransformedImage drawImage error', err);
        }

        ctx.restore();

        me._transformedDirty = false;
    }

    /**
     * Draw the component visual and its terminals without mutating global canvas transform.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;

        // Ensure transformed cache is updated
        if (me._transformedDirty) {
            me._updateTransformedImage();
        }

        // If we have a transformed cache, we must compute the correct top-left so that
        // the center of the transformed bounding box matches the component center.
        if (
            me._transformedCanvas &&
            me._transformedBBoxWidth > 0 &&
            me._transformedBBoxHeight > 0
        ) {
            const drawX = me.positionX + me.width / 2 - me._transformedBBoxWidth / 2;
            const drawY = me.positionY + me.height / 2 - me._transformedBBoxHeight / 2;
            // Draw transformed backing store. Provide width/height in CSS pixels to canvas.drawImage.
            canvas.drawImage(
                me._transformedCanvas,
                drawX,
                drawY,
                me._transformedBBoxWidth,
                me._transformedBBoxHeight
            );
        } else if (me.loaded && me._image) {
            // fallback: draw source image scaled to width/height if transformed cache missing
            canvas.drawImage(me._image, me.positionX, me.positionY, me.width, me.height);
        } else if (!me.svgContent) {
            // placeholder visual
            canvas
                .setStrokeColor(me.color)
                .setStrokeWidth(me.lineWidth)
                .setFillColor('#f0f0f0')
                .rectangle(me.positionX, me.positionY, me.width, me.height)
                .fill()
                .setStrokeColor('#999')
                .stroke()
                .line(me.positionX, me.positionY, me.positionX + me.width, me.positionY + me.height)
                .stroke()
                .line(me.positionX, me.positionY + me.height, me.positionX + me.width, me.positionY)
                .stroke()
                .restore();
        }

        // Draw terminals: terminals compute their absolute positions mathematically (terminalsFollowTransform)
        me._terminals.forEach(term => term.draw(canvas));

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: transforms the test point into component-local coordinates by applying
     * the inverse of the component transform (translate to center, inverse rotate, inverse flip),
     * then performs axis-aligned bounding-box test with hitMargin.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} testX - X coordinate to test.
     * @param {number} testY - Y coordinate to test.
     * @returns {boolean} True if point is inside (with hitMargin), false otherwise.
     */
    isHit(canvas, testX, testY) {
        const me = this;
        const margin = Number(me.hitMargin) || 0;

        // center of component
        const cx = Number(me.positionX) + Number(me.width) / 2;
        const cy = Number(me.positionY) + Number(me.height) / 2;

        // translate test point relative to center
        const tx = Number(testX) - cx;
        const ty = Number(testY) - cy;

        // rotation (coerce to number, default 0)
        const thetaDeg = Number(me.rotation);
        const theta = Number.isFinite(thetaDeg) ? (thetaDeg * Math.PI) / 180 : 0;

        // inverse rotation: rotate by -theta
        const cos = Math.cos(-theta);
        const sin = Math.sin(-theta);
        let rx = tx * cos - ty * sin;
        let ry = tx * sin + ty * cos;

        // inverse scale (handles flips). Ensure values are ±1 (never 0/NaN).
        const scaleX = me.flipH ? -1 : 1;
        const scaleY = me.flipV ? -1 : 1;
        const invScaleX = scaleX === 0 ? 1 : scaleX;
        const invScaleY = scaleY === 0 ? 1 : scaleY;

        rx = rx / invScaleX;
        ry = ry / invScaleY;

        // bring back to absolute coordinates in component space
        const localX = rx + cx;
        const localY = ry + cy;

        // axis-aligned AABB test in component space (includes margin)
        const minX = Number(me.positionX) - margin;
        const minY = Number(me.positionY) - margin;
        const maxX = Number(me.positionX) + Number(me.width) + margin;
        const maxY = Number(me.positionY) + Number(me.height) + margin;

        return localX >= minX && localX <= maxX && localY >= minY && localY <= maxY;
    }

    /**
     * Move the component and (implicitly) its terminals by deltas.
     *
     * @param {number} deltaX - Horizontal shift in pixels.
     * @param {number} deltaY - Vertical shift in pixels.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
        // terminals are stored relative to component; no additional updates required
    }

    /**
     * Rotate the component by given degrees (relative add).
     *
     * @param {number} degrees - Degrees to rotate clockwise.
     * @returns {void}
     */
    rotate(degrees) {
        const me = this;
        me.rotation = (me.rotation + Number(degrees)) % 360;
    }

    /**
     * Toggle horizontal flip.
     *
     * @returns {void}
     */
    flipHorizontal() {
        const me = this;
        me.flipH = !me.flipH;
    }

    /**
     * Toggle vertical flip.
     *
     * @returns {void}
     */
    flipVertical() {
        const me = this;
        me.flipV = !me.flipV;
    }

    /**
     * Edit mutable properties of the component via setters.
     *
     * Supported properties: positionX, positionY, width, height, svgContent, rotation, flipH, flipV, terminalsFollowTransform
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void}
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = [
            'positionX',
            'positionY',
            'width',
            'height',
            'svgContent',
            'rotation',
            'flipH',
            'flipV',
            'terminalsFollowTransform'
        ];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draw selection handles (box) around the component.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        const me = this;
        new HandleBox(me.positionX, me.positionY, me.width, me.height, me, false).draw(canvas);
    }

    /**
     * Returns the axis-aligned bounding box for the component (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box object.
     */
    getBoundingBox() {
        const me = this;
        const margin = Number(me.hitMargin) || 0;
        return {
            x: me.positionX - margin,
            y: me.positionY - margin,
            width: me.width + margin * 2,
            height: me.height + margin * 2
        };
    }

    /**
     * Serialize component to JSON (note: internal DOM Image and offscreen canvas are not serialized).
     *
     * @returns {Object} JSON-serializable representation.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            width: me.width,
            height: me.height,
            svgContent: me.svgContent,
            rotation: me.rotation,
            flipH: me.flipH,
            flipV: me.flipV,
            terminals: me.terminals.map(t => (t && typeof t.toJSON === 'function' ? t.toJSON() : t))
        });
    }

    /**
     * Recreate a Component from JSON previously produced by toJSON().
     *
     * @param {Object} json - JSON object produced by toJSON.
     * @returns {Component} New Component instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for Component.fromJSON');
        const instance = new Component(
            Number(json.x) || 0,
            Number(json.y) || 0,
            Number(json.width) || 0,
            Number(json.height) || 0,
            json.svgContent || ''
        );
        instance.edit({
            rotation: json.rotation,
            flipH: json.flipH,
            flipV: json.flipV,
            terminalsFollowTransform: json.terminalsFollowTransform
        });
        if (Array.isArray(json.terminals)) {
            instance._terminals = json.terminals.map(td =>
                typeof Terminal.fromJSON === 'function' ? Terminal.fromJSON(td, instance) : td
            );
        }
        if (json.id) instance.uniqueId = json.id;
        return instance;
    }

    /**
     * Clean up resources held by this component (revoke object URLs, remove image handlers, release references).
     * Call this when the component will be permanently removed to avoid memory / URL leaks.
     *
     * @returns {void}
     */
    dispose() {
        const me = this;
        if (me._image) {
            try {
                me._image.onload = null;
                me._image.onerror = null;
            } catch (e) {
                // ignore
            }
            me._image = null;
        }
        if (me._objectUrl) {
            try {
                URL.revokeObjectURL(me._objectUrl);
            } catch (e) {
                // ignore
            }
            me._objectUrl = null;
        }
        if (me._transformedCanvas) {
            try {
                me._transformedCanvas.width = 0;
                me._transformedCanvas.height = 0;
            } catch (e) {
                // ignore
            }
            me._transformedCanvas = null;
        }
        me._terminals = [];
        try {
            me.drawingManager = undefined;
        } catch (e) {
            // ignore
        }
    }
}
