import Tool from './Tool.js';
import Wire from '../components/Wire.js';

/**
 * Description:
 *  Tool to delete elements from the canvas. Clicking an element removes it from the DrawingManager.
 *  For wires, it also removes the wire reference from connected terminals to keep model consistent.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *
 * Typical usage:
 *   const tool = new DeleteTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // Click on an element to delete it.
 *
 * Notes / Additional:
 *  - This tool performs direct removals; undo/redo should be handled at DrawingManager level if available.
 *  - The tool assumes Wire and Terminal implement the expected API (Wire.startTerminal, Wire.endTerminal,
 *    Terminal.removeWire). Do not perform defensive existence checks here per project conventions.
 *
 * @class DeleteTool
 */
export default class DeleteTool extends Tool {
    /**
     * Creates an instance of DeleteTool.
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
     * Subclasses may override. DeleteTool performs no special activation work.
     *
     * @returns {void}
     */
    activate() {
        // no-op activation
    }

    /**
     * Deactivate the tool.
     *
     * Subclasses may override. DeleteTool performs no special deactivation work.
     *
     * @returns {void}
     */
    deactivate() {
        // no-op deactivation
    }

    /**
     * Handle mouse down event.
     *
     * Deletes the top-most element under the cursor. For wires, also removes references
     * from connected terminals so they no longer reference the removed wire.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        const clickedElement = me.drawingManager.findElementAt(x, y);
        if (!clickedElement) return;

        // If the element is a Wire, detach it from its terminals.
        if (clickedElement instanceof Wire) {
            if (clickedElement.startTerminal) {
                clickedElement.startTerminal.removeWire(clickedElement);
            }
            if (clickedElement.endTerminal) {
                clickedElement.endTerminal.removeWire(clickedElement);
            }
        }

        // Remove from drawing manager and request a render.
        me.drawingManager.removeElement(clickedElement);
        me.canvas.requestRender();
    }

    /**
     * Handle mouse move event.
     *
     * DeleteTool does not respond to mouse move events.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        // no-op
    }

    /**
     * Handle mouse up event.
     *
     * DeleteTool does not respond to mouse up events.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        // no-op
    }
}
