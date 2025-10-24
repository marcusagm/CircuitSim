import Shape from './Shape.js';
import HandleBox from '../components/HandleBox.js';

/**
 * Description: Represents an SVG graphic rendered on the canvas via an internal Image created from an SVG Blob.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier.
 *  - positionX {number} (inherited): top-left X coordinate (pixels).
 *  - positionY {number} (inherited): top-left Y coordinate (pixels).
 *  - svgContent {string} : raw SVG XML/text content.
 *  - width {number} : rendered width in pixels.
 *  - height {number} : rendered height in pixels.
 *  - image {HTMLImageElement|null} : internal Image used to draw the SVG (not serialized).
 *  - loaded {boolean} : whether internal image finished loading successfully.
 *  - drawingManager {Object|undefined} : optional external manager for requesting renders.
 *  - hitMargin {number} (inherited): extra pixels for hit-testing.
 *  - isSelected {boolean} (inherited): selection state.
 *  - zIndex {number} (inherited): rendering order.
 *
 * Typical usage:
 *   const svg = '<svg ...>...</svg>';
 *   const shape = new SVGDrawing(10, 20, svg);
 *   canvas.addShape(shape);
 *   canvas.render();
 *
 * Notes:
 *  - svgContent is converted to a Blob and loaded into an Image via a temporary object URL.
 *  - URL.revokeObjectURL is called after load/error to avoid leaks.
 *  - Setters centralize validation. Invalid assignments are ignored and produce standardized console.warn messages.
 *
 * @class SVGDrawing
 */
export default class SVGDrawing extends Shape {
    /**
     * Internal svgContent backing field
     *
     * @type {string}
     * @private
     */
    _svgContent = '';

    /**
     * Internal width backing field
     *
     * @type {number}
     * @private
     */
    _width = 0;

    /**
     * Internal height backing field
     *
     * @type {number}
     * @private
     */
    _height = 0;

    /**
     * Internal image backing field (HTMLImageElement) or null
     *
     * @type {HTMLImageElement|null}
     * @private
     */
    _image = null;

    /**
     * Internal loaded state backing field
     *
     * @type {boolean}
     * @private
     */
    _loaded = false;

    /**
     * Optional external drawing manager (host may set).
     *
     * @type {Object|undefined}
     * @private
     */
    _drawingManager = undefined;

    /**
     * Creates a new SVGDrawing instance.
     *
     * @param {number} positionX - Top-left X coordinate in pixels.
     * @param {number} positionY - Top-left Y coordinate in pixels.
     * @param {string} svgContent - Raw SVG XML/text.
     * @param {number} [width=0] - Desired render width (0 = natural after load).
     * @param {number} [height=0] - Desired render height (0 = natural after load).
     */
    constructor(positionX, positionY, svgContent, width = 0, height = 0) {
        super(positionX, positionY);
        const me = this;

        me._drawingManager = undefined;

        // initialize via setters so validation and side-effects apply
        me.svgContent = svgContent;
        me.width = width;
        me.height = height;
        me._loaded = false;
    }

    /**
     * svgContent getter.
     *
     * @returns {string} The raw SVG text.
     */
    get svgContent() {
        return this._svgContent;
    }

