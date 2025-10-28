import Canvas from './Canvas.js';
import DrawingManager from './DrawingManager.js';

/**
 * Description:
 *  Manages available drawing tools and delegates DOM mouse/keyboard events
 *  to the currently active tool. The ToolManager wires canvas element events
 *  to tool methods and exposes registration / activation helpers.
 *
 * Properties summary:
 *  - canvas {Canvas} : Canvas wrapper instance used by tools (DOM element + context).
 *  - drawingManager {DrawingManager} : Drawing manager responsible for elements and state.
 *  - activeToolInstance {Object|null} : Currently active tool instance.
 *  - toolInstances {Object.<string, Object>} : Registry of named tool instances.
 *
 * Typical usage:
 *   const tm = new ToolManager(canvasWrapper, drawingManager);
 *   tm.addTool('select', new SelectTool(canvasWrapper, drawingManager));
 *   tm.setActiveTool('select');
 *
 * Notes / Additional:
 *  - Tool instances are expected to implement the standard tool API (activate, deactivate,
 *    onMouseDown, onMouseMove, onMouseUp, onContextMenu, onKeyDown). ToolManager will call
 *    these methods directly (no runtime existence checks) in accordance with project rules.
 */
export default class ToolManager {
    /**
     * Internal canvas backing field.
     *
     * @type {Canvas|null}
     * @private
     */
    _canvas = null;

    /**
     * Internal drawingManager backing field.
     *
     * @type {DrawingManager|null}
     * @private
     */
    _drawingManager = null;

    /**
     * Internal active tool backing field.
     *
     * @type {Object|null}
     * @private
     */
    _activeToolInstance = null;

    /**
     * Internal tool registry backing field.
     *
     * @type {Object.<string, Object>}
     * @private
     */
    _toolInstances = {};

    /**
     * Creates an instance of ToolManager.
     *
     * @param {Canvas} canvas - Canvas wrapper instance (must be an instance of Canvas).
     * @param {DrawingManager} drawingManager - DrawingManager instance.
     */
    constructor(canvas, drawingManager) {
        const me = this;
        me.canvas = canvas;
        me.drawingManager = drawingManager;

        // Bind event handlers once so they can be removed later if needed
        me._boundMouseDown = me.handleMouseDownEvent.bind(me);
        me._boundMouseMove = me.handleMouseMoveEvent.bind(me);
        me._boundMouseUp = me.handleMouseUpEvent.bind(me);
        me._boundContextMenu = me.handleContextMenuEvent.bind(me);
        me._boundKeyDown = me.handleKeyDownEvent.bind(me);

        // Attach DOM listeners to canvas element
        me.canvas.element.addEventListener('mousedown', me._boundMouseDown);
        me.canvas.element.addEventListener('mousemove', me._boundMouseMove);
        me.canvas.element.addEventListener('mouseup', me._boundMouseUp);
        me.canvas.element.addEventListener('mouseout', me._boundMouseUp);
        me.canvas.element.addEventListener('contextmenu', me._boundContextMenu);
        document.addEventListener('keydown', me._boundKeyDown);
    }

    /**
     * canvas getter.
     *
     * @returns {Canvas} Canvas wrapper instance.
     */
    get canvas() {
        return this._canvas;
    }

    /**
     * canvas setter with basic validation.
     *
     * @param {Canvas} value - Canvas instance (must be Canvas).
     * @returns {void}
     */
    set canvas(value) {
        const me = this;
        const prev = me._canvas;
        if (!(value instanceof Canvas)) {
            console.warn(
                `[ToolManager] invalid canvas assignment (${value}). Canvas must be instance of Canvas. Keeping previous value: ${prev}`
            );
            return;
        }
        me._canvas = value;
    }

    /**
     * drawingManager getter.
     *
     * @returns {DrawingManager} Drawing manager instance.
     */
    get drawingManager() {
        return this._drawingManager;
    }

    /**
     * drawingManager setter with basic validation.
     *
     * @param {DrawingManager} value - DrawingManager instance.
     * @returns {void}
     */
    set drawingManager(value) {
        const me = this;
        const prev = me._drawingManager;
        if (!(value instanceof DrawingManager)) {
            console.warn(
                `[ToolManager] invalid drawingManager assignment (${value}). Must be instance of DrawingManager. Keeping previous value: ${prev}`
            );
            return;
        }
        me._drawingManager = value;
    }

    /**
     * activeToolInstance getter.
     *
     * @returns {Object|null} Currently active tool or null.
     */
    get activeToolInstance() {
        return this._activeToolInstance;
    }

    /**
     * activeToolInstance setter.
     *
     * @param {Object|null} value - Tool instance or null.
     * @returns {void}
     */
    set activeToolInstance(value) {
        this._activeToolInstance = value;
    }

    /**
     * toolInstances getter.
     *
     * @returns {Object.<string, Object>} Registered tool instances.
     */
    get toolInstances() {
        return this._toolInstances;
    }

