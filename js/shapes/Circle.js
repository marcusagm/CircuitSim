import Handle from '../components/Handle.js';
import HandleBox from '../components/HandleBox.js';
import Shape from './Shape.js';

/**
 * Description: Represents a drawable circle shape on the canvas.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier
 *  - positionX {number} (inherited): canonical X coordinate of the circle center
 *  - positionY {number} (inherited): canonical Y coordinate of the circle center
 *  - radius {number} : visual radius of the circle in pixels
 *  - fillColor {string} : fill color (CSS string) of the circle
 *  - color {string} : stroke color (CSS string) of the circle outline
 *  - lineWidth {number} : stroke thickness in pixels
 *  - lineDash {Array<number>} : dash pattern for stroke
 *  - lineDashOffset {number} : dash offset for stroke
 *  - hitMargin {number} (inherited) : extra pixels around the radius used for hit-testing.
 *  - isSelected {boolean} (inherited): selection state
 *  - zIndex {number} (inherited): rendering order
 *
 * Typical usage:
 *   const c = new Circle(100, 80, 20);
 *   c.color = '#ff0000';
 *   c.fillColor = '#ffeeee';
 *   canvas.addShape(c);
 *   canvas.render();
 *
 * Notes:
 *  - All mutable visual properties are validated in their setters.
 *  - Invalid setter assignments will be ignored and will emit a console.warn
 *    following the project’s standardized message format.
 *
 * @class Circle
 */
export default class Circle extends Shape {
    /**
     * Internal radius backing field
     * @type {number}
     * @private
     */
    _radius = 0;

    /**
     * Internal fill color backing field
     * @type {string}
     * @private
     */
    _fillColor = 'transparent';

    /**
     * Internal stroke color backing field
     * @type {string}
     * @private
     */
    _color = '#000000';

    /**
     * Internal line width backing field
     * @type {number}
     * @private
     */
    _lineWidth = 1;

    /**
     * Internal line dash backing field
     * @type {Array<number>}
     * @private
     */
    _lineDash = [];

    /**
     * Internal line dash offset backing field
     * @type {number}
     * @private
     */
    _lineDashOffset = 0;

    /**
     * Creates a new Circle instance.
     *
     * @param {number} positionX - X coordinate of the circle center (pixels).
     * @param {number} positionY - Y coordinate of the circle center (pixels).
     * @param {number} radius - Initial radius of the circle (pixels).
     * @throws {TypeError} If positionX/positionY are not numbers or radius invalid.
     */
    constructor(positionX, positionY, radius) {
        super(positionX, positionY);

        const me = this;

        me.radius = radius;
        me.fillColor = 'transparent';
        me.color = '#000000';
        me.lineWidth = 1;
        me.lineDash = [];
        me.lineDashOffset = 0;
    }

    /**
     * radius getter.
     * @returns {number} The visual radius of the circle in pixels.
     */
    get radius() {
        return this._radius;
    }

