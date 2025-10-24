import Shape from './Shape.js';
import Handle from '../components/Handle.js';
import HandleAnchor from '../components/HandleAnchor.js';

/**
 * Description: Represents a quadratic curve defined by a start point, a single control point and an end point.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier
 *  - positionX {number} (inherited): canonical X coordinate (used by Shape; not primary for control points)
 *  - positionY {number} (inherited): canonical Y coordinate (used by Shape; not primary for control points)
 *  - startX {number} : X coordinate of the curve start point
 *  - startY {number} : Y coordinate of the curve start point
 *  - controlX {number} : X coordinate of the curve control point
 *  - controlY {number} : Y coordinate of the curve control point
 *  - endX {number} : X coordinate of the curve end point
 *  - endY {number} : Y coordinate of the curve end point
 *  - color {string} : stroke color (CSS string)
 *  - lineWidth {number} : stroke thickness in pixels
 *  - lineDash {Array<number>} : dash pattern for stroke
 *  - lineDashOffset {number} : dash offset for stroke
 *  - lineCap {string} : line cap style ('butt','round','square')
 *  - lineJoin {string} : line join style ('miter','round','bevel')
 *  - hitMargin {number} (inherited) : extra pixels for hit-testing
 *  - isSelected {boolean} (inherited) : selection state
 *  - zIndex {number} (inherited) : rendering order
 *
 * Typical usage:
 *   const curve = new ThreePointCurve(10, 10, 60, 30, 120, 10);
 *   curve.color = '#f00';
 *   canvas.addShape(curve);
 *   canvas.render();
 *
 * Notes:
 *  - All mutable properties have validation in their setters. Invalid assignments are ignored and emit standardized warnings.
 *  - Hit testing uses `hitMargin` from Shape and computes distance to the quadratic curve by segment projection approximation (clamped projection).
 *
 * @class ThreePointCurve
 */
export default class ThreePointCurve extends Shape {
    /**
     * Internal start X backing field
     *
     * @type {number}
     * @private
     */
    _startX = 0;

    /**
     * Internal start Y backing field
     *
     * @type {number}
     * @private
     */
    _startY = 0;

    /**
     * Internal control X backing field
     *
     * @type {number}
     * @private
     */
    _controlX = 0;

    /**
     * Internal control Y backing field
     *
     * @type {number}
     * @private
     */
    _controlY = 0;

    /**
     * Internal end X backing field
     *
     * @type {number}
     * @private
     */
    _endX = 0;

    /**
     * Internal end Y backing field
     *
     * @type {number}
     * @private
     */
    _endY = 0;

    /**
     * Internal color backing field
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
     * Internal line cap backing field
     *
     * @type {string}
     * @private
     */
    _lineCap = 'butt';

    /**
     * Internal line join backing field
     *
     * @type {string}
     * @private
     */
    _lineJoin = 'miter';

    /**
     * Creates a new ThreePointCurve instance.
     *
     * @param {number} startX - X coordinate of the start point.
     * @param {number} startY - Y coordinate of the start point.
     * @param {number} controlX - X coordinate of the control point.
     * @param {number} controlY - Y coordinate of the control point.
     * @param {number} endX - X coordinate of the end point.
     * @param {number} endY - Y coordinate of the end point.
     */
    constructor(startX, startY, controlX, controlY, endX, endY) {
        super(startX, startY);
        const me = this;

        me.startX = startX;
        me.startY = startY;
        me.controlX = controlX;
        me.controlY = controlY;
        me.endX = endX;
        me.endY = endY;

        me.color = '#000000';
        me.lineWidth = 1;
        me.lineDash = [];
        me.lineDashOffset = 0;
        me.lineCap = 'butt';
        me.lineJoin = 'miter';
    }

    /**
     * startX getter.
     *
     * @returns {number} The start point X coordinate.
     */
    get startX() {
        return this._startX;
    }

