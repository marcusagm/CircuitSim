/**
 * DrawingManager is responsible for managing drawable elements on a canvas.
 * It provides methods to add, remove, and find elements, as well as to render all elements.
 *
 * Example usage:
 *
 * import DrawingManager from './DrawingManager';
 *
 * const drawingManager = new DrawingManager(canvasInstance);
 * drawingManager.addElement(rectangleElement);
 * drawingManager.drawAll(canvasContext);
 *
 */
import Canvas from "../core/Canvas.js";
import Grid from "../core/Grid.js";

class DrawingManager {
    /**
     * Creates an instance of DrawingManager.
     * @param {Canvas} canvas - The canvas object where elements will be drawn. Must implement a draw() method.
     * @param {Grid} grid - The grid object for reference (optional).
     */
    constructor(canvas, grid) {
        /**
         * The canvas object where elements are managed and drawn.
         * @type {Canvas}
         */
        this.canvas = canvas;
        /**
         * The grid object for reference (optional).
         * @type {Grid}
         */
        this.grid = grid;

        /**
         * Array containing all drawable elements managed by this instance.
         * Each element must implement a draw(context) method and optionally an isHit(x, y) method.
         * @type {Array<Object>}
         */
        this.drawableElements = [];
    }

    /**
     * Adds a drawable element to the manager and redraws the canvas.
     * @param {Object} drawableElement - The element to add. Must implement a draw(context) method.
     * @returns {void}
     */
    addElement(drawableElement) {
        this.drawableElements.push(drawableElement);
        this.canvas.requestRender();
    }

    /**
     * Removes a drawable element from the manager and redraws the canvas.
     * @param {Object} drawableElement - The element to remove.
     * @returns {void}
     */
    removeElement(drawableElement) {
        this.drawableElements = this.drawableElements.filter(
            (existingElement) => existingElement !== drawableElement
        );
        this.canvas.requestRender();
    }

    /**
     * Draws all managed elements onto the provided canvas context.
     * @returns {void}
     */
    drawAll() {
        this.drawableElements.forEach((drawableElement) => {
            drawableElement.draw(this.canvas);
        });
    }

    /**
     * Finds and returns the topmost element at the specified coordinates.
     * Iterates in reverse order to prioritize elements drawn last (on top).
     * @param {number} coordinateX - The X coordinate to check.
     * @param {number} coordinateY - The Y coordinate to check.
     * @returns {Object|null} The found element, or null if none is found.
     */
    findElementAt(coordinateX, coordinateY) {
        for (
            let elementIndex = this.drawableElements.length - 1;
            elementIndex >= 0;
            elementIndex--
        ) {
            const drawableElement = this.drawableElements[elementIndex];
            if (
                drawableElement.isHit &&
                drawableElement.isHit(coordinateX, coordinateY)
            ) {
                return drawableElement;
            }
        }
        return null;
    }
}

export default DrawingManager;
