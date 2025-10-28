import Shape from './Shape.js';
import Handle from '../components/Handle.js';

/**
 * Description:
 *  Represents a multi-segment polyline drawable on the canvas. Points are stored
 *  in world coordinates and the shape supports drawing, editing, hit-testing,
 *  moving, serialization and selection handles.
 *
 * Properties summary:
 *  - points {Array<{x:number, y:number}>} : Array of points defining the polyline.
 *  - color {string} : Stroke color.
 *  - lineWidth {number} : Stroke thickness in pixels.
 *  - lineDash {Array<number>} : Dash pattern for stroke.
 *  - lineDashOffset {number} : Dash offset.
 *  - lineCap {string} : Stroke lineCap ('butt'|'round'|'square').
 *  - lineJoin {string} : Stroke lineJoin ('miter'|'round'|'bevel').
 *
 * Typical usage:
 *   const pl = new PolyLine(10, 10);
 *   pl.addPoint(50, 10);
 *   drawingManager.addElement(pl);
 *
 * Notes / Additional:
 *  - hitMargin is provided by Shape and should be used by subclasses (do not revalidate it).
 *  - Methods keep cyclomatic complexity low and use `const me = this` in longer methods.
 */
export default class PolyLine extends Shape {
    /**
     * Internal points backing field.
     * @type {Array<{x:number,y:number}>}
     * @private
     */
    _points = [];

    /**
     * Internal color backing field.
     * @type {string}
     * @private
     */
    _color = '#000000';

    /**
     * Internal lineWidth backing field.
     * @type {number}
     * @private
     */
    _lineWidth = 1;

    /**
     * Internal lineDash backing field.
     * @type {Array<number>}
     * @private
     */
    _lineDash = [];

    /**
     * Internal lineDashOffset backing field.
     * @type {number}
     * @private
     */
    _lineDashOffset = 0;

    /**
     * Internal lineCap backing field.
     * @type {string}
     * @private
     */
    _lineCap = 'round';

    /**
     * Internal lineJoin backing field.
     * @type {string}
     * @private
     */
    _lineJoin = 'round';

    /**
     * Creates an instance of PolyLine.
     *
     * @param {number} initialXCoordinate - X coordinate of first point.
     * @param {number} initialYCoordinate - Y coordinate of first point.
     */
    constructor(initialXCoordinate, initialYCoordinate) {
        super(initialXCoordinate, initialYCoordinate);
        const me = this;
        me._points = [{ x: Number(initialXCoordinate) || 0, y: Number(initialYCoordinate) || 0 }];
    }

    /**
     * Points getter.
     *
     * @returns {Array<{x:number,y:number}>}
     */
    get points() {
        return this._points;
    }

