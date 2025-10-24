import Tool from './Tool.js';
import Line from '../shapes/Line.js';

/**
 * Description:
 *  Tool to draw straight lines on the canvas.
 *  User clicks to start the line, drags the mouse to define the end point,
 *  and releases to finish the line.
 *
 * Properties summary:
 *  - canvas {import("../core/Canvas.js").default} : Canvas instance reference.
 *  - drawingManager {import("../core/DrawingManager.js").default} : Drawing manager instance reference.
 *  - currentLine {Line|null} : The line currently being drawn.
 *  - isDrawing {boolean} : Flag to track drawing state.
 *  - startX {number} : Starting X coordinate of the line.
 *  - startY {number} : Starting Y coordinate of the line.
 *
 * Typical usage:
 *  const tool = new LineTool(canvasInstance, drawingManager);
 *
 * Notes / Additional:
 *  - Line properties should always be modified using the `edit()` method.
 *  - Mouse move and mouse up events update the line in real-time.
 */
export default class LineTool extends Tool {
    /**
     * Internal backing field for currentLine.
     * @type {Line|null}
     * @private
     */
    _currentLine = null;

    /**
     * Internal backing field for isDrawing flag.
     * @type {boolean}
     * @private
     */
    _isDrawing = false;

    /**
     * Internal backing field for startX coordinate.
     * @type {number}
     * @private
     */
    _startX = 0;

    /**
     * Internal backing field for startY coordinate.
     * @type {number}
     * @private
     */
    _startY = 0;

    /**
     * Creates an instance of LineTool.
     *
     * @param {import("../core/Canvas.js").default} canvas - Canvas instance.
     * @param {import("../core/DrawingManager.js").default} drawingManager - Drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    /**
     * currentLine getter.
     *
     * @returns {Line|null} Current line being drawn.
     */
    get currentLine() {
        return this._currentLine;
    }

    /**
     * currentLine setter.
     *
     * @param {Line|null} value - Line instance to assign.
     * @returns {void}
     */
    set currentLine(value) {
        if (value !== null && !(value instanceof Line)) {
            console.warn(
                `[LineTool] invalid currentLine assignment (${value}). Keeping previous value: ${this._currentLine}`
            );
            return;
        }
        this._currentLine = value;
    }

    /**
     * isDrawing getter.
     *
     * @returns {boolean} True if currently drawing.
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
     * @returns {number} Starting X coordinate.
     */
    get startX() {
        return this._startX;
    }

    /**
     * startX setter with numeric validation.
     *
     * @param {number} value - X coordinate to set.
     * @returns {void}
     */
    set startX(value) {
        const num = Number(value);
        if (Number.isNaN(num)) {
            console.warn(
                `[LineTool] invalid startX assignment (${value}). Keeping previous value: ${this._startX}`
            );
            return;
        }
        this._startX = num;
    }

    /**
     * startY getter.
     *
     * @returns {number} Starting Y coordinate.
     */
    get startY() {
        return this._startY;
    }

    /**
     * startY setter with numeric validation.
     *
     * @param {number} value - Y coordinate to set.
     * @returns {void}
     */
    set startY(value) {
        const num = Number(value);
        if (Number.isNaN(num)) {
            console.warn(
                `[LineTool] invalid startY assignment (${value}). Keeping previous value: ${this._startY}`
            );
            return;
        }
        this._startY = num;
    }

    /**
     * Activates the tool.
     * No operation required for this tool.
     */
    activate() {}

    /**
     * Deactivates the tool.
     * No operation required for this tool.
     */
    deactivate() {}

    /**
     * Handles mouse down events to start a new line.
     *
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        me.isDrawing = true;
        const { x, y } = me.getMouseCoords(event);
        me.startX = x;
        me.startY = y;

        me.currentLine = new Line(me.startX, me.startY, me.startX, me.startY);
        me.drawingManager.addElement(me.currentLine);
    }

    /**
     * Handles mouse move events to update the line end coordinates in real-time.
     *
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawing || !me.currentLine) return;

        const { x, y } = me.getMouseCoords(event);
        me.currentLine.edit({ endX: x, endY: y });

        me.canvas.requestRender();
    }

    /**
     * Handles mouse up events to finalize the line drawing.
     *
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseUp(event) {
        const me = this;
        if (!me.isDrawing || !me.currentLine) return;

        me.isDrawing = false;
        me.currentLine = null;
        me.canvas.requestRender();
    }
}
