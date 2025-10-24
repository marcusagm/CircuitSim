import Shape from './Shape.js';
import Handle from '../components/Handle.js';

/**
 * Description: Represents a freehand/polyline drawing made of sequential points.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier
 *  - positionX {number} (inherited): canonical X coordinate (not used as primary storage for freehand)
 *  - positionY {number} (inherited): canonical Y coordinate (not used as primary storage for freehand)
 *  - points {Array<{x:number,y:number}>} : ordered list of points composing the freehand stroke
 *  - color {string} : stroke color (CSS string)
 *  - lineWidth {number} : stroke thickness (pixels)
 *  - lineDash {Array<number>} : dash pattern for stroke
 *  - lineDashOffset {number} : dash offset for stroke
 *  - lineCap {string} : line cap style ('butt','round','square')
 *  - lineJoin {string} : line join style ('miter','round','bevel')
 *  - hitMargin {number} (inherited) : extra pixels for hit-testing
 *  - isSelected {boolean} (inherited): selection state
 *  - zIndex {number} (inherited): rendering order
 *
 * Typical usage:
 *   const stroke = new Freehand();
 *   stroke.addPoint(10, 10);
 *   stroke.addPoint(12, 11);
 *   stroke.color = '#333';
 *   canvas.addShape(stroke);
 *   canvas.render();
 *
 * Notes:
 *  - All mutable visual properties are validated by setters. Invalid assignments are ignored and emit standardized console.warn messages.
 *  - Hit-testing iterates segments and considers Shape.hitMargin (configurable).
 *  - For performance, consider simplifying or spatially indexing points for very long strokes.
 *
 * @class Freehand
 */
export default class Freehand extends Shape {
    /**
     * Internal points backing field
     *
     * @type {Array<{x:number,y:number}>}
     * @private
     */
    _points = [];

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
     * Creates a new Freehand instance.
     * positionX/positionY default to 0; canonical position isn't used for storage of points.
     *
     * @param {Array<{x:number,y:number}>} [points=[]] - Optional initial points.
     */
    constructor(points = []) {
        super(0, 0);
        const me = this;
        me.points = points; // use setter for validation
        me.color = '#000000';
        me.lineWidth = 1;
        me.lineDash = [];
        me.lineDashOffset = 0;
        me.lineCap = 'butt';
        me.lineJoin = 'miter';
    }

    /**
     * points getter.
     *
     * @returns {Array<{x:number,y:number}>} The ordered list of points composing the stroke.
     */
    get points() {
        return this._points.slice(); // return copy to avoid external mutation
    }

    /**
     * points setter with validation.
     * Accepts arrays of {x:number,y:number}. Invalid assignments are ignored with a warning.
     *
     * @param {Array<{x:number,y:number}>} value - New points array.
     */
    set points(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[Freehand] invalid points assignment (${value}). Points must be an array. Keeping previous value: ${me._points}`
            );
            return;
        }
        // validate each point
        const sanitized = [];
        for (const p of value) {
            const x = Number(p && p.x);
            const y = Number(p && p.y);
            if (Number.isNaN(x) || Number.isNaN(y)) {
                // skip invalid points
                continue;
            }
            sanitized.push({ x, y });
        }
        me._points = sanitized;
    }

    /**
     * color getter.
     *
     * @returns {string} Stroke color (CSS string).
     */
    get color() {
        return this._color;
    }

    /**
     * color setter with basic validation.
     * Accepts strings only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {string} value - New stroke color.
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Freehand] invalid color assignment (${value}). Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * lineWidth getter.
     *
     * @returns {number} Stroke thickness in pixels.
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
        const num = Number(value);
        if (Number.isNaN(num) || num <= 0) {
            console.warn(
                `[Freehand] invalid lineWidth assignment (${value}). Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = num;
    }

    /**
     * lineDash getter.
     *
     * @returns {Array<number>} Dash pattern array.
     */
    get lineDash() {
        return this._lineDash;
    }

