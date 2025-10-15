/**
 * Represents an electrical wire in the circuit drawing application.
 * Wires can connect between two terminals of components or exist as free-floating lines with intermediate nodes.
 * It extends the base Shape class to inherit basic drawing properties and selection capabilities.
 *
 * @example
 * // Example usage:
 * import Wire from './components/Wire.js';
 * import Terminal from './components/Terminal.js';
 *
 * const terminal1 = new Terminal(component1, 0, 0);
 * const terminal2 = new Terminal(component2, 10, 10);
 * const wire = new Wire(terminal1, terminal2);
 * wire.addPoint(5, 5); // Add an intermediate node
 * drawingManager.addElement(wire);
 */
import Shape from "../shapes/Shape.js";

class Wire extends Shape {
    /**
     * Creates an instance of Wire.
     * @param {Terminal|null} startTerminal - The starting terminal of the wire, or null if it starts freely.
     * @param {Terminal|null} endTerminal - The ending terminal of the wire, or null if it ends freely.
     */
    constructor(startTerminal = null, endTerminal = null) {
        super(0, 0); // Base position is adjusted by terminals or path points
        /**
         * The starting terminal of the wire.
         * @type {Terminal|null}
         */
        this.startTerminal = startTerminal;
        /**
         * The ending terminal of the wire.
         * @type {Terminal|null}
         */
        this.endTerminal = endTerminal;
        /**
         * Array of intermediate points (nodes) that define the wire's path.
         * These are the points added by the user for bends, excluding terminal connection points.
         * @type {Array<{x: number, y: number}>}
         */
        this.path = [];
        /**
         * The color of the wire.
         * @type {string}
         */
        this.color = '#000000';
        /**
         * The line width of the wire.
         * @type {number}
         */
        this.lineWidth = 2;
        /**
         * The line dash pattern for the wire (e.g., [5, 5] for dashed line).
         * @type {number[]}
         */
        this.lineDash = [];
        /**
         * Indicates if the wire is temporary (e.g., being drawn).
         * @type {boolean}
         */
        this.isTemporary = false;
    }

    /**
     * Adds an intermediate point to the wire's path.
     * @param {number} coordinateX - The X coordinate of the point.
     * @param {number} coordinateY - The Y coordinate of the point.
     * @returns {void}
     */
    addPoint(coordinateX, coordinateY) {
        this.path.push({ x: coordinateX, y: coordinateY });
    }

    /**
     * Returns all points that define the wire, including the start/end terminals if connected,
     * and all intermediate path points.
     * @returns {Array<{x: number, y: number}>} An array of all points in the wire's path.
     */
    getAllPoints() {
        const allPoints = [];
        if (this.startTerminal) {
            allPoints.push(this.startTerminal.getAbsolutePosition());
        }
        allPoints.push(...this.path);
        if (this.endTerminal) {
            allPoints.push(this.endTerminal.getAbsolutePosition());
        }
        return allPoints;
    }

    /**
     * Draws the wire on the canvas context.
     * @param {CanvasRenderingContext2D} canvasContext - The 2D rendering context of the canvas.
     * @returns {void}
     */
    draw(canvasContext) {
        const allPoints = this.getAllPoints();
        if (allPoints.length < 2) return; // Needs at least two points to draw a line

        canvasContext.beginPath();
        canvasContext.strokeStyle = this.color;
        canvasContext.lineWidth = this.lineWidth;
        canvasContext.setLineDash(this.lineDash);

        canvasContext.moveTo(allPoints[0].x, allPoints[0].y);
        for (let pointIndex = 1; pointIndex < allPoints.length; pointIndex++) {
            canvasContext.lineTo(allPoints[pointIndex].x, allPoints[pointIndex].y);
        }
        canvasContext.stroke();
        canvasContext.setLineDash([]); // Reset to prevent other drawings from being dashed

        if (this.isSelected) {
            this.drawSelectionHandles(canvasContext);
        }
    }