    /**
     * Points setter with validation (replaces entire points array).
     *
     * @param {Array<{x:number,y:number}>} value - New points array.
     * @returns {void}
     */
    set points(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[PolyLine] invalid points assignment (${value}). Must be an array. Keeping previous value.`
            );
            return;
        }
        const ok = value.every(
            point =>
                point &&
                typeof point === 'object' &&
                !Number.isNaN(Number(point.x)) &&
                !Number.isNaN(Number(point.y))
        );
        if (!ok) {
            console.warn(`[PolyLine] invalid points provided. Keeping previous value.`);
            return;
        }
        me._points = value.map(p => ({ x: Number(p.x), y: Number(p.y) }));
    }

    /**
     * Color getter.
     *
     * @returns {string}
     */
    get color() {
        return this._color;
    }

    /**
     * Color setter with basic validation.
     *
     * @param {string} value - CSS color string.
     * @returns {void}
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[PolyLine] invalid color assignment (${value}). Must be a string. Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * lineWidth getter.
     *
     * @returns {number}
     */
    get lineWidth() {
        return this._lineWidth;
    }

    /**
     * lineWidth setter with numeric validation (must be >= 0).
     *
     * @param {number} value - New stroke width in pixels.
     * @returns {void}
     */
    set lineWidth(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n) || n < 0) {
            console.warn(
                `[PolyLine] invalid lineWidth assignment (${value}). Must be a non-negative number. Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = n;
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
     * @param {Array<number>} value - Array of numbers for dash pattern.
     * @returns {void}
     */
    set lineDash(value) {
        const me = this;
        if (!Array.isArray(value) || !value.every(n => typeof n === 'number')) {
            console.warn(
                `[PolyLine] invalid lineDash assignment (${value}). Must be an array of numbers. Keeping previous value.`
            );
            return;
        }
        me._lineDash = value.slice();
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
     * @param {number} value - Offset for dash pattern.
     * @returns {void}
     */
    set lineDashOffset(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n)) {
            console.warn(
                `[PolyLine] invalid lineDashOffset assignment (${value}). Keeping previous value: ${me._lineDashOffset}`
            );
            return;
        }
        me._lineDashOffset = n;
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
     * @param {string} value - 'butt'|'round'|'square'
     * @returns {void}
     */
    set lineCap(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[PolyLine] invalid lineCap assignment (${value}). Keeping previous value: ${me._lineCap}`
            );
            return;
        }
        me._lineCap = value;
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
     * @param {string} value - 'miter'|'round'|'bevel'
     * @returns {void}
     */
    set lineJoin(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[PolyLine] invalid lineJoin assignment (${value}). Keeping previous value: ${me._lineJoin}`
            );
            return;
        }
        me._lineJoin = value;
    }

    /**
     * Adds a new point to the polyline.
     *
     * @param {number} xCoordinate
     * @param {number} yCoordinate
     * @returns {void}
     */
    addPoint(xCoordinate, yCoordinate) {
        const me = this;
        me._points.push({ x: Number(xCoordinate) || 0, y: Number(yCoordinate) || 0 });
    }

    /**
     * Removes a point at the specified index.
     *
     * @param {number} index - Index of the point to remove.
     * @returns {void}
     */
    removePoint(index) {
        const me = this;
        if (typeof index !== 'number' || index < 0 || index >= me._points.length) return;
        me._points.splice(index, 1);
    }

    /**
     * Updates the last point coordinates.
     *
     * @param {number} xCoordinate
     * @param {number} yCoordinate
     * @returns {void}
     */
    updateLastPoint(xCoordinate, yCoordinate) {
        const me = this;
        if (me._points.length === 0) return;
        me._points[me._points.length - 1] = {
            x: Number(xCoordinate) || 0,
            y: Number(yCoordinate) || 0
        };
    }

    /**
     * Draws the polyline on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        if (me._points.length < 1) return;

        canvas
            .setStrokeColor(me.color)
            .setStrokeWidth(me.lineWidth)
            .setStrokeDash(me.lineDash)
            .setStrokeDashOffset(me.lineDashOffset)
            .setStrokeCap(me.lineCap)
            .setStrokeJoin(me.lineJoin);

        canvas.beginPath();
        const first = me._points[0];
        canvas.moveTo(first.x, first.y);
        for (const pt of me._points.slice(1)) {
            canvas.lineTo(pt.x, pt.y);
        }
        canvas.stroke();
        canvas.restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: returns true if (checkingXCoordinate, checkingYCoordinate) is within stroke tolerance.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction (unused but accepted by convention).
     * @param {number} checkingXCoordinate
     * @param {number} checkingYCoordinate
     * @returns {boolean}
     */
    isHit(canvas, checkingXCoordinate, checkingYCoordinate) {
        const me = this;
        const px = Number(checkingXCoordinate) || 0;
        const py = Number(checkingYCoordinate) || 0;
        const halfStroke = (Number(me.lineWidth) || 0) / 2;
        const hitTolerance = halfStroke + Number(me.hitMargin || 0);
        const hitToleranceSq = hitTolerance * hitTolerance;

        const pts = me._points;
        for (let index = 0; index < pts.length - 1; index++) {
            const a = pts[index];
            const b = pts[index + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const lenSq = dx * dx + dy * dy;

            if (lenSq === 0) {
                const distSq = (px - a.x) * (px - a.x) + (py - a.y) * (py - a.y);
                if (distSq <= hitToleranceSq) return true;
                continue;
            }

            const t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;

            let cx;
            let cy;
            if (t <= 0) {
                cx = a.x;
                cy = a.y;
            } else if (t >= 1) {
                cx = b.x;
                cy = b.y;
            } else {
                cx = a.x + t * dx;
                cy = a.y + t * dy;
            }

            const distSq = (px - cx) * (px - cx) + (py - cy) * (py - cy);
            if (distSq <= hitToleranceSq) return true;
        }

        return false;
    }

    /**
     * Moves the entire polyline by deltaX/deltaY.
     *
     * @param {number} deltaX
     * @param {number} deltaY
     * @returns {void}
     */
    move(deltaX, deltaY) {
        const me = this;
        const dx = Number(deltaX) || 0;
        const dy = Number(deltaY) || 0;
        for (const p of me._points) {
            p.x += dx;
            p.y += dy;
        }
        super.move(dx, dy);
    }

    /**
     * Edit mutable properties of the polyline via setters.
     *
     * Supported properties: points, color, lineWidth, lineDash, lineDashOffset, lineCap, lineJoin
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void}
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
        for (let index = 0; index < me._points.length; index++) {
            const pt = me._points[index];
            new Handle(pt.x, pt.y, Handle.TYPES.DOT, me).draw(canvas);
        }
    }

    /**
     * Returns axis-aligned bounding box for the stroke (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}}
     */
    getBoundingBox() {
        const me = this;
        if (me._points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const pt of me._points) {
            if (pt.x < minX) minX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y > maxY) maxY = pt.y;
        }
        const margin = Number(me.hitMargin || 0);
        return {
            x: minX - margin,
            y: minY - margin,
            width: Math.max(0, maxX - minX) + margin * 2,
            height: Math.max(0, maxY - minY) + margin * 2
        };
    }

    /**
     * Serialize to JSON.
     *
     * @returns {Object}
     */
    toJSON() {
        const me = this;
        return Object.assign({}, super.toJSON(), {
            points: me._points.map(p => ({ x: p.x, y: p.y })),
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: Array.isArray(me.lineDash) ? me.lineDash.slice() : [],
            lineDashOffset: me.lineDashOffset,
            lineCap: me.lineCap,
            lineJoin: me.lineJoin
        });
    }

    /**
     * Recreate a PolyLine from JSON produced by toJSON().
     *
     * @param {Object} json
     * @returns {PolyLine}
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for PolyLine.fromJSON');
        const firstX = Number(json.x) || 0;
        const firstY = Number(json.y) || 0;
        const instance = new PolyLine(firstX, firstY);
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
