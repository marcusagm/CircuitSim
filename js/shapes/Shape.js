/**
 * Base class for all drawable shapes on the canvas.
 * Provides common properties and abstract methods for drawing and interaction.
 *
 * All specific shapes (Line, Circle, Rectangle, etc.) should extend this class.
 */
import Canvas from "../core/Canvas.js";

class Shape {

    /**
     * Creates an instance of Shape.
     * @param {number} positionX - The X coordinate of the shape's position.
     * @param {number} positionY - The Y coordinate of the shape's position.
     */
    constructor(positionX, positionY) {
        /**
         * The unique identifier for the shape.
         * @type {string}
         */
        this.uniqueId = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        /**
         * The X coordinate of the shape's position.
         * @type {number}
         */
        this.positionX = positionX;

        /**
         * The Y coordinate of the shape's position.
         * @type {number}
         */
        this.positionY = positionY;

        /**
         * Indicates if the shape is currently selected.
         * @type {boolean}
         */
        this.isSelected = false;
    }

    /**
     * Abstract method to draw the shape on the canvas context.
     * Must be implemented by subclasses. This base method applies common stroke properties.
     * @param {Canvas} canvas - The 2D rendering context of the canvas.
     * @returns {void}
     * @abstract
     */
    draw(canvas) {
        // Método abstrato, deve ser implementado pelas subclasses
        throw new Error("Method 'draw()' must be implemented.");
    }

    /**
     * Abstract method to check if the given coordinates hit the shape.
     * Must be implemented by subclasses.
     * @param {number} coordinateX - The X coordinate to check.
     * @param {number} coordinateY - The Y coordinate to check.
     * @returns {boolean} True if the coordinates hit the shape, false otherwise.
     * @abstract
     */
    isHit(coordinateX, coordinateY) {
        // Método abstrato, deve ser implementado pelas subclasses
        throw new Error("Method 'isHit()' must be implemented.");
    }

    /**
     * Selects the shape.
     * @returns {void}
     */
    select() {
        this.isSelected = true;
    }

    /**
     * Deselects the shape.
     * @returns {void}
     */
    deselect() {
        this.isSelected = false;
    }

    /**
     * Abstract method to move the shape by a given displacement.
     * Must be implemented by subclasses.
     * @param {number} deltaX - The displacement in the X direction.
     * @param {number} deltaY - The displacement in the Y direction.
     * @returns {void}
     * @abstract
     */
    move(deltaX, deltaY) {
        this.positionX += deltaX;
        this.positionY += deltaY;
    }

    /**
     * Edits the properties of the shape.
     * This method can be overridden by subclasses to handle specific properties.
     * @param {object} newProperties - An object containing new properties to apply.
     * @returns {void}
     */
    edit(newProperties) {
        throw new Error("Method 'edit()' must be implemented.");
    }

    /**
     * Draws selection handles for the shape.
     * This method can be overridden by subclasses to draw specific handles.
     * @param {Canvas} canvas - The 2D rendering context of the canvas.
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        throw new Error("Method 'drawSelectionHandles()' must be implemented.");
    }
}

export default Shape;
