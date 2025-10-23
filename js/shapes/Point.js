import Shape from './Shape.js';
import Handle from '../components/Handle.js';

/**
 * Represents a single drawable point on the canvas.
 *
 * The Point class is a lightweight concrete Shape that renders a circular marker
 * at a canonical position (positionX, positionY). It supports hit-testing,
 * moving, editing of basic visual properties (radius, color), drawing of
 * selection handles, bounding-box calculation, and JSON serialization.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited) : read-only identifier for the point.
 *  - positionX {number} : canonical X coordinate (pixels by convention).
 *  - positionY {number} : canonical Y coordinate (pixels by convention).
 *  - radius {number} : visual radius of the point marker in pixels.
 *  - color {string} : CSS color used to fill the point.
 *  - hitMargin {number} (inherited) : extra pixels around the radius used for hit-testing.
 *  - isSelected {boolean} (inherited) : whether the point is selected.
 *  - zIndex {number} (inherited) : rendering order.
 *
 * Typical usage:
 *   const p = new Point(100, 50, 4);
 *   p.draw(canvasInstance);
 *   if (p.isHit(canvasInstance, mouseX, mouseY)) p.select();
 *   p.edit({ radius: 6, color: '#ff0000' });
 *
 * Serialization:
 *   const json = p.toJSON();
 *   const restored = Point.fromJSON(json);
 *
 * @class Point
 */
export default class Point extends Shape {
    /**
     * Internal radius backing field
     * @type {number}
     * @private
     */
    _radius = 3;

    /**
     * Internal color backing field
     * @type {string}
     * @private
     */
    _color = '#000000';

    /**
     * Creates an instance of Point.
     *
     * @param {number} positionX - Canonical X coordinate of the point (pixels).
     * @param {number} positionY - Canonical Y coordinate of the point (pixels).
     * @param {number} [radius=3] - Visual radius of the point (pixels). Must be >= 0.
     */
    constructor(positionX, positionY, radius = 3) {
        super(positionX, positionY);

        const me = this;

        // Use setters to validate and assign initial values
        me.radius = radius;
        me.color = '#000000';
        me.hitMargin = 5;
        // isSelected and zIndex inherited from Shape
    }

    /**
     * Radius getter.
     * @returns {number}
     */
    get radius() {
        return this._radius;
    }

    /**
     * Radius setter with validation.
     * On invalid value, the setter logs a warning and keeps the previous value.
     *
     * @param {number} value
     */
    set radius(value) {
        const me = this;
        const radius = Number(value);
        if (Number.isNaN(radius) || radius < 0) {
            console.warn(
                `[Point] invalid radius assignment (${value}). Radius must be a non-negative number. Keeping previous value: ${me._radius}`
            );
            return;
        }
        me._radius = radius;
    }

    /**
     * Color getter.
     * @returns {string}
     */
    get color() {
        return this._color;
    }

    /**
     * Color setter with basic validation.
     * Accepts strings only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Point] invalid color assignment (${value}). Color must be a string. Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * Draw the point on the provided canvas.
     *
     * The method saves the canvas state, applies stroke/fill settings, draws a
     * filled circle at the canonical position, then restores the canvas state.
     * If the point is selected, selection handles are also drawn.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;

        canvas
            .setStrokeColor('#000000')
            .setFillColor(me.color)
            .setStrokeWidth(1)
            .circle(me.positionX, me.positionY, me.radius)
            .fill()
            .restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test the point: returns true if the given coordinates are within
     * (radius + hitMargin) distance from the canonical center.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} positionX - X coordinate to test.
     * @param {number} positionY - Y coordinate to test.
     * @returns {boolean} True if the point is hit.
     */
    isHit(canvas, positionX, positionY) {
        const me = this;
        const dx = positionX - me.positionX;
        const dy = positionY - me.positionY;
        const distanceSq = dx * dx + dy * dy;
        const hitRadius = me.radius + me.hitMargin || 0;
        return distanceSq <= hitRadius * hitRadius;
    }

    /**
     * Move the point by a displacement
     *
     * @param {number} deltaX - Displacement in X.
     * @param {number} deltaY - Displacement in Y.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
    }

    /**
     * Edit the point's mutable properties.
     *
     * Delegates to setters so validation/warnings are centralized.
     *
     * Supported properties:
     *   - color {string}
     *   - radius {number >= 0}
     *   - positionX {number}
     *   - positionY {number}
     *
     * @param {object} newProperties
     * @returns {void}
     */
    edit(newProperties) {
        if (!newProperties || typeof newProperties !== 'object') return;
        const keys = ['color', 'radius', 'positionX', 'positionY'];
        keys.forEach(key => {
            if (key in newProperties) {
                this[key] = newProperties[key];
            }
        });
    }

    /**
     * Draw selection handles for the point.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        const me = this;
        new Handle(me.positionX, me.positionY, Handle.TYPES.DOT).draw(canvas);
    }

    /**
     * Return the minimal axis-aligned bounding box for the point.
     *
     * @returns {{x:number,y:number,width:number,height:number}}
     */
    getBoundingBox() {
        const me = this;
        const radius = Number(me.radius) || 0;
        const hitMargin = Number(me.hitMargin) || 0;
        const total = radius + hitMargin;
        return {
            x: me.positionX - total,
            y: me.positionY - total,
            width: total * 2,
            height: total * 2
        };
    }

    /**
     * Extend base serialization with point-specific properties.
     *
     * @returns {Object} JSON-serializable object.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            radius: me.radius,
            color: me.color
        });
    }

    /**
     * Recreate a Point from JSON produced by toJSON.
     *
     * Expected JSON shape (examples):
     *   { type: 'Point', id: '...', x: 10, y: 20, radius: 3, color: '#000' }
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @returns {Point}
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object') {
            throw new TypeError('Invalid JSON for Point.fromJSON');
        }

        const x = json.x || 0;
        const y = json.y || 0;
        const radius = json.radius;
        let pointInstance = null;

        if (json.radius) {
            pointInstance = new Point(x, y, radius);
        } else {
            pointInstance = new Point(x, y);
        }

        pointInstance.color = json.color;

        return pointInstance;
    }
}
