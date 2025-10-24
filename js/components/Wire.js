import Shape from '../shapes/Shape.js';
import Terminal from './Terminal.js';
import Handle from './Handle.js';

/**
 * Description:
 *  Represents an electrical wire in the circuit drawing application.
 *  A Wire is composed of an optional start terminal, an optional end terminal,
 *  and zero or more intermediate nodes (path points). It supports drawing,
 *  hit-testing, moving (for free wires), editing of visual properties and
 *  serialization. Terminal references can be resolved after deserialization
 *  using resolveTerminals(mapping).
 *
 * Properties summary:
 *  - uniqueId {string} (inherited) : read-only identifier.
 *  - startTerminal {Terminal|null} : terminal at the start of the wire (optional).
 *  - endTerminal {Terminal|null} : terminal at the end of the wire (optional).
 *  - path {Array<{x:number,y:number}>} : intermediate points (editable nodes).
 *  - color {string} : CSS stroke color of the wire.
 *  - lineWidth {number} : thickness of the wire in pixels.
 *  - lineDash {Array<number>} : dash pattern for stroke.
 *  - isTemporary {boolean} : whether the wire is temporary (being drawn).
 *
 * Typical usage:
 *   const wire = new Wire(terminalA, terminalB);
 *   wire.addPoint(50, 40);
 *   drawingManager.addElement(wire);
 *
 * Notes:
 *  - Path points are stored in order; getAllPoints(canvas) composes terminals and path.
 *  - Wires connected to terminals follow terminal/component movement; only free wires move when move() is called.
 *  - After loading from JSON, call wire.resolveTerminals(mapping) where mapping is { id: Terminal } to reconnect by id.
 *
 * @class Wire
 */
export default class Wire extends Shape {
    /**
     * Internal start terminal backing field.
     *
     * @type {Terminal|null}
     * @private
     */
    _startTerminal = null;

    /**
     * Internal end terminal backing field.
     *
     * @type {Terminal|null}
     * @private
     */
    _endTerminal = null;

    /**
     * Internal path points backing field.
     *
     * @type {Array<{x:number,y:number}>}
     * @private
     */
    _path = [];

    /**
     * Internal color backing field.
     *
     * @type {string}
     * @private
     */
    _color = '#000000';

    /**
     * Internal line width backing field.
     *
     * @type {number}
     * @private
     */
    _lineWidth = 2;

    /**
     * Internal line dash backing field.
     *
     * @type {Array<number>}
     * @private
     */
    _lineDash = [];

    /**
     * Internal isTemporary backing field.
     *
     * @type {boolean}
     * @private
     */
    _isTemporary = false;

    /**
     * Creates an instance of Wire.
     *
     * @param {Terminal|null} startTerminal - The starting terminal or null.
     * @param {Terminal|null} endTerminal - The ending terminal or null.
     */
    constructor(startTerminal = null, endTerminal = null) {
        super(0, 0);
        const me = this;
        me.startTerminal = startTerminal;
        me.endTerminal = endTerminal;
        me._path = [];
        me.color = '#000000';
        me.lineWidth = 2;
        me.lineDash = [];
        me.isTemporary = false;
    }

    /**
     * startTerminal getter.
     *
     * @returns {Terminal|null} Start terminal reference.
     */
    get startTerminal() {
        return this._startTerminal;
    }

    /**
     * startTerminal setter.
     *
     * @param {Terminal|null} value - Start terminal or null.
     * @returns {void}
     */
    set startTerminal(value) {
        const me = this;
        if (value !== null && !(value instanceof Terminal)) {
            console.warn(
                `[Wire] invalid startTerminal assignment (${value}). Keeping previous value: ${me._startTerminal}`
            );
            return;
        }
        me._startTerminal = value;
    }

    /**
     * endTerminal getter.
     *
     * @returns {Terminal|null} End terminal reference.
     */
    get endTerminal() {
        return this._endTerminal;
    }

