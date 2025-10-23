/**
 * Description:
 *  Represents a lightweight interactive handle used for manipulating shapes and components.
 *  A Handle is a small UI affordance (square, dot, directional triangle, cross) that can be
 *  rendered on the canvas and used for mouse interactions (drag, click). Handles are value
 *  objects that know their world position, visual appearance and drawing routine.
 *
 * Properties summary:
 *  - type {string} : handle visual type (see Handle.TYPES).
 *  - x {number} : center X coordinate (world).
 *  - y {number} : center Y coordinate (world).
 *  - size {number} : visual size in pixels.
 *  - fillColor {string} : fill color (CSS string).
 *  - borderColor {string} : border color (CSS string).
 *  - borderSize {number} : border thickness in pixels.
 *  - parentComponent {object|null} : optional reference to the owning component/shape.
 *
 * Typical usage:
 *   const handle = new Handle(100, 50, Handle.TYPES.SQUARE, componentRef, 8);
 *   handle.draw(canvas);
 *
 * Notes:
 *  - The class uses private backing fields and exposes getters/setters with validation.
 *  - Setters log warnings and keep previous values on invalid input (no exceptions).
 *  - Drawing methods assume the canvas manager has already saved the context; methods
 *    therefore only call canvas.restore() at the end per project convention.
 *
 * @class Handle
 */
export default class Handle {
    /**
     * Supported handle types.
     * @type {{SQUARE:string,DOT:string,DIRECTIONAL:string,CROSS:string}}
     */
    static TYPES = {
        SQUARE: 'square',
        DOT: 'dot',
        DIRECTIONAL: 'directional',
        CROSS: 'cross'
    };

    /**
     * Internal X coordinate backing field (center).
     * @type {number}
     * @private
     */
    _positionX = 0;

    /**
     * Internal Y coordinate backing field (center).
     * @type {number}
     * @private
     */
    _positionY = 0;

    /**
     * Internal type backing field.
     * @type {string}
     * @private
     */
    _type = Handle.TYPES.SQUARE;

    /**
     * Internal size backing field.
     * @type {number}
     * @private
     */
    _size = 5;

    /**
     * Internal fillColor backing field.
     * @type {string}
     * @private
     */
    _fillColor = '#00ccff66';

    /**
     * Internal borderColor backing field.
     * @type {string}
     * @private
     */
    _borderColor = '#00ccffff';

    /**
     * Internal borderSize backing field.
     * @type {number}
     * @private
     */
    _borderSize = 1;

    /**
     * Internal parentComponent backing field.
     * @type {object|null}
     * @private
     */
    _parentComponent = null;

    /**
     * Creates an instance of Handle.
     *
     * @param {number} positionX - Center X coordinate in world pixels.
     * @param {number} positionY - Center Y coordinate in world pixels.
     * @param {string} [type=Handle.TYPES.SQUARE] - One of Handle.TYPES.
     * @param {object|null} [parentComponent=null] - Optional owner reference.
     * @param {number} [size=5] - Size in pixels.
     * @param {string} [fillColor='#00ccff66'] - Fill CSS color.
     * @param {number} [borderSize=1] - Border thickness in pixels.
     * @param {string} [borderColor='#00ccffff'] - Border CSS color.
     */
    constructor(
        positionX,
        positionY,
        type = Handle.TYPES.SQUARE,
        parentComponent = null,
        size = 5,
        fillColor = '#00ccff66',
        borderSize = 1,
        borderColor = '#00ccffff'
    ) {
        const me = this;

        me.positionX = positionX;
        me.positionY = positionY;
        me.type = type;
        me.parentComponent = parentComponent;
        me.size = size;
        me.fillColor = fillColor;
        me.borderSize = borderSize;
        me.borderColor = borderColor;
    }

    /**
     * X getter.
     * @returns {number} Center X coordinate.
     */
    get positionX() {
        return this._positionX;
    }

