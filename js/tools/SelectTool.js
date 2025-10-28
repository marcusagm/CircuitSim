import Tool from './Tool.js';

/**
 * Description:
 *  SelectionTool allows clicking and drag-selecting shapes on the canvas.
 *  It supports single-click selection, drag-to-select rectangle, multi-select with Shift,
 *  and moving selected shapes by dragging.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *  - isDrawing {boolean} (inherited) : Whether the tool is currently handling a drag action.
 *  - startX {number} (inherited) : X coordinate where an action started.
 *  - startY {number} (inherited) : Y coordinate where an action started.
 *  - _isDragging {boolean} : Internal flag for drag-selection or move-in-progress.
 *  - _dragRectangle {{x:number,y:number,width:number,height:number}|null} : Internal selection rectangle while dragging.
 *  - _clickedElement {import('../shapes/Shape.js').default|null} : Last clicked element reference.
 *  - _selectedElements {Array<import('../shapes/Shape.js').default>} : Elements currently selected / being manipulated.
 *
 * Typical usage:
 *   const tool = new SelectionTool(canvasInstance, drawingManager);
 *   tool.activate();
 *
 * Notes / Additional:
 *  - SelectionTool uses drawingManager.findElementAt(canvas, x, y) when available; otherwise it falls back to drawingManager.findElementAt(x,y).
 *  - All property validation is centralized in setters. Methods keep cyclomatic complexity small.
 */
export default class SelectionTool extends Tool {
    /**
     * Internal dragging flag backing field.
     *
     * @type {boolean}
     * @private
     */
    _isDragging = false;

    /**
     * Internal drag rectangle backing field (null when not dragging).
     *
     * @type {{x:number,y:number,width:number,height:number}|null}
     * @private
     */
    _dragRectangle = null;

    /**
     * Internal clicked element backing field.
     *
     * @type {import('../shapes/Shape.js').default|null}
     * @private
     */
    _clickedElement = null;

    /**
     * Internal selected elements backing field.
     *
     * @type {Array<import('../shapes/Shape.js').default>}
     * @private
     */
    _selectedElements = [];

    /**
     * Creates an instance of SelectionTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me._isDragging = false;
        me._dragRectangle = null;
        me._clickedElement = null;
        me._selectedElements = [];
    }

    /**
     * isDragging getter.
     *
     * @returns {boolean} True if a drag operation is in progress.
     */
    get isDragging() {
        return this._isDragging;
    }

    /**
     * isDragging setter with boolean coercion.
     *
     * @param {boolean} value - New dragging flag.
     * @returns {void}
     */
    set isDragging(value) {
        this._isDragging = Boolean(value);
    }

    /**
     * dragRectangle getter.
     *
     * @returns {{x:number,y:number,width:number,height:number}|null} Current drag rectangle or null.
     */
    get dragRectangle() {
        return this._dragRectangle;
    }

    /**
     * dragRectangle setter.
     *
     * @param {{x:number,y:number,width:number,height:number}|null} value - New drag rectangle or null.
     * @returns {void}
     */
    set dragRectangle(value) {
        const me = this;
        if (value !== null && typeof value !== 'object') {
            console.warn(
                `[SelectionTool] invalid dragRectangle assignment (${value}). Keeping previous value: ${JSON.stringify(
                    me._dragRectangle
                )}`
            );
            return;
        }
        me._dragRectangle = value;
    }

    /**
     * clickedElement getter.
     *
     * @returns {import('../shapes/Shape.js').default|null} Last clicked element or null.
     */
    get clickedElement() {
        return this._clickedElement;
    }

    /**
     * clickedElement setter.
     *
     * @param {import('../shapes/Shape.js').default|null} value - Element to assign as last clicked or null.
     * @returns {void}
     */
    set clickedElement(value) {
        const me = this;
        if (value !== null && typeof value !== 'object') {
            console.warn(
                `[SelectionTool] invalid clickedElement assignment (${value}). Keeping previous value: ${me._clickedElement}`
            );
            return;
        }
        me._clickedElement = value;
    }

    /**
     * selectedElements getter.
     *
     * @returns {Array<import('../shapes/Shape.js').default>} Elements currently selected.
     */
    get selectedElements() {
        return this._selectedElements;
    }

