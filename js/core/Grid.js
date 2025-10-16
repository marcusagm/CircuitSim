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
import Canvas from './Canvas.js';

class Grid {
    /**
     * Creates an instance of Grid.
     *
     * @param {Canvas} canvas - The canvas element on which the grid will be drawn. Must have a 'ctx' property referencing its 2D context.
     * @param {number} gridCellSize - The size (in pixels) of each grid cell.
     */
    constructor(canvas, gridCellSize) {
        this.canvas = canvas;

        /**
         * The size of each grid cell in pixels.
         * @type {number}
         */
        this.gridCellSize = gridCellSize;

        /**
         * The color used to draw the grid lines.
         * @type {string}
         */
        this.gridLineColor = "#bbeeeeff";
    }

    /**
     * Draws the grid overlay on the canvas.
     *
     * This method draws both vertical and horizontal grid lines spaced according to the gridCellSize property.
     *
     * @returns {void}
     */
    draw() {
        this.canvas.context.beginPath();
        this.canvas.context.strokeStyle = this.gridLineColor;
        this.canvas.context.lineWidth = 0.5;
        this.canvas.context.lineCap = "round";
        this.canvas.context.setLineDash([0.25, this.gridCellSize / 2]);

        // Draw vertical grid lines
        for (
            let currentXPosition = 0;
            currentXPosition <= this.canvas.width;
            currentXPosition += this.gridCellSize
        ) {
            this.canvas.context.moveTo(currentXPosition, 0);
            this.canvas.context.lineTo(
                currentXPosition,
                this.canvas.height
            );
        }

        // Draw horizontal grid lines
        for (
            let currentYPosition = 0;
            currentYPosition <= this.canvas.height;
            currentYPosition += this.gridCellSize
        ) {
            this.canvas.context.moveTo(0, currentYPosition);
            this.canvas.context.lineTo(
                this.canvas.width,
                currentYPosition
            );
        }

        this.canvas.context.stroke();
        this.canvas.context.closePath();
        this.canvas.context.setLineDash([]);
        this.canvas.requestRender
    }
}

export default Grid;
