import Canvas from './Canvas.js';

/**
 * Description:
 *  Represents a configurable grid overlay for a Canvas wrapper used by WireToucan.
 *
 * Properties summary:
 *  - canvas {import('./Canvas.js').default} : Canvas wrapper instance used to draw the grid.
 *  - gridCellSize {number} : Size in pixels of each square cell in the grid.
 *  - gridLineColor {string} : CSS color used to draw the grid lines.
 *  - strokeWidth {number} : Width of the grid lines.
 *  - strokeCap {CanvasLineCap} : Line cap style ('butt', 'round', or 'square').
 *  - strokeDash {number[]} : Dash pattern for grid lines.
 *  - visible {boolean} : Visibility flag to enable or disable rendering.
 *
 * Typical usage:
 *   const grid = new Grid(canvasWrapper, 20);
 *   grid.gridLineColor = '#aaffaa';
 *   grid.visible = true;
 *   grid.draw();
 *
 * Notes / Additional:
 *  - Requires a valid Canvas wrapper (not a raw <canvas> element).
 *  - Follows fluent API design used throughout the WireToucan codebase.
 */
export default class Grid {
    /**
     * Internal canvas backing field.
     *
     * @type {Canvas|null}
     * @private
     */
    _canvas = null;

    /**
     * Internal grid cell size backing field.
     *
     * @type {number}
     * @private
     */
    _gridCellSize = 20;

    /**
     * Internal grid line color backing field.
     *
     * @type {string}
     * @private
     */
    _strokeColor = '#666666ff';

    /**
     * Internal stroke width backing field.
     *
     * @type {number}
     * @private
     */
    _strokeWidth = 0.5;

    /**
     * Internal stroke cap backing field.
     *
     * @type {CanvasLineCap}
     * @private
     */
    _strokeCap = 'round';

    /**
     * Internal stroke dash pattern backing field.
     *
     * @type {number[]}
     * @private
     */
    _strokeDash = [2, 2];

    /**
     * Internal visibility flag.
     *
     * @type {boolean}
     * @private
     */
    _visible = true;

    /**
     * Creates an instance of Grid.
     *
     * @param {import('./Canvas.js').default} canvas - Canvas wrapper instance (required).
     * @param {number} gridCellSize - Size (in pixels) of each grid cell.
     * @param {object} [options={}] - Optional configuration object.
     * @param {string} [options.strokeColor='#666666ff'] - Grid line color.
     * @param {number} [options.strokeWidth=0.5] - Line width for the grid.
     * @param {CanvasLineCap} [options.strokeCap='round'] - Line cap style.
     * @param {number[]} [options.strokeDash=[2,2]] - Dash pattern array.
     * @param {boolean} [options.visible=true] - Whether the grid is visible initially.
     */
    constructor(canvas, gridCellSize, options = {}) {
        const me = this;

        me.canvas = canvas;
        me.gridCellSize = gridCellSize;

        const validValues = ['strokeColor', 'strokeWidth', 'strokeCap', 'strokeDash', 'visible'];
        validValues.forEach(key => {
            if (key in options) {
                me[key] = options[key];
            }
        });
    }

    /**
     * canvas getter.
     *
     * @returns {import('./Canvas.js').default|null} The Canvas wrapper instance.
     */
    get canvas() {
        return this._canvas;
    }

    /**
     * canvas setter with validation.
     *
     * @param {import('./Canvas.js').default} value - Canvas wrapper instance.
     * @returns {void}
     */
    set canvas(value) {
        const prev = this._canvas;
        if (!(value instanceof Canvas)) {
            console.warn(
                `[Grid] invalid canvas assignment (${value}). Canvas must be instance of Canvas. Keeping previous value: ${prev}`
            );
            return;
        }
        this._canvas = value;
    }

    /**
     * gridCellSize getter.
     *
     * @returns {number} Grid cell size in pixels.
     */
    get gridCellSize() {
        return this._gridCellSize;
    }

    /**
     * gridCellSize setter with validation.
     *
     * @param {number} value - New grid cell size in pixels (must be positive).
     * @returns {void}
     */
    set gridCellSize(value) {
        const prev = this._gridCellSize;
        const num = Number(value);
        if (Number.isNaN(num) || num <= 0) {
            console.warn(
                `[Grid] invalid gridCellSize assignment (${value}). Must be positive number. Keeping previous value: ${prev}`
            );
            return;
        }
        this._gridCellSize = Math.floor(num);
    }

    /**
     * gridLineColor getter.
     *
     * @returns {string} CSS color string for grid lines.
     */
    get strokeColor() {
        return this._strokeColor;
    }