    /**
     * selectedElements setter.
     *
     * @param {Array<import('../shapes/Shape.js').default>} value - New array of selected elements.
     * @returns {void}
     */
    set selectedElements(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[SelectionTool] invalid selectedElements assignment (${value}). Keeping previous value: ${JSON.stringify(
                    me._selectedElements
                )}`
            );
            return;
        }
        me._selectedElements = value;
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override; SelectionTool uses a no-op activation.
     *
     * @returns {void}
     */
    activate() {
        // no-op
    }

    /**
     * Deactivate the tool.
     *
     * Clears any in-progress drag.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.isDragging = false;
        me.dragRectangle = null;
        me.selectedElements = [];
        me.clickedElement = null;
    }

    /**
     * Handle mouse down event.
     *
     * Single click selects top-most element under pointer (or toggles when shift pressed).
     * Click+drag starts a selection rectangle (if not clicking an element) or starts moving selected elements (if clicking selected element).
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;
        const multiSelection = event.shiftKey === true;

        me.startX = x;
        me.startY = y;

        me.selectedElements = me.drawingManager.getAllSelectedElements
            ? me.drawingManager.getAllSelectedElements()
            : [];
        me.clickedElement = me.drawingManager.findElementAt
            ? me.drawingManager.findElementAt(x, y)
            : null;

        if (me.clickedElement === null) {
            if (multiSelection === false) {
                me.deselectAll();
            }

            me.dragRectangle = { x: x, y: y, width: 0, height: 0 };
            me.isDragging = true;
            return;
        }

        if (multiSelection === true && me.clickedElement.isSelected) {
            me.clickedElement.deselect();
            me.canvas.requestRender();
            me.isDragging = false;
            return;
        }

        if (!me.selectedElements.includes(me.clickedElement) && multiSelection === false) {
            me.deselectAll();
        }
        if (me.clickedElement.isSelected === false) {
            me.clickedElement.select();
            me.canvas.requestRender();
            me.selectedElements.push(me.clickedElement);
        }

        if (me.selectedElements.length > 0) {
            me.isDragging = true;
        }
    }

    /**
     * Handle mouse move event.
     *
     * Updates drag rectangle or moves selected elements when dragging.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDragging) return;

        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;
        const dx = x - me.startX;
        const dy = y - me.startY;
        const multiSelection = event.shiftKey === true;

        if (multiSelection === false && me.selectedElements && me.selectedElements.length > 0) {
            // move each element by delta (delegating to their move method)
            me.selectedElements.forEach(element => {
                if (typeof element.move === 'function') {
                    element.move(dx, dy);
                }
            });

            // update start point for incremental moves
            me.startX = x;
            me.startY = y;
            me.canvas.requestRender();
            return;
        }

        // Otherwise update selection rectangle
        if (me.dragRectangle) {
            const rx = Math.min(me.startX, x);
            const ry = Math.min(me.startY, y);
            const rw = Math.abs(x - me.startX);
            const rh = Math.abs(y - me.startY);
            me.dragRectangle.x = rx;
            me.dragRectangle.y = ry;
            me.dragRectangle.width = rw;
            me.dragRectangle.height = rh;
            me.drawingManager.setSelectionRectangle(me.startX, me.startY, x, y);
        }
    }

    /**
     * Handle mouse up event.
     *
     * Finalizes moves or applies selection rectangle.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        const me = this;
        if (!me.isDragging) return;

        const multiSelection = event.shiftKey === true;

        // If we were dragging elements, stop
        if (multiSelection === false && me.selectedElements && me.selectedElements.length > 0) {
            me.selectedElements = [];
            me.isDragging = false;
            me.drawingManager.clearSelectionRectangle();
            return;
        }

        // If we had a dragRect, select elements inside it
        if (me.dragRectangle) {
            me.drawingManager.selectElementsInRectangle(multiSelection);
            me.dragRectangle = null;
            me.isDragging = false;
            me.selectedElements = [];
            me.clickedElement = null;
            return;
        }

        // otherwise simple click finished (handled earlier on mouseDown)
        me.isDragging = false;
        me.dragRectangle = null;
        me.selectedElements = [];
        me.clickedElement = null;
    }

    /**
     * Handle context menu event (right-click). Prevents default when dragging or returns no-op.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onContextMenu(event) {
        // prevent context menu while dragging selection
        if (this._isDragging) {
            event.preventDefault();
        }
    }

    /**
     * Deselect all elements via drawingManager and clear local selection state.
     *
     * @returns {void}
     */
    deselectAll() {
        const me = this;
        me.drawingManager.deselectAll();
        me.selectedElements = [];
    }
}
