import Tool from './Tool.js';
import Point from '../shapes/Point.js';

/**
 * Description:
 *  Tool to add single Point shapes to the canvas. A left-click places a Point
 *  at the clicked canvas coordinates. This tool is intentionally simple and
 *  does not support dragging or multi-step interactions.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} : Canvas instance (inherited from Tool).
 *  - drawingManager {import('../core/DrawingManager.js').default} : Drawing manager (inherited from Tool).
 *
 * Typical usage:
 *   const tool = new PointTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // Click on canvas to add points
 *
 * Notes / Additional:
 *  - PointTool delegates validation and property persistence to the Point shape.
 *  - After adding a Point the tool requests a canvas render via the drawing manager.
 *
 * @class PointTool
 */
export default class PointTool extends Tool {
    /**
     * Creates an instance of PointTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    /**
     * Activate the tool.
     *
     * Subclasses may set up UI state here; this implementation is a no-op.
     *
     * @returns {void}
     */
    activate() {
        // No special activation steps required for PointTool.
    }

    /**
     * Deactivate the tool.
     *
     * Clean up any ephemeral state. This implementation is a no-op.
     *
     * @returns {void}
     */
    deactivate() {
        // No special deactivation steps required for PointTool.
    }

    /**
     * Handle mouse down: place a new Point at the clicked coordinates.
     *
     * @param {MouseEvent} event - The mouse event that triggered this action.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const positionX = Number(coords.x) || 0;
        const positionY = Number(coords.y) || 0;

        const newPoint = new Point(positionX, positionY);
        me.drawingManager.addElement(newPoint);
        me.canvas.requestRender();
    }

    /**
     * Handle mouse move. PointTool does not react to mouse move.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        // Intentionally no-op for PointTool.
    }

    /**
     * Handle mouse up. PointTool does not react to mouse up.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        // Intentionally no-op for PointTool.
    }
}
