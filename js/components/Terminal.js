/**
 * Description:
 *  Represents a connection terminal (anchor) for a Component. A Terminal has a small
 *  circular visual, a radius for hit-testing and drawing, a list of connected wires,
 *  and a reference to its parent component. Terminal coordinates are defined relative
 *  to the parent component top-left (positionX, positionY). Optionally, the terminal
 *  can follow the parent's transform (rotation/flip) when parentComponent.terminalsFollowTransform is true.
 *
 * Properties summary:
 *  - id {string} : terminal identifier.
 *  - positionX {number} : X coordinate relative to parent top-left (pixels).
 *  - positionY {number} : Y coordinate relative to parent top-left (pixels).
 *  - parentComponent {Component} : owning component (required).
 *  - connectedWires {Array<any>} : array of wire references connected to this terminal.
 *  - radius {number} : visual radius and hit-test radius (pixels).
 *  - color {string} : fill color used to draw the terminal.
 *
 * Typical usage:
 *   const t = new Terminal('A', 4, 8, component);
 *   component.addTerminal(t.id, t.positionX, t.positionY);
 *   t.draw(canvasInstance);
 *
 * Notes:
 *  - getAbsolutePosition(canvas) computes absolute coordinates using parentComponent.positionX/positionY.
 *    If parentComponent.terminalsFollowTransform is true, the returned position accounts for the parent's
 *    rotation and flips using the same transform order used to render the component.
 *
 * @class Terminal
 */
export default class Terminal {
    /**
     * Internal positionX backing field (relative to parent).
     *
     * @type {number}
     * @private
     */
    _positionX = 0;

    /**
     * Internal positionY backing field (relative to parent).
     *
     * @type {number}
     * @private
     */
    _positionY = 0;

    /**
     * Parent component reference.
     *
     * @type {Object}
     * @private
     */
    _parentComponent = null;

    /**
     * Connected wires backing field.
     *
     * @type {Array<any>}
     * @private
     */
    _connectedWires = [];

    /**
     * Internal radius backing field.
     *
     * @type {number}
     * @private
     */
    _radius = 4;

    /**
     * Internal color backing field.
     *
     * @type {string}
     * @private
     */
    _color = '#0000FF';

    /**
     * Creates a Terminal.
     *
     * @param {string} id - Terminal identifier.
     * @param {number} positionX - X coordinate relative to parent top-left in pixels.
     * @param {number} positionY - Y coordinate relative to parent top-left in pixels.
     * @param {Object} parentComponent - Owning component instance.
     */
    constructor(id, positionX, positionY, parentComponent) {
        const me = this;
        me.id = id;
        me.positionX = positionX;
        me.positionY = positionY;
        me.parentComponent = parentComponent;
        me._connectedWires = [];
        me.radius = 4;
        me.color = '#0000FF';
    }

    /**
     * positionX getter.
     *
     * @returns {number} X coordinate relative to parent top-left.
     */
    get positionX() {
        return this._positionX;
    }

