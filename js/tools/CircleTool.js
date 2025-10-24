import Tool from './Tool.js';
import Circle from '../shapes/Circle.js';

/**
 * Description:
 *  Tool for interactively drawing circles on the canvas. User presses mouse down to set center,
 *  drags to size the radius and releases to finalize. If radius is zero the circle is discarded.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance (from Tool).
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager (from Tool).
 *  - currentCircle {Circle|null} : The Circle instance currently being drawn.
 *  - isDrawing {boolean} : Whether a drawing operation is active.
 *  - startX {number} : X coordinate where drawing started (center).
 *  - startY {number} : Y coordinate where drawing started (center).
 *
 * Typical usage:
 *   const tool = new CircleTool(canvasInstance, drawingManager);
 *   tool.activate();
 *
 * Notes / Additional:
 *  - The tool creates a temporary Circle (currentCircle.isTemporary = true) while drawing.
 *  - On mouse up, if radius is zero the temporary circle is removed.
 *
 */
export default class CircleTool extends Tool {
    /**
     * Internal currentCircle backing field.
     *
     * @type {Circle|null}
     * @private
     */
    _currentCircle = null;

    /**
     * Internal isDrawing backing field.
     *
     * @type {boolean}
     * @private
     */
    _isDrawing = false;

    /**
     * Internal startX backing field.
     *
     * @type {number}
     * @private
     */
    _startX = 0;

    /**
     * Internal startY backing field.
     *
     * @type {number}
     * @private
     */
    _startY = 0;

    /**
     * Creates an instance of CircleTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me._currentCircle = null;
        me._isDrawing = false;
        me._startX = 0;
        me._startY = 0;
    }

    /**
     * currentCircle getter.
     *
     * @returns {Circle|null} The circle currently being drawn or null.
     */
    get currentCircle() {
        return this._currentCircle;
    }

    /**
     * currentCircle setter.
     *
     * @param {Circle|null} value - New current circle or null.
     * @returns {void}
     */
    set currentCircle(value) {
        const me = this;
        if (value !== null && !(value instanceof Circle)) {
            console.warn(
                `[CircleTool] invalid currentCircle assignment (${value}). Keeping previous value: ${me._currentCircle}`
            );
            return;
        }
        me._currentCircle = value;
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
     * @param {boolean} value - Whether the tool is currently drawing.
     * @returns {void}
     */
    set isDrawing(value) {
        this._isDrawing = Boolean(value);
    }

    /**
     * startX getter.
     *
     * @returns {number} X coordinate where drawing started.
     */
    get startX() {
        return this._startX;
    }

    /**
     * startX setter with numeric validation.
     *
     * @param {number} value - Starting X coordinate.
     * @returns {void}
     */
    set startX(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n)) {
            console.warn(
                `[CircleTool] invalid startX assignment (${value}). Keeping previous value: ${me._startX}`
            );
            return;
        }
        me._startX = n;
    }

    /**
     * startY getter.
     *
     * @returns {number} Y coordinate where drawing started.
     */
    get startY() {
        return this._startY;
    }

    /**
     * startY setter with numeric validation.
     *
     * @param {number} value - Starting Y coordinate.
     * @returns {void}
     */
    set startY(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n)) {
            console.warn(
                `[CircleTool] invalid startY assignment (${value}). Keeping previous value: ${me._startY}`
            );
            return;
        }
        me._startY = n;
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override to implement custom activation logic. This tool uses a no-op activation.
     *
     * @returns {void}
     */
    activate() {
        // no special activation needed
    }

    /**
     * Deactivate the tool.
     *
     * Subclasses may override to implement custom deactivation logic. This tool resets internal state.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        // Clean up any temporary drawing state
        if (me._currentCircle && me._isDrawing) {
            try {
                me.drawingManager.removeElement(me._currentCircle);
            } catch (e) {
                // ignore if not present
            }
        }
        me._currentCircle = null;
        me._isDrawing = false;
    }

    /**
     * Handle mouse down event.
     *
     * Starts a new circle centered at the mouse position.
     *
     * @param {MouseEvent} event - The mouse event.
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

        const circle = new Circle(me.startX, me.startY, 0);
        circle.isTemporary = true;
        me.currentCircle = circle;
        me.drawingManager.addElement(circle);
    }

    /**
     * Handle mouse move event.
     *
     * Updates the radius of the current circle while drawing (rubber-banding).
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawing || !me.currentCircle) return;

        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        const deltaX = x - me.startX;
        const deltaY = y - me.startY;
        const radius = Math.hypot(deltaX, deltaY);

        me.currentCircle.radius = radius;
        if (me.canvas && typeof me.canvas.requestRender === 'function') {
            me.canvas.requestRender();
        }
    }

    /**
     * Handle mouse up event.
     *
     * Finalizes the circle; if radius is zero removes the temporary circle.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        const me = this;
        if (!me.isDrawing || !me.currentCircle) return;

        me.isDrawing = false;

        // If radius is zero (or falsy), remove the temporary circle
        if (!me.currentCircle.radius) {
            try {
                me.drawingManager.removeElement(me.currentCircle);
            } catch (e) {
                // ignore if removal fails
            }
        } else {
            // finalize
            me.currentCircle.isTemporary = false;
        }

        me.currentCircle = null;

        if (me.canvas && typeof me.canvas.requestRender === 'function') {
            me.canvas.requestRender();
        }
    }
}
