import Tool from './Tool.js';
import Wire from '../components/Wire.js';
import Line from '../shapes/Line.js';
import PolyLine from '../shapes/PolyLine.js';
import ThreePointCurve from '../shapes/ThreePointCurve.js';
import BezierCurve from '../shapes/BezierCurve.js';

/**
 * Description:
 *  Tool for interactively editing nodes (points) of selected Wire, Line, PolyLine,
 *  ThreePointCurve and BezierCurve shapes. Allows clicking and dragging individual
 *  nodes with snapping to the grid. For Wire shapes only intermediate path points
 *  are editable (terminals are not editable). Selection persists across tools.
 *
 * Properties summary:
 *  - selectedShape {Wire|Line|PolyLine|ThreePointCurve|BezierCurve|null} : The shape whose nodes are being edited.
 *  - draggingNodeIndex {number} : Index of the node being dragged, or -1 when none.
 *  - dragStartX {number} : Mouse X at drag start.
 *  - dragStartY {number} : Mouse Y at drag start.
 *  - initialNodePosition {{x:number,y:number}|null} : Original node position at drag start.
 *
 * Typical usage:
 *   const tool = new NodeEditTool(canvas, drawingManager);
 *   tool.activate();
 *
 * Notes / Additional:
 *  - Distance checks use squared-distance to avoid Math.sqrt in hot loops.
 *  - Snapping uses drawingManager.grid.gridCellSize (fallback to 1 if missing).
 *  - This tool does not rename or assume alternate property names from shape classes.
 */
export default class NodeEditTool extends Tool {
    /**
     * Internal selected shape backing field.
     *
     * @type {Wire|Line|PolyLine|ThreePointCurve|BezierCurve|null}
     * @private
     */
    _selectedShape = null;

    /**
     * Internal dragging node index backing field (-1 when not dragging).
     *
     * @type {number}
     * @private
     */
    _draggingNodeIndex = -1;

    /**
     * Internal drag start X backing field.
     *
     * @type {number}
     * @private
     */
    _dragStartX = 0;

    /**
     * Internal drag start Y backing field.
     *
     * @type {number}
     * @private
     */
    _dragStartY = 0;

    /**
     * Internal initial node position backing field.
     *
     * @type {{x:number,y:number}|null}
     * @private
     */
    _initialNodePosition = null;

    /**
     * Constructs an instance of NodeEditTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me.selectedShape = null;
        me.draggingNodeIndex = -1;
        me.dragStartX = 0;
        me.dragStartY = 0;
        me.initialNodePosition = null;
    }

    /**
     * selectedShape getter.
     *
     * @returns {Wire|Line|PolyLine|ThreePointCurve|BezierCurve|null} Currently selected editable shape or null.
     */
    get selectedShape() {
        return this._selectedShape;
    }

    /**
     * selectedShape setter with validation.
     *
     * @param {Wire|Line|PolyLine|ThreePointCurve|BezierCurve|null} value - Shape instance or null.
     * @returns {void}
     */
    set selectedShape(value) {
        const me = this;
        if (
            value !== null &&
            !(
                value instanceof Wire ||
                value instanceof Line ||
                value instanceof PolyLine ||
                value instanceof ThreePointCurve ||
                value instanceof BezierCurve
            )
        ) {
            console.warn(
                `[NodeEditTool] invalid selectedShape assignment (${value}). Keeping previous value: ${me._selectedShape}`
            );
            return;
        }
        me._selectedShape = value;
    }

    /**
     * draggingNodeIndex getter.
     *
     * @returns {number} Index of the node currently being dragged or -1.
     */
    get draggingNodeIndex() {
        return this._draggingNodeIndex;
    }

