/**
 * WireTool allows users to draw electrical wires on the canvas.
 * It supports connecting wires between component terminals or drawing free-floating wires with intermediate bend points.
 * Wires can be drawn with orthogonal or 45-degree segments.
 *
 * @example
 * // Example usage:
 * import WireTool from './tools/WireTool.js';
 * const wireTool = new WireTool(canvas, drawingManager);
 * toolManager.addTool('wire', wireTool);
 */
import Tool from "./Tool.js";
import Wire from "../components/Wire.js";
import Terminal from "../components/Terminal.js";

class WireTool extends Tool {
    /**
     * Creates an instance of WireTool.
     * @param {Canvas} canvas - The canvas instance.
     * @param {DrawingManager} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        /**
         * The wire currently being drawn.
         * @type {Wire|null}
         */
        this.currentWire = null;
        /**
         * The starting terminal if the wire begins from one.
         * @type {Terminal|null}
         */
        this.startTerminal = null;
        /**
         * The last point added to the wire's path during drawing.
         * @type {{x: number, y: number}|null}
         */
        this.lastPoint = null;
        /**
         * Indicates if a wire drawing operation is currently active.
         * @type {boolean}
         */
        this.isDrawingWire = false;
    }

    /**
     * Activates the WireTool, preparing it for drawing.
     * @returns {void}
     */
    activate() {
        this.resetToolState();
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    /**
     * Deactivates the WireTool, cleaning up any active drawing state.
     * @returns {void}
     */
    deactivate() {
        this.resetToolState();
        document.removeEventListener("keydown", this.onKeyDown.bind(this));
    }

    /**
     * Resets the internal state of the tool, clearing any temporary wires or drawing flags.
     * @returns {void}
     */
    resetToolState() {
        if (this.currentWire && this.currentWire.isTemporary) {
            this.drawingManager.removeElement(this.currentWire);
        }
        this.currentWire = null;
        this.startTerminal = null;
        this.lastPoint = null;
        this.isDrawingWire = false;
        this.canvas.requestRender();
    }

    /**
     * Handles the mouse down event, initiating or continuing wire drawing.
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const { x: coordinateX, y: coordinateY } = this.getMouseCoords(event);
        const snappedX =
            Math.round(coordinateX / this.drawingManager.grid.gridCellSize) *
            this.drawingManager.grid.gridCellSize;
        const snappedY =
            Math.round(coordinateY / this.drawingManager.grid.gridCellSize) *
            this.drawingManager.grid.gridCellSize;
        const snappedPoint = { x: snappedX, y: snappedY };

        let clickedTerminal = null;

        // Search for a clicked terminal on any component
        for (const element of this.drawingManager.drawableElements) {
            if (element.terminals) {
                for (const terminal of element.terminals) {
                    if (terminal.isHit(coordinateX, coordinateY)) {
                        clickedTerminal = terminal;
                        break;
                    }
                }
            }
            if (clickedTerminal) break;
        }

        if (!this.isDrawingWire) {
            // Attempting to start a new wire
            if (clickedTerminal) {
                this.startTerminal = clickedTerminal;
                this.currentWire = new Wire(this.startTerminal);
                this.currentWire.isTemporary = true;
                this.drawingManager.addElement(this.currentWire);
                this.startTerminal.addWire(this.currentWire);
                this.lastPoint = this.startTerminal.getAbsolutePosition();
                this.isDrawingWire = true;
            } else {
                // Clicked on an empty spot, start a free-floating wire
                this.currentWire = new Wire();
                this.currentWire.isTemporary = true;
                this.currentWire.addPoint(snappedPoint.x, snappedPoint.y);
                this.drawingManager.addElement(this.currentWire);
                this.lastPoint = snappedPoint;
                this.isDrawingWire = true;
            }
        } else {
            // Continue drawing the wire or connect to a terminal
            if (clickedTerminal && clickedTerminal !== this.startTerminal) {
                // Connect to another terminal
                this.currentWire.endTerminal = clickedTerminal;
                clickedTerminal.addWire(this.currentWire);
                this.currentWire.isTemporary = false;
                this.currentWire = null;
                this.startTerminal = null;
                this.lastPoint = null;
                this.isDrawingWire = false;
            } else {
                // Add a bend point to the wire
                this.currentWire.addPoint(snappedPoint.x, snappedPoint.y);
                this.lastPoint = snappedPoint;
            }
        }
        this.canvas.requestRender();
    }

    /**
     * Handles the mouse move event, updating the temporary wire segment.
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        if (!this.isDrawingWire || !this.currentWire) return;

        const { x: coordinateX, y: coordinateY } = this.getMouseCoords(event);
        const snappedX =
            Math.round(coordinateX / this.drawingManager.grid.gridCellSize) *
            this.drawingManager.grid.gridCellSize;
        const snappedY =
            Math.round(coordinateY / this.drawingManager.grid.gridCellSize) *
            this.drawingManager.grid.gridCellSize;
        const currentSnappedPoint = { x: snappedX, y: snappedY };

        // If there are no points in the path, the initial point is the startTerminal or the first click
        const referencePoint =
            this.currentWire.path.length > 0
                ? this.currentWire.path[this.currentWire.path.length - 1]
                : this.startTerminal
                ? this.startTerminal.getAbsolutePosition()
                : this.lastPoint;

        let finalX = currentSnappedPoint.x;
        let finalY = currentSnappedPoint.y;

        const deltaX = Math.abs(currentSnappedPoint.x - referencePoint.x);
        const deltaY = Math.abs(currentSnappedPoint.y - referencePoint.y);

        // Logic to force orthogonal or 45 degrees
        if (deltaX === deltaY) {
            // 45 degrees
            finalX = currentSnappedPoint.x;
            finalY = currentSnappedPoint.y;
        } else if (deltaX > deltaY) {
            // Horizontal
            finalY = referencePoint.y;
        } else {
            // Vertical
            finalX = referencePoint.x;
        }

        // Add or update the last point of the path
        if (this.currentWire.path.length === 0 && !this.startTerminal) {
            // If the wire started from a free point and this is the first movement
            this.currentWire.path.push({ x: finalX, y: finalY });
        } else if (this.currentWire.path.length === 0 && this.startTerminal) {
            // If the wire started from a terminal, the first point of the path is the mouse
            this.currentWire.path.push({ x: finalX, y: finalY });
        } else {
            // Update the last point of the path
            this.currentWire.path[this.currentWire.path.length - 1] = {
                x: finalX,
                y: finalY,
            };
        }

        this.canvas.requestRender();
    }

    /**
     * Handles the mouse up event. For WireTool, finalization is typically handled in onMouseDown or onKeyDown (ESC).
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        // The wire finalization logic is handled in onMouseDown (when clicking another terminal or a free point)
        // No specific logic needed here for this tool.
    }

    /**
     * Handles key down events, specifically for 'Escape' to cancel wire drawing.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {void}
     */
    onKeyDown(event) {
        if (event.key === "Escape" && this.isDrawingWire) {
            if (this.currentWire) {
                this.drawingManager.removeElement(this.currentWire);
            }
            this.resetToolState();
        }
    }
}

export default WireTool;