    /**
     * endTerminal setter.
     *
     * @param {Terminal|null} value - End terminal or null.
     * @returns {void}
     */
    set endTerminal(value) {
        const me = this;
        if (value !== null && !(value instanceof Terminal)) {
            console.warn(
                `[Wire] invalid endTerminal assignment (${value}). Keeping previous value: ${me._endTerminal}`
            );
            return;
        }
        me._endTerminal = value;
    }

    /**
     * path getter.
     *
     * @returns {Array<{x:number,y:number}>} Array of intermediate path points.
     */
    get path() {
        return this._path;
    }

    /**
     * path setter (replaces entire path).
     *
     * @param {Array<{x:number,y:number}>} value - New path array.
     * @returns {void}
     */
    set path(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(`[Wire] invalid path assignment (${value}). Keeping previous value.`);
            return;
        }
        const ok = value.every(
            point => point && typeof point.x === 'number' && typeof point.y === 'number'
        );
        if (!ok) {
            console.warn(`[Wire] invalid path points provided. Keeping previous value.`);
            return;
        }
        me._path = value;
    }

    /**
     * color getter.
     *
     * @returns {string} Stroke color.
     */
    get color() {
        return this._color;
    }

    /**
     * color setter with basic validation.
     *
     * @param {string} value - New color string.
     * @returns {void}
     */
    set color(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[Wire] invalid color assignment (${value}). Color must be a string. Keeping previous value: ${me._color}`
            );
            return;
        }
        me._color = value;
    }

    /**
     * lineWidth getter.
     *
     * @returns {number} Line thickness in pixels.
     */
    get lineWidth() {
        return this._lineWidth;
    }

    /**
     * lineWidth setter with validation.
     *
     * @param {number} value - New line width in pixels.
     * @returns {void}
     */
    set lineWidth(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue) || numberValue < 0) {
            console.warn(
                `[Wire] invalid lineWidth assignment (${value}). Keeping previous value: ${me._lineWidth}`
            );
            return;
        }
        me._lineWidth = numberValue;
    }

    /**
     * lineDash getter.
     *
     * @returns {Array<number>} Dash pattern.
     */
    get lineDash() {
        return this._lineDash;
    }

    /**
     * lineDash setter with validation.
     *
     * @param {Array<number>} value - New dash pattern array.
     * @returns {void}
     */
    set lineDash(value) {
        const me = this;
        if (!Array.isArray(value) || !value.every(n => typeof n === 'number')) {
            console.warn(
                `[Wire] invalid lineDash assignment (${value}). Keeping previous value: ${JSON.stringify(
                    me._lineDash
                )}`
            );
            return;
        }
        me._lineDash = value;
    }

    /**
     * isTemporary getter.
     *
     * @returns {boolean} True if wire is temporary.
     */
    get isTemporary() {
        return this._isTemporary;
    }

    /**
     * isTemporary setter.
     *
     * @param {boolean} value - New temporary flag.
     * @returns {void}
     */
    set isTemporary(value) {
        const me = this;
        me._isTemporary = Boolean(value);
    }

    /**
     * Add an intermediate point (node) to the wire's path.
     *
     * @param {number} coordinateX - X coordinate of the point.
     * @param {number} coordinateY - Y coordinate of the point.
     * @returns {void}
     */
    addPoint(coordinateX, coordinateY) {
        const me = this;
        me._path.push({ x: Number(coordinateX) || 0, y: Number(coordinateY) || 0 });
    }

    /**
     * Remove an intermediate point at index.
     *
     * @param {number} index - Index of the point to remove.
     * @returns {void}
     */
    removePoint(index) {
        const me = this;
        if (typeof index !== 'number' || index < 0 || index >= me._path.length) return;
        me._path.splice(index, 1);
    }

    /**
     * Returns all points composing the wire: startTerminal (if any), intermediate path points, endTerminal (if any).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {Array<{x:number,y:number}>} Array of points in world coordinates.
     */
    getAllPoints(canvas) {
        const me = this;
        const allPoints = [];
        if (me.startTerminal) {
            allPoints.push(me.startTerminal.getAbsolutePosition(canvas));
        }
        allPoints.push(
            ...me._path.map(point => ({ x: Number(point.x) || 0, y: Number(point.y) || 0 }))
        );
        if (me.endTerminal) {
            allPoints.push(me.endTerminal.getAbsolutePosition(canvas));
        }
        return allPoints;
    }

    /**
     * Draws the wire on the canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        const allPoints = me.getAllPoints(canvas);
        if (allPoints.length < 2) return;

        canvas
            .setStrokeColor(me.color)
            .setStrokeWidth(me.lineWidth)
            .setStrokeDash(me.lineDash)
            .setStrokeCap('round')
            .setStrokeJoin('round')
            .beginPath()
            .moveTo(allPoints[0].x, allPoints[0].y);

        for (let pointIndex = 1; pointIndex < allPoints.length; pointIndex++) {
            const point = allPoints[pointIndex];
            canvas.lineTo(point.x, point.y);
        }

        // The canvas manager saves state; we restore here per project convention.
        canvas.stroke().restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: checks whether the provided coordinates are within clickable distance of any segment.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} coordinateX - X coordinate to test.
     * @param {number} coordinateY - Y coordinate to test.
     * @returns {boolean} True if the coordinates hit the wire.
     */
    isHit(canvas, coordinateX, coordinateY) {
        const me = this;
        const allPoints = me.getAllPoints(canvas);
        if (allPoints.length < 2) return false;

        const hitTolerance = (Number(me.lineWidth) || 0) / 2 + me.hitMargin;

        for (let segmentIndex = 0; segmentIndex < allPoints.length - 1; segmentIndex++) {
            const p1 = allPoints[segmentIndex];
            const p2 = allPoints[segmentIndex + 1];

            const deltaX = p2.x - p1.x;
            const deltaY = p2.y - p1.y;
            const segmentLengthSquared = deltaX * deltaX + deltaY * deltaY;
            if (segmentLengthSquared === 0) {
                const distSq = (coordinateX - p1.x) ** 2 + (coordinateY - p1.y) ** 2;
                if (distSq <= hitTolerance * hitTolerance) return true;
                continue;
            }

            const t =
                ((coordinateX - p1.x) * deltaX + (coordinateY - p1.y) * deltaY) /
                segmentLengthSquared;

            let closestX;
            let closestY;
            if (t <= 0) {
                closestX = p1.x;
                closestY = p1.y;
            } else if (t >= 1) {
                closestX = p2.x;
                closestY = p2.y;
            } else {
                closestX = p1.x + t * deltaX;
                closestY = p1.y + t * deltaY;
            }

            const distSq = (coordinateX - closestX) ** 2 + (coordinateY - closestY) ** 2;
            if (distSq <= hitTolerance * hitTolerance) return true;
        }

        return false;
    }

    /**
     * Moves the wire by the given deltas. Only affects free wires (no terminal connections).
     *
     * @param {number} deltaX - Horizontal displacement.
     * @param {number} deltaY - Vertical displacement.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        const me = this;
        if (me.startTerminal || me.endTerminal) return;

        const dx = Number(deltaX) || 0;
        const dy = Number(deltaY) || 0;
        me._path.forEach(point => {
            point.x = Number(point.x) + dx;
            point.y = Number(point.y) + dy;
        });
    }

    /**
     * Edit mutable properties of the wire via setters.
     *
     * Supported properties: color, lineWidth, lineDash, isTemporary, path
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void}
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = ['color', 'lineWidth', 'lineDash', 'isTemporary', 'path'];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draws selection handles for intermediate nodes and highlights terminal connections.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        const me = this;

        me._path.forEach(point => {
            new Handle(point.x, point.y, Handle.TYPES.DOT, me).draw(canvas);
        });

        if (me.startTerminal) {
            const position = me.startTerminal.getAbsolutePosition(canvas);
            new Handle(position.x, position.y, Handle.TYPES.SQUARE, me).draw(canvas);
        }
        if (me.endTerminal) {
            const position = me.endTerminal.getAbsolutePosition(canvas);
            new Handle(position.x, position.y, Handle.TYPES.SQUARE, me).draw(canvas);
        }
    }

    /**
     * Return a serializable representation of the wire.
     *
     * @returns {Object} JSON-serializable object representing the wire.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign({}, base, {
            startTerminalId: me.startTerminal ? me.startTerminal.id || null : null,
            endTerminalId: me.endTerminal ? me.endTerminal.id || null : null,
            path: me._path.map(point => ({ x: point.x, y: point.y })),
            color: me.color,
            lineWidth: me.lineWidth,
            lineDash: Array.isArray(me.lineDash) ? me.lineDash.slice() : []
        });
    }

    /**
     * Recreate a Wire from JSON produced by toJSON().
     *
     * Note: terminals are restored by ID externally or by calling code; this method
     * accepts startTerminal and endTerminal references optionally.
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @param {Terminal|null} [startTerminal=null] - Optional resolved start terminal instance.
     * @param {Terminal|null} [endTerminal=null] - Optional resolved end terminal instance.
     * @returns {Wire} New Wire instance.
     */
    static fromJSON(json, startTerminal = null, endTerminal = null) {
        if (!json || typeof json !== 'object') {
            throw new TypeError('Invalid JSON for Wire.fromJSON');
        }
        const instance = new Wire(startTerminal, endTerminal);

        let pathArray = [];
        if (Array.isArray(json.path)) {
            pathArray = json.path.map(p => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
        }

        instance.edit({
            path: pathArray,
            color: json.color,
            lineWidth: json.lineWidth,
            lineDash: json.lineDash
        });

        if (json.id) instance.uniqueId = json.id;
        // Keep startTerminalId/endTerminalId in JSON for external resolution if needed.
        return instance;
    }

    /**
     * Resolve terminal references using a mapping of ids to Terminal instances.
     *
     * The mapping may be an Object `{ id: Terminal }` or a Map.
     * If a terminal id is not found in the mapping, the corresponding terminal remains null.
     *
     * @param {Object<string, Terminal>|Map<string, Terminal>} mapping - Id -> Terminal mapping.
     * @param {string|null} [startId=null] - Optional start terminal id to resolve (if omitted, attempts to use startTerminal.id).
     * @param {string|null} [endId=null] - Optional end terminal id to resolve (if omitted, attempts to use endTerminal.id).
     * @returns {{resolvedStart:boolean,resolvedEnd:boolean}} Object indicating which terminals were resolved.
     */
    resolveTerminals(mapping, startId = null, endId = null) {
        const me = this;
        let resolvedStart = false;
        let resolvedEnd = false;

        const lookup = id => {
            if (id === null || id === undefined) return null;
            if (mapping instanceof Map) {
                const found = mapping.get(id);
                return found || null;
            }
            if (Object.prototype.hasOwnProperty.call(mapping, id)) {
                return mapping[id];
            }
            return null;
        };

        let candidateStartId = null;
        if (startId !== null && startId !== undefined) {
            candidateStartId = startId;
        } else if (me.startTerminal && me.startTerminal.id) {
            candidateStartId = me.startTerminal.id;
        }

        let candidateEndId = null;
        if (endId !== null && endId !== undefined) {
            candidateEndId = endId;
        } else if (me.endTerminal && me.endTerminal.id) {
            candidateEndId = me.endTerminal.id;
        }

        if (candidateStartId !== null) {
            const resolvedStartTerminal = lookup(candidateStartId);
            if (resolvedStartTerminal instanceof Terminal) {
                me.startTerminal = resolvedStartTerminal;
                resolvedStart = true;
            }
        }

        if (candidateEndId !== null) {
            const resolvedEndTerminal = lookup(candidateEndId);
            if (resolvedEndTerminal instanceof Terminal) {
                me.endTerminal = resolvedEndTerminal;
                resolvedEnd = true;
            }
        }

        return { resolvedStart, resolvedEnd };
    }
}
