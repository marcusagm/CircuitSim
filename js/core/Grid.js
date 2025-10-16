/**
 * Represents a grid overlay for a canvas element, useful for visual alignment in graphical applications.
 *
 * @example
 * // Example usage:
 * import Grid from './Grid.js';
 *
 * const canvasElement = document.getElementById('myCanvas');
 * canvasElement.ctx = canvasElement.getContext('2d');
 * const gridCellSize = 20;
 * const gridOverlay = new Grid(canvasElement, gridCellSize);
 * gridOverlay.draw();
 */
class Grid {
    /**
     * Creates an instance of Grid.
     *
     * @param {HTMLCanvasElement} canvasElement - The canvas element on which the grid will be drawn. Must have a 'ctx' property referencing its 2D context.
     * @param {number} gridCellSize - The size (in pixels) of each grid cell.
     */
    constructor(canvasElement, gridCellSize) {
        /**
         * The canvas element on which the grid is drawn.
         * @type {HTMLCanvasElement}
         */
        this.canvasElement = canvasElement;

        /**
         * The 2D rendering context of the canvas.
         * @type {CanvasRenderingContext2D}
         */
        this.canvasContext = canvasElement.ctx;

        /**
         * The size of each grid cell in pixels.
         * @type {number}
         */
        this.gridCellSize = gridCellSize;

        /**
         * The color used to draw the grid lines.
         * @type {string}
         */
        this.gridLineColor = "#28656fff";
    }

    /**
     * Draws the grid overlay on the canvas.
     *
     * This method draws both vertical and horizontal grid lines spaced according to the gridCellSize property.
     *
     * @returns {void}
     */
    draw() {
        this.canvasContext.beginPath();
        this.canvasContext.strokeStyle = this.gridLineColor;
        this.canvasContext.lineWidth = 0.5;

        // Draw vertical grid lines
        for (
            let currentXPosition = 0;
            currentXPosition <= this.canvasElement.width;
            currentXPosition += this.gridCellSize
        ) {
            this.canvasContext.moveTo(currentXPosition, 0);
            this.canvasContext.lineTo(
                currentXPosition,
                this.canvasElement.height
            );
        }

        // Draw horizontal grid lines
        for (
            let currentYPosition = 0;
            currentYPosition <= this.canvasElement.height;
            currentYPosition += this.gridCellSize
        ) {
            this.canvasContext.moveTo(0, currentYPosition);
            this.canvasContext.lineTo(
                this.canvasElement.width,
                currentYPosition
            );
        }

        this.canvasContext.stroke();
    }
}

export default Grid;