    /**
     * Checks if the given coordinates hit the wire.
     * @param {number} coordinateX - The X coordinate to check.
     * @param {number} coordinateY - The Y coordinate to check.
     * @returns {boolean} True if the coordinates hit the wire, false otherwise.
     */
    isHit(coordinateX, coordinateY) {
        const allPoints = this.getAllPoints();
        if (allPoints.length < 2) return false;

        for (let pointIndex = 0; pointIndex < allPoints.length - 1; pointIndex++) {
            const point1 = allPoints[pointIndex];
            const point2 = allPoints[pointIndex + 1];

            const lineSegmentSquaredLength = Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2);
            if (lineSegmentSquaredLength === 0) continue; // It's a point

            const t = ((coordinateX - point1.x) * (point2.x - point1.x) + (coordinateY - point1.y) * (point2.y - point1.y)) / lineSegmentSquaredLength;
            const projectionX = point1.x + t * (point2.x - point1.x);
            const projectionY = point1.y + t * (point2.y - point1.y);

            let distance;
            if (t < 0) {
                distance = Math.sqrt(Math.pow(coordinateX - point1.x, 2) + Math.pow(coordinateY - point1.y, 2));
            } else if (t > 1) {
                distance = Math.sqrt(Math.pow(coordinateX - point2.x, 2) + Math.pow(coordinateY - point2.y, 2));
            }
            else {
                distance = Math.sqrt(Math.pow(coordinateX - projectionX, 2) + Math.pow(coordinateY - projectionY, 2));
            }

            if (distance < (this.lineWidth + 5)) { // Add a small buffer for easier clicking
                return true;
            }
        }
        return false;
    }

    /**
     * Moves the wire by a given displacement. Only applies to free-floating wires (not connected to terminals).
     * @param {number} deltaX - The displacement in the X direction.
     * @param {number} deltaY - The displacement in the Y direction.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        // Wires connected to terminals do not move directly, but with their components
        // Free wires (without terminals) or wires under construction move
        if (!this.startTerminal && !this.endTerminal) {
            this.path.forEach(pathPoint => {
                pathPoint.x += deltaX;
                pathPoint.y += deltaY;
            });
        }
    }

    /**
     * Edits the properties of the wire.
     * @param {object} newProperties - An object containing new properties to apply (color, lineWidth, lineDash).
     * @returns {void}
     */
    edit(newProperties) {
        if (newProperties.color !== undefined) this.color = newProperties.color;
        if (newProperties.lineWidth !== undefined) this.lineWidth = newProperties.lineWidth;
        if (newProperties.lineDash !== undefined) this.lineDash = newProperties.lineDash;
    }

    /**
     * Draws selection handles for the wire's editable nodes and highlights terminal connections.
     * @param {CanvasRenderingContext2D} canvasContext - The 2D rendering context of the canvas.
     * @returns {void}
     */
    drawSelectionHandles(canvasContext) {
        const handleSize = 5;
        canvasContext.fillStyle = 'blue';
        canvasContext.strokeStyle = 'white';
        canvasContext.lineWidth = 1;

        // Draw handles only for intermediate path points (editable nodes)
        this.path.forEach(pathPoint => {
            canvasContext.fillRect(pathPoint.x - handleSize / 2, pathPoint.y - handleSize / 2, handleSize, handleSize);
            canvasContext.strokeRect(pathPoint.x - handleSize / 2, pathPoint.y - handleSize / 2, handleSize, handleSize);
        });

        // Highlight terminal connection points (not editable nodes for this tool)
        if (this.startTerminal) {
            const terminalPosition = this.startTerminal.getAbsolutePosition();
            canvasContext.fillRect(terminalPosition.x - handleSize / 2, terminalPosition.y - handleSize / 2, handleSize, handleSize);
            canvasContext.strokeRect(terminalPosition.x - handleSize / 2, terminalPosition.y - handleSize / 2, handleSize, handleSize);
        }
        if (this.endTerminal) {
            const terminalPosition = this.endTerminal.getAbsolutePosition();
            canvasContext.fillRect(terminalPosition.x - handleSize / 2, terminalPosition.y - handleSize / 2, handleSize, handleSize);
            canvasContext.strokeRect(terminalPosition.x - handleSize / 2, terminalPosition.y - handleSize / 2, handleSize, handleSize);
        }
    }
}

export default Wire;

