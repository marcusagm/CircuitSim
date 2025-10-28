import Tool from './Tool.js';
import SVGDrawing from '../shapes/SVGDrawing.js';

/**
 * Description:
 *  Tool for adding SVG drawings to the canvas. The user may paste SVG XML content
 *  or upload a local SVG file. The tool creates an SVGDrawing and adds it to the
 *  DrawingManager. SVG loading is asynchronous; SVGDrawing requests a redraw when ready.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *
 * Typical usage:
 *   const tool = new SVGTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // Click canvas to be prompted for Content or File; SVG will be inserted at click position.
 *
 * Notes / Additional:
 *  - This tool assumes DrawingManager API is present (no defensive existence checks).
 *  - getMouseCoords returns { x, y } (canvas-relative). Do not rely on other property names.
 *  - For production UI, replace blocking prompt/alert with non-blocking dialogs.
 */
export default class SVGTool extends Tool {
    /**
     * Creates an instance of SVGTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        // no additional backing fields required
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override; SVGTool uses a no-op activation.
     *
     * @returns {void}
     */
    activate() {
        // no-op
    }

    /**
     * Deactivate the tool.
     *
     * Subclasses may override; SVGTool uses a no-op deactivation.
     *
     * @returns {void}
     */
    deactivate() {
        // no-op
    }

    /**
     * Handles the mouse down event. Prompts the user for SVG content or a file,
     * then creates an SVGDrawing placed at the clicked canvas coordinates.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        const inputType = prompt("Load SVG from (type 'Content' or 'File'):");
        if (inputType === null) return; // user cancelled

        const mode = String(inputType).trim().toLowerCase();
        if (mode === 'content') {
            const svgContent = prompt('Paste SVG content here:');
            if (svgContent !== null && String(svgContent).trim() !== '') {
                me.createSVGDrawing(x, y, String(svgContent));
            }
            return;
        }

        if (mode === 'file') {
            me.promptForLocalFile(x, y);
            return;
        }

        // If user typed something else (not null), inform them.
        alert("Invalid input. Please type 'Content' or 'File'.");
    }

    /**
     * Creates and adds an SVGDrawing to the drawing manager.
     *
     * @param {number} x - The X coordinate for the SVG.
     * @param {number} y - The Y coordinate for the SVG.
     * @param {string} svgContent - The SVG XML content as a string.
     * @returns {void}
     */
    createSVGDrawing(x, y, svgContent) {
        const me = this;
        const px = Number(x);
        const py = Number(y);
        if (Number.isNaN(px) || Number.isNaN(py)) {
            console.warn(
                `[SVGTool] invalid coordinates for createSVGDrawing (${x}, ${y}). Operation aborted.`
            );
            return;
        }
        if (!svgContent || typeof svgContent !== 'string') {
            console.warn(
                `[SVGTool] invalid svgContent for createSVGDrawing (${svgContent}). Operation aborted.`
            );
            return;
        }

        const newSVG = new SVGDrawing(px, py, svgContent);
        newSVG.drawingManager = me.drawingManager; // allow SVGDrawing to request redraw on load
        me.drawingManager.addElement(newSVG);
        me.canvas.requestRender();
    }

    /**
     * Prompts the user to select a local SVG file, reads it as text, and creates an SVGDrawing.
     *
     * @param {number} x - The X coordinate for the SVG.
     * @param {number} y - The Y coordinate for the SVG.
     * @returns {void}
     */
    promptForLocalFile(x, y) {
        const me = this;
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/svg+xml';

        fileInput.onchange = event => {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const result = e && e.target ? e.target.result : null;
                if (result && typeof result === 'string') {
                    me.createSVGDrawing(x, y, result);
                } else {
                    console.error('[SVGTool] failed to read SVG file as text.');
                    alert('Failed to read SVG file. See console for details.');
                }
            };
            reader.onerror = err => {
                console.error('[SVGTool] FileReader error:', err);
                alert('Failed to read file. See console for details.');
            };
            reader.readAsText(file);
        };

        fileInput.click();
    }

    /**
     * Handles mouse move event. SVGTool does not use mouse move.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        // no-op
    }

    /**
     * Handles mouse up event. SVGTool does not use mouse up.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        // no-op
    }
}
