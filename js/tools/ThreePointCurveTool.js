import Tool from './Tool.js';
import ThreePointCurve from '../shapes/ThreePointCurve.js';

/**
 * Description:
 *  Tool to create a quadratic (three-point) curve defined by a start point, a control point and an end point.
 *  User clicks: 1) start point, 2) end point (visualized), 3) control point — then curve is finalized.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *  - isDrawing {boolean} (inherited) : Whether a drawing operation is in progress.
 *  - startX {number} (inherited) : X coordinate where a drawing started.
 *  - startY {number} (inherited) : Y coordinate where a drawing started.
 *  - _currentCurve {ThreePointCurve|null} : Backing field for the curve being drawn.
 *  - _clickCount {number} : Backing field counting clicks in the current operation (0..2).
 *  - _startPoint {Object|null} : Backing field for the start point {x,y}.
 *  - _endPoint {Object|null} : Backing field for the end point {x,y}.
 *
 * Typical usage:
 *   const tool = new ThreePointCurveTool(canvas, drawingManager);
 *   tool.activate();
 *   // Click to set start, click to set end, click to set control, curve is created.
 *
 * Notes / Additional:
 *  - Uses ThreePointCurve shape which stores coordinates as (x1,y1) start, (cx,cy) control, (x2,y2) end.
 *  - All mutable fields use getters/setters with validation following WireToucan patterns.
 */
export default class ThreePointCurveTool extends Tool {
    /**
     * Internal current curve backing field.
     * @type {ThreePointCurve|null}
     * @private
     */
    _currentCurve = null;

    /**
     * Internal click counter backing field.
     * @type {number}
     * @private
     */
    _clickCount = 0;

    /**
     * Internal start point backing field.
     * @type {{x:number,y:number}|null}
     * @private
     */
    _startPoint = null;

    /**
     * Internal end point backing field.
     * @type {{x:number,y:number}|null}
     * @private
     */
    _endPoint = null;

    /**
     * Creates an instance of ThreePointCurveTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me._currentCurve = null;
        me._clickCount = 0;
        me._startPoint = null;
        me._endPoint = null;
    }

    /**
     * currentCurve getter.
     *
     * @returns {ThreePointCurve|null} Curve currently being drawn or null.
     */
    get currentCurve() {
        return this._currentCurve;
    }

    /**
     * currentCurve setter with validation.
     *
     * @param {ThreePointCurve|null} value - ThreePointCurve instance or null.
     * @returns {void}
     */
    set currentCurve(value) {
        const me = this;
        if (value !== null && !(value instanceof ThreePointCurve)) {
            console.warn(
                `[ThreePointCurveTool] invalid currentCurve assignment (${value}). Keeping previous value: ${me._currentCurve}`
            );
            return;
        }
        me._currentCurve = value;
    }

    /**
     * clickCount getter.
     *
     * @returns {number} Number of clicks in the current drawing operation (0..2).
     */
    get clickCount() {
        return this._clickCount;
    }

