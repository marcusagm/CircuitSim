import Tool from './Tool.js';

/**
 * Description:
 *  Tool to move selected elements on the canvas. Click an element to start dragging it
 *  (or drag all currently selected elements). Clicking empty space clears selection.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *  - isDragging {boolean} : Whether a drag operation is in progress.
 *  - dragStartX {number} : X coordinate where current drag started.
 *  - dragStartY {number} : Y coordinate where current drag started.
 *  - elementsToMove {Array<import('../shapes/Shape.js').default>} : Elements being moved during drag.
 *
 * Typical usage:
 *   const tool = new MoveTool(canvas, drawingManager);
 *   tool.activate();
 *   // Select elements via SelectTool, then use MoveTool to drag them.
 *
 * Notes / Additional:
 *  - This tool relies on DrawingManager being the source of truth for selection.
 *  - Do not perform defensive checks for DrawingManager API; project convention is to assume the API exists.
 *  - All mutable properties have getters/setters that centralize validation and logging.
 *
 * @class MoveTool
 */
export default class MoveTool extends Tool {
    /**
     * Internal dragging flag backing field.
     * @type {boolean}
     * @private
     */
    _isDragging = false;

    /**
     * Internal drag start X backing field.
     * @type {number}
     * @private
     */
    _dragStartX = 0;

    /**
     * Internal drag start Y backing field.
     * @type {number}
     * @private
     */
    _dragStartY = 0;

    /**
     * Internal elements-to-move backing field.
     * @type {Array<import('../shapes/Shape.js').default>}
     * @private
     */
    _elementsToMove = [];

    /**
     * Creates an instance of MoveTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me.isDragging = false;
        me.dragStartX = 0;
        me.dragStartY = 0;
        me.elementsToMove = [];
    }

    /**
     * isDragging getter.
     *
     * @returns {boolean} True when dragging.
     */
    get isDragging() {
        return this._isDragging;
    }

    /**
     * isDragging setter with boolean coercion.
     *
     * @param {boolean} value - Whether a drag is active.
     * @returns {void}
     */
    set isDragging(value) {
        const me = this;
        me._isDragging = Boolean(value);
    }

    /**
     * dragStartX getter.
     *
     * @returns {number} Drag start X coordinate.
     */
    get dragStartX() {
        return this._dragStartX;
    }

    /**
     * dragStartX setter with numeric validation.
     *
     * @param {number} value - X coordinate.
     * @returns {void}
     */
    set dragStartX(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n)) {
            console.warn(
                `[MoveTool] invalid dragStartX assignment (${value}). Keeping previous value: ${me._dragStartX}`
            );
            return;
        }
        me._dragStartX = n;
    }

    /**
     * dragStartY getter.
     *
     * @returns {number} Drag start Y coordinate.
     */
    get dragStartY() {
        return this._dragStartY;
    }

    /**
     * dragStartY setter with numeric validation.
     *
     * @param {number} value - Y coordinate.
     * @returns {void}
     */
    set dragStartY(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n)) {
            console.warn(
                `[MoveTool] invalid dragStartY assignment (${value}). Keeping previous value: ${me._dragStartY}`
            );
            return;
        }
        me._dragStartY = n;
    }

    /**
     * elementsToMove getter.
     *
     * @returns {Array<import('../shapes/Shape.js').default>} Elements that will be moved.
     */
    get elementsToMove() {
        return this._elementsToMove;
    }

    /**
     * elementsToMove setter.
     *
     * @param {Array<import('../shapes/Shape.js').default>} value - Array of elements to move.
     * @returns {void}
     */
    set elementsToMove(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[MoveTool] invalid elementsToMove assignment (${value}). Keeping previous value.`
            );
            return;
        }
        me._elementsToMove = value;
    }

    /**
     * Activate the tool.
     *
     * No special activation behavior required.
     *
     * @returns {void}
     */
    activate() {
        // no-op
    }

    /**
     * Deactivate the tool.
     *
     * Clears dragging state and elementsToMove to avoid residual state.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.isDragging = false;
        me.elementsToMove = [];
    }

    /**
     * Handle mouse down event.
     *
     * Determines which elements should be moved (clicked element or all selected elements),
     * begins dragging and stores the drag start coordinates.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        // Source of truth for selection lives in drawingManager
        const currentlySelected = me.drawingManager.getAllSelectedElements();
        const clickedElement = me.drawingManager.findElementAt(x, y);

        if (clickedElement) {
            if (clickedElement.isSelected) {
                // Move all selected elements
                me.elementsToMove = currentlySelected.slice();
            } else {
                // Deselect everything and select only the clicked element
                me.drawingManager.elements.forEach(el => el.deselect());
                clickedElement.select();
                me.elementsToMove = [clickedElement];
            }
        } else {
            // Clicked empty space: deselect all
            me.drawingManager.elements.forEach(el => el.deselect());
            me.elementsToMove = [];
        }

        if (me.elementsToMove.length > 0) {
            me.isDragging = true;
            me.dragStartX = x;
            me.dragStartY = y;
        }
        me.canvas.requestRender();
    }

    /**
     * Handle mouse move event.
     *
     * When dragging, moves the elements by the delta since last mouse position.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDragging || !me.elementsToMove || me.elementsToMove.length === 0) return;

        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        const dx = x - me.dragStartX;
        const dy = y - me.dragStartY;

        me.elementsToMove.forEach(el => {
            el.move(dx, dy);
        });

        me.dragStartX = x;
        me.dragStartY = y;
        me.canvas.requestRender();
    }

    /**
     * Handle mouse up event.
     *
     * Finalizes a drag operation.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        const me = this;
        me.isDragging = false;
        // keep selection; elementsToMove left intact until next operation or deactivation
        me.canvas.requestRender();
    }
}
