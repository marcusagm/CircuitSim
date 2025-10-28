import Tool from './Tool.js';
import Wire from '../components/Wire.js';

/**
 * Description:
 *  Tool that allows the user to draw electrical wires on the canvas. It supports:
 *   - Connecting wires to component terminals.
 *   - Free-floating wires with intermediate bend points.
 *   - Snapping to the drawing grid and creating orthogonal or 45° segments.
 *
 * Properties summary:
 *  - currentWire {Wire|null} : Wire instance currently being drawn (temporary while drawing).
 *  - startTerminal {Object|null} : Terminal where the wire started, if any.
 *  - lastPoint {{x:number,y:number}|null} : Last registered point of the current drawing path.
 *  - isDrawingWire {boolean} : Flag indicating whether a wire drawing operation is active.
 *
 * Typical usage:
 *   const wireTool = new WireTool(canvas, drawingManager);
 *   toolManager.addTool('wire', wireTool);
 *
 * Notes / Additional:
 *  - Only one temporary wire exists while the user draws.
 *  - Temporary wire is removed if drawing is cancelled (Escape).
 *  - Positions are snapped to drawingManager.grid.gridCellSize.
 */
export default class WireTool extends Tool {
    /**
     * Internal currentWire backing field.
     *
     * @type {Wire|null}
     * @private
     */
    _currentWire = null;

    /**
     * Internal startTerminal backing field.
     *
     * @type {Object|null}
     * @private
     */
    _startTerminal = null;

    /**
     * Internal lastPoint backing field.
     *
     * @type {{x:number,y:number}|null}
     * @private
     */
    _lastPoint = null;

    /**
     * Internal isDrawingWire backing field.
     *
     * @type {boolean}
     * @private
     */
    _isDrawingWire = false;

    /**
     * Creates an instance of WireTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me.currentWire = null;
        me.startTerminal = null;
        me.lastPoint = null;
        me.isDrawingWire = false;
    }

    /**
     * currentWire getter.
     *
     * @returns {Wire|null} Wire currently being drawn or null.
     */
    get currentWire() {
        return this._currentWire;
    }

    /**
     * currentWire setter with validation.
     *
     * @param {Wire|null} value - Wire instance or null.
     * @returns {void}
     */
    set currentWire(value) {
        const me = this;
        if (value !== null && !(value instanceof Wire)) {
            console.warn(
                `[WireTool] invalid currentWire assignment (${value}). Keeping previous value: ${me._currentWire}`
            );
            return;
        }
        me._currentWire = value;
    }

    /**
     * startTerminal getter.
     *
     * @returns {Object|null} Start terminal instance or null.
     */
    get startTerminal() {
        return this._startTerminal;
    }

    /**
     * startTerminal setter.
     *
     * @param {Object|null} value - Terminal-like object or null.
     * @returns {void}
     */
    set startTerminal(value) {
        const me = this;
        if (value !== null && typeof value !== 'object') {
            console.warn(
                `[WireTool] invalid startTerminal assignment (${value}). Keeping previous value: ${JSON.stringify(
                    me._startTerminal
                )}`
            );
            return;
        }
        me._startTerminal = value;
    }

    /**
     * lastPoint getter.
     *
     * @returns {{x:number,y:number}|null} Last point or null.
     */
    get lastPoint() {
        return this._lastPoint;
    }

    /**
     * lastPoint setter with validation.
     *
     * @param {{x:number,y:number}|null} value - Object with numeric x and y or null.
     * @returns {void}
     */
    set lastPoint(value) {
        const me = this;
        if (value !== null) {
            if (
                typeof value !== 'object' ||
                Number.isNaN(Number(value.x)) ||
                Number.isNaN(Number(value.y))
            ) {
                console.warn(
                    `[WireTool] invalid lastPoint assignment (${JSON.stringify(
                        value
                    )}). Keeping previous value: ${JSON.stringify(me._lastPoint)}`
                );
                return;
            }
            me._lastPoint = { x: Number(value.x), y: Number(value.y) };
            return;
        }
        me._lastPoint = null;
    }

    /**
     * isDrawingWire getter.
     *
     * @returns {boolean} True if a drawing operation is active.
     */
    get isDrawingWire() {
        return this._isDrawingWire;
    }

    /**
     * isDrawingWire setter.
     *
     * @param {boolean} value - New flag value.
     * @returns {void}
     */
    set isDrawingWire(value) {
        this._isDrawingWire = Boolean(value);
    }

    /**
     * Activates the tool and prepares it for drawing.
     *
     * @returns {void}
     */
    activate() {
        const me = this;
        me.resetToolState();
    }

    /**
     * Deactivates the tool and clears any active state.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.resetToolState();
    }

    /**
     * Resets internal state, removing any temporary wire and clearing flags.
     *
     * @returns {void}
     */
    resetToolState() {
        const me = this;
        if (me.currentWire && me.currentWire.isTemporary) {
            me.drawingManager.removeElement(me.currentWire);
        }
        me.currentWire = null;
        me.startTerminal = null;
        me.lastPoint = null;
        me.isDrawingWire = false;
        me.canvas.requestRender();
    }

