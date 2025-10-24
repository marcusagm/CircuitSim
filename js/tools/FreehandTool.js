import Tool from './Tool.js';
import Freehand from '../shapes/Freehand.js';

/**
 * Description:
 *  Tool for drawing freehand strokes on the canvas. User presses the mouse to start a stroke,
 *  moves the pointer to append points, and releases to finalize. Strokes with fewer than two points
 *  are discarded.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *  - isDrawing {boolean} (inherited) : Whether a drawing operation is in progress.
 *  - startX {number} (inherited) : X coordinate where the current drawing started.
 *  - startY {number} (inherited) : Y coordinate where the current drawing started.
 *  - _currentFreehand {Freehand|null} : Backing field for the Freehand instance being drawn.
 *
 * Typical usage:
 *   const tool = new FreehandTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // press-drag-release on canvas to draw freehand strokes
 *
 * Notes:
 *  - Strokes are represented by the Freehand shape which stores an ordered array of points.
 *  - This tool delegates validation and persistence to the Freehand shape and the DrawingManager.
 *
 * @class FreehandTool
 */
export default class FreehandTool extends Tool {
    /**
     * Internal current freehand backing field.
     * @type {Freehand|null}
     * @private
     */
    _currentFreehand = null;

    /**
     * Creates an instance of FreehandTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me._currentFreehand = null;
    }

    /**
     * currentFreehand getter.
     *
     * @returns {Freehand|null} The Freehand instance currently being drawn or null.
     */
    get currentFreehand() {
        return this._currentFreehand;
    }

    /**
     * currentFreehand setter with validation.
     *
     * Accepts Freehand instances or null. On invalid value, logs a warning and keeps previous value.
     *
     * @param {Freehand|null} value - New Freehand instance or null.
     * @returns {void}
     */
    set currentFreehand(value) {
        const me = this;
        if (value !== null && !(value instanceof Freehand)) {
            console.warn(
                `[FreehandTool] invalid currentFreehand assignment (${value}). Keeping previous value: ${me._currentFreehand}`
            );
            return;
        }
        me._currentFreehand = value;
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override. This tool performs no special activation work.
     *
     * @returns {void}
     */
    activate() {
        // no-op activation for FreehandTool
    }

    /**
     * Deactivate the tool.
     *
     * Clears any in-progress stroke.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        if (me._currentFreehand) {
            // If a stroke is in progress, cancel it
            me.drawingManager.removeElement(me._currentFreehand);
        }
        me.currentFreehand = null;
        me.isDrawing = false;
    }

    /**
     * Handle mouse down event: begin a new freehand stroke.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const coordinateX = Number(coords.x) || 0;
        const coordinateY = Number(coords.y) || 0;

        me.isDrawing = true;
        me.startX = coordinateX;
        me.startY = coordinateY;

        // Create new Freehand and add the first point
        const stroke = new Freehand();
        stroke.addPoint(coordinateX, coordinateY);

        me.currentFreehand = stroke;
        me.drawingManager.addElement(me.currentFreehand);
    }

    /**
     * Handle mouse move event: append points to the current stroke.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawing || !me.currentFreehand) return;

        const coords = me.getMouseCoords(event);
        const coordinateX = Number(coords.x) || 0;
        const coordinateY = Number(coords.y) || 0;

        me.currentFreehand.addPoint(coordinateX, coordinateY);
        me.canvas.requestRender();
    }

    /**
     * Handle mouse up event: finalize the current stroke.
     *
     * If the stroke has fewer than two points it is removed.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        const me = this;
        if (!me.isDrawing) return;

        me.isDrawing = false;

        if (!me.currentFreehand) {
            me.canvas.requestRender();
            return;
        }

        const points = me.currentFreehand.points;
        if (!Array.isArray(points) || points.length < 2) {
            // Discard trivial stroke
            me.drawingManager.removeElement(me.currentFreehand);
        }

        me.currentFreehand = null;
        me.canvas.requestRender();
    }
}
