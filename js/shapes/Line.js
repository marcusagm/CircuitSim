import Shape from './Shape.js';
import Handle from '../components/Handle.js';
// import HandleBox from '../components/HandleBox.js';

/**
 * Description: Represents a straight line segment on the canvas.
 *
 *  * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier
 *  - positionX {number} (inherited)
 *  - positionY {number} (inherited)
 *  - startX {number} : starting point X coordinate
 *  - startY {number} : starting point Y coordinate
 *  - endX {number} : ending point X coordinate
 *  - endY {number} : ending point Y coordinate
 *  - color {string} : stroke color of the line
 *  - lineWidth {number} : thickness of the line (pixels)
 *  - lineDash {Array<number>} : dash pattern for stroke
 *  - lineDashOffset {number} : dash offset
 *  - lineCap {string} : line cap style ('butt', 'round', 'square')
 *  - lineJoin {string} : line join style ('miter', 'round', 'bevel')
 *  - isSelected {boolean} (inherited)
 *  - zIndex {number} (inherited)
 *
 * Typical usage:
 *   const line = new Line(10, 10, 100, 100);
 *   line.color = 'red';
 *   line.lineWidth = 2;
 *   canvas.addShape(line);
 *   canvas.render();
 *
 * Notes:
 *  - All mutable properties should be edited via `edit()` or setters to ensure validation.
 *  - Hit testing uses a tolerance based on lineWidth + 5 pixels.
 *
 * @class Line
 */
export default class Line extends Shape {
    /**
     * Internal starting X coordinate backing field
     * @type {number}
     * @private
     */
    _startX = 0;

    /**
     * Internal starting Y coordinate backing field
     * @type {number}
     * @private
     */
    _startY = 0;

    /**
     * Internal ending X coordinate backing field
     * @type {number}
     * @private
     */
    _endX = 0;

    /**
     * Internal ending Y coordinate backing field
     * @type {number}
     * @private
     */
    _endY = 0;

    /**
     * Internal color backing field
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
     * Internal line cap backing field
     * @type {string}
     * @private
     */
    _lineCap = 'butt';

    /**
     * Internal line join backing field
     * @type {string}
     * @private
     */
    _lineJoin = 'miter';

    /**
     * Creates a new Line instance.
     *
     * @param {number} startX - Starting X coordinate of the line.
     * @param {number} startY - Starting Y coordinate of the line.
     * @param {number} endX - Ending X coordinate of the line.
     * @param {number} endY - Ending Y coordinate of the line.
     */
    constructor(startX, startY, endX, endY) {
        super(startX, startY);

        const me = this;

        me.startX = startX;
        me.startY = startY;
        me.endX = endX;
        me.endY = endY;
    }

    /**
     * startX getter.
     * @returns {number} The starting X coordinate of the line.
     */
    get startX() {
        return this._startX;
    }