    /**
     * startX setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New start X coordinate.
     */
    set startX(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[ThreePointCurve] invalid startX assignment (${value}). Keeping previous value: ${me._startX}`
            );
            return;
        }
        me._startX = v;
    }

    /**
     * startY getter.
     *
     * @returns {number} The start point Y coordinate.
     */
    get startY() {
        return this._startY;
    }

    /**
     * startY setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New start Y coordinate.
     */
    set startY(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[ThreePointCurve] invalid startY assignment (${value}). Keeping previous value: ${me._startY}`
            );
            return;
        }
        me._startY = v;
    }

    /**
     * controlX getter.
     *
     * @returns {number} The control point X coordinate.
     */
    get controlX() {
        return this._controlX;
    }

    /**
     * controlX setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New control X coordinate.
     */
    set controlX(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[ThreePointCurve] invalid controlX assignment (${value}). Keeping previous value: ${me._controlX}`
            );
            return;
        }
        me._controlX = v;
    }

    /**
     * controlY getter.
     *
     * @returns {number} The control point Y coordinate.
     */
    get controlY() {
        return this._controlY;
    }

    /**
     * controlY setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New control Y coordinate.
     */
    set controlY(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[ThreePointCurve] invalid controlY assignment (${value}). Keeping previous value: ${me._controlY}`
            );
            return;
        }
        me._controlY = v;
    }

    /**
     * endX getter.
     *
     * @returns {number} The end point X coordinate.
     */
    get endX() {
        return this._endX;
    }

    /**
     * endX setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New end X coordinate.
     */
    set endX(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[ThreePointCurve] invalid endX assignment (${value}). Keeping previous value: ${me._endX}`
            );
            return;
        }
        me._endX = v;
    }

    /**
     * endY getter.
     *
     * @returns {number} The end point Y coordinate.
     */
    get endY() {
        return this._endY;
    }

    /**
     * endY setter with basic validation.
     * Accepts numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New end Y coordinate.
     */
    set endY(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[ThreePointCurve] invalid endY assignment (${value}). Keeping previous value: ${me._endY}`
            );
            return;
        }
        me._endY = v;
    }

    /**
     * color getter.
     *
     * @returns {string} The stroke color.
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
                `[ThreePointCurve] invalid color assignment (${value}). Keeping previous value: ${me._color}`
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
     * @param {number} value - New line width.
     */
    set lineWidth(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v <= 0) {
            console.warn(
                `[ThreePointCurve] invalid lineWidth assignment (${value}). Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = v;
    }

    /**
     * lineDash getter.
     *
     * @returns {Array<number>} The dash pattern array.
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
                `[ThreePointCurve] invalid lineDash assignment (${value}). Keeping previous value: ${me._lineDash}`
            );
            return;
        }
        me._lineDash = value;
    }

    /**
     * lineDashOffset getter.
     *
     * @returns {number} The dash offset.
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
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[ThreePointCurve] invalid lineDashOffset assignment (${value}). Keeping previous value: ${me._lineDashOffset}`
            );
            return;
        }
        me._lineDashOffset = v;
    }

    /**
     * lineCap getter.
     *
     * @returns {string} The line cap style.
     */
    get lineCap() {
        return this._lineCap;
    }

    /**
     * lineCap setter with validation.
     * Accepts 'butt', 'round', 'square'. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New line cap style.
     */
    set lineCap(value) {
        const me = this;
        const valid = ['butt', 'round', 'square'];
        if (!valid.includes(value)) {
            console.warn(
                `[ThreePointCurve] invalid lineCap assignment (${value}). Keeping previous value: ${me._lineCap}`
            );
            return;
        }
        me._lineCap = value;
    }

    /**
     * lineJoin getter.
     *
     * @returns {string} The line join style.
     */
    get lineJoin() {
        return this._lineJoin;
    }

    /**
     * lineJoin setter with validation.
     * Accepts 'miter', 'round', 'bevel'. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New line join style.
     */
    set lineJoin(value) {
        const me = this;
        const valid = ['miter', 'round', 'bevel'];
        if (!valid.includes(value)) {
            console.warn(
                `[ThreePointCurve] invalid lineJoin assignment (${value}). Keeping previous value: ${me._lineJoin}`
            );
            return;
        }
        me._lineJoin = value;
    }

    /**
     * Draws the quadratic curve on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    draw(canvas) {
        const me = this;
        // begin path and draw quadratic curve: moveTo(start) -> quadraticCurveTo(control, end)
        canvas
            .setStrokeColor(me.color)
            .setStrokeWidth(me.lineWidth)
            .setStrokeDash(me.lineDash)
            .setStrokeDashOffset(me.lineDashOffset)
            .setStrokeCap(me.lineCap)
            .setStrokeJoin(me.lineJoin)
            .beginPath()
            .quadraticCurveTo(me.startX, me.startY, me.controlX, me.controlY, me.endX, me.endY)
            .stroke()
            .restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: returns true if the point is within hitMargin of the curve bounding box
     * or (more precisely) within hitMargin of any sampled point along the curve.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} testX - X coordinate to test.
     * @param {number} testY - Y coordinate to test.
     * @returns {boolean} True if the test point hits the curve, false otherwise.
     */
    isHit(canvas, testX, testY) {
        const me = this;
        const margin = Number(me.hitMargin) || 0;

        // quick bounding-box reject with margin
        const minX = Math.min(me.startX, me.controlX, me.endX) - margin;
        const maxX = Math.max(me.startX, me.controlX, me.endX) + margin;
        const minY = Math.min(me.startY, me.controlY, me.endY) - margin;
        const maxY = Math.max(me.startY, me.controlY, me.endY) + margin;
        if (testX < minX || testX > maxX || testY < minY || testY > maxY) return false;

        // sample curve at N points and check distance to each segment (approximation)
        const samples = 24; // reasonable default; can be tuned for perf/precision
        let prevX = me.startX;
        let prevY = me.startY;
        for (let i = 1; i <= samples; i++) {
            const t = i / samples;
            // quadratic Bezier point: B(t) = (1-t)^2 * P0 + 2(1-t)t * C + t^2 * P2
            const inv = 1 - t;
            const bx = inv * inv * me.startX + 2 * inv * t * me.controlX + t * t * me.endX;
            const by = inv * inv * me.startY + 2 * inv * t * me.controlY + t * t * me.endY;

            // distance from test point to segment prev -> (bx,by)
            const dx = bx - prevX;
            const dy = by - prevY;
            const segLenSq = dx * dx + dy * dy;
            if (segLenSq === 0) {
                const d = Math.hypot(testX - prevX, testY - prevY);
                if (d <= me.lineWidth + margin) return true;
            } else {
                // project point onto segment
                let proj = ((testX - prevX) * dx + (testY - prevY) * dy) / segLenSq;
                if (proj < 0) proj = 0;
                else if (proj > 1) proj = 1;
                const projX = prevX + proj * dx;
                const projY = prevY + proj * dy;
                const dist = Math.hypot(testX - projX, testY - projY);
                if (dist <= me.lineWidth + margin) return true;
            }

            prevX = bx;
            prevY = by;
        }

        return false;
    }

    /**
     * Moves all control points of the curve by given deltas.
     *
     * @param {number} deltaX - Horizontal shift.
     * @param {number} deltaY - Vertical shift.
     * @returns {void} Nothing.
     */
    move(deltaX, deltaY) {
        const me = this;
        const dx = Number(deltaX) || 0;
        const dy = Number(deltaY) || 0;
        super.move(dx, dy);
        me.startX += dx;
        me.startY += dy;
        me.controlX += dx;
        me.controlY += dy;
        me.endX += dx;
        me.endY += dy;
    }

    /**
     * Edits the curve properties using setters.
     *
     * Supported properties: startX, startY, controlX, controlY, endX, endY, color, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void} Nothing.
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = [
            'startX',
            'startY',
            'controlX',
            'controlY',
            'endX',
            'endY',
            'color',
            'lineWidth',
            'lineDash',
            'lineDashOffset',
            'lineCap',
            'lineJoin'
        ];
        keys.forEach(k => {
            if (k in newProperties) me[k] = newProperties[k];
        });
    }

    /**
     * Draws selection handles for the curve (start, control, end).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    drawSelectionHandles(canvas) {
        const me = this;

        // start handle
        new Handle(me.startX, me.startY, Handle.TYPES.SQUARE).draw(canvas);

        // control anchor handle (provides directional anchors inside)
        new HandleAnchor(
            me.controlX,
            me.controlY,
            (me.startX - me.controlX) / 2,
            (me.startY - me.controlY) / 2,
            (me.endX - me.controlX) / 2,
            (me.endY - me.controlY) / 2
        ).draw(canvas);

        // end handle
        new Handle(me.endX, me.endY, Handle.TYPES.SQUARE).draw(canvas);
    }

    /**
     * Returns the minimal axis-aligned bounding box for the curve (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box of the curve.
     */
    getBoundingBox() {
        const me = this;
        const minX = Math.min(me.startX, me.controlX, me.endX);
        const minY = Math.min(me.startY, me.controlY, me.endY);
        const maxX = Math.max(me.startX, me.controlX, me.endX);
        const maxY = Math.max(me.startY, me.controlY, me.endY);
        const margin = Number(me.hitMargin) || 0;
        return {
            x: minX - margin,
            y: minY - margin,
            width: maxX - minX + margin * 2,
            height: maxY - minY + margin * 2
        };
    }

    /**
     * Serializes the curve to JSON.
     *
     * @returns {Object} JSON object representing the curve.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            startX: me.startX,
            startY: me.startY,
            controlX: me.controlX,
            controlY: me.controlY,
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
     * Recreates a ThreePointCurve instance from JSON produced by toJSON().
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @returns {ThreePointCurve} New ThreePointCurve instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for ThreePointCurve.fromJSON');
        const c = new ThreePointCurve(
            Number(json.startX) || 0,
            Number(json.startY) || 0,
            Number(json.controlX) || 0,
            Number(json.controlY) || 0,
            Number(json.endX) || 0,
            Number(json.endY) || 0
        );
        c.edit({
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: json.lineDash,
            lineDashOffset: json.lineDashOffset,
            lineCap: json.lineCap,
            lineJoin: json.lineJoin
        });
        if (json.id) c.uniqueId = json.id;
        return c;
    }
}
