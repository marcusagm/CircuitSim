import Tool from './Tool.js';
import TextBox from '../shapes/TextBox.js';

/**
 * Description:
 *  Tool to create a TextBox on the canvas by clicking. Prompts the user for text content
 *  and places a TextBox at the clicked coordinates.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} : Canvas instance (inherited).
 *  - drawingManager {import('../core/DrawingManager.js').default} : Drawing manager (inherited).
 *
 * Typical usage:
 *   const tool = new TextBoxTool(canvas, drawingManager);
 *   tool.activate();
 *
 * Notes / Additional:
 *  - This tool is a simple "click-to-create" command and does not track drag events.
 */
export default class TextBoxTool extends Tool {
    /**
     * Creates an instance of TextBoxTool.
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
     * @returns {void}
     */
    activate() {
        // no-op for this simple tool; activation handled by tool manager
    }

    /**
     * Deactivate the tool.
     *
     * @returns {void}
     */
    deactivate() {
        // no-op
    }

    /**
     * Handle mouse down: prompt for text and create a TextBox at the clicked coordinates.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const { x, y } = me.getMouseCoords(event);
        const textContent = window.prompt('Digite o texto:');
        if (textContent !== null && textContent.trim() !== '') {
            const newTextBox = new TextBox(Number(x) || 0, Number(y) || 0, textContent);
            me.drawingManager.addElement(newTextBox);
            me.canvas.requestRender();
        }
    }

    /**
     * Handle mouse move. This tool does not use mouse move events.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        // intentionally empty
    }

    /**
     * Handle mouse up. This tool does not use mouse up events.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        // intentionally empty
    }
}
