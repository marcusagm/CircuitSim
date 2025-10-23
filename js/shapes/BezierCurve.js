import Shape from './Shape.js';
import HandleAnchor from '../components/HandleAnchor.js';
import Handle from '../components/Handle.js';

/**
 * Description: Represents a cubic Bezier curve defined by a start point,
 * two control points and an end point. Provides drawing, hit-testing,
 * moving, editing, selection-handle drawing, bounding-box calculation and
 * JSON serialization/deserialization.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier
 *  - positionX {number} (inherited): canonical X coordinate (not primary for control points)
 *  - positionY {number} (inherited): canonical Y coordinate (not primary for control points)
 *  - startX {number} : X coordinate of the start point
 *  - startY {number} : Y coordinate of the start point
 *  - control1X {number} : X coordinate of the first control point
 *  - control1Y {number} : Y coordinate of the first control point
 *  - control2X {number} : X coordinate of the second control point
 *  - control2Y {number} : Y coordinate of the second control point
 *  - endX {number} : X coordinate of the end point
 *  - endY {number} : Y coordinate of the end point
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
 *   const bez = new BezierCurve(10,10, 40,0, 80,20, 120,10);
 *   bez.color = '#f00';
 *   canvas.addShape(bez);
 *   canvas.render();
 *
 * Notes:
 *  - Setters centralize validation and emit standardized warnings on invalid assignments.
 *  - Hit testing approximates distance to the curve by sampling N points (configurable via _hitSamples).
 *  - Canvas wrapper is expected to provide beginPath(), moveTo(), bezierCurveTo(), stroke(), restore(), etc.
 *
 * @class BezierCurve
 */
export default class BezierCurve extends Shape {
    /**
     * Internal start X backing field
     * @type {number}
     * @private
     */
    _startX = 0;

    /**
     * Internal start Y backing field
     * @type {number}
     * @private
     */
    _startY = 0;

    /**
     * Internal control1 X backing field
     * @type {number}
     * @private
     */
    _control1X = 0;

    /**
     * Internal control1 Y backing field
     * @type {number}
     * @private
     */
    _control1Y = 0;

    /**
     * Internal control2 X backing field
     * @type {number}
     * @private
     */
    _control2X = 0;

    /**
     * Internal control2 Y backing field
     * @type {number}
     * @private
     */
    _control2Y = 0;

    /**
     * Internal end X backing field
     * @type {number}
     * @private
     */
    _endX = 0;

    /**
     * Internal end Y backing field
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
     * Internal hit sampling count for isHit() approximation
     * @type {number}
     * @private
     */
    _hitSamples = 24;

