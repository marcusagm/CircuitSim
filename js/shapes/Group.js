import Shape from './Shape.js';
import HandleBox from '../components/HandleBox.js';

/**
 * Description:
 *  Composite shape that groups multiple drawable shapes and treats them as a single unit.
 *  Group stores its children with positions relative to the group's origin so the group can
 *  be moved/serialized as one element. Child shapes are drawn at absolute positions computed
 *  from group's position plus each child's relative offset.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited) : read-only identifier.
 *  - positionX {number} (inherited) : group's top-left X coordinate (world).
 *  - positionY {number} (inherited) : group's top-left Y coordinate (world).
 *  - width {number} : group's width in pixels (computed from children or editable).
 *  - height {number} : group's height in pixels (computed from children or editable).
 *  - children {Array<Shape>} : child shapes stored with positions relative to the group origin.
 *  - rotation {number} : rotation in degrees (currently informational; does not transform children).
 *  - flipH {boolean} : horizontal flip flag (informational).
 *  - flipV {boolean} : vertical flip flag (informational).
 *
 * Typical usage:
 *   const g = new Group([shapeA, shapeB]);
 *   drawingManager.addElement(g);
 *   g.move(10, 0); // moves group and children visually as a unit
 *
 * Notes / Additional:
 *  - Children are normalized to positions relative to the group's origin at construction.
 *  - Group drawing does not use canvas transforms; children are drawn by temporarily applying
 *    absolute positions to them during draw and then restoring their previous positions.
 *  - Many transform operations (rotate/flip) are placeholders: full per-child transform logic
 *    should be implemented when needed. This preserves predictable coordinates for hit-tests.
 *
 * @class Group
 */
export default class Group extends Shape {
    /**
     * Internal children backing field (array of shapes).
     * Children stored here have their positionX/positionY adjusted to be relative to the group origin.
     *
     * @type {Array<import('./Shape.js').default>}
     * @private
     */
    _children = [];

    /**
     * Internal width backing field.
     *
     * @type {number}
     * @private
     */
    _width = 0;

    /**
     * Internal height backing field.
     *
     * @type {number}
     * @private
     */
    _height = 0;

    /**
     * Internal rotation backing field (degrees).
     *
     * @type {number}
     * @private
     */
    _rotation = 0;

    /**
     * Internal flip horizontal backing field.
     *
     * @type {boolean}
     * @private
     */
    _flipH = false;

    /**
     * Internal flip vertical backing field.
     *
     * @type {boolean}
     * @private
     */
    _flipV = false;

    /**
     * Creates an instance of Group.
     *
     * @param {Array<import('./Shape.js').default>} [children=[]] - An array of Shape objects to include in the group.
     */
    constructor(children = []) {
        // compute bounding box of provided children (use their public getters)
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        // tolerate empty children
        if (!Array.isArray(children)) children = [];

        for (const child of children) {
            if (!child || typeof child.getBoundingBox !== 'function') continue;
            const bounds = child.getBoundingBox();
            const bx = Number(bounds.x) || 0;
            const by = Number(bounds.y) || 0;
            const bw = Number(bounds.width) || 0;
            const bh = Number(bounds.height) || 0;
            if (bx < minX) minX = bx;
            if (by < minY) minY = by;
            if (bx + bw > maxX) maxX = bx + bw;
            if (by + bh > maxY) maxY = by + bh;
        }

        // fallbacks for empty set
        if (!isFinite(minX)) minX = 0;
        if (!isFinite(minY)) minY = 0;
        if (!isFinite(maxX)) maxX = minX;
        if (!isFinite(maxY)) maxY = minY;

        // initialize Shape with group's top-left at minX,minY
        super(minX, minY);

        const me = this;

        // compute group dimensions
        me._width = Math.max(0, maxX - minX);
        me._height = Math.max(0, maxY - minY);

        // normalize children positions to be relative to group origin
        me._children = [];
        for (const child of children) {
            if (!child) continue;
            // capture child's absolute original position
            const absX = Number(child.positionX) || 0;
            const absY = Number(child.positionY) || 0;
            // compute relative
            const relX = absX - me.positionX;
            const relY = absY - me.positionY;
            // store original absolute position on the instance so we can restore if needed
            // then set child's position to relative so that edit()/toJSON() on child remains valid
            child.positionX = relX;
            child.positionY = relY;
            me._children.push(child);
        }
    }