    /**
     * X setter with validation.
     *
     * @param {number} value - New X coordinate.
     * @returns {void}
     */
    set positionX(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Handle] invalid x assignment (${value}). Keeping previous value: ${me._positionX}`
            );
            return;
        }
        me._positionX = numberValue;
    }

    /**
     * Y getter.
     * @returns {number} Center Y coordinate.
     */
    get positionY() {
        return this._positionY;
    }

    /**
     * Y setter with validation.
     *
     * @param {number} value - New Y coordinate.
     * @returns {void}
     */
    set positionY(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[Handle] invalid y assignment (${value}). Keeping previous value: ${me._positionY}`
            );
            return;
        }
        me._positionY = numberValue;
    }

    /**
     * type getter.
     * @returns {string} Handle type.
     */
    get type() {
        return this._type;
    }

    /**
     * type setter with validation.
     *
     * @param {string} value - One of Handle.TYPES.
     * @returns {void}
     */
    set type(value) {
        const me = this;
        if (typeof value !== 'string' || !Object.values(Handle.TYPES).includes(value)) {
            console.warn(
                `[Handle] invalid type assignment (${value}). Keeping previous value: ${me._type}`
            );
            return;
        }
        me._type = value;
    }

    /**
     * size getter.
     * @returns {number} Size in pixels.
     */
    get size() {
        return this._size;
    }

    /**
     * size setter with validation.
     *
     * @param {number} value - New size in pixels.
     * @returns {void}
     */
    set size(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue <= 0) {
            console.warn(
                `[Handle] invalid size assignment (${value}). Size must be a positive number. Keeping previous value: ${me._size}`
            );
            return;
        }
        me._size = numberValue;
    }

    /**
     * fillColor getter.
     * @returns {string} Fill CSS color.
     */
    get fillColor() {
        return this._fillColor;
    }

    /**
     * fillColor setter with validation.
     *
     * @param {string} value - New fill color string.
     * @returns {void}
     */
    set fillColor(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Handle] invalid fillColor assignment (${value}). Keeping previous value: ${me._fillColor}`
            );
            return;
        }
        me._fillColor = value;
    }

    /**
     * borderColor getter.
     * @returns {string} Border CSS color.
     */
    get borderColor() {
        return this._borderColor;
    }

    /**
     * borderColor setter with validation.
     *
     * @param {string} value - New border color string.
     * @returns {void}
     */
    set borderColor(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Handle] invalid borderColor assignment (${value}). Keeping previous value: ${me._borderColor}`
            );
            return;
        }
        me._borderColor = value;
    }

    /**
     * borderSize getter.
     * @returns {number} Border thickness in pixels.
     */
    get borderSize() {
        return this._borderSize;
    }

    /**
     * borderSize setter with validation.
     *
     * @param {number} value - New border size in pixels.
     * @returns {void}
     */
    set borderSize(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue < 0) {
            console.warn(
                `[Handle] invalid borderSize assignment (${value}). Keeping previous value: ${me._borderSize}`
            );
            return;
        }
        me._borderSize = numberValue;
    }

    /**
     * parentComponent getter.
     * @returns {object|null} Parent component reference.
     */
    get parentComponent() {
        return this._parentComponent;
    }

    /**
     * parentComponent setter.
     *
     * @param {object|null} value - Parent component or null.
     * @returns {void}
     */
    set parentComponent(value) {
        const me = this;
        // no strict type enforcement for parent; accept null or object
        if (value !== null && typeof value !== 'object') {
            console.warn(
                `[Handle] invalid parentComponent assignment (${value}). Keeping previous value.`
            );
            return;
        }
        me._parentComponent = value;
    }

    /**
     * Returns the "absolute" top-left position of the visual handle rectangle, taking border into account.
     *
     * @returns {{x:number,y:number}} Top-left coordinate for drawing primitives.
     */
    getAbsolutePosition() {
        const me = this;
        const halfSize = me.size / 2;
        const halfBorder = me.borderSize / 2;
        return {
            x: me.positionX - halfSize - halfBorder,
            y: me.positionY - halfSize - halfBorder
        };
    }

    /**
     * Draw the handle using the canvas abstraction.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        switch (me.type) {
            case Handle.TYPES.SQUARE:
                me.drawSquareHandle(canvas);
                break;
            case Handle.TYPES.DOT:
                me.drawDotHandle(canvas);
                break;
            case Handle.TYPES.DIRECTIONAL:
                me.drawDirectionalHandle(canvas);
                break;
            case Handle.TYPES.CROSS:
                me.drawCrossHandle(canvas);
                break;
            default:
                me.drawSquareHandle(canvas);
        }
    }

    /**
     * Draws a square handle.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawSquareHandle(canvas) {
        const me = this;
        const absPos = me.getAbsolutePosition();
        const innerSize = Math.max(0, me.size - me.borderSize);

        canvas
            .setStrokeColor(me.borderColor)
            .setFillColor(me.fillColor)
            .setStrokeWidth(me.borderSize)
            .rectangle(absPos.x, absPos.y, innerSize, innerSize)
            .fill()
            .rectangle(absPos.x, absPos.y, me.size, me.size)
            .stroke()
            .restore();
    }

    /**
     * Draws a dot (circular) handle.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawDotHandle(canvas) {
        const me = this;
        const absPos = me.getAbsolutePosition();
        const centerX = absPos.x + me.size / 2;
        const centerY = absPos.y + me.size / 2;
        const radius = Math.max(0, (me.size - me.borderSize) / 2);

        canvas
            .setStrokeColor(me.borderColor)
            .setFillColor(me.fillColor)
            .setStrokeWidth(me.borderSize)
            .circle(centerX, centerY, radius)
            .fill()
            .stroke()
            .restore();
    }

    /**
     * Draws a directional (triangle) handle centered at the handle position.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawDirectionalHandle(canvas) {
        const me = this;
        const absPos = me.getAbsolutePosition();
        const centerX = absPos.x + me.size / 2;
        const centerY = absPos.y + me.size / 2;
        const halfSize = Math.max(0, (me.size - me.borderSize) / 2);

        // draw a simple upward-pointing triangle (can be rotated by parent if needed)
        canvas
            .setStrokeColor(me.borderColor)
            .setFillColor(me.fillColor)
            .setStrokeWidth(me.borderSize)
            .beginPath()
            .line(centerX, centerY - halfSize, centerX - halfSize, centerY + halfSize)
            .line(centerX, centerY + halfSize, centerX + halfSize, centerY + halfSize)
            .closePath()
            .fill()
            .stroke()
            .restore();
    }

    /**
     * Draws a cross (X) handle.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawCrossHandle(canvas) {
        const me = this;
        const absPos = me.getAbsolutePosition();

        canvas
            .setStrokeColor(me.borderColor)
            .setStrokeWidth(me.borderSize)
            .line(absPos.x, absPos.y, absPos.x + me.size, absPos.y + me.size)
            .stroke()
            .line(absPos.x + me.size, absPos.y, absPos.x, absPos.y + me.size)
            .stroke()
            .restore();
    }
}