    /**
     * draggingNodeIndex setter with numeric coercion.
     *
     * @param {number} value - New dragging node index.
     * @returns {void}
     */
    set draggingNodeIndex(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n)) {
            console.warn(
                `[NodeEditTool] invalid draggingNodeIndex assignment (${value}). Keeping previous value: ${me._draggingNodeIndex}`
            );
            return;
        }
        me._draggingNodeIndex = Math.floor(n);
    }

    /**
     * dragStartX getter.
     *
     * @returns {number} X position where drag started.
     */
    get dragStartX() {
        return this._dragStartX;
    }

    /**
     * dragStartX setter with numeric coercion.
     *
     * @param {number} value - New drag start X.
     * @returns {void}
     */
    set dragStartX(value) {
        const me = this;
        const n = Number(value);
        me._dragStartX = Number.isNaN(n) ? 0 : n;
    }

    /**
     * dragStartY getter.
     *
     * @returns {number} Y position where drag started.
     */
    get dragStartY() {
        return this._dragStartY;
    }

    /**
     * dragStartY setter with numeric coercion.
     *
     * @param {number} value - New drag start Y.
     * @returns {void}
     */
    set dragStartY(value) {
        const me = this;
        const n = Number(value);
        me._dragStartY = Number.isNaN(n) ? 0 : n;
    }

    /**
     * initialNodePosition getter.
     *
     * @returns {{x:number,y:number}|null} Original node position at drag start.
     */
    get initialNodePosition() {
        return this._initialNodePosition;
    }

    /**
     * initialNodePosition setter with validation.
     *
     * @param {{x:number,y:number}|null} value - Object with numeric x and y or null.
     * @returns {void}
     */
    set initialNodePosition(value) {
        const me = this;
        if (value !== null) {
            if (
                typeof value !== 'object' ||
                Number.isNaN(Number(value.x)) ||
                Number.isNaN(Number(value.y))
            ) {
                console.warn(
                    `[NodeEditTool] invalid initialNodePosition assignment (${JSON.stringify(
                        value
                    )}). Keeping previous value: ${JSON.stringify(me._initialNodePosition)}`
                );
                return;
            }
            me._initialNodePosition = { x: Number(value.x), y: Number(value.y) };
            return;
        }
        me._initialNodePosition = null;
    }

    /**
     * Activates the tool and ensures the currently selected element (if any) is editable.
     *
     * @returns {void}
     */
    activate() {
        const me = this;
        const selectedElements = me.drawingManager.getAllSelectedElements();
        if (selectedElements.length === 1) {
            const element = selectedElements[0];
            if (
                element instanceof Wire ||
                element instanceof Line ||
                element instanceof PolyLine ||
                element instanceof ThreePointCurve ||
                element instanceof BezierCurve
            ) {
                me.selectedShape = element;
            } else {
                me.selectedShape = null;
            }
        } else {
            me.selectedShape = null;
        }
        me.canvas.requestRender();
    }

    /**
     * Deactivates the tool and clears any active dragging state.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.draggingNodeIndex = -1;
        me.initialNodePosition = null;
        // Do not clear me.selectedShape (selection persists)
    }

    /**
     * Handle mouse down: start dragging a node if clicked, otherwise select an editable shape.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const px = Number(coords.x) || 0;
        const py = Number(coords.y) || 0;
        const hitTolerance = 10; // pixels
        const hitToleranceSq = hitTolerance * hitTolerance;

        // If we already have a selected editable shape, test its editable points first
        if (me.selectedShape) {
            const editablePoints = me.getEditablePoints(me.selectedShape);
            for (let i = 0; i < editablePoints.length; i++) {
                const p = editablePoints[i];
                const dx = px - p.x;
                const dy = py - p.y;
                const distSq = dx * dx + dy * dy;
                if (distSq <= hitToleranceSq) {
                    // Start dragging this node
                    me.draggingNodeIndex = i;
                    me.dragStartX = px;
                    me.dragStartY = py;
                    me.initialNodePosition = { x: p.x, y: p.y };
                    return;
                }
            }
        }

        // No editable node clicked — attempt to select a new editable shape
        me.draggingNodeIndex = -1;
        const clickedElement = me.drawingManager.findElementAt(px, py);

        if (
            clickedElement instanceof Wire ||
            clickedElement instanceof Line ||
            clickedElement instanceof PolyLine ||
            clickedElement instanceof ThreePointCurve ||
            clickedElement instanceof BezierCurve
        ) {
            if (me.selectedShape && me.selectedShape !== clickedElement) {
                me.selectedShape.deselect();
            }
            clickedElement.select();
            me.selectedShape = clickedElement;
            me.canvas.requestRender();
            return;
        }

        // Clicked empty space or non-editable element — deselect current shape if any
        if (me.selectedShape) {
            me.selectedShape.deselect();
            me.selectedShape = null;
            me.canvas.requestRender();
        }
    }

    /**
     * Handle mouse move: if dragging a node, update its position with grid snapping.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (me.draggingNodeIndex === -1 || !me.selectedShape || !me.initialNodePosition) return;

        const coords = me.getMouseCoords(event);
        const px = Number(coords.x) || 0;
        const py = Number(coords.y) || 0;

        // Mouse displacement since drag start
        const deltaX = px - me.dragStartX;
        const deltaY = py - me.dragStartY;

        // New (un-snapped) coordinates
        const newX = me.initialNodePosition.x + deltaX;
        const newY = me.initialNodePosition.y + deltaY;

        // Grid cell size (fallback to 1)
        const cellSize =
            me.drawingManager && me.drawingManager.grid && me.drawingManager.grid.gridCellSize
                ? Number(me.drawingManager.grid.gridCellSize) || 1
                : 1;

        // Snap to grid
        const snappedX = Math.round(newX / cellSize) * cellSize;
        const snappedY = Math.round(newY / cellSize) * cellSize;

        // Update the correct property depending on shape type
        if (me.selectedShape instanceof Wire) {
            // For Wire, edit intermediate path points (Wire.path)
            const path = me.selectedShape.path || [];
            if (me.draggingNodeIndex >= 0 && me.draggingNodeIndex < path.length) {
                path[me.draggingNodeIndex].x = snappedX;
                path[me.draggingNodeIndex].y = snappedY;
                // Assign back via setter to ensure validation (some Wire implementations may require)
                me.selectedShape.path = path;
            }
        } else if (me.selectedShape instanceof Line) {
            // Line has startX/startY and endX/endY (two nodes)
            if (me.draggingNodeIndex === 0) {
                me.selectedShape.startX = snappedX;
                me.selectedShape.startY = snappedY;
            } else if (me.draggingNodeIndex === 1) {
                me.selectedShape.endX = snappedX;
                me.selectedShape.endY = snappedY;
            }
        } else if (me.selectedShape instanceof PolyLine) {
            // PolyLine.points array
            const pts = me.selectedShape.points || [];
            if (me.draggingNodeIndex >= 0 && me.draggingNodeIndex < pts.length) {
                pts[me.draggingNodeIndex].x = snappedX;
                pts[me.draggingNodeIndex].y = snappedY;
                me.selectedShape.points = pts;
            }
        } else if (me.selectedShape instanceof ThreePointCurve) {
            // ThreePointCurve uses startX/startY, controlX/controlY, endX/endY
            if (me.draggingNodeIndex === 0) {
                me.selectedShape.startX = snappedX;
                me.selectedShape.startY = snappedY;
            } else if (me.draggingNodeIndex === 1) {
                me.selectedShape.controlX = snappedX;
                me.selectedShape.controlY = snappedY;
            } else if (me.draggingNodeIndex === 2) {
                me.selectedShape.endX = snappedX;
                me.selectedShape.endY = snappedY;
            }
        } else if (me.selectedShape instanceof BezierCurve) {
            // BezierCurve uses startX/startY, control1X/control1Y, control2X/control2Y, endX/endY
            switch (me.draggingNodeIndex) {
                case 0:
                    me.selectedShape.startX = snappedX;
                    me.selectedShape.startY = snappedY;
                    break;
                case 1:
                    me.selectedShape.control1X = snappedX;
                    me.selectedShape.control1Y = snappedY;
                    break;
                case 2:
                    me.selectedShape.control2X = snappedX;
                    me.selectedShape.control2Y = snappedY;
                    break;
                case 3:
                    me.selectedShape.endX = snappedX;
                    me.selectedShape.endY = snappedY;
                    break;
            }
        }

        me.canvas.requestRender();
    }

    /**
     * Handle mouse up: finish the drag operation and clear temporary drag state.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        const me = this;
        me.draggingNodeIndex = -1;
        me.initialNodePosition = null;
        me.canvas.requestRender();
    }

    /**
     * Returns the list of points editable by this tool for a given shape.
     *
     * @param {Wire|Line|PolyLine|ThreePointCurve|BezierCurve} shape - The shape to inspect.
     * @returns {Array<{x:number,y:number}>} Array of editable points (copies where appropriate).
     */
    getEditablePoints(shape) {
        if (shape instanceof Wire) {
            // Use Wire.path (intermediate points). Return direct references to allow drag start read.
            return shape.path || [];
        }

        if (shape instanceof Line) {
            return [
                { x: shape.startX, y: shape.startY },
                { x: shape.endX, y: shape.endY }
            ];
        }

        if (shape instanceof PolyLine) {
            return shape.points || [];
        }

        if (shape instanceof ThreePointCurve) {
            return [
                { x: shape.startX, y: shape.startY },
                { x: shape.controlX, y: shape.controlY },
                { x: shape.endX, y: shape.endY }
            ];
        }

        if (shape instanceof BezierCurve) {
            return [
                { x: shape.startX, y: shape.startY },
                { x: shape.control1X, y: shape.control1Y },
                { x: shape.control2X, y: shape.control2Y },
                { x: shape.endX, y: shape.endY }
            ];
        }

        return [];
    }
}
