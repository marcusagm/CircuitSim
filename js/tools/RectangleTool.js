import Tool from './Tool.js';
import Rectangle from '../shapes/Rectangle.js';

/**
 * Description:
 *  Tool for drawing axis-aligned rectangles on the canvas. The user clicks to start
 *  the rectangle and drags to size it. Release finalizes the rectangle; zero-sized
 *  rectangles are discarded.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *  - isDrawing {boolean} (inherited) : Whether a drawing operation is in progress.
 *  - startX {number} (inherited) : X coordinate where drawing started.
 *  - startY {number} (inherited) : Y coordinate where drawing started.
 *  - _currentRectangle {Rectangle|null} : Rectangle instance being drawn (backing field).
 *
 * Typical usage:
 *   const tool = new RectangleTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // user presses mouse, drags and releases to create rectangles
 *
 * Notes / Additional:
 *  - All mutable properties are validated in setters.
 *  - Methods keep complexity low and use `const me = this` when appropriate.
 */
export default class RectangleTool extends Tool {
    /**
     * Internal current rectangle backing field.
     * @type {Rectangle|null}
     * @private
     */
    _currentRectangle = null;

    /**
     * Creates an instance of RectangleTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me._currentRectangle = null;
    }

    /**
     * currentRectangle getter.
     *
     * @returns {Rectangle|null} Rectangle currently being drawn or null.
     */
    get currentRectangle() {
        return this._currentRectangle;
    }

    /**
     * currentRectangle setter.
     *
     * @param {Rectangle|null} value - Rectangle instance or null.
     * @returns {void}
     */
    set currentRectangle(value) {
        const me = this;
        if (value !== null && !(value instanceof Rectangle)) {
            console.warn(
                `[RectangleTool] invalid currentRectangle assignment (${value}). Keeping previous value: ${me._currentRectangle}`
            );
            return;
        }
        me._currentRectangle = value;
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override to add activation behavior. This implementation is a no-op.
     *
     * @returns {void}
     */
    activate() {
        // no-op activation
    }

    /**
     * Deactivate the tool.
     *
     * Clears in-progress drawing state.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.isDrawing = false;
        me.currentRectangle = null;
    }

    /**
     * Handle mouse down event.
     *
     * Starts a new rectangle drawing operation at the mouse coordinates.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        me.isDrawing = true;
        me.startX = x;
        me.startY = y;

        const rect = new Rectangle(me.startX, me.startY, 0, 0);
        me.currentRectangle = rect;
        me.drawingManager.addElement(rect);
    }

    /**
     * Handle mouse move event.
     *
     * While drawing, updates the rectangle width and height to follow the cursor.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawing || !me.currentRectangle) return;

        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        const newWidth = x - me.startX;
        const newHeight = y - me.startY;

        // Assign directly to rectangle properties (setters on Rectangle will validate)
        me.currentRectangle.width = newWidth;
        me.currentRectangle.height = newHeight;

        me.canvas.requestRender();
    }

    /**
     * Handle mouse up event.
     *
     * Finalizes the rectangle. Ensures width/height are positive by normalizing
     * position and absolute sizes. Discards zero-area rectangles.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        const me = this;
        if (!me.isDrawing || !me.currentRectangle) return;

        me.isDrawing = false;

        // Normalize width/height to be positive and adjust position accordingly.
        let rectX = Number(me.currentRectangle.x) || 0;
        let rectY = Number(me.currentRectangle.y) || 0;
        let rectW = Number(me.currentRectangle.width) || 0;
        let rectH = Number(me.currentRectangle.height) || 0;

        if (rectW < 0) {
            rectX = rectX + rectW;
            rectW = Math.abs(rectW);
        }
        if (rectH < 0) {
            rectY = rectY + rectH;
            rectH = Math.abs(rectH);
        }

        me.currentRectangle.x = rectX;
        me.currentRectangle.y = rectY;
        me.currentRectangle.width = rectW;
        me.currentRectangle.height = rectH;

        // Discard zero-area rectangles
        if (rectW === 0 || rectH === 0) {
            me.drawingManager.removeElement(me.currentRectangle);
        }

        me.currentRectangle = null;
        me.canvas.requestRender();
    }
}
