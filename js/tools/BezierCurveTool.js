import Tool from './Tool.js';
import BezierCurve from '../shapes/BezierCurve.js';

/**
 * Description:
 *  Tool to interactively draw cubic Bezier curves. The user places up to four points:
 *  start, control1, control2, end. Points are placed with left-clicks and the tool
 *  supports live preview while moving the mouse. Pressing Escape cancels the current curve.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance (from Tool).
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager (from Tool).
 *  - currentCurve {BezierCurve|null} : The curve being drawn (temporary until completed).
 *  - points {Array<{x:number,y:number}>} : Ordered points placed by the user.
 *  - clickCount {number} : Number of clicks placed for the current curve.
 *  - isDrawing {boolean} : Whether a curve drawing operation is in progress.
 *  - boundKeyDown {Function|null} : Bound keydown handler for ESC cancelation.
 *
 * Typical usage:
 *   const tool = new BezierCurveTool(canvasInstance, drawingManager);
 *   tool.activate();
 *
 * Notes / Additional:
 *  - The tool uses the BezierCurve shape which expects properties: x1,y1,cx1,cy1,cx2,cy2,x2,y2.
 *  - The tool keeps the current curve in a temporary state until 4 points are placed.
 *
 */
export default class BezierCurveTool extends Tool {
    /**
     * Internal currentCurve backing field.
     *
     * @type {BezierCurve|null}
     * @private
     */
    _currentCurve = null;

    /**
     * Internal points backing field.
     *
     * @type {Array<{x:number,y:number}>}
     * @private
     */
    _points = [];

    /**
     * Internal clickCount backing field.
     *
     * @type {number}
     * @private
     */
    _clickCount = 0;

    /**
     * Internal isDrawing backing field.
     *
     * @type {boolean}
     * @private
     */
    _isDrawing = false;

    /**
     * Internal boundKeyDown backing field.
     *
     * @type {Function|null}
     * @private
     */
    _boundKeyDown = null;

    /**
     * Creates an instance of BezierCurveTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me._currentCurve = null;
        me._points = [];
        me._clickCount = 0;
        me._isDrawing = false;
        me._boundKeyDown = me._onKeyDownInternal.bind(me);
    }

    /**
     * currentCurve getter.
     *
     * @returns {BezierCurve|null} The curve currently being drawn or null.
     */
    get currentCurve() {
        return this._currentCurve;
    }

    /**
     * currentCurve setter.
     *
     * @param {BezierCurve|null} value - New current curve or null.
     * @returns {void}
     */
    set currentCurve(value) {
        const me = this;
        if (value !== null && !(value instanceof BezierCurve)) {
            console.warn(
                `[BezierCurveTool] invalid currentCurve assignment (${value}). Keeping previous value: ${me._currentCurve}`
            );
            return;
        }
        me._currentCurve = value;
    }

    /**
     * points getter.
     *
     * @returns {Array<{x:number,y:number}>} The array of placed points.
     */
    get points() {
        return this._points;
    }

