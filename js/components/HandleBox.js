import Handle from './Handle.js';

/**
 * Description:
 *  HandleBox represents an interactive bounding box with handles used to resize or manipulate a component.
 *  It renders a dashed or solid rectangle and a configurable set of handles (corner, edge, center).
 *  The class centralizes property validation in getters/setters and exposes a small API for drawing and editing.
 *
 * Properties summary:
 *  - x {number} : top-left X coordinate of the box (world).
 *  - y {number} : top-left Y coordinate of the box (world).
 *  - width {number} : width of the box in pixels.
 *  - height {number} : height of the box in pixels.
 *  - parentComponent {object|null} : optional owner reference.
 *  - borderColor {string} : CSS color used to render the box border.
 *  - borderSize {number} : border thickness in pixels.
 *  - isDashed {boolean} : whether the border is drawn dashed.
 *  - showCenterHandles {boolean} : whether the center cross handle is shown.
 *
 * Typical usage:
 *   const hb = new HandleBox(10, 20, 120, 80, componentRef);
 *   hb.draw(canvasInstance);
 *
 * Notes:
 *  - Setters validate input and log warnings (do not throw) using consistent message format.
 *  - draw(canvas) assumes the canvas manager handles save(); this method calls canvas.restore() per project convention.
 *
 * @class HandleBox
 */
export default class HandleBox {
    /**
     * Internal X backing field (top-left).
     * @type {number}
     * @private
     */
    _positionX = 0;

    /**
     * Internal Y backing field (top-left).
     * @type {number}
     * @private
     */
    _positionY = 0;

    /**
     * Internal width backing field.
     * @type {number}
     * @private
     */
    _width = 0;

    /**
     * Internal height backing field.
     * @type {number}
     * @private
     */
    _height = 0;

    /**
     * Internal parent component backing field.
     * @type {object|null}
     * @private
     */
    _parentComponent = null;

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
     * Internal isDashed backing field.
     * @type {boolean}
     * @private
     */
    _isDashed = true;

    /**
     * Internal showCenterHandles backing field.
     * @type {boolean}
     * @private
     */
    _showCenterHandles = true;

    /**
     * Supported handle types for convenience.
     * @type {{SQUARE:string,DOT:string,DIRECTIONAL:string,ANCHOR:string,CROSS:string}}
     */
    static TYPES = {
        SQUARE: 'square',
        DOT: 'dot',
        DIRECTIONAL: 'directional',
        ANCHOR: 'anchor',
        CROSS: 'cross'
    };

    /**
     * Creates an instance of HandleBox.
     *
     * @param {number} positionX - Top-left X coordinate in world pixels.
     * @param {number} positionY - Top-left Y coordinate in world pixels.
     * @param {number} width - Width of the box in pixels.
     * @param {number} height - Height of the box in pixels.
     * @param {object|null} parentComponent - Optional owner reference.
     * @param {boolean} [showCenterHandles=true] - Show center handle cross.
     * @param {boolean} [isDashed=true] - Draw dashed border when true.
     * @param {number} [borderSize=1] - Border thickness in pixels.
     * @param {string} [borderColor='#00ccffff'] - Border CSS color.
     */
    constructor(
        positionX,
        positionY,
        width,
        height,
        parentComponent = null,
        showCenterHandles = true,
        isDashed = true,
        borderSize = 1,
        borderColor = '#00ccffff'
    ) {
        const me = this;
        me.positionX = positionX;
        me.positionY = positionY;
        me.width = width;
        me.height = height;
        me.isDashed = isDashed;
        me.borderSize = borderSize;
        me.borderColor = borderColor;
        me.parentComponent = parentComponent;
        me.showCenterHandles = showCenterHandles;
    }

    /**
     * x getter.
     * @returns {number} Top-left X coordinate.
     */
    get positionX() {
        return this._positionX;
    }