    /**
     * gridLineColor setter with validation.
     *
     * @param {string} value - CSS color string.
     * @returns {void}
     */
    set strokeColor(value) {
        const prev = this._strokeColor;
        if (typeof value !== 'string') {
            console.warn(
                `[Grid] invalid strokeColor assignment (${value}). Must be string. Keeping previous value: ${prev}`
            );
            return;
        }
        this._strokeColor = value;
    }

    /**
     * strokeWidth getter.
     *
     * @returns {number} Stroke width in pixels.
     */
    get strokeWidth() {
        return this._strokeWidth;
    }

    /**
     * strokeWidth setter with validation.
     *
     * @param {number} value - Positive number.
     * @returns {void}
     */
    set strokeWidth(value) {
        const prev = this._strokeWidth;
        const num = Number(value);
        if (Number.isNaN(num) || num <= 0) {
            console.warn(
                `[Grid] invalid strokeWidth assignment (${value}). Must be positive number. Keeping previous value: ${prev}`
            );
            return;
        }
        this._strokeWidth = num;
    }

    /**
     * strokeCap getter.
     *
     * @returns {CanvasLineCap} Line cap style.
     */
    get strokeCap() {
        return this._strokeCap;
    }

    /**
     * strokeCap setter with validation.
     *
     * @param {CanvasLineCap} value - Must be one of: 'butt', 'round', or 'square'.
     * @returns {void}
     */
    set strokeCap(value) {
        const prev = this._strokeCap;
        if (!['butt', 'round', 'square'].includes(value)) {
            console.warn(
                `[Grid] invalid strokeCap assignment (${value}). Must be 'butt', 'round' or 'square'. Keeping previous value: ${prev}`
            );
            return;
        }
        this._strokeCap = value;
    }

    /**
     * strokeDash getter.
     *
     * @returns {number[]} Dash pattern array.
     */
    get strokeDash() {
        return this._strokeDash;
    }

    /**
     * strokeDash setter with validation.
     *
     * @param {number[]} value - Array of non-negative numbers.
     * @returns {void}
     */
    set strokeDash(value) {
        const prev = this._strokeDash;
        if (!Array.isArray(value) || value.some(v => typeof v !== 'number' || v < 0)) {
            console.warn(
                `[Grid] invalid strokeDash assignment (${value}). Must be array of non-negative numbers. Keeping previous value: ${prev}`
            );
            return;
        }
        this._strokeDash = value;
    }

    /**
     * visible getter.
     *
     * @returns {boolean} True if grid is visible.
     */
    get visible() {
        return this._visible;
    }

    /**
     * visible setter.
     *
     * @param {boolean} value - True to render grid, false to hide it.
     * @returns {void}
     */
    set visible(value) {
        const prev = this._visible;
        if (typeof value !== 'boolean') {
            console.warn(
                `[Grid] invalid visible assignment (${value}). Must be boolean. Keeping previous value: ${prev}`
            );
            return;
        }
        this._visible = value;
    }

    /**
     * Draws the grid overlay on the canvas if visible.
     *
     * This method draws vertical and horizontal grid lines spaced according to gridCellSize.
     *
     * @returns {void}
     */
    draw() {
        const me = this;
        if (!me._visible) return;
        if (!me.canvas) {
            console.warn('[Grid] cannot draw: canvas not set.');
            return;
        }

        const canvasWidth = Number(me.canvas.width) || 0;
        const canvasHeight = Number(me.canvas.height) || 0;
        const cell = Number(me.gridCellSize) || 1;
        if (canvasWidth <= 0 || canvasHeight <= 0) return;

        me.canvas
            .setStrokeColor(me.strokeColor)
            .setStrokeWidth(me.strokeWidth)
            .setStrokeCap(me.strokeCap)
            .setStrokeDash(me.strokeDash)
            .beginPath();

        for (let x = 0; x <= canvasWidth; x += cell) {
            me.canvas.moveTo(x, 0);
            me.canvas.lineTo(x, canvasHeight);
        }

        for (let y = 0; y <= canvasHeight; y += cell) {
            me.canvas.moveTo(0, y);
            me.canvas.lineTo(canvasWidth, y);
        }

        me.canvas.stroke();
        me.canvas.closePath();
        me.canvas.restore();
        if (typeof me.canvas.requestRender === 'function') me.canvas.requestRender();
    }

    /**
     * Disposes this grid instance, clearing all internal references.
     *
     * @returns {void}
     */
    dispose() {
        this._canvas = null;
        this._gridCellSize = 0;
        this._strokeColor = '';
        this._strokeWidth = 0;
        this._strokeCap = 'butt';
        this._strokeDash = [];
        this._visible = false;
    }
}
