/* eslint-disable no-unused-vars */
/**
 * Description:
 *  Abstract base class representing a drawing or interaction tool in the canvas system.
 *  Tools handle mouse interactions and can manipulate drawable elements via the DrawingManager.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} : Reference to the canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} : Reference to the drawing manager handling drawable elements.
 *  - isDrawing {boolean} : Indicates if the tool is currently performing a drawing action.
 *  - startX {number} : X coordinate where the current drawing started.
 *  - startY {number} : Y coordinate where the current drawing started.
 *
 * Typical usage:
 *   class RectangleTool extends Tool {
 *       onMouseDown(event) { ... }
 *       onMouseMove(event) { ... }
 *       onMouseUp(event) { ... }
 *   }
 *   const tool = new RectangleTool(canvasInstance, drawingManager);
 *
 * Notes / Additional:
 *  - Subclasses MUST implement the abstract mouse event methods.
 *  - Coordinates provided by getMouseCoords are relative to the canvas element.
 */
export default class Tool {
    /**
     * Reference to the canvas instance where drawing occurs.
     * @type {import('../core/Canvas.js').default}
     * @private
     */
    _canvas = null;

    /**
     * Reference to the drawing manager handling drawable elements.
     * @type {import('../core/DrawingManager.js').default}
     * @private
     */
    _drawingManager = null;

    /**
     * Indicates if the tool is currently performing a drawing action.
     * @type {boolean}
     * @private
     */
    _isDrawing = false;

    /**
     * X coordinate where the current drawing started.
     * @type {number}
     * @private
     */
    _startX = 0;

    /**
     * Y coordinate where the current drawing started.
     * @type {number}
     * @private
     */
    _startY = 0;

    /**
     * Creates an instance of Tool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        this.canvas = canvas;
        this.drawingManager = drawingManager;
    }

    /**
     * canvas getter.
     *
     * @returns {import('../core/Canvas.js').default}
     */
    get canvas() {
        return this._canvas;
    }

    /**
     * Canvas setter.
     *
     * @param {import('../core/Canvas.js').default} value - Canvas instance to assign.
     * @returns {void}
     */
    set canvas(value) {
        if (!value) {
            console.warn(
                `[Tool] invalid canvas assignment (${value}). Keeping previous value: ${this._canvas}`
            );
            return;
        }
        this._canvas = value;
    }

    /**
     * drawingManager getter.
     *
     * @returns {import('../core/DrawingManager.js').default}
     */
    get drawingManager() {
        return this._drawingManager;
    }

    /**
     * DrawingManager setter.
     *
     * @param {import('../core/DrawingManager.js').default} value - Drawing manager instance to assign.
     * @returns {void}
     */
    set drawingManager(value) {
        if (!value) {
            console.warn(
                `[Tool] invalid drawingManager assignment (${value}). Keeping previous value: ${this._drawingManager}`
            );
            return;
        }
        this._drawingManager = value;
    }

    /**
     * isDrawing getter.
     *
     * @returns {boolean}
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
     * @returns {number}
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
        const num = Number(value);
        if (Number.isNaN(num)) {
            console.warn(
                `[Tool] invalid startX assignment (${value}). Keeping previous value: ${this._startX}`
            );
            return;
        }
        this._startX = num;
    }

    /**
     * startY getter.
     *
     * @returns {number}
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
        const num = Number(value);
        if (Number.isNaN(num)) {
            console.warn(
                `[Tool] invalid startY assignment (${value}). Keeping previous value: ${this._startY}`
            );
            return;
        }
        this._startY = num;
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override to implement custom activation logic.
     * Default implementation throws an error to ensure proper overriding.
     *
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    activate() {
        throw new Error("Method 'activate()' must be implemented by subclasses of Tool.");
    }

    /**
     * Deactivate the tool.
     *
     * Subclasses may override to implement custom deactivation logic.
     * Default implementation throws an error to ensure proper overriding.
     *
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    deactivate() {
        throw new Error("Method 'deactivate()' must be implemented by subclasses of Tool.");
    }

    /**
     * Handle mouse down event.
     *
     * Subclasses MUST implement this method.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    onMouseDown(event) {
        throw new Error("Method 'onMouseDown(event)' must be implemented by subclasses of Tool.");
    }

    /**
     * Handle mouse move event.
     *
     * Subclasses MUST implement this method.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    onMouseMove(event) {
        throw new Error("Method 'onMouseMove(event)' must be implemented by subclasses of Tool.");
    }

    /**
     * Handle mouse up event.
     *
     * Subclasses MUST implement this method.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    onMouseUp(event) {
        throw new Error("Method 'onMouseUp(event)' must be implemented by subclasses of Tool.");
    }

    /**
     * Converts a MouseEvent to canvas-relative coordinates.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {{x:number, y:number}} The X and Y coordinates relative to the canvas.
     */
    getMouseCoords(event) {
        const rect = this.canvas.element.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}
