/**
 * ToolManager is responsible for managing the selection and interaction of drawing tools on a canvas element.
 * It listens for mouse events on the canvas and delegates those events to the currently active tool.
 * Each tool can implement its own logic for mouse events and can access the ToolManager instance.
 *
 * Example usage:
 *
 * import ToolManager from './ToolManager.js';
 * import SelectTool from './SelectTool.js';
 *
 * const canvasWrapper = {
 *   canvasElement: document.getElementById('myCanvas'),
 *   drawingContext: document.getElementById('myCanvas').getContext('2d'),
 *   draw: () => { custom draw logic }
 * };
 * const drawingManager = new DrawingManager();
 * const toolManager = new ToolManager(canvasWrapper, drawingManager);
 * toolManager.addTool('select', new SelectTool());
 * toolManager.setActiveTool('select');
 *
 * @class ToolManager
 * @classdesc Manages drawing tools, delegates mouse events, and coordinates canvas redraws.
 */
class ToolManager {
    /**
     * Creates an instance of ToolManager.
     *
     * @param {Object} canvasWrapper - An object containing the canvas DOM element, its drawing context, and a draw method.
     * @param {Object} drawingManagerInstance - The manager responsible for drawing operations and state.
     * @returns {ToolManager} A new instance of ToolManager.
     */
    constructor(canvasWrapper, drawingManagerInstance) {
        /**
         * The wrapper object for the canvas, containing the DOM element, drawing context, and draw method.
         * @type {Object}
         */
        this.canvasWrapper = canvasWrapper;

        /**
         * The 2D drawing context for the canvas.
         * @type {CanvasRenderingContext2D}
         */
        this.drawingContext = canvasWrapper.drawingContext;

        /**
         * The drawing manager responsible for handling drawing operations and state.
         * @type {Object}
         */
        this.drawingManagerInstance = drawingManagerInstance;

        /**
         * The currently active tool instance.
         * @type {Object|null}
         */
        this.activeToolInstance = null;

        /**
         * A map of tool names to their respective tool instances.
         * @type {Object.<string, Object>}
         */
        this.toolInstances = {};

        // Bind mouse event handlers to the canvas element
        this.canvasWrapper.canvasElement.addEventListener(
            "mousedown",
            this.handleMouseDownEvent.bind(this)
        );
        this.canvasWrapper.canvasElement.addEventListener(
            "mousemove",
            this.handleMouseMoveEvent.bind(this)
        );
        this.canvasWrapper.canvasElement.addEventListener(
            "mouseup",
            this.handleMouseUpEvent.bind(this)
        );
        this.canvasWrapper.canvasElement.addEventListener(
            "mouseout",
            this.handleMouseUpEvent.bind(this)
        ); // Handles mouse leaving the canvas
    }

    /**
     * Registers a new tool with the ToolManager.
     * The tool instance will have access to the ToolManager via the `toolManager` property.
     *
     * @param {string} toolName - The unique name of the tool to register.
     * @param {Object} toolInstance - The instance of the tool to be added.
     * @returns {void}
     */
    addTool(toolName, toolInstance) {
        this.toolInstances[toolName] = toolInstance;
        toolInstance.toolManager = this; // Allows the tool to access the ToolManager
    }

    /**
     * Sets the active tool by its name.
     * Deactivates the previous tool (if any) and activates the new one.
     *
     * @param {string} toolName - The name of the tool to activate.
     * @returns {void}
     */
    setActiveTool(toolName) {
        if (
            this.activeToolInstance &&
            typeof this.activeToolInstance.deactivate === "function"
        ) {
            this.activeToolInstance.deactivate();
        }
        this.activeToolInstance = this.toolInstances[toolName];
        if (
            this.activeToolInstance &&
            typeof this.activeToolInstance.activate === "function"
        ) {
            this.activeToolInstance.activate();
        }
        console.log(`Active tool: ${toolName}`);
    }

    /**
     * Handles the mouse down event on the canvas.
     * Delegates the event to the active tool's `onMouseDown` method if implemented.
     * Triggers a redraw of the canvas.
     *
     * @param {MouseEvent} mouseEvent - The mouse down event object.
     * @returns {void}
     */
    handleMouseDownEvent(mouseEvent) {
        if (
            this.activeToolInstance &&
            typeof this.activeToolInstance.onMouseDown === "function"
        ) {
            this.activeToolInstance.onMouseDown(mouseEvent);
            this.canvasWrapper.draw();
        }
    }

    /**
     * Handles the mouse move event on the canvas.
     * Delegates the event to the active tool's `onMouseMove` method if implemented.
     * Triggers a redraw of the canvas.
     *
     * @param {MouseEvent} mouseEvent - The mouse move event object.
     * @returns {void}
     */
    handleMouseMoveEvent(mouseEvent) {
        if (
            this.activeToolInstance &&
            typeof this.activeToolInstance.onMouseMove === "function"
        ) {
            this.activeToolInstance.onMouseMove(mouseEvent);
            this.canvasWrapper.draw();
        }
    }

    /**
     * Handles the mouse up event on the canvas.
     * Delegates the event to the active tool's `onMouseUp` method if implemented.
     * Triggers a redraw of the canvas.
     *
     * @param {MouseEvent} mouseEvent - The mouse up event object.
     * @returns {void}
     */
    handleMouseUpEvent(mouseEvent) {
        if (
            this.activeToolInstance &&
            typeof this.activeToolInstance.onMouseUp === "function"
        ) {
            this.activeToolInstance.onMouseUp(mouseEvent);
            this.canvasWrapper.draw();
        }
    }
}

export default ToolManager;