    /**
     * Creates a new BezierCurve instance.
     *
     * @param {number} startX - X coordinate of the start point.
     * @param {number} startY - Y coordinate of the start point.
     * @param {number} control1X - X coordinate of the first control point.
     * @param {number} control1Y - Y coordinate of the first control point.
     * @param {number} control2X - X coordinate of the second control point.
     * @param {number} control2Y - Y coordinate of the second control point.
     * @param {number} endX - X coordinate of the end point.
     * @param {number} endY - Y coordinate of the end point.
     */
    constructor(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
        super(startX, startY);
        const me = this;

        // initialize via setters so validation applies
        me.startX = startX;
        me.startY = startY;
        me.control1X = control1X;
        me.control1Y = control1Y;
        me.control2X = control2X;
        me.control2Y = control2Y;
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
     * @returns {number} The X coordinate of the start point.
     */
    get startX() {
        return this._startX;
    }

    /**
     * startX setter with validation.
     *
     * @param {number} value - New start X coordinate.
     */
    set startX(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid startX assignment (${value}). Keeping previous value: ${me._startX}`
            );
            return;
        }
        me._startX = v;
    }

    /**
     * startY getter.
     * @returns {number} The Y coordinate of the start point.
     */
    get startY() {
        return this._startY;
    }

    /**
     * startY setter with validation.
     *
     * @param {number} value - New start Y coordinate.
     */
    set startY(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid startY assignment (${value}). Keeping previous value: ${me._startY}`
            );
            return;
        }
        me._startY = v;
    }

    /**
     * control1X getter.
     * @returns {number} The X coordinate of the first control point.
     */
    get control1X() {
        return this._control1X;
    }

    /**
     * control1X setter with validation.
     *
     * @param {number} value - New control1 X coordinate.
     */
    set control1X(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid control1X assignment (${value}). Keeping previous value: ${me._control1X}`
            );
            return;
        }
        me._control1X = v;
    }

    /**
     * control1Y getter.
     * @returns {number} The Y coordinate of the first control point.
     */
    get control1Y() {
        return this._control1Y;
    }

    /**
     * control1Y setter with validation.
     *
     * @param {number} value - New control1 Y coordinate.
     */
    set control1Y(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid control1Y assignment (${value}). Keeping previous value: ${me._control1Y}`
            );
            return;
        }
        me._control1Y = v;
    }

    /**
     * control2X getter.
     * @returns {number} The X coordinate of the second control point.
     */
    get control2X() {
        return this._control2X;
    }

    /**
     * control2X setter with validation.
     *
     * @param {number} value - New control2 X coordinate.
     */
    set control2X(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid control2X assignment (${value}). Keeping previous value: ${me._control2X}`
            );
            return;
        }
        me._control2X = v;
    }

    /**
     * control2Y getter.
     * @returns {number} The Y coordinate of the second control point.
     */
    get control2Y() {
        return this._control2Y;
    }

    /**
     * control2Y setter with validation.
     *
     * @param {number} value - New control2 Y coordinate.
     */
    set control2Y(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid control2Y assignment (${value}). Keeping previous value: ${me._control2Y}`
            );
            return;
        }
        me._control2Y = v;
    }

    /**
     * endX getter.
     * @returns {number} The X coordinate of the end point.
     */
    get endX() {
        return this._endX;
    }

    /**
     * endX setter with validation.
     *
     * @param {number} value - New end X coordinate.
     */
    set endX(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid endX assignment (${value}). Keeping previous value: ${me._endX}`
            );
            return;
        }
        me._endX = v;
    }

    /**
     * endY getter.
     * @returns {number} The Y coordinate of the end point.
     */
    get endY() {
        return this._endY;
    }

    /**
     * endY setter with validation.
     *
     * @param {number} value - New end Y coordinate.
     */
    set endY(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid endY assignment (${value}). Keeping previous value: ${me._endY}`
            );
            return;
        }
        me._endY = v;
    }

    /**
     * color getter.
     * @returns {string} Stroke color CSS string.
     */
    get color() {
        return this._color;
    }

    /**
     * color setter with validation.
     *
     * @param {string} value - New stroke color (CSS string).
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[BezierCurve] invalid color assignment (${value}). Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * lineWidth getter.
     * @returns {number} Stroke thickness in pixels.
     */
    get lineWidth() {
        return this._lineWidth;
    }

    /**
     * lineWidth setter with validation.
     *
     * @param {number} value - New line width.
     */
    set lineWidth(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v <= 0) {
            console.warn(
                `[BezierCurve] invalid lineWidth assignment (${value}). Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = v;
    }

    /**
     * lineDash getter.
     * @returns {Array<number>} Dash pattern array.
     */
    get lineDash() {
        return this._lineDash;
    }

    /**
     * lineDash setter with validation.
     *
     * @param {Array<number>} value - New dash pattern array.
     */
    set lineDash(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[BezierCurve] invalid lineDash assignment (${value}). Keeping previous value: ${me._lineDash}`
            );
            return;
        }
        me._lineDash = value;
    }

    /**
     * lineDashOffset getter.
     * @returns {number} Dash offset.
     */
    get lineDashOffset() {
        return this._lineDashOffset;
    }

    /**
     * lineDashOffset setter with validation.
     *
     * @param {number} value - New dash offset.
     */
    set lineDashOffset(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v)) {
            console.warn(
                `[BezierCurve] invalid lineDashOffset assignment (${value}). Keeping previous value: ${me._lineDashOffset}`
            );
            return;
        }
        me._lineDashOffset = v;
    }

    /**
     * lineCap getter.
     * @returns {string} Line cap style.
     */
    get lineCap() {
        return this._lineCap;
    }

    /**
     * lineCap setter with validation.
     *
     * @param {string} value - New line cap style ('butt','round','square').
     */
    set lineCap(value) {
        const me = this;
        const valid = ['butt', 'round', 'square'];
        if (!valid.includes(value)) {
            console.warn(
                `[BezierCurve] invalid lineCap assignment (${value}). Keeping previous value: ${me._lineCap}`
            );
            return;
        }
        me._lineCap = value;
    }

    /**
     * lineJoin getter.
     * @returns {string} Line join style.
     */
    get lineJoin() {
        return this._lineJoin;
    }

    /**
     * lineJoin setter with validation.
     *
     * @param {string} value - New line join style ('miter','round','bevel').
     */
    set lineJoin(value) {
        const me = this;
        const valid = ['miter', 'round', 'bevel'];
        if (!valid.includes(value)) {
            console.warn(
                `[BezierCurve] invalid lineJoin assignment (${value}). Keeping previous value: ${me._lineJoin}`
            );
            return;
        }
        me._lineJoin = value;
    }

    /**
     * hitSamples getter.
     * @returns {number} Number of samples used for hit-testing approximation.
     */
    get hitSamples() {
        return this._hitSamples;
    }

    /**
     * hitSamples setter with validation.
     *
     * @param {number} value - New number of samples (integer >= 4 recommended).
     */
    set hitSamples(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 1) {
            console.warn(
                `[BezierCurve] invalid hitSamples assignment (${value}). Keeping previous value: ${me._hitSamples}`
            );
            return;
        }
        me._hitSamples = Math.max(1, Math.floor(v));
    }

    /**
     * Draws the cubic Bezier curve on the provided canvas.
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
            .setStrokeCap(me.lineCap)
            .setStrokeJoin(me.lineJoin)
            .beginPath()
            .bezierCurveTo(
                me.startX,
                me.startY,
                me.control1X,
                me.control1Y,
                me.control2X,
                me.control2Y,
                me.endX,
                me.endY
            )
            .stroke()
            .restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: approximates whether the test point is within (lineWidth + hitMargin)
     * of the curve by sampling points along the curve and testing distance to segments.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} testX - X coordinate to test.
     * @param {number} testY - Y coordinate to test.
     * @returns {boolean} True if the point hits the curve, false otherwise.
     */
    isHit(canvas, testX, testY) {
        const me = this;
        const margin = Number(me.hitMargin) || 0;
        const samples = Number(me.hitSamples) || 24;

        // quick bounding-box reject with margin
        const minX = Math.min(me.startX, me.control1X, me.control2X, me.endX) - margin;
        const maxX = Math.max(me.startX, me.control1X, me.control2X, me.endX) + margin;
        const minY = Math.min(me.startY, me.control1Y, me.control2Y, me.endY) - margin;
        const maxY = Math.max(me.startY, me.control1Y, me.control2Y, me.endY) + margin;
        if (testX < minX || testX > maxX || testY < minY || testY > maxY) return false;

        // sample the curve and check segments
        const toPoint = t => {
            const inv = 1 - t;
            // cubic Bezier: (1-t)^3 P0 + 3(1-t)^2 t C1 + 3(1-t) t^2 C2 + t^3 P3
            const x =
                inv * inv * inv * me.startX +
                3 * inv * inv * t * me.control1X +
                3 * inv * t * t * me.control2X +
                t * t * t * me.endX;
            const y =
                inv * inv * inv * me.startY +
                3 * inv * inv * t * me.control1Y +
                3 * inv * t * t * me.control2Y +
                t * t * t * me.endY;
            return { x, y };
        };

        let prev = toPoint(0);
        for (let i = 1; i <= samples; i++) {
            const t = i / samples;
            const cur = toPoint(t);

            const dx = cur.x - prev.x;
            const dy = cur.y - prev.y;
            const segLenSq = dx * dx + dy * dy;

            if (segLenSq === 0) {
                const d = Math.hypot(testX - prev.x, testY - prev.y);
                if (d <= me.lineWidth + margin) return true;
            } else {
                let proj = ((testX - prev.x) * dx + (testY - prev.y) * dy) / segLenSq;
                if (proj < 0) proj = 0;
                else if (proj > 1) proj = 1;
                const projX = prev.x + proj * dx;
                const projY = prev.y + proj * dy;
                const dist = Math.hypot(testX - projX, testY - projY);
                if (dist <= me.lineWidth + margin) return true;
            }

            prev = cur;
        }

        return false;
    }

    /**
     * Move all control points by the given deltas.
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
        me.control1X += dx;
        me.control1Y += dy;
        me.control2X += dx;
        me.control2Y += dy;
        me.endX += dx;
        me.endY += dy;
    }

    /**
     * Edit the curve's mutable properties.
     *
     * Supported properties:
     *  - startX,startY,control1X,control1Y,control2X,control2Y,endX,endY
     *  - color,lineWidth,lineDash,lineDashOffset,lineCap,lineJoin,hitSamples
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
            'control1X',
            'control1Y',
            'control2X',
            'control2Y',
            'endX',
            'endY',
            'color',
            'lineWidth',
            'lineDash',
            'lineDashOffset',
            'lineCap',
            'lineJoin',
            'hitSamples'
        ];
        keys.forEach(k => {
            if (k in newProperties) me[k] = newProperties[k];
        });
    }

    /**
     * Draws selection handles for the curve (start, control1, control2, end).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    drawSelectionHandles(canvas) {
        const me = this;
        const handleSize = 8;
        const handleColor = '#00ccff66';
        const handleBorderColor = '#00ccffff';
        const handleBorderSize = 2;

        // start handle
        new Handle(
            me.startX,
            me.startY,
            Handle.TYPES.SQUARE,
            me,
            handleSize,
            handleColor,
            handleBorderSize,
            handleBorderColor
        ).draw(canvas);

        // control anchors (draw directional anchors via HandleAnchor)
        new HandleAnchor(
            me.control1X,
            me.control1Y,
            me.startX - me.control1X,
            me.startY - me.control1Y,
            me.control2X - me.control1X,
            me.control2Y - me.control1Y,
            me,
            handleSize,
            handleColor,
            handleBorderSize,
            handleBorderColor
        ).draw(canvas);

        new HandleAnchor(
            me.control2X,
            me.control2Y,
            me.control1X - me.control2X,
            me.control1Y - me.control2Y,
            me.endX - me.control2X,
            me.endY - me.control2Y,
            me,
            handleSize,
            handleColor,
            handleBorderSize,
            handleBorderColor
        ).draw(canvas);

        // end handle
        new Handle(
            me.endX,
            me.endY,
            Handle.TYPES.SQUARE,
            me,
            handleSize,
            handleColor,
            handleBorderSize,
            handleBorderColor
        ).draw(canvas);
    }

    /**
     * Returns axis-aligned bounding box for the curve (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box of the curve.
     */
    getBoundingBox() {
        const me = this;
        const minX = Math.min(me.startX, me.control1X, me.control2X, me.endX);
        const minY = Math.min(me.startY, me.control1Y, me.control2Y, me.endY);
        const maxX = Math.max(me.startX, me.control1X, me.control2X, me.endX);
        const maxY = Math.max(me.startY, me.control1Y, me.control2Y, me.endY);
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
            control1X: me.control1X,
            control1Y: me.control1Y,
            control2X: me.control2X,
            control2Y: me.control2Y,
            endX: me.endX,
            endY: me.endY,
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: me.lineDash,
            lineDashOffset: me.lineDashOffset,
            lineCap: me.lineCap,
            lineJoin: me.lineJoin,
            hitSamples: me.hitSamples
        });
    }

    /**
     * Recreates a BezierCurve instance from JSON produced by toJSON().
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @returns {BezierCurve} New BezierCurve instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for BezierCurve.fromJSON');
        const c = new BezierCurve(
            Number(json.startX) || 0,
            Number(json.startY) || 0,
            Number(json.control1X) || 0,
            Number(json.control1Y) || 0,
            Number(json.control2X) || 0,
            Number(json.control2Y) || 0,
            Number(json.endX) || 0,
            Number(json.endY) || 0
        );
        c.edit({
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: json.lineDash,
            lineDashOffset: json.lineDashOffset,
            lineCap: json.lineCap,
            lineJoin: json.lineJoin,
            hitSamples: json.hitSamples
        });
        if (json.id) c.uniqueId = json.id;
        return c;
    }
}
