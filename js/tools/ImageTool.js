import Tool from './Tool.js';
import ImageShape from '../shapes/Image.js';

/**
 * Description:
 *  Tool for adding raster images to the canvas. The user may supply an image URL
 *  or upload a local file. The tool creates an ImageShape and adds it to the
 *  DrawingManager. Image loading is asynchronous; ImageShape requests a redraw
 *  when loading completes.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *
 * Typical usage:
 *   const tool = new ImageTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // Click canvas to be prompted for URL or local file; image will be inserted at click position.
 *
 * Notes / Additional:
 *  - This tool assumes DrawingManager API is present (no defensive existence checks).
 *  - getMouseCoords returns { x, y } (canvas-relative). Do not rely on other property names.
 *  - All user-facing prompts are synchronous (prompt/alert); in a production UI replace with non-blocking dialogs.
 */
export default class ImageTool extends Tool {
    /**
     * Creates an instance of ImageTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        // No additional backing fields required for this tool.
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override; ImageTool uses no-op activation.
     *
     * @returns {void}
     */
    activate() {
        // no-op
    }

    /**
     * Deactivate the tool.
     *
     * Subclasses may override; ImageTool uses no-op deactivation.
     *
     * @returns {void}
     */
    deactivate() {
        // no-op
    }

    /**
     * Handles the mouse down event. Prompts the user for an image source (URL or local file)
     * and places the created ImageShape at the clicked canvas coordinates.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        const inputType = prompt("Load image from (type 'URL' or 'File'):");
        if (inputType === null) return; // user cancelled

        const mode = String(inputType).trim().toLowerCase();
        if (mode === 'url') {
            const imageUrl = prompt('Enter the image URL:');
            if (imageUrl !== null && String(imageUrl).trim() !== '') {
                me.createImageShape(x, y, String(imageUrl).trim());
            }
            return;
        }

        if (mode === 'file') {
            me.promptForLocalFile(x, y);
            return;
        }

        // If user typed something else (not null), inform them.
        alert("Invalid input. Please type 'URL' or 'File'.");
    }

    /**
     * Creates and adds an ImageShape to the drawing manager.
     *
     * @param {number} x - The X coordinate for the image.
     * @param {number} y - The Y coordinate for the image.
     * @param {string} source - The image source (URL or data URL).
     * @returns {void}
     */
    createImageShape(x, y, source) {
        const me = this;
        const px = Number(x);
        const py = Number(y);
        if (Number.isNaN(px) || Number.isNaN(py)) {
            console.warn(
                `[ImageTool] invalid coordinates for createImageShape (${x}, ${y}). Operation aborted.`
            );
            return;
        }
        if (!source || typeof source !== 'string') {
            console.warn(
                `[ImageTool] invalid source for createImageShape (${source}). Operation aborted.`
            );
            return;
        }

        const newImage = new ImageShape(px, py, source);
        newImage.drawingManager = me.drawingManager; // allow ImageShape to request redraw on load
        me.drawingManager.addElement(newImage);
        me.canvas.requestRender();
    }

    /**
     * Prompts the user to select a local image file and converts it to a Data URL,
     * then creates an ImageShape at the provided coordinates.
     *
     * @param {number} x - The X coordinate for the image.
     * @param {number} y - The Y coordinate for the image.
     * @returns {void}
     */
    promptForLocalFile(x, y) {
        const me = this;
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = event => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const result = e && e.target ? e.target.result : null;
                if (result && typeof result === 'string') {
                    me.createImageShape(x, y, result);
                } else {
                    console.error('[ImageTool] failed to read file as data URL.');
                }
            };
            reader.onerror = err => {
                console.error('[ImageTool] FileReader error:', err);
                alert('Failed to read file. See console for details.');
            };
            reader.readAsDataURL(file);
        };

        // Trigger the native file picker
        fileInput.click();
    }

    /**
     * Handles mouse move event. ImageTool does not use mouse move.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        // no-op
    }

    /**
     * Handles mouse up event. ImageTool does not use mouse up.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        // no-op
    }
}
