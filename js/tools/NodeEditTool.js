/**
 * NodeEditTool allows interactive editing of intermediate nodes (bend points) of a selected wire.
 * It enables users to click and drag these nodes to reshape the wire, while respecting grid snapping.
 * Terminal connection points are not directly editable by this tool, as their position is determined by the connected component.
 *
 * @example
 * // Example usage:
 * import NodeEditTool from './NodeEditTool.js';
 * const nodeEditTool = new NodeEditTool(canvas, drawingManager);
 * toolManager.addTool('nodeEdit', nodeEditTool);
 */
import Tool from './Tool.js';
import Wire from '../components/Wire.js';

class NodeEditTool extends Tool {
    /**
     * Creates an instance of NodeEditTool.
     * @param {Canvas} canvas - The canvas instance.
     * @param {DrawingManager} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        /**
         * The currently selected wire for node editing.
         * @type {Wire|null}
         */
        this.selectedWire = null;
        /**
         * The index of the node in the wire's `path` array that is currently being dragged.
         * -1 if no node is being dragged.
         * @type {number}
         */
        this.draggingNodePathIndex = -1;
        /**
         * The X coordinate where the drag operation started.
         * @type {number}
         */
        this.dragStartX = 0;
        /**
         * The Y coordinate where the drag operation started.
         * @type {number}
         */
        this.dragStartY = 0;
        /**
         * The initial position of the dragged node before the drag operation began.
         * @type {{x: number, y: number}}
         */
        this.initialNodePosition = { x: 0, y: 0 };
    }

    /**
     * Activates the NodeEditTool, resetting its state.
     * @returns {void}
     */
    activate() {
        this.selectedWire = null;
        this.draggingNodePathIndex = -1;
    }

    /**
     * Deactivates the NodeEditTool, deselecting any active wire and resetting its state.
     * @returns {void}
     */
    deactivate() {
        if (this.selectedWire) {
            this.selectedWire.deselect();
        }
        this.selectedWire = null;
        this.draggingNodePathIndex = -1;
    }

    /**
     * Handles the mouse down event, initiating node dragging or wire selection.
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const { x: coordinateX, y: coordinateY } = this.getMouseCoords(event);

        // First, check if an intermediate node of an already selected wire was clicked
        if (this.selectedWire) {
            // Only points in this.selectedWire.path are draggable by this tool
            for (let nodeIndex = 0; nodeIndex < this.selectedWire.path.length; nodeIndex++) {
                const pathNode = this.selectedWire.path[nodeIndex];
                const distance = Math.sqrt(
                    Math.pow(coordinateX - pathNode.x, 2) + Math.pow(coordinateY - pathNode.y, 2)
                );

                if (distance < 10) {
                    // 10px buffer for clicking on a node
                    this.draggingNodePathIndex = nodeIndex; // Direct index in the wire's path array
                    this.dragStartX = coordinateX;
                    this.dragStartY = coordinateY;
                    this.initialNodePosition = { x: pathNode.x, y: pathNode.y }; // Save initial node position
                    return; // Start dragging
                }
            }
        }

        // If no intermediate node was dragged, check if a new wire should be selected
        this.draggingNodePathIndex = -1; // Ensure no dragging is active
        const clickedElement = this.drawingManager.findElementAt(coordinateX, coordinateY);

        if (clickedElement instanceof Wire) {
            if (this.selectedWire !== clickedElement) {
                if (this.selectedWire) {
                    this.selectedWire.deselect();
                }
                this.selectedWire = clickedElement;
                this.selectedWire.select();
            }
        } else {
            // Clicked on empty space, deselect current wire
            if (this.selectedWire) {
                this.selectedWire.deselect();
                this.selectedWire = null;
            }
        }
        this.canvas.requestRender();
    }

    /**
     * Handles the mouse move event, updating the position of the dragged node.
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        if (this.draggingNodePathIndex === -1 || !this.selectedWire) return;

        const { x: coordinateX, y: coordinateY } = this.getMouseCoords(event);

        // Calculate mouse displacement relative to drag start
        const deltaX = coordinateX - this.dragStartX;
        const deltaY = coordinateY - this.dragStartY;

        // Calculate new node position without initial snapping
        const newX = this.initialNodePosition.x + deltaX;
        const newY = this.initialNodePosition.y + deltaY;

        // Apply snapping to the new position
        const snappedX =
            Math.round(newX / this.drawingManager.grid.gridCellSize) *
            this.drawingManager.grid.gridCellSize;
        const snappedY =
            Math.round(newY / this.drawingManager.grid.gridCellSize) *
            this.drawingManager.grid.gridCellSize;

        // Update the node in the wire's path array
        if (
            this.draggingNodePathIndex >= 0 &&
            this.draggingNodePathIndex < this.selectedWire.path.length
        ) {
            this.selectedWire.path[this.draggingNodePathIndex].x = snappedX;
            this.selectedWire.path[this.draggingNodePathIndex].y = snappedY;
        }

        this.canvas.requestRender();
    }

    /**
     * Handles the mouse up event, ending the node dragging operation.
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        this.draggingNodePathIndex = -1;
        // Do not deselect the wire, to allow multiple edits
        this.canvas.requestRender();
    }
}

export default NodeEditTool;