    /**
     * toolInstances setter with validation.
     *
     * @param {Object.<string, Object>} value - Map of tool name to instance.
     * @returns {void}
     */
    set toolInstances(value) {
        const me = this;
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            console.warn(
                `[ToolManager] invalid toolInstances assignment (${value}). Must be a plain object. Keeping previous value.`
            );
            return;
        }
        me._toolInstances = value;
    }

    /**
     * Registers a new tool instance in the manager and injects the toolManager reference into it.
     *
     * @param {string} toolName - Unique name used to reference the tool.
     * @param {Object} toolInstance - Tool instance to register.
     * @returns {void}
     */
    addTool(toolName, toolInstance) {
        const me = this;
        if (typeof toolName !== 'string' || !toolName) {
            console.warn(
                `[ToolManager] invalid toolName assignment (${toolName}). Tool name must be a non-empty string.`
            );
            return;
        }
        me.toolInstances[toolName] = toolInstance;
        toolInstance.toolManager = me;
        toolInstance.canvas = me.canvas;
        toolInstance.drawingManager = me.drawingManager;
    }

    /**
     * Sets the active tool given its registered name.
     * Deactivates previous active tool and activates the new one.
     *
     * @param {string} toolName - Name of the tool to activate.
     * @returns {void}
     */
    setActiveTool(toolName) {
        const me = this;
        const prevTool = me.activeToolInstance;
        if (prevTool) prevTool.deactivate();

        const newTool = me.toolInstances[toolName] || null;
        me.activeToolInstance = newTool;

        if (newTool) newTool.activate();

        console.info(`Active tool: ${toolName}`);
    }

    /**
     * Handles canvas mousedown events and delegates to active tool.
     *
     * @param {MouseEvent} mouseEvent - The DOM mouse event.
     * @returns {void}
     */
    handleMouseDownEvent(mouseEvent) {
        const me = this;
        if (!me.activeToolInstance) {
            return;
        }

        if (typeof me.activeToolInstance.onMouseDown === 'function') {
            me.activeToolInstance.onMouseDown(mouseEvent);
        }
    }

    /**
     * Handles canvas mousemove events and delegates to active tool.
     *
     * @param {MouseEvent} mouseEvent - The DOM mouse event.
     * @returns {void}
     */
    handleMouseMoveEvent(mouseEvent) {
        const me = this;
        if (!me.activeToolInstance) {
            return;
        }

        if (typeof me.activeToolInstance.onMouseMove === 'function') {
            me.activeToolInstance.onMouseMove(mouseEvent);
        }
    }

    /**
     * Handles canvas mouseup events and delegates to active tool.
     *
     * @param {MouseEvent} mouseEvent - The DOM mouse event.
     * @returns {void}
     */
    handleMouseUpEvent(mouseEvent) {
        const me = this;
        if (!me.activeToolInstance) {
            return;
        }

        if (typeof me.activeToolInstance.onMouseUp === 'function') {
            me.activeToolInstance.onMouseUp(mouseEvent);
        }
    }

    /**
     * Handles contextmenu events on the canvas and delegates to active tool.
     *
     * @param {MouseEvent} mouseEvent - The DOM mouse event.
     * @returns {void}
     */
    handleContextMenuEvent(mouseEvent) {
        const me = this;
        if (!me.activeToolInstance) {
            return;
        }

        if (typeof me.activeToolInstance.onContextMenu === 'function') {
            me.activeToolInstance.onContextMenu(mouseEvent);
        }
    }

    /**
     * Handles keydown events and delegates to active tool.
     *
     * @param {KeyboardEvent} keyboardEvent - The DOM keyboard event.
     * @returns {void}
     */
    handleKeyDownEvent(keyboardEvent) {
        const me = this;
        if (!me.activeToolInstance) {
            return;
        }

        if (typeof me.activeToolInstance.onKeyDown === 'function') {
            me.activeToolInstance.onKeyDown(keyboardEvent);
        }
    }

    /**
     * Disposes the ToolManager instance by removing all event listeners
     * and clearing internal references to avoid memory leaks.
     *
     * Usage:
     *   toolManager.dispose();
     *
     * @returns {void}
     */
    dispose() {
        const me = this;
        if (me.canvas && me.canvas.element) {
            me.canvas.element.removeEventListener('mousedown', me._boundMouseDown);
            me.canvas.element.removeEventListener('mousemove', me._boundMouseMove);
            me.canvas.element.removeEventListener('mouseup', me._boundMouseUp);
            me.canvas.element.removeEventListener('mouseout', me._boundMouseUp);
            me.canvas.element.removeEventListener('contextmenu', me._boundContextMenu);
        }
        document.removeEventListener('keydown', me._boundKeyDown);

        me._activeToolInstance = null;
        me._toolInstances = {};
        me._canvas = null;
        me._drawingManager = null;

        console.info('[ToolManager] Disposed and all listeners removed.');
    }
}
