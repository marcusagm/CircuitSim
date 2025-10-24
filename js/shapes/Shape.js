/* eslint-disable no-unused-vars */
/**
 * Base class representing a drawable and interactive shape on a canvas.
 *
 * The Shape class provides common, minimal state and behavior shared by all
 * concrete shapes (for example Circle, Rectangle, Line). It stores identity
 * and basic geometry (position), selection state and rendering order, and
 * defines an API (abstract methods) that subclasses must implement to be
 * renderable and interactive within a canvas-based editor or renderer.
 *
 * Key responsibilities:
 *  - Hold identifying information (uniqueId).
 *  - Store canonical position (positionX, positionY) and optional zIndex.
 *  - Provide selection management (select/deselect).
 *  - Provide a safe default translation implementation (move).
 *  - Define abstract methods for drawing, hit-testing, editing, selection-handle
 *    drawing, bounding box calculation, and JSON serialization/deserialization.
 *
 * Typical usage:
 *  1. Subclass Shape and implement the abstract methods:
 *     - draw(canvas)
 *     - isHit(canvas, x, y)
 *     - edit(newProperties)
 *     - drawSelectionHandles(canvas)
 *     - getBoundingBox()
 *     - static fromJSON(json)
 *
 *  2. Instantiate the concrete shape and use on a canvas:
 *     const circle = new Circle(100, 80, 20); // Circle extends Shape
 *     circle.draw(canvasInstance);
 *     if (circle.isHit(canvasInstance, mouseX, mouseY)) circle.select();
 *
 *  3. Serialize/deserialize:
 *     const data = circle.toJSON();
 *     const restored = Circle.fromJSON(data);
 *
 * Notes:
 *  - positionX/positionY are numeric coordinates (by convention, in pixels).
 *  - uniqueId is generated automatically and intended to be treated as read-only.
 *
 * @class Shape
 */
export default class Shape {
    /**
     * Unique identifier for the shape.
     *
     * @readonly
     * @type {string}
     */
    uniqueId = null;

    /**
     * X coordinate of the shape's position (usually in pixels).
     * Interpretation (e.g. center or top-left) must be defined by subclasses.
     *
     * @type {number}
     * @protected
     */
    _positionX = 0;

    /**
     * Y coordinate of the shape's position (usually in pixels).
     *
     * @type {number}
     * @protected
     */
    _positionY = 0;

    /**
     * Whether the shape is currently selected.
     *
     * @type {boolean}
     * @protected
     */
    _isSelected = false;

    /**
     * Optional z-index for rendering order. Higher numbers draw on top.
     *
     * @type {number}
     * @protected
     */
    _zIndex = 0;

    /**
     * Margin to identify the hit area
     *
     * @type {number}
     * @protected
     */
    _hitMargin = 5;

    /**
     * Creates an instance of Shape.
     *
     * @param {number} [positionX=0] - Initial X coordinate.
     * @param {number} [positionY=0] - Initial Y coordinate.
     * @throws {TypeError} If positionX or positionY are not valid numbers.
     */
    constructor(positionX = 0, positionY = 0) {
        const me = this,
            x = Number(positionX),
            y = Number(positionY),
            radix = 36,
            start = 2,
            length = 9;

        if (Number.isNaN(x) || Number.isNaN(y)) {
            throw new TypeError('positionX and positionY must be valid numbers.');
        }

        // generate unique id: prefer crypto.randomUUID() when available
        try {
            me.uniqueId =
                typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                    ? crypto.randomUUID()
                    : `shape_${Date.now()}_${Math.random().toString(radix).slice(start, length)}`;
        } catch (error) {
            me.uniqueId = `shape_${Date.now()}_${Math.random().toString(radix).slice(start, length)}`;
        }

        me.positionX = x;
        me.positionY = y;
        me.isSelected = false;
        me.zIndex = 0;
    }

    /**
     * PositionX getter.
     *
     * @returns {number}
     */
    get positionX() {
        return this._positionX;
    }

    /**
     * PositionX setter with validation.
     * On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value
     */
    set positionX(value) {
        const me = this;
        const positionX = Number(value);
        if (Number.isNaN(positionX)) {
            console.warn(
                `[Point] invalid positionX assignment (${value}). Keeping previous value: ${me._positionX}`
            );
            return;
        }
        me._positionX = positionX;
    }

    /**
     * PositionY getter.
     *
     * @returns {number}
     */
    get positionY() {
        return this._positionY;
    }

    /**
     * PositionY setter with validation.
     * On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value
     */
    set positionY(value) {
        const me = this;
        const positionY = Number(value);
        if (Number.isNaN(positionY)) {
            console.warn(
                `[Point] invalid positionY assignment (${value}). Keeping previous value: ${me._positionY}`
            );
            return;
        }
        me._positionY = positionY;
    }