    /**
     * radius setter with validation.
     * Accepts non-negative numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New radius in pixels.
     */
    set radius(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue < 0) {
            console.warn(
                `[Circle] invalid radius assignment (${value}). Radius must be a non-negative number. Keeping previous value: ${me._radius}`
            );
            return;
        }
        me._radius = numberValue;
    }

    /**
     * fillColor getter.
     * @returns {string} The fill color CSS string.
     */
    get fillColor() {
        return this._fillColor;
    }

    /**
     * fillColor setter with basic validation.
     * Accepts strings only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New fill color (CSS string).
     */
    set fillColor(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Circle] invalid fillColor assignment (${value}). Keeping previous value: ${me._fillColor}`
            );
            return;
        }
        me._fillColor = value;
    }

    /**
     * color getter.
     * @returns {string} The stroke color CSS string.
     */
    get color() {
        return this._color;
    }

    /**
     * color setter with basic validation.
     * Accepts strings only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New stroke color (CSS string).
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Circle] invalid color assignment (${value}). Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * lineWidth getter.
     * @returns {number} The stroke thickness in pixels.
     */
    get lineWidth() {
        return this._lineWidth;
    }

    /**
     * lineWidth setter with validation.
     * Accepts positive numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New stroke thickness in pixels.
     */
    set lineWidth(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue <= 0) {
            console.warn(
                `[Circle] invalid lineWidth assignment (${value}). Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = numberValue;
    }

    /**
     * lineDash getter.
     * @returns {Array<number>} The dash pattern array for the stroke.
     */
    get lineDash() {
        return this._lineDash;
    }

    /**
     * lineDash setter with validation.
     * Accepts arrays only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {Array<number>} value - New dash pattern array.
     */
    set lineDash(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[Circle] invalid lineDash assignment (${value}). Keeping previous value: ${me._lineDash}`
            );
            return;
        }
        me._lineDash = value;
    }

    /**
     * lineDashOffset getter.
     * @returns {number} The dash offset for the stroke.
     */
    get lineDashOffset() {
        return this._lineDashOffset;
    }

    /**
     * lineDashOffset setter with validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New dash offset.
     */
    set lineDashOffset(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Circle] invalid lineDashOffset assignment (${value}). Keeping previous value: ${me._lineDashOffset}`
            );
            return;
        }
        me._lineDashOffset = numberValue;
    }

    /**
     * Draws the circle on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    draw(canvas) {
        const me = this;
        canvas
            .setStrokeColor(me.color)
            .setStrokeWidth(me.lineWidth)
            .setStrokeDash(me.lineDash)
            .setStrokeDashOffset(me.lineDashOffset)
            .setFillColor(me.fillColor)
            .circle(me.positionX, me.positionY, me.radius)
            .stroke()
            .fill()
            .restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test for the circle.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} positionX - X coordinate of the point to test.
     * @param {number} positionY - Y coordinate of the point to test.
     * @returns {boolean} True if the point is within clickable area of the circle, false otherwise.
     */
    isHit(canvas, positionX, positionY) {
        const me = this;
        const distance = Math.hypot(positionX - me.positionX, positionY - me.positionY);
        return distance <= me.radius + me.hitMargin;
    }

    /**
     * Moves the circle by the given deltas.
     *
     * @param {number} deltaX - Horizontal displacement in pixels.
     * @param {number} deltaY - Vertical displacement in pixels.
     * @returns {void} Nothing.
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
    }

    /**
     * Edit the circle's mutable properties.
     *
     * Valid properties: fillColor, color, lineWidth, lineDash, lineDashOffset, positionX, positionY, radius
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void} Nothing.
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = [
            'fillColor',
            'color',
            'lineWidth',
            'lineDash',
            'lineDashOffset',
            'positionX',
            'positionY'
        ];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draws selection handles for the circle.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    drawSelectionHandles(canvas) {
        const me = this;
        const boundingBox = me.getBoundingBox();

        // // center handle
        // new Handle(me.positionX, me.positionY, Handle.TYPES.CROSS).draw(canvas);
        // radius handle on the right
        new Handle(me.positionX + me.radius, me.positionY, Handle.TYPES.DOT).draw(canvas);

        new HandleBox(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height).draw(
            canvas
        );
    }

    /**
     * Returns the minimal axis-aligned bounding box for the circle.
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box of the circle.
     */
    getBoundingBox() {
        const me = this;
        const total = me.radius + me.hitMargin;
        return {
            x: me.positionX - total,
            y: me.positionY - total,
            width: total * 2,
            height: total * 2
        };
    }

    /**
     * Serializes the circle to JSON.
     *
     * @returns {Object} JSON object representing the circle.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            radius: me.radius,
            fillColor: me.fillColor,
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: me.lineDash,
            lineDashOffset: me.lineDashOffset
        });
    }

    /**
     * Creates a Circle instance from JSON.
     *
     * @param {Object} json - JSON object with circle properties.
     * @returns {Circle} New Circle instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for Circle.fromJSON');
        const circle = new Circle(
            Number(json.x) || 0,
            Number(json.y) || 0,
            Number(json.radius) || 0
        );
        circle.edit({
            fillColor: json.fillColor,
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: json.lineDash,
            lineDashOffset: json.lineDashOffset
        });
        return circle;
    }
}
