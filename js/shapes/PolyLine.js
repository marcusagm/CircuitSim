import Shape from './Shape.js';
import Handle from '../components/Handle.js';

/**
 * Description:
 *  Represents a multi-segment line drawable on the canvas.
 *  This line is defined by an array of points, allowing continuous drawing, node editing, and hit-testing.
 *
 * Properties summary:
 *  - points {Array<{x:number, y:number}>} : Array of points defining the line segments.
 *  - color {string} : Stroke color of the line.
 *  - lineWidth {number} : Stroke width of the line.
 *  - lineDash {Array<number>} : Dash pattern array for the line.
 *  - lineDashOffset {number} : Dash offset for the line.
 *  - lineCap {string} : Stroke line cap style.
 *  - lineJoin {string} : Stroke line join style.
 *
 * Typical usage:
 *   const polyLine = new PolyLine(10, 10);
 *   polyLine.addPoint(50, 50);
 *   polyLine.draw(canvasInstance);
 *
 * Notes / Additional:
 *  - Subclasses of Shape must respect hitMargin for hit-testing.
 *  - Drawing handles is done only if isSelected is true.
 */
export default class PolyLine extends Shape {
    /**
     * Internal array of points for the line segments.
     *
     * @type {Array<{x:number, y:number}>}
     * @private
     */
    _points = [];

    /**
     * Internal stroke color.
     *
     * @type {string}
     * @private
     */
    _color = '#000000';

    /**
     * Internal line width.
     *
     * @type {number}
     * @private
     */
    _lineWidth = 1;

    /**
     * Internal line dash pattern.
     *
     * @type {Array<number>}
     * @private
     */
    _lineDash = [];

    /**
     * Internal line dash offset.
     *
     * @type {number} @private
     */
    _lineDashOffset = 0;

    /**
     * Internal line cap style.
     *
     * @type {string}
     * @private
     */
    _lineCap = 'round';

    /**
     * Internal line join style.
     *
     * @type {string}
     * @private
     */
    _lineJoin = 'round';

    /**
     * Creates an instance of PolyLine.
     *
     * @param {number} initialXCoordinate - X coordinate of the first point.
     * @param {number} initialYCoordinate - Y coordinate of the first point.
     */
    constructor(initialXCoordinate, initialYCoordinate) {
        super(initialXCoordinate, initialYCoordinate);
        const me = this;
        me._points = [{ x: initialXCoordinate, y: initialYCoordinate }];
    }

    /**
     * Points getter.
     *
     * @returns {Array<{x:number, y:number}>} Array of points defining the line.
     */
    get points() {
        return this._points;
    }

    /**
     * Points setter with validation.
     *
     * @param {Array<{x:number, y:number}>} value - New points array.
     * @returns {void}
     */
    set points(value) {
        if (!Array.isArray(value)) {
            console.warn(
                `[PolyLine] invalid points assignment (${value}). Must be an array. Keeping previous value.`
            );
            return;
        }
        this._points = value;
    }

    /**
     * Color getter.
     *
     * @returns {string} Line stroke color.
     */
    get color() {
        return this._color;
    }

    /**
     * Color setter.
     *
     * @param {string} value - New stroke color.
     * @returns {void}
     */
    set color(value) {
        if (typeof value !== 'string') {
            console.warn(
                `[PolyLine] invalid color assignment (${value}). Must be a string. Keeping previous value: ${this._color}`
            );
            return;
        }
        this._color = value;
    }

    /**
     * Line width getter.
     *
     * @returns {number} Stroke width.
     */
    get lineWidth() {
        return this._lineWidth;
    }

    /**
     * Line width setter with numeric validation.
     *
     * @param {number} value - Stroke width.
     * @returns {void}
     */
    set lineWidth(value) {
        const num = Number(value);
        if (Number.isNaN(num) || num <= 0) {
            console.warn(
                `[PolyLine] invalid lineWidth assignment (${value}). Must be positive number. Keeping previous value: ${this._lineWidth}`
            );
            return;
        }
        this._lineWidth = num;
    }

    /**
     * lineDash getter.
     *
     * @returns {Array<number>}
     */
    get lineDash() {
        return this._lineDash;
    }

    /**
     * lineDash setter with validation.
     *
     * @param {Array<number>} value
     * @returns {void}
     */
    set lineDash(value) {
        if (!Array.isArray(value)) {
            console.warn(
                `[PolyLine] invalid lineDash assignment (${value}). Must be an array. Keeping previous value.`
            );
            return;
        }
        this._lineDash = value;
    }

    /**
     * lineDashOffset getter.
     *
     * @returns {number}
     */
    get lineDashOffset() {
        return this._lineDashOffset;
    }

    /**
     * lineDashOffset setter.
     *
     * @param {number} value
     * @returns {void}
     */
    set lineDashOffset(value) {
        const num = Number(value);
        if (Number.isNaN(num)) {
            console.warn(
                `[PolyLine] invalid lineDashOffset assignment (${value}). Keeping previous value: ${this._lineDashOffset}`
            );
            return;
        }
        this._lineDashOffset = num;
    }

    /**
     * lineCap getter.
     *
     * @returns {string}
     */
    get lineCap() {
        return this._lineCap;
    }

    /**
     * lineCap setter.
     *
     * @param {string} value
     * @returns {void}
     */
    set lineCap(value) {
        if (typeof value !== 'string') {
            console.warn(
                `[PolyLine] invalid lineCap assignment (${value}). Keeping previous value: ${this._lineCap}`
            );
            return;
        }
        this._lineCap = value;
    }