    /**
     * lineDash setter with validation.
     * Accepts arrays only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {Array<number>} value - New dash pattern.
     */
    set lineDash(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[Freehand] invalid lineDash assignment (${value}). Keeping previous value: ${me._lineDash}`
            );
            return;
        }
        me._lineDash = value;
    }

    /**
     * lineDashOffset getter.
     *
     * @returns {number} Dash offset.
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
        const num = Number(value);
        if (Number.isNaN(num)) {
            console.warn(
                `[Freehand] invalid lineDashOffset assignment (${value}). Keeping previous value: ${me._lineDashOffset}`
            );
            return;
        }
        me._lineDashOffset = num;
    }

    /**
     * lineCap getter.
     *
     * @returns {string} Line cap style.
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
                `[Freehand] invalid lineCap assignment (${value}). Keeping previous value: ${me._lineCap}`
            );
            return;
        }
        me._lineCap = value;
    }

    /**
     * lineJoin getter.
     *
     * @returns {string} Line join style.
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
                `[Freehand] invalid lineJoin assignment (${value}). Keeping previous value: ${me._lineJoin}`
            );
            return;
        }
        me._lineJoin = value;
    }

    /**
     * Adds a point to the end of the stroke.
     *
     * @param {number} x - X coordinate of the new point.
     * @param {number} y - Y coordinate of the new point.
     * @returns {void} Nothing.
     */
    addPoint(x, y) {
        const me = this;
        const nx = Number(x);
        const ny = Number(y);
        if (Number.isNaN(nx) || Number.isNaN(ny)) {
            console.warn(
                `[Freehand] invalid addPoint(${x}, ${y}) call. Point coordinates must be numbers.`
            );
            return;
        }
        // push to internal array
        me._points.push({ x: nx, y: ny });
    }

    /**
     * Draw the freehand stroke on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    draw(canvas) {
        const me = this;
        if (me._points.length < 2) return;

        // configure stroke
        canvas
            .setStrokeColor(me.color)
            .setStrokeWidth(me.lineWidth)
            .setStrokeDash(me.lineDash)
            .setStrokeDashOffset(me.lineDashOffset)
            .setStrokeCap(me.lineCap)
            .setStrokeJoin(me.lineJoin);

        // begin path using Canvas wrapper's moveTo/lineTo
        canvas.moveTo(me._points[0].x, me._points[0].y);
        for (let i = 1; i < me._points.length; i++) {
            const pt = me._points[i];
            canvas.lineTo(pt.x, pt.y);
        }

        // stroke and restore state
        canvas.stroke().restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test the stroke: true if the point is within hitMargin of any segment or endpoint.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} testX - X coordinate to test.
     * @param {number} testY - Y coordinate to test.
     * @returns {boolean} True if the point hits the stroke, false otherwise.
     */
    isHit(canvas, testX, testY) {
        const me = this;
        const margin = Number(me.hitMargin) || 0;
        if (me._points.length === 0) return false;

        for (let i = 0; i < me._points.length - 1; i++) {
            const p1 = me._points[i];
            const p2 = me._points[i + 1];
            const deltaX = p2.x - p1.x;
            const deltaY = p2.y - p1.y;
            const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;
            if (segmentLengthSquared === 0) {
                // degenerate to point distance
                const d = Math.hypot(testX - p1.x, testY - p1.y);
                if (d <= me.lineWidth + margin) return true;
                continue;
            }

            let t = ((testX - p1.x) * deltaX + (testY - p1.y) * deltaY) / segmentLengthSquared;
            // clamp projection to segment
            if (t < 0) t = 0;
            else if (t > 1) t = 1;

            const projX = p1.x + t * deltaX;
            const projY = p1.y + t * deltaY;
            const distance = Math.hypot(testX - projX, testY - projY);
            if (distance <= me.lineWidth + margin) return true;
        }

        return false;
    }

    /**
     * Move the entire stroke by given deltas.
     *
     * @param {number} deltaX - Horizontal shift.
     * @param {number} deltaY - Vertical shift.
     * @returns {void} Nothing.
     */
    move(deltaX, deltaY) {
        const me = this;
        const dx = Number(deltaX) || 0;
        const dy = Number(deltaY) || 0;
        // update internal points
        me._points.forEach(pt => {
            pt.x += dx;
            pt.y += dy;
        });
        // update base position as well (keeps canonical origin consistent)
        super.move(dx, dy);
    }

    /**
     * Edit the freehand stroke's properties.
     *
     * Supported properties: points, color, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void} Nothing.
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = [
            'points',
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
     * Draw selection handles for the stroke.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    drawSelectionHandles(canvas) {
        const me = this;
        if (me._points.length === 0) return;

        // first and last point handles
        const first = me._points[0];
        const last = me._points[me._points.length - 1];
        new Handle(first.x, first.y, Handle.TYPES.SQUARE).draw(canvas);
        new Handle(last.x, last.y, Handle.TYPES.SQUARE).draw(canvas);

        // optional: dot for every point (kept, but can be heavy for many points)
        for (const pt of me._points) {
            new Handle(pt.x, pt.y, Handle.TYPES.DOT).draw(canvas);
        }
    }

    /**
     * Returns axis-aligned bounding box for the stroke (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box of stroke.
     */
    getBoundingBox() {
        const me = this;
        if (me._points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        for (const pt of me._points) {
            if (pt.x < minX) minX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y > maxY) maxY = pt.y;
        }
        const margin = Number(me.hitMargin) || 0;
        return {
            x: minX - margin,
            y: minY - margin,
            width: maxX - minX + margin * 2,
            height: maxY - minY + margin * 2
        };
    }

    /**
     * Serializes the stroke to JSON.
     *
     * @returns {Object} JSON representation of the stroke.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            points: me._points.map(p => ({ x: p.x, y: p.y })),
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: me.lineDash,
            lineDashOffset: me.lineDashOffset,
            lineCap: me.lineCap,
            lineJoin: me.lineJoin
        });
    }

    /**
     * Recreates a Freehand instance from JSON produced by toJSON().
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @returns {Freehand} New Freehand instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for Freehand.fromJSON');
        const pts = Array.isArray(json.points)
            ? json.points.map(p => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }))
            : [];
        const f = new Freehand(pts);
        f.edit({
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: json.lineDash,
            lineDashOffset: json.lineDashOffset,
            lineCap: json.lineCap,
            lineJoin: json.lineJoin
        });
        if (json.id) f.uniqueId = json.id;
        return f;
    }
}