    /**
     * positionX setter with validation.
     *
     * @param {number} value - New X coordinate relative to parent.
     * @returns {void}
     */
    set positionX(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[Terminal] invalid positionX assignment (${value}). Keeping previous value: ${me._positionX}`
            );
            return;
        }
        me._positionX = v;
    }

    /**
     * positionY getter.
     *
     * @returns {number} Y coordinate relative to parent top-left.
     */
    get positionY() {
        return this._positionY;
    }

    /**
     * positionY setter with validation.
     *
     * @param {number} value - New Y coordinate relative to parent.
     * @returns {void}
     */
    set positionY(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[Terminal] invalid positionY assignment (${value}). Keeping previous value: ${me._positionY}`
            );
            return;
        }
        me._positionY = v;
    }

    /**
     * parentComponent getter.
     *
     * @returns {Object} Parent component instance.
     */
    get parentComponent() {
        return this._parentComponent;
    }

    /**
     * parentComponent setter.
     *
     * @param {Object} value - Parent component instance.
     * @returns {void}
     */
    set parentComponent(value) {
        const me = this;
        me._parentComponent = value;
    }

    /**
     * connectedWires getter.
     *
     * @returns {Array<any>} Array of connected wires.
     */
    get connectedWires() {
        return this._connectedWires;
    }

    /**
     * radius getter.
     *
     * @returns {number} Visual / hit-test radius in pixels.
     */
    get radius() {
        return this._radius;
    }

    /**
     * radius setter with validation.
     *
     * @param {number} value - New radius in pixels.
     * @returns {void}
     */
    set radius(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 0) {
            console.warn(
                `[Terminal] invalid radius assignment (${value}). Radius must be a non-negative number. Keeping previous value: ${me._radius}`
            );
            return;
        }
        me._radius = v;
    }

    /**
     * color getter.
     *
     * @returns {string} Fill color string.
     */
    get color() {
        return this._color;
    }

    /**
     * color setter with basic validation.
     *
     * @param {string} value - New color string.
     * @returns {void}
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Terminal] invalid color assignment (${value}). Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * Returns the absolute position of the terminal on the canvas.
     *
     * If the parent component has `terminalsFollowTransform === true`, the returned
     * coordinates account for the parent's transforms (scale for flips then rotation)
     * using the same transform order applied in Component.draw().
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {{x:number,y:number}} Absolute coordinates on canvas.
     */
    getAbsolutePosition(canvas) {
        const me = this;
        const parent = me.parentComponent;
        // fallback: terminal absolute in world if no parent
        if (!parent) {
            return { x: Number(me.positionX) || 0, y: Number(me.positionY) || 0 };
        }

        // component top-left (canonical names)
        const parentX = Number(parent.positionX) || 0;
        const parentY = Number(parent.positionY) || 0;

        // local (component-space) point (px, py)
        const px = parentX + Number(me.positionX);
        const py = parentY + Number(me.positionY);

        // If parent requests terminals to follow its transform, apply transforms:
        // Component applies: translate(cx,cy) -> rotate(theta) -> scale(flips) -> translate(-cx,-cy)
        // So worldPoint = T(cx) * R(theta) * S(flips) * T(-cx) * p
        // That equals: compute v = p - center; v_scaled = S * v; v_rot = R * v_scaled; world = center + v_rot
        if (parent.terminalsFollowTransform) {
            const cx = parentX + Number(parent.width) / 2;
            const cy = parentY + Number(parent.height) / 2;

            // vector from center to local point
            const vx = px - cx;
            const vy = py - cy;

            // apply scale first (flips)
            const scaleX = parent.flipH ? -1 : 1;
            const scaleY = parent.flipV ? -1 : 1;
            const sx = Number.isFinite(scaleX) ? scaleX : 1;
            const sy = Number.isFinite(scaleY) ? scaleY : 1;

            const sxVx = vx * sx;
            const syVy = vy * sy;

            // rotation (coerce to number, default 0)
            const thetaDeg = Number(parent.rotation) || 0;
            const theta = Number.isFinite(thetaDeg) ? (thetaDeg * Math.PI) / 180 : 0;
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);

            // rotate the scaled vector
            const rx = sxVx * cos - syVy * sin;
            const ry = sxVx * sin + syVy * cos;

            // world coordinates
            return { x: cx + rx, y: cy + ry };
        }

        // default: no transform (simple translation)
        return { x: px, y: py };
    }

    /**
     * Draw the terminal on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        const absPos = me.getAbsolutePosition(canvas);

        canvas
            .setFillColor(me.color)
            .setStrokeColor('#000000')
            .setStrokeWidth(1)
            .circle(absPos.x, absPos.y, me.radius)
            .fill()
            .stroke()
            .restore();
    }

    /**
     * Hit test the terminal.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} coordinateX - X coordinate to test.
     * @param {number} coordinateY - Y coordinate to test.
     * @returns {boolean} True when the test point is within the clickable area of the terminal.
     */
    isHit(canvas, coordinateX, coordinateY) {
        const me = this;
        const absPos = me.getAbsolutePosition(canvas);
        const dx = Number(coordinateX) - Number(absPos.x);
        const dy = Number(coordinateY) - Number(absPos.y);
        const distanceSq = dx * dx + dy * dy;
        const parentMargin = me.parentComponent ? Number(me.parentComponent.hitMargin) || 0 : 0;
        const hitRadius = (Number(me.radius) || 0) + parentMargin + 2;
        return distanceSq <= hitRadius * hitRadius;
    }

    /**
     * Connect a wire to this terminal.
     *
     * @param {any} wire - Wire reference to add.
     * @returns {void}
     */
    addWire(wire) {
        const me = this;
        if (!me._connectedWires.includes(wire)) me._connectedWires.push(wire);
    }

    /**
     * Remove a connected wire from this terminal.
     *
     * @param {any} wire - Wire reference to remove.
     * @returns {void}
     */
    removeWire(wire) {
        const me = this;
        me._connectedWires = me._connectedWires.filter(w => w !== wire);
    }

    /**
     * Serialize the terminal to JSON.
     *
     * @returns {Object} JSON-serializable representation of the terminal.
     */
    toJSON() {
        const me = this;
        return {
            id: me.id,
            x: me.positionX,
            y: me.positionY
        };
    }

    /**
     * Recreate a Terminal from JSON.
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @param {Object} parentComponent - Parent Component instance to attach the terminal to.
     * @returns {Terminal} New Terminal instance.
     */
    static fromJSON(json, parentComponent) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for Terminal.fromJSON');
        const t = new Terminal(json.id, Number(json.x) || 0, Number(json.y) || 0, parentComponent);
        return t;
    }
}