    /**
     * clickCount setter with numeric coercion.
     *
     * @param {number} value - New click count.
     * @returns {void}
     */
    set clickCount(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n) || n < 0) {
            console.warn(
                `[ThreePointCurveTool] invalid clickCount assignment (${value}). Keeping previous value: ${me._clickCount}`
            );
            return;
        }
        me._clickCount = Math.floor(n);
    }

    /**
     * startPoint getter.
     *
     * @returns {{x:number,y:number}|null} Start point or null.
     */
    get startPoint() {
        return this._startPoint;
    }

    /**
     * startPoint setter with validation.
     *
     * @param {{x:number,y:number}|null} value - Object with numeric x and y or null.
     * @returns {void}
     */
    set startPoint(value) {
        const me = this;
        if (value !== null) {
            if (
                typeof value !== 'object' ||
                Number.isNaN(Number(value.x)) ||
                Number.isNaN(Number(value.y))
            ) {
                console.warn(
                    `[ThreePointCurveTool] invalid startPoint assignment (${JSON.stringify(
                        value
                    )}). Keeping previous value: ${JSON.stringify(me._startPoint)}`
                );
                return;
            }
            me._startPoint = { x: Number(value.x), y: Number(value.y) };
            return;
        }
        me._startPoint = null;
    }

    /**
     * endPoint getter.
     *
     * @returns {{x:number,y:number}|null} End point or null.
     */
    get endPoint() {
        return this._endPoint;
    }

    /**
     * endPoint setter with validation.
     *
     * @param {{x:number,y:number}|null} value - Object with numeric x and y or null.
     * @returns {void}
     */
    set endPoint(value) {
        const me = this;
        if (value !== null) {
            if (
                typeof value !== 'object' ||
                Number.isNaN(Number(value.x)) ||
                Number.isNaN(Number(value.y))
            ) {
                console.warn(
                    `[ThreePointCurveTool] invalid endPoint assignment (${JSON.stringify(
                        value
                    )}). Keeping previous value: ${JSON.stringify(me._endPoint)}`
                );
                return;
            }
            me._endPoint = { x: Number(value.x), y: Number(value.y) };
            return;
        }
        me._endPoint = null;
    }

    /**
     * Activate the tool.
     *
     * Resets internal state so a new curve can be drawn.
     *
     * @returns {void}
     */
    activate() {
        const me = this;
        me.clickCount = 0;
        me.startPoint = null;
        me.endPoint = null;
        me.currentCurve = null;
    }

    /**
     * Deactivate the tool.
     *
     * Clears drawing state.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.clickCount = 0;
        me.startPoint = null;
        me.endPoint = null;
        me.currentCurve = null;
        me.isDrawing = false;
    }

    /**
     * Handle mouse down event.
     *
     * 1st click: set start point and create a temporary curve.
     * 2nd click: set end point (visualized).
     * 3rd click: set control point and finalize curve.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        if (me.clickCount === 0) {
            // first click -> start point
            me.startPoint = { x, y };
            // ThreePointCurve constructor signature: (x1, y1, cx, cy, x2, y2)
            me.currentCurve = new ThreePointCurve(x, y, x, y, x, y);
            me.drawingManager.addElement(me.currentCurve);
            me.isDrawing = true;
            me.clickCount = 1;
            return;
        }

        if (me.clickCount === 1) {
            // second click -> end point
            me.endPoint = { x, y };
            // set end on shape: x2/y2
            me.currentCurve.endX = x;
            me.currentCurve.endY = y;
            // control follows pointer for visualization
            me.currentCurve.controlX = x;
            me.currentCurve.controlY = y;
            me.clickCount = 2;
            return;
        }

        if (me.clickCount === 2) {
            // third click -> control point, finalize
            // set control on shape: cx/cy
            me.currentCurve.controlX = x;
            me.currentCurve.controlY = y;

            // finalize
            me.currentCurve = null;
            me.startPoint = null;
            me.endPoint = null;
            me.clickCount = 0;
            me.isDrawing = false;
            return;
        }
    }

    /**
     * Handle mouse move event.
     *
     * Updates visualization of the curve while drawing.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawing || !me.currentCurve) return;

        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        if (me.clickCount === 1) {
            // updating end point visualization and control point follows mouse
            me.currentCurve.endX = x;
            me.currentCurve.endY = y;
            me.currentCurve.controlX = x;
            me.currentCurve.controlY = y;
        } else if (me.clickCount === 2) {
            // updating control point visualization
            me.currentCurve.controlX = x;
            me.currentCurve.controlY = y;
        }
        me.canvas.requestRender();
    }

    /**
     * Handle mouse up event.
     *
     * No-op for this tool (finalization occurs on clicks).
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        // Intentionally empty; clicks drive the tool lifecycle.
    }
}
