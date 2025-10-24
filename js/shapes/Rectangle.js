import Shape from './Shape.js';
// import Handle from '../components/Handle.js';
import HandleBox from '../components/HandleBox.js';

/**
 * Description: Represents an axis-aligned rectangle shape.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier
 *  - positionX {number} (inherited): X coordinate of the rectangle origin (top-left by convention)
 *  - positionY {number} (inherited): Y coordinate of the rectangle origin (top-left by convention)
 *  - width {number} : width of the rectangle in pixels
 *  - height {number} : height of the rectangle in pixels
 *  - fillColor {string} : fill color (CSS string)
 *  - color {string} : stroke color (CSS string)
 *  - lineWidth {number} : stroke thickness in pixels
 *  - lineDash {Array<number>} : dash pattern for stroke
 *  - lineDashOffset {number} : dash offset for stroke
 *  - hitMargin {number} (inherited) : extra pixels used for hit testing
 *  - isSelected {boolean} (inherited) : selection state
 *  - zIndex {number} (inherited) : rendering order
 *
 * Typical usage:
 *   const rect = new Rectangle(10, 20, 200, 100);
 *   rect.color = '#333';
 *   rect.fillColor = '#eee';
 *   canvas.addShape(rect);
 *   canvas.render();
 *
 * Notes:
 *  - All mutable properties are validated in setters. Invalid assignments are ignored and emit standardized warnings.
 *  - The rectangle uses top-left origin semantics for positionX/positionY by convention.
 *
 * @class Rectangle
 */
export default class Rectangle extends Shape {
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
     * Internal fill color backing field
     *
     * @type {string}
     * @private
     */
    _fillColor = 'transparent';

    /**
     * Internal stroke color backing field
     *
     * @type {string}
     * @private
     */
    _color = '#000000';

    /**
     * Internal line width backing field
     *
     * @type {number}
     * @private
     */
    _lineWidth = 1;

    /**
     * Internal line dash backing field
     *
     * @type {Array<number>}
     * @private
     */
    _lineDash = [];

    /**
     * Internal line dash offset backing field
     *
     * @type {number}
     * @private
     */
    _lineDashOffset = 0;

    /**
     * Creates a new Rectangle instance.
     *
     * @param {number} positionX - Top-left X coordinate in pixels.
     * @param {number} positionY - Top-left Y coordinate in pixels.
     * @param {number} width - Width of the rectangle in pixels.
     * @param {number} height - Height of the rectangle in pixels.
     * @throws {TypeError} If positionX/positionY are invalid numbers.
     */
    constructor(positionX, positionY, width, height) {
        super(positionX, positionY);
        const me = this;

        me.width = width;
        me.height = height;

        me.fillColor = 'transparent';
        me.color = '#000000';
        me.lineWidth = 1;
        me.lineDash = [];
        me.lineDashOffset = 0;
    }

    /**
     * width getter.
     *
     * @returns {number} The rectangle width in pixels.
     */
    get width() {
        return this._width;
    }