    /**
     * lineJoin getter.
     *
     * @returns {string}
     */
    get lineJoin() {
        return this._lineJoin;
    }

    /**
     * lineJoin setter.
     *
     * @param {string} value
     * @returns {void}
     */
    set lineJoin(value) {
        if (typeof value !== 'string') {
            console.warn(
                `[PolyLine] invalid lineJoin assignment (${value}). Keeping previous value: ${this._lineJoin}`
            );
            return;
        }
        this._lineJoin = value;
    }

    /**
     * Adds a new point to the line.
     *
     * @param {number} xCoordinate
     * @param {number} yCoordinate
     * @returns {void}
     */
    addPoint(xCoordinate, yCoordinate) {
        const me = this;
        me.points.push({ x: Number(xCoordinate), y: Number(yCoordinate) });
    }

    /**
     * Updates the last point of the line.
     *
     * @param {number} xCoordinate
     * @param {number} yCoordinate
     * @returns {void}
     */
    updateLastPoint(xCoordinate, yCoordinate) {
        const me = this;
        if (me.points.length > 0) {
            me.points[me.points.length - 1] = { x: Number(xCoordinate), y: Number(yCoordinate) };
        }
    }

    /**
     * Draws the polyline.
     *
     * @param {import('../core/Canvas.js').default} canvas
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        if (me.points.length < 1) return;

        canvas
            .setStrokeColor(me.color)
            .setStrokeWidth(me.lineWidth)
            .setStrokeDash(me.lineDash)
            .setStrokeDashOffset(me.lineDashOffset)
            .setStrokeCap(me.lineCap)
            .setStrokeJoin(me.lineJoin);

        canvas.beginPath();
        canvas.moveTo(me.points[0].x, me.points[0].y);
        for (let i = 1; i < me.points.length; i++) {
            canvas.lineTo(me.points[i].x, me.points[i].y);
        }
        canvas.stroke();
        canvas.restore();

        if (me.isSelected) me.drawSelectionHandles(canvas);
    }

    /**
     * Hit test including hitMargin.
     *
     * @param {import('../core/Canvas.js').default} canvas
     * @param {number} checkingXCoordinate
     * @param {number} checkingYCoordinate
     * @returns {boolean}
     */
    isHit(canvas, checkingXCoordinate, checkingYCoordinate) {
        const me = this;
        const hitTolerance = me.lineWidth / 2 + me.hitMargin;
        for (let i = 0; i < me.points.length - 1; i++) {
            const start = me.points[i];
            const end = me.points[i + 1];
            const deltaX = end.x - start.x;
            const deltaY = end.y - start.y;
            const lineLengthSquared = deltaX * deltaX + deltaY * deltaY;

            if (lineLengthSquared === 0) {
                const distSq =
                    (checkingXCoordinate - start.x) ** 2 + (checkingYCoordinate - start.y) ** 2;
                if (distSq <= hitTolerance ** 2) return true;
                continue;
            }

            const t =
                ((checkingXCoordinate - start.x) * deltaX +
                    (checkingYCoordinate - start.y) * deltaY) /
                lineLengthSquared;

            let closestX;
            let closestY;
            if (t <= 0) {
                closestX = start.x;
                closestY = start.y;
            } else if (t >= 1) {
                closestX = end.x;
                closestY = end.y;
            } else {
                closestX = start.x + t * deltaX;
                closestY = start.y + t * deltaY;
            }

            const distSq =
                (checkingXCoordinate - closestX) ** 2 + (checkingYCoordinate - closestY) ** 2;
            if (distSq <= hitTolerance ** 2) return true;
        }
        return false;
    }

    /**
     * Moves the entire line by deltaX/deltaY.
     *
     * @param {number} deltaX
     * @param {number} deltaY
     * @returns {void}
     */
    move(deltaX, deltaY) {
        const me = this;
        me.points.forEach(p => {
            p.x += deltaX;
            p.y += deltaY;
        });
        super.move(deltaX, deltaY);
    }

    /**
     * Edit polyline properties using public setters.
     *
     * @param {object} newProperties
     * @returns {void}
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = [
            'color',
            'lineWidth',
            'lineDash',
            'lineDashOffset',
            'lineCap',
            'lineJoin',
            'points'
        ];
        keys.forEach(key => {
            if (key in newProperties) me[key] = newProperties[key];
        });
    }

    /**
     * Draws selection handles at each point.
     *
     * @param {import('../core/Canvas.js').default} canvas
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        const me = this;
        me.points.forEach(point => {
            new Handle(point.x, point.y, Handle.TYPES.DOT, me).draw(canvas);
        });
    }

    /**
     * Convert instance to JSON object for serialization.
     *
     * @returns {object}
     */
    toJSON() {
        const me = this;
        return {
            ...super.toJSON(),
            points: me.points.map(p => ({ x: p.x, y: p.y })),
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: [...me.lineDash],
            lineDashOffset: me.lineDashOffset,
            lineCap: me.lineCap,
            lineJoin: me.lineJoin
        };
    }

    /**
     * Create PolyLine instance from JSON object.
     *
     * @param {object} json
     * @returns {PolyLine}
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for PolyLine.fromJSON');
        const instance = new PolyLine(Number(json.x) || 0, Number(json.y) || 0);
        instance.edit({
            points: Array.isArray(json.points)
                ? json.points.map(p => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
                : [],
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: Array.isArray(json.lineDash) ? json.lineDash : [],
            lineDashOffset: json.lineDashOffset,
            lineCap: json.lineCap,
            lineJoin: json.lineJoin
        });
        if (json.id) instance.uniqueId = json.id;
        return instance;
    }
}
