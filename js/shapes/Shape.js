/* eslint-disable no-unused-vars */
/**
 * Description:
 *  Base class representing a drawable and interactive shape on a canvas.
 *
 * Properties summary:
 *  - uniqueId {string} : Read-only unique identifier for the shape.
 *  - _positionX {number} : Internal X coordinate backing field.
 *  - _positionY {number} : Internal Y coordinate backing field.
 *  - _isSelected {boolean} : Internal selection state backing field.
 *  - _zIndex {number} : Internal z-index backing field used for render ordering.
 *  - _hitMargin {number} : Internal extra tolerance (pixels) for hit-testing.
 *
 * Typical usage:
 *   class Circle extends Shape {
 *     draw(canvas) { ... }
 *     isHit(canvas, x, y) { ... }
 *     edit(newProperties) { ... }
 *     drawSelectionHandles(canvas) { ... }
 *     getBoundingBox() { ... }
 *     static fromJSON(json) { ... }
 *   }
 *
 * Notes / Additional:
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
     * Internal positionX backing field.
     *
     * @type {number}
     * @protected
     */
    _positionX = 0;

    /**
     * Internal positionY backing field.
     *
     * @type {number}
     * @protected
     */
    _positionY = 0;

    /**
     * Internal selection state backing field.
     *
     * @type {boolean}
     * @protected
     */
    _isSelected = false;

    /**
     * Internal z-index backing field.
     *
     * @type {number}
     * @protected
     */
    _zIndex = 0;

    /**
     * Internal hitMargin backing field (extra tolerance for hit-testing).
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
        me._isSelected = false;
        me.zIndex = 0;
    }

    /**
     * positionX getter.
     *
     * @returns {number} Current X coordinate.
     */
    get positionX() {
        return this._positionX;
    }

    /**
     * positionX setter with validation.
     *
     * @param {number} value - New X coordinate.
     * @returns {void}
     */
    set positionX(value) {
        const me = this;
        const coerced = Number(value);
        if (Number.isNaN(coerced)) {
            console.warn(
                `[Shape] invalid positionX assignment (${value}). positionX must be a valid number. Keeping previous value: ${me._positionX}`
            );
            return;
        }
        me._positionX = coerced;
    }

    /**
     * positionY getter.
     *
     * @returns {number} Current Y coordinate.
     */
    get positionY() {
        return this._positionY;
    }

    /**
     * positionY setter with validation.
     *
     * @param {number} value - New Y coordinate.
     * @returns {void}
     */
    set positionY(value) {
        const me = this;
        const coerced = Number(value);
        if (Number.isNaN(coerced)) {
            console.warn(
                `[Shape] invalid positionY assignment (${value}). positionY must be a valid number. Keeping previous value: ${me._positionY}`
            );
            return;
        }
        me._positionY = coerced;
    }

    /**
     * hitMargin getter.
     *
     * @returns {number} Current hit margin in pixels.
     */
    get hitMargin() {
        return this._hitMargin;
    }

    /**
     * hitMargin setter with validation.
     *
     * @param {number} value - New hit margin (non-negative number).
     * @returns {void}
     */
    set hitMargin(value) {
        const me = this;
        const coerced = Number(value);
        if (Number.isNaN(coerced) || coerced < 0) {
            console.warn(
                `[Shape] invalid hitMargin assignment (${value}). hitMargin must be a non-negative number. Keeping previous value: ${me._hitMargin}`
            );
            return;
        }
        me._hitMargin = coerced;
    }

    /**
     * zIndex getter.
     *
     * @returns {number} Current z-index.
     */
    get zIndex() {
        return this._zIndex;
    }

    /**
     * zIndex setter with validation.
     *
     * @param {number} value - New z-index value.
     * @returns {void}
     */
    set zIndex(value) {
        const me = this;
        const coerced = Number(value);
        if (Number.isNaN(coerced)) {
            console.warn(
                `[Shape] invalid zIndex assignment (${value}). zIndex must be a valid number. Keeping previous value: ${me._zIndex}`
            );
            return;
        }
        me._zIndex = coerced;
    }

    /**
     * isSelected getter.
     *
     * @returns {boolean} True when the shape is selected.
     */
    get isSelected() {
        return this._isSelected;
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
        const me = this;
        me._isSelected = true;
    }

    /**
     * Deselect the shape.
     *
     * @returns {void}
     */
    deselect() {
        const me = this;
        me._isSelected = false;
    }

    /**
     * Move the shape by a given delta. This default implementation updates the shape's origin.
     * Subclasses that maintain multiple control points (e.g., Line) should override if they require different behavior.
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
        me.positionX = me.positionX + dx;
        me.positionY = me.positionY + dy;
    }

    /**
     * Edit (update) the shape's properties. Subclasses should override to support specific properties safely.
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
     * @throws {Error} If not implemented by subclass.
     * @abstract
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box object.
     */
    getBoundingBox() {
        throw new Error("Method 'getBoundingBox()' must be implemented by subclasses of Shape.");
    }

    /**
     * Return a serializable representation of the shape.
     * Subclasses should extend to include shape-specific properties.
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
     * Restore shape state from JSON. Subclasses should implement this helper and may call super if needed.
     *
     * @param {Object} json - Object previously produced by toJSON.
     * @throws {Error} If not implemented by subclass (base).
     * @abstract
     * @returns {Shape}
     */
    static fromJSON(json) {
        throw new Error(
            "Static method 'fromJSON(json)' must be implemented by concrete Shape subclasses."
        );
    }
}