    /**
     * points setter (replaces entire points array).
     *
     * @param {Array<{x:number,y:number}>} value - New points array.
     * @returns {void}
     */
    set points(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[BezierCurveTool] invalid points assignment (${value}). Keeping previous value.`
            );
            return;
        }
        const ok = value.every(p => p && typeof p.x === 'number' && typeof p.y === 'number');
        if (!ok) {
            console.warn(
                `[BezierCurveTool] invalid points elements (${JSON.stringify(value)}). Keeping previous value.`
            );
            return;
        }
        me._points = value;
    }

    /**
     * clickCount getter.
     *
     * @returns {number} Number of clicks placed for current curve.
     */
    get clickCount() {
        return this._clickCount;
    }

    /**
     * clickCount setter with numeric coercion.
     *
     * @param {number} value - New clickCount value.
     * @returns {void}
     */
    set clickCount(value) {
        const me = this;
        const n = Number(value);
        if (Number.isNaN(n) || n < 0) {
            console.warn(
                `[BezierCurveTool] invalid clickCount assignment (${value}). Keeping previous value: ${me._clickCount}`
            );
            return;
        }
        me._clickCount = Math.floor(n);
    }

    /**
     * isDrawing getter.
     *
     * @returns {boolean} True if currently drawing.
     */
    get isDrawing() {
        return this._isDrawing;
    }

    /**
     * isDrawing setter.
     *
     * @param {boolean} value - New drawing flag.
     * @returns {void}
     */
    set isDrawing(value) {
        this._isDrawing = Boolean(value);
    }

    /**
     * Activate the tool.
     *
     * Registers keyboard listener for ESC cancellation and resets any prior state.
     *
     * @returns {void}
     */
    activate() {
        const me = this;
        me.reset();
        if (typeof document !== 'undefined' && me._boundKeyDown) {
            document.addEventListener('keydown', me._boundKeyDown);
        }
    }

    /**
     * Deactivate the tool.
     *
     * Removes keyboard listener and resets tool state.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.reset();
        if (typeof document !== 'undefined' && me._boundKeyDown) {
            document.removeEventListener('keydown', me._boundKeyDown);
        }
    }

    /**
     * Reset internal drawing state and remove temporary curve from drawing manager if present.
     *
     * @returns {void}
     */
    reset() {
        const me = this;
        if (me._currentCurve && me._isDrawing) {
            try {
                me.drawingManager.removeElement(me._currentCurve);
            } catch (err) {
                // ignore if not present
            }
        }
        me._currentCurve = null;
        me._points = [];
        me._clickCount = 0;
        me._isDrawing = false;
        if (me.canvas && typeof me.canvas.requestRender === 'function') {
            me.canvas.requestRender();
        }
    }

    /**
     * Internal keydown handler bound to the instance.
     *
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {void}
     * @private
     */
    _onKeyDownInternal(event) {
        const me = this;
        if (event && event.key === 'Escape' && me._isDrawing) {
            me.reset();
        }
    }

    /**
     * Handle mouse down event.
     *
     * Left click places points (start, control1, control2, end). When four points exist
     * the curve is finalized. Right-click (button === 2) cancels the current curve.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const { x, y } = me.getMouseCoords(event);

        if (!me.isDrawing) {
            // Primeiro clique: ponto inicial
            me.points.push({ x, y });
            me.currentCurve = new BezierCurve(x, y, x, y, x, y, x, y); // Inicializa com todos os pontos iguais
            me.drawingManager.addElement(me.currentCurve);
            me.isDrawing = true;
            me.clickCount++;
        } else {
            // Adiciona pontos de controle ou ponto final
            me.points.push({ x, y });
            me.clickCount++;

            // Atualiza a curva com os novos pontos
            me._updateCurvePoints();

            // Se tivermos 4 pontos (start, cp1, cp2, end), a curva está completa
            if (me.clickCount >= 4) {
                me.currentCurve.isTemporary = false; // Marca como não temporário
                me.currentCurve = null;
                me.points = [];
                me.clickCount = 0;
                me.isDrawing = false;
            }
        }
        me.canvas.requestRender();
    }

    /**
     * Handle mouse move event.
     *
     * Updates the preview point depending on how many points were placed.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawing || !me.currentCurve) return;

        const { x, y } = me.getMouseCoords(event);

        // Atualiza o ponto que está sendo desenhado
        if (me.clickCount === 1) {
            // Ponto de controle 1 e ponto final (para visualização)
            me.currentCurve.control1X = x;
            me.currentCurve.control1Y = y;
            me.currentCurve.control2X = x; // Temporariamente
            me.currentCurve.control2Y = y; // Temporariamente
            me.currentCurve.endX = x;
            me.currentCurve.endY = y;
        } else if (me.clickCount === 2) {
            // Ponto de controle 2 e ponto final (para visualização)
            me.currentCurve.control2X = x;
            me.currentCurve.control2Y = y;
            me.currentCurve.endX = x;
            me.currentCurve.endY = y;
        } else if (me.clickCount === 3) {
            // Ponto final
            me.currentCurve.endX = x;
            me.currentCurve.endY = y;
        }
        me.canvas.requestRender();
    }

    /**
     * Handle mouse up event.
     *
     * No-op: placing points occurs on mouse down; this method exists for completeness.
     *
     * @param {MouseEvent} _event - The mouse event.
     * @returns {void}
     */
    onMouseUp(_event) {
        // intentional no-op
    }

    /**
     * Update the internal BezierCurve shape with available points.
     *
     * Accepts 2..4 points and maps them to BezierCurve fields with reasonable defaults.
     *
     * @returns {void}
     * @private
     */
    _updateCurvePoints() {
        const me = this;
        if (!me._currentCurve) return;

        const pts = me._points;
        if (pts.length >= 4) {
            me._currentCurve.x1 = Number(pts[0].x) || 0;
            me._currentCurve.y1 = Number(pts[0].y) || 0;
            me._currentCurve.cx1 = Number(pts[1].x) || 0;
            me._currentCurve.cy1 = Number(pts[1].y) || 0;
            me._currentCurve.cx2 = Number(pts[2].x) || 0;
            me._currentCurve.cy2 = Number(pts[2].y) || 0;
            me._currentCurve.x2 = Number(pts[3].x) || 0;
            me._currentCurve.y2 = Number(pts[3].y) || 0;
            return;
        }

        if (pts.length === 3) {
            me._currentCurve.x1 = Number(pts[0].x) || 0;
            me._currentCurve.y1 = Number(pts[0].y) || 0;
            me._currentCurve.cx1 = Number(pts[1].x) || 0;
            me._currentCurve.cy1 = Number(pts[1].y) || 0;
            me._currentCurve.cx2 = Number(pts[2].x) || 0;
            me._currentCurve.cy2 = Number(pts[2].y) || 0;
            // use control2 as end for preview
            me._currentCurve.x2 = Number(pts[2].x) || 0;
            me._currentCurve.y2 = Number(pts[2].y) || 0;
            return;
        }

        if (pts.length === 2) {
            me._currentCurve.x1 = Number(pts[0].x) || 0;
            me._currentCurve.y1 = Number(pts[0].y) || 0;
            me._currentCurve.cx1 = Number(pts[1].x) || 0;
            me._currentCurve.cy1 = Number(pts[1].y) || 0;
            // mirror control1 to control2 and end for preview
            me._currentCurve.cx2 = Number(pts[1].x) || 0;
            me._currentCurve.cy2 = Number(pts[1].y) || 0;
            me._currentCurve.x2 = Number(pts[1].x) || 0;
            me._currentCurve.y2 = Number(pts[1].y) || 0;
        }
    }
}