    /**
     * Handle mouse down: start or continue drawing the wire. Snaps to grid and connects to terminals.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const { x: coordinateX, y: coordinateY } = me.getMouseCoords(event);

        const cellSize =
            me.drawingManager && me.drawingManager.grid && me.drawingManager.grid.gridCellSize
                ? Number(me.drawingManager.grid.gridCellSize) || 1
                : 1;

        const snappedX = Math.round(coordinateX / cellSize) * cellSize;
        const snappedY = Math.round(coordinateY / cellSize) * cellSize;
        const snappedPoint = { x: snappedX, y: snappedY };

        let clickedTerminal = null;

        // Detect clicked terminal by iterating components' terminals
        for (const element of me.drawingManager.elements) {
            if (element.terminals) {
                for (const terminal of element.terminals) {
                    if (terminal.isHit(me.canvas, coordinateX, coordinateY)) {
                        clickedTerminal = terminal;
                        break;
                    }
                }
            }
            if (clickedTerminal) break;
        }

        if (!me.isDrawingWire) {
            // Start a new wire
            if (clickedTerminal) {
                me.startTerminal = clickedTerminal;
                me.currentWire = new Wire(me.startTerminal);
                me.currentWire.isTemporary = true;
                me.drawingManager.addElement(me.currentWire);
                // Register wire with terminal
                if (typeof me.startTerminal.addWire === 'function') {
                    me.startTerminal.addWire(me.currentWire);
                }
                me.lastPoint = me.startTerminal.getAbsolutePosition
                    ? me.startTerminal.getAbsolutePosition(me.canvas)
                    : null;
                me.isDrawingWire = true;
            } else {
                // Start free-floating wire
                me.currentWire = new Wire();
                me.currentWire.isTemporary = true;
                me.currentWire.addPoint(snappedPoint.x, snappedPoint.y);
                me.drawingManager.addElement(me.currentWire);
                me.lastPoint = snappedPoint;
                me.isDrawingWire = true;
            }
        } else {
            // Continue existing wire
            if (clickedTerminal && clickedTerminal !== me.startTerminal) {
                // Connect to clicked terminal
                me.currentWire.endTerminal = clickedTerminal;
                if (typeof clickedTerminal.addWire === 'function') {
                    clickedTerminal.addWire(me.currentWire);
                }
                me.currentWire.isTemporary = false;
                // finalize & reset state
                me.resetToolState();
            } else {
                // Add bend point
                me.currentWire.addPoint(snappedPoint.x, snappedPoint.y);
                me.lastPoint = snappedPoint;
            }
        }

        me.canvas.requestRender();
    }

    /**
     * Handle mouse move: update the temporary last segment so it stays orthogonal or 45° to the reference point.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(event) {
        const me = this;
        if (!me.isDrawingWire || !me.currentWire) return;

        const { x: coordinateX, y: coordinateY } = me.getMouseCoords(event);

        const cellSize =
            me.drawingManager && me.drawingManager.grid && me.drawingManager.grid.gridCellSize
                ? Number(me.drawingManager.grid.gridCellSize) || 1
                : 1;

        const snappedX = Math.round(coordinateX / cellSize) * cellSize;
        const snappedY = Math.round(coordinateY / cellSize) * cellSize;
        const currentSnappedPoint = { x: snappedX, y: snappedY };

        // Determine reference point for orthogonal/45° calculation
        let referencePoint = null;
        if (me.currentWire.path.length > 0) {
            referencePoint = me.currentWire.path[me.currentWire.path.length - 1];
        } else if (me.startTerminal && typeof me.startTerminal.getAbsolutePosition === 'function') {
            referencePoint = me.startTerminal.getAbsolutePosition(me.canvas);
        } else {
            referencePoint = me.lastPoint || { x: 0, y: 0 };
        }

        let finalX = currentSnappedPoint.x;
        let finalY = currentSnappedPoint.y;

        const deltaX = Math.abs(currentSnappedPoint.x - referencePoint.x);
        const deltaY = Math.abs(currentSnappedPoint.y - referencePoint.y);

        // Force orthogonal or 45°
        if (deltaX === deltaY) {
            // 45° — keep both coordinates
            finalX = currentSnappedPoint.x;
            finalY = currentSnappedPoint.y;
        } else if (deltaX > deltaY) {
            // horizontal — snap Y to reference
            finalY = referencePoint.y;
        } else {
            // vertical — snap X to reference
            finalX = referencePoint.x;
        }

        // Update or append the last point of the path
        if (me.currentWire.path.length === 0) {
            me.currentWire.path.push({ x: finalX, y: finalY });
        } else {
            me.currentWire.path[me.currentWire.path.length - 1] = { x: finalX, y: finalY };
        }

        me.canvas.requestRender();
    }

    /**
     * Handle mouse up. No-op for this tool (finalization handled on mouse down or ESC).
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(event) {
        // Intentionally empty
    }

    /**
     * Handle key down: cancel drawing on Escape.
     *
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {void}
     */
    onKeyDown(event) {
        const me = this;
        if (event.key === 'Escape' && me.isDrawingWire) {
            if (me.currentWire) {
                me.drawingManager.removeElement(me.currentWire);
            }
            me.resetToolState();
        }
    }
}