    /**
     * width setter with validation.
     * Accepts non-negative numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New width in pixels.
     */
    set width(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue < 0) {
            console.warn(
                `[Rectangle] invalid width assignment (${value}). Width must be a non-negative number. Keeping previous value: ${me._width}`
            );
            return;
        }
        me._width = numberValue;
    }

    /**
     * height getter.
     *
     * @returns {number} The rectangle height in pixels.
     */
    get height() {
        return this._height;
    }

    /**
     * height setter with validation.
     * Accepts non-negative numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New height in pixels.
     */
    set height(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue < 0) {
            console.warn(
                `[Rectangle] invalid height assignment (${value}). Height must be a non-negative number. Keeping previous value: ${me._height}`
            );
            return;
        }
        me._height = numberValue;
    }

    /**
     * fillColor getter.
     *
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
                `[Rectangle] invalid fillColor assignment (${value}). Keeping previous value: ${me._fillColor}`
            );
            return;
        }
        me._fillColor = value;
    }

    /**
     * color getter.
     *
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
                `[Rectangle] invalid color assignment (${value}). Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * lineWidth getter.
     *
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
                `[Rectangle] invalid lineWidth assignment (${value}). Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = numberValue;
    }

    /**
     * lineDash getter.
     *
     * @returns {Array<number>} The dash pattern for the stroke.
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
                `[Rectangle] invalid lineDash assignment (${value}). Keeping previous value: ${me._lineDash}`
            );
            return;
        }
        me._lineDash = value;
    }

    /**
     * lineDashOffset getter.
     *
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
                `[Rectangle] invalid lineDashOffset assignment (${value}). Keeping previous value: ${me._lineDashOffset}`
            );
            return;
        }
        me._lineDashOffset = numberValue;
    }

    /**
     * Draws the rectangle on the provided canvas.
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
            .rectangle(me.positionX, me.positionY, me.width, me.height)
            .fill()
            .stroke()
            .restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: returns true if the point is inside (or within hitMargin of) the rectangle.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} testX - X coordinate to test.
     * @param {number} testY - Y coordinate to test.
     * @returns {boolean} True if the point hits the rectangle, false otherwise.
     */
    isHit(canvas, testX, testY) {
        const me = this;
        const margin = Number(me.hitMargin) || 0;
        const minX = me.positionX - margin;
        const minY = me.positionY - margin;
        const maxX = me.positionX + me.width + margin;
        const maxY = me.positionY + me.height + margin;
        return testX >= minX && testX <= maxX && testY >= minY && testY <= maxY;
    }

    /**
     * Moves the rectangle by the given deltas.
     *
     * @param {number} deltaX - Horizontal shift in pixels.
     * @param {number} deltaY - Vertical shift in pixels.
     * @returns {void} Nothing.
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
    }

    /**
     * Edits rectangle properties using setters.
     *
     * Supported properties: positionX, positionY, width, height, fillColor, color, lineWidth, lineDash, lineDashOffset
     *
     * @param {Object} newProperties - Object containing properties to update.
     * @returns {void} Nothing.
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;
        const keys = [
            'positionX',
            'positionY',
            'width',
            'height',
            'fillColor',
            'lineWidth',
            'lineDash',
            'lineDashOffset'
        ];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draws selection handles for the rectangle (corners, midpoints and center).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    drawSelectionHandles(canvas) {
        const me = this;
        const boundingBox = me.getBoundingBox();

        new HandleBox(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height).draw(
            canvas
        );

        // const x = me.positionX;
        // const y = me.positionY;
        // const w = me.width;
        // const h = me.height;

        // // corners
        // new Handle(x, y, Handle.TYPES.SQUARE).draw(canvas); // top-left
        // new Handle(x + w, y, Handle.TYPES.SQUARE).draw(canvas); // top-right
        // new Handle(x, y + h, Handle.TYPES.SQUARE).draw(canvas); // bottom-left
        // new Handle(x + w, y + h, Handle.TYPES.SQUARE).draw(canvas); // bottom-right

        // // midpoints
        // new Handle(x + w / 2, y, Handle.TYPES.DOT).draw(canvas); // top-center
        // new Handle(x + w / 2, y + h, Handle.TYPES.DOT).draw(canvas); // bottom-center
        // new Handle(x, y + h / 2, Handle.TYPES.DOT).draw(canvas); // middle-left
        // new Handle(x + w, y + h / 2, Handle.TYPES.DOT).draw(canvas); // middle-right

        // // center
        // new Handle(x + w / 2, y + h / 2, Handle.TYPES.CROSS).draw(canvas); // center
    }

    /**
     * Returns the minimal axis-aligned bounding box for the rectangle (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box of the rectangle.
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
     * Serializes the rectangle to JSON.
     *
     * @returns {Object} JSON object representing the rectangle.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            width: me.width,
            height: me.height,
            fillColor: me.fillColor,
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: me.lineDash,
            lineDashOffset: me.lineDashOffset
        });
    }

    /**
     * Creates a Rectangle instance from JSON.
     *
     * @param {Object} json - JSON object containing rectangle properties.
     * @returns {Rectangle} New Rectangle instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for Rectangle.fromJSON');
        const rect = new Rectangle(
            Number(json.x) || 0,
            Number(json.y) || 0,
            Number(json.width) || 0,
            Number(json.height) || 0
        );
        rect.edit({
            fillColor: json.fillColor,
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: json.lineDash,
            lineDashOffset: json.lineDashOffset
        });
        if (json.id) rect.uniqueId = json.id;
        return rect;
    }
}
