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
        this.gridLineColor = '#bbeeeeff';
    }

    /**
     * Draws the grid overlay on the canvas.
     *
     * This method draws both vertical and horizontal grid lines spaced according to the gridCellSize property.
     *
     * @returns {void}
     */
    draw() {
        this.canvas.beginPath();
        this.canvas.setStrokeColor(this.gridLineColor);
        this.canvas.setStrokeWidth(0.5);
        this.canvas.setStrokeCap('round');
        this.canvas.setStrokeDash([0.25, this.gridCellSize / 2]);

        // Draw vertical grid lines
        for (
            let currentXPosition = 0;
            currentXPosition <= this.canvas.width;
            currentXPosition += this.gridCellSize
        ) {
            this.canvas.moveTo(currentXPosition, 0);
            this.canvas.lineTo(currentXPosition, this.canvas.height);
        }

        // Draw horizontal grid lines
        for (
            let currentYPosition = 0;
            currentYPosition <= this.canvas.height;
            currentYPosition += this.gridCellSize
        ) {
            this.canvas.moveTo(0, currentYPosition);
            this.canvas.lineTo(this.canvas.width, currentYPosition);
        }

        this.canvas.stroke();
        this.canvas.closePath();
        this.canvas.restore();
        this.canvas.requestRender();
    }
}

export default Grid;