    /**
     * children getter.
     *
     * @returns {Array<import('./Shape.js').default>} Array of child shapes (positions are relative to group origin).
     */
    get children() {
        return this._children;
    }

    /**
     * children setter (replaces entire children array).
     *
     * @param {Array<import('./Shape.js').default>} value - New children array.
     * @returns {void}
     */
    set children(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(`[Group] invalid children assignment (${value}). Keeping previous value.`);
            return;
        }
        // normalize positions: assume provided children have absolute positions and convert them
        me._children = [];
        for (const child of value) {
            if (!child) continue;
            const absX = Number(child.positionX) || 0;
            const absY = Number(child.positionY) || 0;
            const relX = absX - me.positionX;
            const relY = absY - me.positionY;
            child.positionX = relX;
            child.positionY = relY;
            me._children.push(child);
        }
        // update dimensions
        me._recalculateBounds();
    }

    /**
     * width getter.
     *
     * @returns {number} Group width in pixels.
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
        const num = Number(value);
        if (Number.isNaN(num) || num < 0) {
            console.warn(
                `[Group] invalid width assignment (${value}). Keeping previous value: ${me._width}`
            );
            return;
        }
        me._width = num;
    }

    /**
     * height getter.
     *
     * @returns {number} Group height in pixels.
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
        const num = Number(value);
        if (Number.isNaN(num) || num < 0) {
            console.warn(
                `[Group] invalid height assignment (${value}). Keeping previous value: ${me._height}`
            );
            return;
        }
        me._height = num;
    }

    /**
     * rotation getter.
     *
     * @returns {number} Rotation in degrees.
     */
    get rotation() {
        return this._rotation;
    }

    /**
     * rotation setter with numeric coercion.
     *
     * @param {number} value - Rotation in degrees.
     * @returns {void}
     */
    set rotation(value) {
        const me = this;
        const num = Number(value);
        if (Number.isNaN(num)) {
            console.warn(
                `[Group] invalid rotation assignment (${value}). Keeping previous value: ${me._rotation}`
            );
            return;
        }
        me._rotation = num % 360;
    }

    /**
     * flipH getter.
     *
     * @returns {boolean} True if horizontally flipped.
     */
    get flipH() {
        return this._flipH;
    }

    /**
     * flipH setter.
     *
     * @param {boolean} value - Flip horizontally flag.
     * @returns {void}
     */
    set flipH(value) {
        this._flipH = Boolean(value);
    }

    /**
     * flipV getter.
     *
     * @returns {boolean} True if vertically flipped.
     */
    get flipV() {
        return this._flipV;
    }

    /**
     * flipV setter.
     *
     * @param {boolean} value - Flip vertically flag.
     * @returns {void}
     */
    set flipV(value) {
        this._flipV = Boolean(value);
    }

    /**
     * Draw the group and its children on the provided canvas.
     *
     * Children are drawn at absolute positions computed from the group's position
     * plus each child's relative coordinates. Child positions are restored after draw.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        if (!Array.isArray(me._children) || me._children.length === 0) {
            // nothing to draw except selection handles
            if (me.isSelected) me.drawSelectionHandles(canvas);
            return;
        }

        // Draw each child at absolute position (temporarily set child's position then restore)
        for (let index = 0; index < me._children.length; index++) {
            const child = me._children[index];
            if (!child) continue;
            const originalX = child.positionX;
            const originalY = child.positionY;

            // compute absolute position from group's world origin
            child.positionX = me.positionX + Number(originalX || 0);
            child.positionY = me.positionY + Number(originalY || 0);

            // draw child
            try {
                child.draw(canvas);
            } finally {
                // restore child's relative coords
                child.positionX = originalX;
                child.positionY = originalY;
            }
        }

        // draw selection handles after children (group-local rect)
        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: determine whether the given coordinates intersect the group or any child.
     *
     * Coordinates are tested in world space; child hit testing receives coordinates transformed
     * into group's local space (child positions are relative to group origin).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} coordinateX - X coordinate to test.
     * @param {number} coordinateY - Y coordinate to test.
     * @returns {boolean} True if any child hits or bounding box contains the point.
     */
    isHit(canvas, coordinateX, coordinateY) {
        const me = this;
        const margin = Number(me.hitMargin) || 0;

        // quick AABB check (world coords)
        const minX = Number(me.positionX) - margin;
        const minY = Number(me.positionY) - margin;
        const maxX = Number(me.positionX) + Number(me._width) + margin;
        const maxY = Number(me.positionY) + Number(me._height) + margin;

        if (
            coordinateX >= minX &&
            coordinateX <= maxX &&
            coordinateY >= minY &&
            coordinateY <= maxY
        ) {
            return true;
        }

        // test children: convert world coord to group-local then to child's relative coords
        for (let idx = 0; idx < me._children.length; idx++) {
            const child = me._children[idx];
            if (!child || typeof child.isHit !== 'function') continue;

            const localX = coordinateX - me.positionX;
            const localY = coordinateY - me.positionY;

            // prepare child's world coords for its isHit: child expects (canvas, x, y) in world coords,
            // so compute child's absolute coordinates of the test point:
            const childTestX = me.positionX + localX; // equals coordinateX
            const childTestY = me.positionY + localY; // equals coordinateY

            // Temporarily set child's absolute position for accurate isHit if child uses positionX internally
            const origX = child.positionX;
            const origY = child.positionY;
            child.positionX = Number(origX || 0) + me.positionX;
            child.positionY = Number(origY || 0) + me.positionY;

            try {
                if (child.isHit(canvas, childTestX, childTestY)) {
                    // restore and return true
                    child.positionX = origX;
                    child.positionY = origY;
                    return true;
                }
            } finally {
                child.positionX = origX;
                child.positionY = origY;
            }
        }

        return false;
    }

    /**
     * Move the group by a given delta. Children positions are stored relative to the group origin,
     * so they do not need updating when the group moves.
     *
     * @param {number} deltaX - Displacement along X.
     * @param {number} deltaY - Displacement along Y.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        const me = this;
        const dx = Number(deltaX) || 0;
        const dy = Number(deltaY) || 0;
        me.positionX += dx;
        me.positionY += dy;
    }

    /**
     * Rotate the group around its center. NOTE: per-child rotation not implemented.
     *
     * @param {number} angleDegrees - Rotation in degrees.
     * @returns {void}
     */
    rotate(angleDegrees) {
        const me = this;
        const num = Number(angleDegrees);
        if (Number.isNaN(num)) {
            console.warn(
                `[Group] invalid rotate assignment (${angleDegrees}). Keeping previous value: ${me._rotation}`
            );
            return;
        }
        me._rotation = (me._rotation + num) % 360;
        console.warn(
            'Group.rotate: per-child rotation is not implemented; only rotation state updated.'
        );
    }

    /**
     * Flip horizontal placeholder (per-child flipping not implemented).
     *
     * @returns {void}
     */
    flipHorizontal() {
        const me = this;
        me._flipH = !me._flipH;
        console.warn(
            'Group.flipHorizontal: per-child flip not implemented; only flip state updated.'
        );
    }

    /**
     * Flip vertical placeholder (per-child flipping not implemented).
     *
     * @returns {void}
     */
    flipVertical() {
        const me = this;
        me._flipV = !me._flipV;
        console.warn(
            'Group.flipVertical: per-child flip not implemented; only flip state updated.'
        );
    }

    /**
     * Edit mutable properties of the group via setters.
     *
     * Supported properties: positionX, positionY, width, height, rotation, flipH, flipV, children
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
            'rotation',
            'flipH',
            'flipV',
            'children'
        ];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draw selection handles around group's bounding box.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        const me = this;

        // Draw simple rectangle and point handles (use Handle instances for interaction)
        // Draw rectangle (relative to group origin in world coords)
        canvas
            .setStrokeColor('#00ccff')
            .setStrokeWidth(1)
            .setStrokeDash([5, 5])
            .rectangle(me.positionX, me.positionY, me._width, me._height)
            .stroke()
            .restore();

        // corner handles
        new HandleBox(me.positionX, me.positionY, me.width, me.height, me, false).draw(canvas);
    }

    /**
     * Return a minimal axis-aligned bounding box for the group.
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box in world coordinates.
     */
    getBoundingBox() {
        const me = this;
        return {
            x: Number(me.positionX),
            y: Number(me.positionY),
            width: Number(me._width),
            height: Number(me._height)
        };
    }

    /**
     * Serialize group and children to JSON.
     *
     * @returns {Object} JSON-serializable object representing the group.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign({}, base, {
            width: me._width,
            height: me._height,
            rotation: me._rotation,
            flipH: me._flipH,
            flipV: me._flipV,
            children: me._children.map(child => {
                // child.toJSON expected; if absent, fallback to minimal data
                if (typeof child.toJSON === 'function') {
                    return child.toJSON();
                }
                return { x: child.positionX, y: child.positionY };
            })
        });
    }

    /**
     * Recreate a Group from JSON produced by toJSON().
     *
     * Note: children deserialization is performed by caller or via shapes' fromJSON methods.
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @param {Array<import('./Shape.js').default>} [resolvedChildren] - Optional array of child shape instances aligned with json.children.
     * @returns {Group} New Group instance.
     */
    static fromJSON(json, resolvedChildren = []) {
        if (!json || typeof json !== 'object') {
            throw new TypeError('Invalid JSON for Group.fromJSON');
        }

        // If resolvedChildren provided, use them; otherwise leave children empty and expect external resolution.
        const children = Array.isArray(resolvedChildren) ? resolvedChildren : [];

        const instance = new Group(children);
        instance.positionX = Number(json.x) || 0;
        instance.positionY = Number(json.y) || 0;
        instance.width = Number(json.width) || instance.width;
        instance.height = Number(json.height) || instance.height;
        instance.rotation = json.rotation || 0;
        instance.flipH = !!json.flipH;
        instance.flipV = !!json.flipV;
        if (json.id) instance.uniqueId = json.id;

        // If children data present and caller provided resolvedChildren of same length, trust them and apply relative positions
        if (
            Array.isArray(json.children) &&
            Array.isArray(children) &&
            children.length === json.children.length
        ) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const childJson = json.children[i] || {};
                // child may need initialization via its own fromJSON externally.
                const relX = Number(childJson.x) || Number(child.positionX) || 0;
                const relY = Number(childJson.y) || Number(child.positionY) || 0;
                child.positionX = relX;
                child.positionY = relY;
            }
            instance._children = children;
            instance._recalculateBounds();
        }

        return instance;
    }

    /**
     * Recalculate group's width/height from children positions and bounding boxes.
     *
     * @private
     * @returns {void}
     */
    _recalculateBounds() {
        const me = this;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < me._children.length; i++) {
            const child = me._children[i];
            if (!child || typeof child.getBoundingBox !== 'function') continue;
            const b = child.getBoundingBox();
            const cx = Number(b.x) || 0;
            const cy = Number(b.y) || 0;
            const cw = Number(b.width) || 0;
            const ch = Number(b.height) || 0;
            // child's bbox is relative to group origin (we store children relative)
            if (cx < minX) minX = cx;
            if (cy < minY) minY = cy;
            if (cx + cw > maxX) maxX = cx + cw;
            if (cy + ch > maxY) maxY = cy + ch;
        }

        if (!isFinite(minX)) {
            me._width = 0;
            me._height = 0;
            return;
        }

        me._width = Math.max(0, maxX - minX);
        me._height = Math.max(0, maxY - minY);
    }
}