    /**
     * hitMargin getter.
     *
     * @returns {number}
     */
    get hitMargin() {
        return this._hitMargin;
    }

    /**
     * hitMargin setter with validation.
     * On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value
     */
    set hitMargin(value) {
        const me = this;
        const hitMargin = Number(value);
        if (Number.isNaN(hitMargin) || hitMargin < 0) {
            console.warn(
                `[Point] invalid padding assignment (${value}). Padding must be a non-negative number. Keeping previous value: ${me._hitMargin}`
            );
            return;
        }
        me._hitMargin = hitMargin;
    }

    /**
     * ZIndex getter.
     *
     * @returns {number}
     */
    get zIndex() {
        return this._zIndex;
    }

    /**
     * ZIndex setter with validation.
     * On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value
     */
    set zIndex(value) {
        const me = this;
        const zIndex = Number(value);
        if (Number.isNaN(zIndex)) {
            console.warn(
                `[Point] invalid zIndex assignment (${value}). Keeping previous value: ${me._zIndex}`
            );
            return;
        }
        me._zIndex = zIndex;
    }

    /**
     * Draw the shape on the provided canvas.
     *
     * Subclasses MUST implement this method.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    draw(canvas) {
        throw new Error("Method 'draw(canvas)' must be implemented by subclasses of Shape.");
    }

    /**
     * Hit test: determine whether the given coordinates intersect the shape.
     *
     * Subclasses MUST implement this method. Coordinates are typically in canvas pixels.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas/context helper object.
     * @param {number} coordinateX - X coordinate to test.
     * @param {number} coordinateY - Y coordinate to test.
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {boolean} True if the point hits the shape, otherwise false.
     */
    isHit(canvas, coordinateX, coordinateY) {
        throw new Error("Method 'isHit(canvas, x, y)' must be implemented by subclasses of Shape.");
    }

    /**
     * Select the shape.
     *
     * @returns {void}
     */
    select() {
        this.isSelected = true;
    }

    /**
     * Deselect the shape.
     *
     * @returns {void}
     */
    deselect() {
        this.isSelected = false;
    }

    /**
     * Returns if the shape is selected
     *
     * @returns {boolean}
     */
    isSelected() {
        return this._isSelected;
    }

    /**
     * Move the shape by a given delta. This implementation updates the shape's origin.
     * Subclasses that maintain multiple control points (e.g., a Line) should override
     * if they require different behavior.
     *
     * This method is **not abstract** and provides a safe default implementation.
     *
     * @param {number} deltaX - Displacement along the X axis.
     * @param {number} deltaY - Displacement along the Y axis.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        const me = this;
        const dx = Number(deltaX) || 0;
        const dy = Number(deltaY) || 0;
        me.positionX += dx;
        me.positionY += dy;
    }

    /**
     * Edit (update) the shape's properties. Subclasses should override to support
     * specific properties safely (validate ranges, types, etc).
     *
     * @param {Object<string, any>} newProperties - Key/value map with properties to update.
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    edit(newProperties) {
        throw new Error("Method 'edit(newProperties)' must be implemented by subclasses of Shape.");
    }

    /**
     * Draw visual selection handles (resize/move grips).
     *
     * Subclasses decide where and how handles appear (corners, midpoints, rotation handle, etc).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas helper/context.
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        throw new Error(
            "Method 'drawSelectionHandles(canvas)' must be implemented by subclasses of Shape."
        );
    }

    /**
     * Returns a minimal bounding box for the shape in the form { x, y, width, height }.
     * Subclasses should override to provide accurate box.
     *
     * Default implementation throws to force subclass implementation for shapes that
     * need bounding boxes for selection, collision, or layout.
     *
     * @throws {Error} If not implemented by subclass.
     * @returns {{x:number,y:number,width:number,height:number}}
     * @abstract
     */
    getBoundingBox() {
        throw new Error("Method 'getBoundingBox()' must be implemented by subclasses of Shape.");
    }

    /**
     * Return a serializable representation of the shape.
     * Subclasses should extend to include shape-specific properties.
     *
     * Default includes type, id, position and zIndex.
     *
     * @returns {Object} JSON-serializable object representing the shape.
     */
    toJSON() {
        const me = this;
        return {
            type: me.constructor.name || 'Shape',
            id: me.uniqueId,
            x: me.positionX,
            y: me.positionY,
            zIndex: me.zIndex,
            selected: me.isSelected
        };
    }

    /**
     * Restore shape state from JSON. Subclasses should override and call super if needed.
     * Note: this is a helper to be implemented by concrete shapes; base throws by default.
     *
     * @param {Object} json - Object previously produced by toJSON.
     * @throws {Error} If not implemented by subclass (base).
     * @abstract
     */
    static fromJSON(json) {
        throw new Error(
            "Static method 'fromJSON(json)' must be implemented by concrete Shape subclasses."
        );
    }
}