    /**
     * svgContent setter. Converts the SVG text into an object URL and loads it into an internal Image.
     * On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - SVG XML/text content.
     */
    set svgContent(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[SVGDrawing] invalid svgContent assignment (${value}). Keeping previous value.`
            );
            return;
        }

        // if identical content and we have an image, do nothing
        if (value === me._svgContent && me._image) return;

        me._svgContent = value;
        me._loaded = false;

        // load svg into image via blob URL
        me._loadSVGFromContent(value);
    }

    /**
     * width getter.
     *
     * @returns {number} Render width in pixels.
     */
    get width() {
        return this._width;
    }

    /**
     * width setter with validation.
     * Accepts non-negative numbers only. On invalid value logs a warning and keeps previous value.
     *
     * @param {number} value - New width in pixels.
     */
    set width(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 0) {
            console.warn(
                `[SVGDrawing] invalid width assignment (${value}). Width must be a non-negative number. Keeping previous value: ${me._width}`
            );
            return;
        }
        me._width = v;
    }

    /**
     * height getter.
     *
     * @returns {number} Render height in pixels.
     */
    get height() {
        return this._height;
    }

    /**
     * height setter with validation.
     * Accepts non-negative numbers only. On invalid value logs a warning and keeps previous value.
     *
     * @param {number} value - New height in pixels.
     */
    set height(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 0) {
            console.warn(
                `[SVGDrawing] invalid height assignment (${value}). Height must be a non-negative number. Keeping previous value: ${me._height}`
            );
            return;
        }
        me._height = v;
    }

    /**
     * image getter.
     *
     * @returns {HTMLImageElement|null} Internal Image element or null.
     */
    get image() {
        return this._image;
    }

    /**
     * loaded getter.
     *
     * @returns {boolean} True if the internal image is loaded.
     */
    get loaded() {
        return this._loaded;
    }

    /**
     * drawingManager getter.
     *
     * @returns {Object|undefined} Optional drawing manager.
     */
    get drawingManager() {
        return this._drawingManager;
    }

    /**
     * drawingManager setter.
     *
     * @param {Object|undefined} value - Optional external drawing manager with canvas.requestRender().
     */
    set drawingManager(value) {
        const me = this;
        me._drawingManager = value;
    }

    /**
     * Internal helper: load SVG content into internal Image via Blob object URL.
     *
     * @param {string} content - SVG XML/text to load.
     * @returns {void} Nothing.
     * @private
     */
    _loadSVGFromContent(content) {
        const me = this;

        // cleanup previous object URL if any
        if (me._objectUrl) {
            try {
                URL.revokeObjectURL(me._objectUrl);
            } catch (e) {
                // ignore
            }
            me._objectUrl = null;
        }

        // Create blob + object URL
        const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        me._objectUrl = url;

        // create image and assign handlers
        const img = new Image();
        img.onload = function () {
            try {
                if (me._width === 0) me.width = this.naturalWidth || this.width || 0;
                if (me._height === 0) me.height = this.naturalHeight || this.height || 0;
            } catch (err) {
                console.error('[SVGDrawing] error applying natural size after load', err);
            }
            me._loaded = true;
            // notify host/drawing manager if available
            if (
                me._drawingManager &&
                me._drawingManager.canvas &&
                typeof me._drawingManager.canvas.requestRender === 'function'
            ) {
                me._drawingManager.canvas.requestRender();
            }
            // revoke object URL
            try {
                URL.revokeObjectURL(url);
                me._objectUrl = null;
            } catch (e) {
                // ignore revoke errors
            }
        };
        img.onerror = function (ev) {
            const maxString = 200;
            console.error(
                '[SVGDrawing] error loading SVG content (truncated):',
                (content || '').substring(0, maxString),
                ev
            );
            me._loaded = false;
            try {
                URL.revokeObjectURL(url);
                me._objectUrl = null;
            } catch (e) {
                // ignore
            }
        };

        // set src after handlers to ensure events catch
        img.src = url;
        me._image = img;
    }

    /**
     * Draws the SVG (via internal Image) on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    draw(canvas) {
        const me = this;
        if (me.loaded && me._image) {
            canvas.drawImage(me._image, me.positionX, me.positionY, me.width, me.height);
        }

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: true if test point is inside the SVG bounding box (including hitMargin).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} testX - X coordinate to test.
     * @param {number} testY - Y coordinate to test.
     * @returns {boolean} True if the point hits the SVG drawing.
     */
    isHit(canvas, testX, testY) {
        const me = this;
        if (!me.loaded) return false;
        const margin = Number(me.hitMargin) || 0;
        const minX = me.positionX - margin;
        const minY = me.positionY - margin;
        const maxX = me.positionX + me.width + margin;
        const maxY = me.positionY + me.height + margin;
        return testX >= minX && testX <= maxX && testY >= minY && testY <= maxY;
    }

    /**
     * Move the SVG drawing by given deltas (updates canonical position).
     *
     * @param {number} deltaX - Horizontal shift.
     * @param {number} deltaY - Vertical shift.
     * @returns {void} Nothing.
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
    }

    /**
     * Edit properties of the SVGDrawing via setters.
     *
     * Supported properties: svgContent, width, height, positionX, positionY
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void} Nothing.
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = ['svgContent', 'width', 'height', 'positionX', 'positionY'];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draw selection handles (box) around the SVG drawing.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    drawSelectionHandles(canvas) {
        const me = this;
        if (!me.loaded) return;
        new HandleBox(me.positionX, me.positionY, me.width, me.height, me, true).draw(canvas);
    }

    /**
     * Returns axis-aligned bounding box for the SVG drawing (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box of the SVG drawing.
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
     * Serializes the SVGDrawing to JSON.
     *
     * @returns {Object} JSON object representing the SVG drawing.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            svgContent: me.svgContent,
            width: me.width,
            height: me.height,
            loaded: me.loaded
        });
    }

    /**
     * Recreates a SVGDrawing instance from JSON produced by toJSON.
     *
     * @param {Object} json - JSON object produced by toJSON.
     * @returns {SVGDrawing} New SVGDrawing instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for SVGDrawing.fromJSON');
        const instance = new SVGDrawing(
            Number(json.x) || 0,
            Number(json.y) || 0,
            json.svgContent || '',
            Number(json.width) || 0,
            Number(json.height) || 0
        );
        if (json.id) instance.uniqueId = json.id;
        return instance;
    }
}