    /**
     * startX setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New starting X coordinate.
     */
    set startX(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Line] invalid startX assignment (${value}). Keeping previous value: ${me._startX}`
            );
            return;
        }
        me._startX = numberValue;
    }

    /**
     * startY getter.
     * @returns {number} The starting Y coordinate of the line.
     */
    get startY() {
        return this._startY;
    }

    /**
     * startY setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New starting Y coordinate.
     */
    set startY(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Line] invalid startY assignment (${value}). Keeping previous value: ${me._startY}`
            );
            return;
        }
        me._startY = numberValue;
    }

    /**
     * endX getter.
     * @returns {number} The ending X coordinate of the line.
     */
    get endX() {
        return this._endX;
    }

    /**
     * endX setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New ending X coordinate.
     */
    set endX(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Line] invalid endX assignment (${value}). Keeping previous value: ${me._endX}`
            );
            return;
        }
        me._endX = numberValue;
    }

    /**
     * endY getter.
     * @returns {number} The ending Y coordinate of the line.
     */
    get endY() {
        return this._endY;
    }

    /**
     * endY setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New ending Y coordinate.
     */
    set endY(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Line] invalid endY assignment (${value}). Keeping previous value: ${me._endY}`
            );
            return;
        }
        me._endY = numberValue;
    }

    /**
     * color getter.
     * @returns {string} The color of the line.
     */
    get color() {
        return this._color;
    }

    /**
     * color setter with basic validation.
     * Accepts strings only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New color value.
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Line] invalid color assignment (${value}). Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * lineWidth getter.
     * @returns {number} The thickness of the line.
     */
    get lineWidth() {
        return this._lineWidth;
    }

    /**
     * lineWidth setter with basic validation.
     * Accepts positive numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New line width.
     */
    set lineWidth(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue <= 0) {
            console.warn(
                `[Line] invalid lineWidth assignment (${value}). Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = numberValue;
    }

    /**
     * lineDash getter.
     * @returns {Array<number>} The dash pattern of the line.
     */
    get lineDash() {
        return this._lineDash;
    }

    /**
     * lineDash setter with basic validation.
     * Accepts arrays only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {Array<number>} value - New dash pattern array.
     */
    set lineDash(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[Line] invalid lineDash assignment (${value}). Keeping previous value: ${me._lineDash}`
            );
            return;
        }
        me._lineDash = value;
    }

    /**
     * lineDashOffset getter.
     * @returns {number} Offset for the dash pattern.
     */
    get lineDashOffset() {
        return this._lineDashOffset;
    }

    /**
     * lineDashOffset setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New dash offset.
     */
    set lineDashOffset(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Line] invalid lineDashOffset assignment (${value}). Keeping previous value: ${me._lineDashOffset}`
            );
            return;
        }
        me._lineDashOffset = numberValue;
    }

    /**
     * lineCap getter.
     * @returns {string} The style of the line cap ('butt', 'round', 'square').
     */
    get lineCap() {
        return this._lineCap;
    }

    /**
     * lineCap setter with basic validation.
     * Accepts 'butt', 'round', 'square'. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New line cap style.
     */
    set lineCap(value) {
        const me = this;
        const validValues = ['butt', 'round', 'square'];
        if (!validValues.includes(value)) {
            console.warn(
                `[Line] invalid lineCap assignment (${value}). Keeping previous value: ${me._lineCap}`
            );
            return;
        }
        me._lineCap = value;
    }

    /**
     * lineJoin getter.
     * @returns {string} The style of the line join ('miter', 'round', 'bevel').
     */
    get lineJoin() {
        return this._lineJoin;
    }

    /**
     * lineJoin setter with basic validation.
     * Accepts 'miter', 'round', 'bevel'. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New line join style.
     */
    set lineJoin(value) {
        const me = this;
        const validValues = ['miter', 'round', 'bevel'];
        if (!validValues.includes(value)) {
            console.warn(
                `[Line] invalid lineJoin assignment (${value}). Keeping previous value: ${me._lineJoin}`
            );
            return;
        }
        me._lineJoin = value;
    }

    /**
     * Draws the line on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        canvas
            .setStrokeColor(me.color)
            .setStrokeWidth(me.lineWidth)
            .setStrokeDash(me.lineDash)
            .setStrokeDashOffset(me.lineDashOffset)
            .setStrokeCap(me.lineCap)
            .setStrokeJoin(me.lineJoin)
            .line(me.startX, me.startY, me.endX, me.endY)
            .stroke()
            .restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Determines if a point hits the line.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} positionX - X coordinate of the point to test.
     * @param {number} positionY - Y coordinate of the point to test.
     * @returns {boolean} True if the point is within clickable area of the line, false otherwise.
     */
    isHit(canvas, positionX, positionY) {
        const me = this;
        const deltaX = me.endX - me.startX;
        const deltaY = me.endY - me.startY;
        const lineLengthSquared = deltaX * deltaX + deltaY * deltaY;
        if (lineLengthSquared === 0) return false;

        const t =
            ((positionX - me.startX) * deltaX + (positionY - me.startY) * deltaY) /
            lineLengthSquared;
        if (t < 0 || t > 1) return false;

        const projectionX = me.startX + t * deltaX;
        const projectionY = me.startY + t * deltaY;
        const distance = Math.hypot(positionX - projectionX, positionY - projectionY);
        return distance <= me.lineWidth + me.hitMargin;
    }

    /**
     * Moves the line by the given deltas.
     *
     * @param {number} deltaX - Horizontal shift.
     * @param {number} deltaY - Vertical shift.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);

        const me = this;

        me.startX += deltaX;
        me.startY += deltaY;
        me.endX += deltaX;
        me.endY += deltaY;
    }

    /**
     * Edits line properties using setters.
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void}
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = [
            'startX',
            'startY',
            'endX',
            'endY',
            'color',
            'lineWidth',
            'lineDash',
            'lineDashOffset',
            'lineCap',
            'lineJoin'
        ];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draws selection handles at the line endpoints.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        const me = this;
        // const boundingBox = me.getBoundingBox();
        new Handle(me.startX, me.startY, Handle.TYPES.DOT).draw(canvas);
        new Handle(me.endX, me.endY, Handle.TYPES.DOT).draw(canvas);

        // new HandleBox(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height).draw(
        //     canvas
        // );
    }

    /**
     * Returns the minimal bounding box for the line.
     *
     * @returns {Object} Bounding box with properties: x, y, width, height.
     */
    getBoundingBox() {
        const me = this;
        const minX = Math.min(me.startX, me.endX);
        const minY = Math.min(me.startY, me.endY);
        const maxX = Math.max(me.startX, me.endX);
        const maxY = Math.max(me.startY, me.endY);
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    /**
     * Serializes the line to JSON.
     *
     * @returns {Object} JSON object representing the line.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            startX: me.startX,
            startY: me.startY,
            endX: me.endX,
            endY: me.endY,
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: me.lineDash,
            lineDashOffset: me.lineDashOffset,
            lineCap: me.lineCap,
            lineJoin: me.lineJoin
        });
    }

    /**
     * Creates a Line instance from JSON.
     *
     * @param {Object} json - JSON object containing line properties.
     * @returns {Line} New Line instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for Line.fromJSON');
        const line = new Line(json.startX || 0, json.startY || 0, json.endX || 0, json.endY || 0);
        line.edit({
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: json.lineDash,
            lineDashOffset: json.lineDashOffset,
            lineCap: json.lineCap,
            lineJoin: json.lineJoin
        });
        return line;
    }
}
