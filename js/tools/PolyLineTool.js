import Tool from './Tool.js';
import PolyLine from '../shapes/PolyLine.js';

/**
 * Description:
 *  Tool for drawing continuous multi-segment polylines on the canvas.
 *  Users left-click to add vertices (start/extend the polyline) and right-click
 *  to finalize the current polyline. While drawing, moving the mouse updates
 *  the last vertex for a rubber-banding effect.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} : Canvas instance reference (inherited).
 *  - drawingManager {import('../core/DrawingManager.js').default} : Drawing manager reference (inherited).
 *  - currentLine {PolyLine|null} : The polyline currently being drawn.
 *  - isDrawing {boolean} : Flag indicating whether a continuous drawing operation is in progress.
 *  - _onContextMenuBound {Function|null} : Internal bound contextmenu handler for add/remove listener symmetry.
 *
 * Typical usage:
 *   const tool = new PolyLineTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // left-click to start and add segments, right-click to finish
 *
 * Notes / Additional:
 *  - This tool attaches a document-level contextmenu handler while active to intercept right-clicks.
 *  - Event listeners are cleaned up on deactivate().
 *  - All properties that change state are exposed via getters/setters where appropriate.
 *
 * @class PolyLineTool
 */
export default class PolyLineTool extends Tool {
    /**
     * Internal backing field for the currently active polyline.
     * @type {PolyLine|null}
     * @private
     */
    _currentLine = null;

    /**
     * Internal backing field for whether a drawing operation is active.
     * @type {boolean}
     * @private
     */
    _isDrawing = false;

    /**
     * Internal bound contextmenu handler reference (so removeEventListener can use the same reference).
     * @type {Function|null}
     * @private
     */
    _onContextMenuBound = null;

    /**
     * Creates an instance of PolyLineTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    /**
     * currentLine getter.
     *
     * @returns {PolyLine|null} The currently active polyline.
     */
    get currentLine() {
        return this._currentLine;
    }

    /**
     * currentLine setter.
     *
     * @param {PolyLine|null} value - PolyLine instance or null.
     * @returns {void}
     */
    set currentLine(value) {
        const me = this;
        if (value !== null && !(value instanceof PolyLine)) {
            console.warn(
                `[PolyLineTool] invalid currentLine assignment (${value}). Keeping previous value: ${me._currentLine}`
            );
            return;
        }
        me._currentLine = value;
    }

    /**
     * isDrawing getter.
     *
     * @returns {boolean} True if a drawing operation is active.
     */
    get isDrawing() {
        return this._isDrawing;
    }

    /**
     * isDrawing setter with boolean coercion.
     *
     * @param {boolean} value - New drawing state.
     * @returns {void}
     */
    set isDrawing(value) {
        this._isDrawing = Boolean(value);
    }

    /**
     * Activates the tool.
     *
     * Attaches a bound contextmenu listener to prevent the browser context menu
     * while this tool is active.
     *
     * @returns {void}
     */
    activate() {
        const me = this;
        me._onContextMenuBound = me.onContextMenu.bind(me);
        document.addEventListener('contextmenu', me._onContextMenuBound);
    }

    /**
     * Deactivates the tool.
     *
     * Removes the bound contextmenu listener and finalizes or discards an in-progress polyline.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        if (me._onContextMenuBound) {
            document.removeEventListener('contextmenu', me._onContextMenuBound);
            me._onContextMenuBound = null;
        }

        if (me.isDrawing && me.currentLine) {
            // If polyline has fewer than 2 points, remove it; otherwise keep as-is.
            if (!Array.isArray(me.currentLine.points) || me.currentLine.points.length < 2) {
                me.drawingManager.removeElement(me.currentLine);
            }
            me.currentLine = null;
            me.isDrawing = false;
            me.canvas.requestRender();
        }
    }

    /**
     * Handles mouse down events.
     *
     * Left-click starts a new polyline or adds a vertex to the current one.
     * Right-click finalizes the current polyline (if any).
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const { x, y } = me.getMouseCoords(event);

        // Left button: start/add segment
        if (event.button === 0) {
            if (!me.isDrawing) {
                me.isDrawing = true;
                me.currentLine = new PolyLine(x, y);
                me.drawingManager.addElement(me.currentLine);
            } else {
                me.currentLine.addPoint(x, y);
            }
            me.canvas.requestRender();
            return;
        }

        // Right button: finalize
        if (event.button === 2) {
            if (me.isDrawing && me.currentLine) {
                const points = Array.isArray(me.currentLine.points) ? me.currentLine.points : [];
                if (points.length > 0) {
                    const lastPoint = points[points.length - 1];
                    if (lastPoint.x !== x || lastPoint.y !== y) {
                        me.currentLine.updateLastPoint(x, y);
                    }
                }
                if (points.length < 2) {
                    me.drawingManager.removeElement(me.currentLine);
                }
                me.currentLine = null;
                me.isDrawing = false;
                me.canvas.requestRender();
            }
        }
    }

    /**
     * Handles mouse move events.
     *
     * Updates the last vertex of the active polyline to create a rubber-band effect.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawing || !me.currentLine) return;

        const { x, y } = me.getMouseCoords(event);
        me.currentLine.updateLastPoint(x, y);
        me.canvas.requestRender();
    }

    /**
     * Handles mouse up events.
     *
     * For continuous polyline drawing, mouse up does not finalize segments.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        // Intentionally empty: segments are added on mouse down for continuous drawing.
    }

    /**
     * Context menu handler used to intercept right-click while drawing.
     *
     * Prevents the browser context menu from opening during drawing operations.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onContextMenu(event) {
        event.preventDefault();
    }
}