    /**
     * x setter with validation.
     *
     * @param {number} value - New top-left X coordinate.
     * @returns {void}
     */
    set positionX(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[HandleBox] invalid x assignment (${value}). Keeping previous value: ${me._positionX}`
            );
            return;
        }
        me._positionX = numberValue;
    }

    /**
     * y getter.
     * @returns {number} Top-left Y coordinate.
     */
    get positionY() {
        return this._positionY;
    }

    /**
     * y setter with validation.
     *
     * @param {number} value - New top-left Y coordinate.
     * @returns {void}
     */
    set positionY(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[HandleBox] invalid y assignment (${value}). Keeping previous value: ${me._positionY}`
            );
            return;
        }
        me._positionY = numberValue;
    }

    /**
     * width getter.
     * @returns {number} Width in pixels.
     */
    get width() {
        return this._width;
    }

    /**
     * width setter with validation.
     *
     * @param {number} value - New width in pixels.
     * @returns {void}
     */
    set width(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue < 0) {
            console.warn(
                `[HandleBox] invalid width assignment (${value}). Keeping previous value: ${me._width}`
            );
            return;
        }
        me._width = numberValue;
    }

    /**
     * height getter.
     * @returns {number} Height in pixels.
     */
    get height() {
        return this._height;
    }

    /**
     * height setter with validation.
     *
     * @param {number} value - New height in pixels.
     * @returns {void}
     */
    set height(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue < 0) {
            console.warn(
                `[HandleBox] invalid height assignment (${value}). Keeping previous value: ${me._height}`
            );
            return;
        }
        me._height = numberValue;
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
        if (value !== null && typeof value !== 'object') {
            console.warn(
                `[HandleBox] invalid parentComponent assignment (${value}). Keeping previous value.`
            );
            return;
        }
        me._parentComponent = value;
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
                `[HandleBox] invalid borderColor assignment (${value}). Keeping previous value: ${me._borderColor}`
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
                `[HandleBox] invalid borderSize assignment (${value}). Keeping previous value: ${me._borderSize}`
            );
            return;
        }
        me._borderSize = numberValue;
    }

    /**
     * isDashed getter.
     * @returns {boolean} True when border is dashed.
     */
    get isDashed() {
        return this._isDashed;
    }

    /**
     * isDashed setter.
     *
     * @param {boolean} value - True to draw a dashed border.
     * @returns {void}
     */
    set isDashed(value) {
        const me = this;
        me._isDashed = Boolean(value);
    }

    /**
     * showCenterHandles getter.
     * @returns {boolean} True when center handle is shown.
     */
    get showCenterHandles() {
        return this._showCenterHandles;
    }

    /**
     * showCenterHandles setter.
     *
     * @param {boolean} value - True to show the center handle.
     * @returns {void}
     */
    set showCenterHandles(value) {
        const me = this;
        me._showCenterHandles = Boolean(value);
    }

    /**
     * Returns the absolute top-left position of the handle box.
     * If parentComponent transforms are needed they should be applied externally or by overriding this method.
     *
     * @returns {{x:number,y:number}} Top-left coordinate.
     */
    getAbsolutePosition() {
        const me = this;
        return { x: me.positionX, y: me.positionY };
    }

    /**
     * Draws the handle box (rectangle) and all handles.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        const absPos = me.getAbsolutePosition();

        canvas.setStrokeColor(me.borderColor).setStrokeWidth(me.borderSize);

        if (me.isDashed) {
            canvas.setStrokeDash([5, 3]);
        } else {
            canvas.setStrokeDash([]);
        }

        canvas.rectangle(absPos.x, absPos.y, me.width, me.height).stroke().restore();

        // Corner handles
        new Handle(absPos.x, absPos.y, Handle.TYPES.SQUARE, me).draw(canvas); // top-left
        new Handle(absPos.x + me.width, absPos.y, Handle.TYPES.SQUARE, me).draw(canvas); // top-right
        new Handle(absPos.x, absPos.y + me.height, Handle.TYPES.SQUARE, me).draw(canvas); // bottom-left
        new Handle(absPos.x + me.width, absPos.y + me.height, Handle.TYPES.SQUARE, me).draw(canvas); // bottom-right

        // Edge-center handles
        new Handle(absPos.x + me.width / 2, absPos.y, Handle.TYPES.DOT, me).draw(canvas); // top-center
        new Handle(absPos.x + me.width / 2, absPos.y + me.height, Handle.TYPES.DOT, me).draw(
            canvas
        ); // bottom-center
        new Handle(absPos.x, absPos.y + me.height / 2, Handle.TYPES.DOT, me).draw(canvas); // middle-left
        new Handle(absPos.x + me.width, absPos.y + me.height / 2, Handle.TYPES.DOT, me).draw(
            canvas
        ); // middle-right

        // Optional center cross handle
        if (me.showCenterHandles) {
            new Handle(
                absPos.x + me.width / 2,
                absPos.y + me.height / 2,
                Handle.TYPES.CROSS,
                me
            ).draw(canvas);
        }
    }
}
