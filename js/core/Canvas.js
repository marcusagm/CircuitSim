/**
 * Description:
 *  Canvas wrapper that provides an abstraction over the HTMLCanvas 2D context.
 *  Centralizes all drawing operations so other classes do not access the raw context directly.
 *
 * Properties summary:
 *  - element {HTMLCanvasElement} : The HTML canvas element.
 *  - context {CanvasRenderingContext2D} : The 2D rendering context of the canvas.
 *  - width {number} : Logical width (CSS pixels) of the canvas.
 *  - height {number} : Logical height (CSS pixels) of the canvas.
 *  - pixelRatio {number} : Device pixel ratio used for high-DPI displays.
 *  - needsRender {boolean} : Flag indicating whether a re-render is needed.
 *  - isRendering {boolean} : Flag indicating if a render is currently in progress.
 *
 * Typical usage:
 *   const canvas = new Canvas({ width: 800, height: 600, pixelRatio: 2 });
 *   document.body.appendChild(canvas.element);
 *   canvas.requestRender();
 *
 * Notes / Additional:
 *  - This class exposes a fluent API for common drawing operations (setStrokeColor, beginPath, lineTo, stroke, etc).
 *  - All drawing state push/pop is done via save()/restore() wrappers.
 */
export default class Canvas {
    /**
     * Internal HTML canvas element backing field.
     *
     * @type {HTMLCanvasElement|null}
     * @private
     */
    _element = null;

    /**
     * Internal 2D rendering context backing field.
     *
     * @type {CanvasRenderingContext2D|null}
     * @private
     */
    _context = null;

    /**
     * Internal width backing field (CSS pixels).
     *
     * @type {number}
     * @private
     */
    _width = 100;

    /**
     * Internal height backing field (CSS pixels).
     *
     * @type {number}
     * @private
     */
    _height = 100;

    /**
     * Internal device pixel ratio backing field.
     *
     * @type {number}
     * @private
     */
    _pixelRatio = 1;

    /**
     * Internal antialiasing flag backing field.
     *
     * @type {boolean}
     * @private
     */
    _antialiasing = false;

    /**
     * Internal image smoothing quality backing field.
     *
     * @type {string}
     * @private
     */
    _imageSmoothingQuality = 'high';

    /**
     * Flag indicating whether a re-render is needed.
     *
     * @type {boolean}
     */
    needsRender = false;

    /**
     * Flag indicating whether a render loop is active.
     *
     * @type {boolean}
     */
    isRendering = false;

    /**
     * ID of the active animation frame request.
     *
     * @type {number|null}
     */
    animationFrameId = null;

    /**
     * Timestamp of the last render.
     *
     * @type {DOMHighResTimeStamp}
     */
    lastRenderTimestamp = 0;

    /**
     * Optional scene or owner reference (user-managed).
     *
     * @type {*|null}
     */
    scene = null;

    /**
     * Array of callbacks to execute before rendering the canvas.
     *
     * @type {Function[]}
     */
    beforeRenderCallbacks = [];

    /**
     * Array of callbacks to execute after rendering the canvas.
     *
     * @type {Function[]}
     */
    afterRenderCallbacks = [];

    /**
     * Image smoothing quality enum.
     *
     * @static
     * @enum {string}
     */
    static QUALITY = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high'
    };

    /**
     * Creates an instance of Canvas.
     *
     * @param {Object} [options={}] - Options object.
     * @param {number} [options.width=100] - Initial logical width (CSS pixels).
     * @param {number} [options.height=100] - Initial logical height (CSS pixels).
     * @param {number|null} [options.pixelRatio=null] - Device pixel ratio override. If null, window.devicePixelRatio is used.
     * @param {boolean} [options.antialiasing=false] - Whether to enable image smoothing on the context.
     */
    // constructor(width, height, pixelRatio = null, antialiasing = false) {
    constructor(options = {}) {
        const me = this;

        me._width = options.width || me._width;
        me._height = options.height || me._height;
        me._pixelRatio =
            typeof options.pixelRatio === 'number'
                ? options.pixelRatio
                : window.devicePixelRatio || 1;
        me._antialiasing = !!options.antialiasing;

        me._element = document.createElement('canvas');
        me._context = me._element.getContext('2d');

        me._setupCanvas();

        // Bind methods to the instance to ensure `this` context is correct
        me.requestRender = me.requestRender.bind(me);
        me.render = me.render.bind(me);
    }

    /**
     * Returns the 2D rendering context of the canvas.
     *
     * @returns {CanvasRenderingContext2D|null} The 2D rendering context.
     */
    get context() {
        return this._context;
    }

    /**
     * Returns the HTML canvas element.
     *
     * @returns {HTMLCanvasElement|null} The HTML canvas element.
     */
    get element() {
        return this._element;
    }

    /**
     * Returns the logical width (CSS pixels) of the canvas.
     *
     * @returns {number} The canvas width in CSS pixels.
     */
    get width() {
        return this._width;
    }

    /**
     * Sets the logical width (CSS pixels) of the canvas and reconfigures the backing store.
     *
     * @param {number} value - The new width in CSS pixels.
     * @returns {void}
     */
    set width(value) {
        const me = this;

        me._width = value;
        me._setupCanvas();
    }

    /**
     * Returns the logical height (CSS pixels) of the canvas.
     *
     * @returns {number} The canvas height in CSS pixels.
     */
    get height() {
        return this._height;
    }

    /**
     * Sets the logical height (CSS pixels) of the canvas and reconfigures the backing store.
     *
     * @param {number} value - The new height in CSS pixels.
     * @returns {void}
     */
    set height(value) {
        const me = this;

        me._height = value;
        me._setupCanvas();
    }

    /**
     * Returns the device pixel ratio used by this canvas.
     *
     * @returns {number} The device pixel ratio.
     */
    get pixelRatio() {
        return this._pixelRatio;
    }

    /**
     * Sets the device pixel ratio and reconfigures the backing store.
     *
     * @param {number} value - The new device pixel ratio (must be > 0).
     * @returns {void}
     */
    set pixelRatio(value) {
        const me = this;
        if (!value || value <= 0) return;
        me._pixelRatio = value;
        me._setupCanvas();
    }

    /**
     * Sets up the canvas element's dimensions and scaling for high-DPI displays.
     *
     * @private
     * @returns {void}
     */
    _setupCanvas() {
        const me = this;

        // Fix blurry lines in canvas rendering
        const blurryFix = 0.5;

        // Give the canvas pixel dimensions of their CSS
        // size * the device pixel ratio.
        me.element.width = me._width * me._pixelRatio;
        me.element.height = me._height * me._pixelRatio;

        // Set CSS size
        me._element.style.width = `${me._width}px`;
        me._element.style.height = `${me._height}px`;

        // Scale all drawing operations by the device pixel ratio, so you
        // don't have to worry about the difference.
        me.resetTransform();
        // me.scale(me.pixelRatio, me.pixelRatio);

        // Optionally apply subpixel translation for crisp lines (document this)
        // Use only if you know you want it; otherwise remove
        me.translate(blurryFix, blurryFix);
        me.enableAntialiasing(me._antialiasing);
        me.setQuality(me._imageSmoothingQuality);
        me.save();
    }

    /**
     * Requests a re-render of the canvas using requestAnimationFrame for efficiency.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    requestRender() {
        const me = this;

        me.needsRender = true;
        me.startRender();
        return me;
    }

    /**
     * Starts the render loop by requesting an animation frame.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    startRender() {
        const me = this;

        if (me.isRendering) return me;

        me.isRendering = true;
        me.animationFrameId = requestAnimationFrame(me.render);
        return me;
    }

    /**
     * Stops the render loop and cancels any pending animation frame.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    stopRender() {
        const me = this;

        me.isRendering = false;
        if (me.animationFrameId !== null) {
            cancelAnimationFrame(me.animationFrameId);
            me.animationFrameId = null;
        }
        return me;
    }

    /**
     * Frame handler that can be used when driving the loop manually.
     *
     * @param {DOMHighResTimeStamp} timestamp - The current high-resolution timestamp.
     * @returns {Canvas} The current Canvas instance.
     */
    frame(timestamp) {
        const me = this;

        me.lastTimestamp = timestamp;
        if (me.needsRender) {
            me.render();
        }
        if (me.isRendering) {
            me.animationFrameId = requestAnimationFrame(me.frame.bind(me));
        }

        return me;
    }

    /**
     * Main render method: clears the canvas and executes before/after callbacks.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    render() {
        const me = this;

        if (!me.needsRender) {
            me.isRendering = false;
            return me;
        }

        me.needsRender = false;

        me.beforeRender();
        me.clearAll();
        me.afterRender();

        me.isRendering = false;
        return me;
    }

    /**
     * Executes callbacks registered to run before the render cycle.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    beforeRender() {
        const me = this;
        me.beforeRenderCallbacks.forEach(callback => callback());
        return me;
    }

    /**
     * Executes callbacks registered to run after the render cycle.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    afterRender() {
        const me = this;
        me.afterRenderCallbacks.forEach(callback => callback());
        return me;
    }

    /**
     * Adds a callback to be executed before each render.
     *
     * @param {Function} callback - The function to add.
     * @returns {Canvas} The current Canvas instance.
     */
    addBeforeRenderCallback(callback) {
        const me = this;
        if (typeof callback === 'function') {
            me.beforeRenderCallbacks.push(callback);
        }
        return me;
    }

    /**
     * Adds a callback to be executed after each render.
     *
     * @param {Function} callback - The function to add.
     * @returns {Canvas} The current Canvas instance.
     */
    addAfterRenderCallback(callback) {
        const me = this;
        if (typeof callback === 'function') {
            me.afterRenderCallbacks.push(callback);
        }
        return me;
    }

    /**
     * Dispose the canvas wrapper by removing DOM references and clearing context.
     *
     * @returns {void}
     */
    dispose() {
        const me = this;
        // remove DOM references (if appended)
        if (me._element && me._element.parentNode) {
            me._element.parentNode.removeChild(me._element);
        }
        me.beforeRenderCallbacks = [];
        me.afterRenderCallbacks = [];
        me._context = null;
        me._element = null;
    }

    /**
     * Reset transform and apply device pixel ratio scaling.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    resetTransform() {
        const me = this;
        const devicePixelRatio = this._pixelRatio || window.devicePixelRatio || 1;

        if (typeof me.context.resetTransform === 'function') {
            me.context.resetTransform();
        } else {
            me.context.setTransform(1, 0, 0, 1, 0, 0);
        }
        me.context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        return me;
    }

    /**
     * Enables or disables image smoothing (antialiasing) on the context.
     *
     * @param {boolean} enabled - True to enable smoothing, false to disable.
     * @returns {Canvas} The current Canvas instance.
     */
    enableAntialiasing(enabled) {
        const me = this;
        me.context.imageSmoothingEnabled = enabled;
        return me;
    }

    /**
     * Sets the image smoothing quality for the canvas context.
     *
     * @param {string} quality - The quality setting ('low', 'medium', 'high').
     * @returns {Canvas} The current Canvas instance.
     * @throws {Error} When an invalid quality string is provided.
     */
    setQuality(quality) {
        const me = this;

        if (Object.values(Canvas.QUALITY).includes(quality.toLowerCase()) === false) {
            throw new Error("The value: '" + quality + "' is invalid.");
        }

        try {
            me.context.imageSmoothingQuality = quality;
        } catch (error) {
            console.warn("Browser doesn't support imageSmoothingQuality. Error: " + error);
        }

        return me;
    }

    /**
     * Saves the current drawing state of the canvas context.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    save() {
        const me = this;
        me.context.save();
        return me;
    }

    /**
     * Restores the most recently saved drawing state of the canvas context.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    restore() {
        const me = this;
        me.context.setLineDash([]);
        me.context.restore();
        return me;
    }

    /**
     * Fills the current path.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    fill() {
        const me = this;
        me.context.fill();
        return me;
    }

    /**
     * Strokes the current path.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    stroke() {
        const me = this;
        me.context.stroke();
        return me;
    }

    /**
     * Clears a rectangular area of the canvas.
     *
     * @param {number} x - Top-left X coordinate.
     * @param {number} y - Top-left Y coordinate.
     * @param {number} width - Width of the cleared rectangle.
     * @param {number} height - Height of the cleared rectangle.
     * @returns {Canvas} The current Canvas instance.
     */
    clear(x, y, width, height) {
        const me = this;
        me.context.clearRect(x, y, width, height);
        return me;
    }

    /**
     * Clears the entire canvas drawing surface.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    clearAll() {
        const me = this;
        me.clear(0, 0, me.element.width, me.element.height);
        return me;
    }

    /**
     * Begins a new path on the canvas context.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    beginPath() {
        const me = this;
        me.context.beginPath();
        return me;
    }

    /**
     * Closes the current path on the canvas context.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    closePath() {
        const me = this;
        me.context.closePath();
        return me;
    }

    /**
     * Moves the current drawing position to the specified coordinates.
     *
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {Canvas} The current Canvas instance.
     */
    moveTo(x, y) {
        const me = this;
        me.context.moveTo(Math.round(x), Math.round(y));
        return me;
    }

    /**
     * Adds a line from the current position to the specified coordinates.
     *
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {Canvas} The current Canvas instance.
     */
    lineTo(x, y) {
        const me = this;
        me.context.lineTo(Math.round(x), Math.round(y));
        return me;
    }

    /**
     * Draws a straight line between two points.
     *
     * @param {number} x1 - X coordinate of the start point.
     * @param {number} y1 - Y coordinate of the start point.
     * @param {number} x2 - X coordinate of the end point.
     * @param {number} y2 - Y coordinate of the end point.
     * @returns {Canvas} The current Canvas instance.
     */
    line(x1, y1, x2, y2) {
        const me = this;
        me.beginPath();
        me.context.moveTo(Math.round(x1), Math.round(y1));
        me.context.lineTo(Math.round(x2), Math.round(y2));
        me.closePath();
        return me;
    }

    /**
     * Draws a circle path.
     *
     * @param {number} x - Center X.
     * @param {number} y - Center Y.
     * @param {number} radius - Radius of the circle.
     * @returns {Canvas} The current Canvas instance.
     */
    circle(x, y, radius) {
        const me = this;
        me.beginPath();
        me.context.arc(x, y, radius, 0, Math.PI * 2, false);
        me.closePath();
        return me;
    }

    /**
     * Draws an ellipse path.
     *
     * @param {number} x1 - Left/top X of bounding box.
     * @param {number} y1 - Left/top Y of bounding box.
     * @param {number} x2 - Right/bottom X of bounding box.
     * @param {number} y2 - Right/bottom Y of bounding box.
     * @returns {Canvas} The current Canvas instance.
     */
    ellipse(x1, y1, x2, y2) {
        const me = this,
            radiusX = (x2 - x1) / 2,
            radiusY = (y2 - y1) / 2,
            centerX = x1 + radiusX,
            centerY = y1 + radiusY;

        me.beginPath();
        me.context.ellipse(centerX, centerY, radiusX, radiusY, 0, Math.PI * 2, false);
        me.closePath();
        return me;
    }

    /**
     * Draws a rectangle path.
     *
     * @param {number} x - Top-left X.
     * @param {number} y - Top-left Y.
     * @param {number} width - Rectangle width.
     * @param {number} height - Rectangle height.
     * @returns {Canvas} The current Canvas instance.
     */
    rectangle(x, y, width, height) {
        const me = this;

        me.beginPath();
        me.context.rect(x, y, width, height);
        me.closePath();
        return me;
    }

    /**
     * Draws a polygon path.
     *
     * @param {number} centerX - Center X.
     * @param {number} centerY - Center Y.
     * @param {number} radius - Radius.
     * @param {number} sides - Number of sides.
     * @param {number} angle - Initial angle in radians.
     * @returns {Canvas} The current Canvas instance.
     */
    polygon(centerX, centerY, radius, sides, angle) {
        const me = this,
            coordinates = [];

        for (let index = 0; index < sides; index++) {
            coordinates.push({
                x: centerX - radius * Math.cos(angle),
                y: centerY - radius * Math.sin(angle)
            });
            angle += (Math.PI * 2) / sides;
        }

        me.beginPath();
        me.context.moveTo(coordinates[0].x, coordinates[0].y);
        for (let index = 1; index < sides; index++) {
            me.context.lineTo(coordinates[index].x, coordinates[index].y);
        }
        me.closePath();
        return me;
    }

    /**
     * Draws a star-shaped polygon path.
     *
     * @param {number} centerX - Center X.
     * @param {number} centerY - Center Y.
     * @param {number} points - Number of star points.
     * @param {number} radiusOuter - Outer radius.
     * @param {number} radiusInner - Inner radius.
     * @param {number} angle - Starting angle in radians.
     * @returns {Canvas} The current Canvas instance.
     */
    star(centerX, centerY, points, radiusOuter, radiusInner, angle) {
        const me = this,
            coordinates = [],
            totalPoints = 2 * points;

        let radius = radiusOuter;

        for (let index = 0; index < totalPoints + 1; index++) {
            radius = index % 2 === 0 ? radiusOuter : radiusInner;
            coordinates.push({
                x: centerX - radius * Math.cos(angle),
                y: centerY - radius * Math.sin(angle)
            });
            angle += (Math.PI * 2) / points;
        }

        me.beginPath();
        me.context.moveTo(coordinates[0].x, coordinates[0].y);
        for (let index = 1; index < totalPoints; index++) {
            me.context.lineTo(coordinates[index].x, coordinates[index].y);
        }
        me.closePath();
        return me;
    }

    /**
     * Adds a cubic Bezier curve to the current path.
     *
     * @param {number} anchor1x - Start anchor X.
     * @param {number} anchor1y - Start anchor Y.
     * @param {number} anchor2x - First control X.
     * @param {number} anchor2y - First control Y.
     * @param {number} anchor3x - Second control X.
     * @param {number} anchor3y - Second control Y.
     * @param {number} anchor4x - End anchor X.
     * @param {number} anchor4y - End anchor Y.
     * @returns {Canvas} The current Canvas instance.
     */
    bezierCurveTo(anchor1x, anchor1y, anchor2x, anchor2y, anchor3x, anchor3y, anchor4x, anchor4y) {
        const me = this;
        me.context.moveTo(anchor1x, anchor1y);
        me.context.bezierCurveTo(anchor2x, anchor2y, anchor3x, anchor3y, anchor4x, anchor4y);
        return me;
    }

    /**
     * Adds a quadratic curve to the current path.
     *
     * @param {number} anchor1x - Start anchor X.
     * @param {number} anchor1y - Start anchor Y.
     * @param {number} anchor2x - Control point X.
     * @param {number} anchor2y - Control point Y.
     * @param {number} anchor3x - End anchor X.
     * @param {number} anchor3y - End anchor Y.
     * @returns {Canvas} The current Canvas instance.
     */
    quadraticCurveTo(anchor1x, anchor1y, anchor2x, anchor2y, anchor3x, anchor3y) {
        const me = this;
        me.context.moveTo(anchor1x, anchor1y);
        me.context.quadraticCurveTo(anchor2x, anchor2y, anchor3x, anchor3y);
        return me;
    }

    /**
     * Tests whether a point is in the current path or provided Path2D.
     *
     * @param {number} x - X coordinate to test.
     * @param {number} y - Y coordinate to test.
     * @param {Path2D|null} path - Optional Path2D to test against.
     * @param {CanvasFillRule|undefined} fillRule - Optional fill rule.
     * @returns {boolean} True if the point is inside the path.
     */
    isPointInPath(x, y, path = null, fillRule = undefined) {
        if (path) {
            return this._context.isPointInPath(path, x, y, fillRule);
        }
        return this._context.isPointInPath(x, y, fillRule);
    }

    /**
     * Sets the line width for strokes.
     *
     * @param {number} width - The stroke width in pixels.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeWidth(width) {
        const me = this;
        me.context.lineWidth = width;
        return me;
    }

    /**
     * Sets the line cap style.
     *
     * @param {CanvasLineCap} capType - The line cap style ('butt','round','square').
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeCap(capType) {
        const me = this;
        me.context.lineCap = capType;
        return me;
    }

    /**
     * Sets the line join style.
     *
     * @param {CanvasLineJoin} joinType - The join style ('bevel','round','miter').
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeJoin(joinType) {
        const me = this;
        me.context.lineJoin = joinType;
        return me;
    }

    /**
     * Sets the line dash pattern for strokes.
     *
     * @param {number[]} offset - Array of dash/gap lengths.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeDash(offset) {
        const me = this;
        me.context.setLineDash(offset);
        return me;
    }

    /**
     * Sets the dash offset for the current dash pattern.
     *
     * @param {number} offset - The dash offset.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeDashOffset(offset) {
        const me = this;
        me.context.lineDashOffset = offset;
        return me;
    }

    /**
     * Sets the stroke style.
     *
     * @param {string|CanvasGradient|CanvasPattern} color - Stroke style value.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeColor(color) {
        const me = this;
        me.context.strokeStyle = color;
        return me;
    }

    /**
     * Sets the miter limit for miter joins.
     *
     * @param {number} limit - The miter limit.
     * @returns {Canvas} The current Canvas instance.
     */
    setMiterLimit(limit) {
        const me = this;
        me.context.miterLimit = limit;
        return me;
    }

    /**
     * Sets the fill style.
     *
     * @param {string|CanvasGradient|CanvasPattern} color - Fill style value.
     * @returns {Canvas} The current Canvas instance.
     */
    setFillColor(color) {
        const me = this;
        me.context.fillStyle = color;
        return me;
    }

    /**
     * Sets the global composite operation.
     *
     * @param {GlobalCompositeOperation} type - Composite operation name.
     * @returns {Canvas} The current Canvas instance.
     */
    setCompositionType(type) {
        const me = this;
        me.context.globalCompositeOperation = type;
        return me;
    }

    /**
     * Sets the canvas context filter string.
     *
     * @param {string} filter - CSS filter string (e.g., 'blur(2px)').
     * @returns {Canvas} The current Canvas instance.
     */
    setFilter(filter) {
        const me = this;
        me.context.filter = filter;
        return me;
    }

    /**
     * Sets shadow properties for subsequent drawing operations.
     *
     * @param {number} blur - Shadow blur radius.
     * @param {string} color - Shadow color.
     * @param {number} offsetX - Horizontal offset.
     * @param {number} offsetY - Vertical offset.
     * @returns {Canvas} The current Canvas instance.
     */
    setShadow(blur, color, offsetX = 0, offsetY = 0) {
        this.context.shadowBlur = blur;
        this.context.shadowColor = color;
        this.context.shadowOffsetX = offsetX;
        this.context.shadowOffsetY = offsetY;
        return this;
    }

    /**
     * Sets the font for text drawing.
     *
     * @param {string} font - CSS font string (e.g., '12px sans-serif').
     * @returns {Canvas} The current Canvas instance.
     */
    setFont(font) {
        const me = this;
        me.context.font = font;
        return me;
    }

    /**
     * Sets the text direction for the context.
     *
     * @param {CanvasDirection} direction - Text direction ('ltr','rtl','inherit').
     * @returns {Canvas} The current Canvas instance.
     */
    setDirection(direction) {
        const me = this;
        me.context.direction = direction;
        return me;
    }

    /**
     * Sets the text alignment for the context.
     *
     * @param {CanvasTextAlign} align - Text alignment value.
     * @returns {Canvas} The current Canvas instance.
     */
    setTextAlign(align) {
        const me = this;
        me.context.textAlign = align;
        return me;
    }

    /**
     * Sets the text baseline for the context.
     *
     * @param {CanvasTextBaseline} baseline - Text baseline value.
     * @returns {Canvas} The current Canvas instance.
     */
    setTextBaseline(baseline) {
        const me = this;
        me.context.textBaseline = baseline;
        return me;
    }

    /**
     * Sets text rendering hint (non-standard property in some browsers).
     *
     * @param {string} textRendering - Rendering hint value.
     * @returns {Canvas} The current Canvas instance.
     */
    setTextRendering(textRendering) {
        const me = this;
        me.context.textRendering = textRendering;
        return me;
    }

    /**
     * Sets word spacing (non-standard; may be ignored by browsers).
     *
     * @param {string} wordSpacing - Word spacing value.
     * @returns {Canvas} The current Canvas instance.
     */
    setWordSpacing(wordSpacing) {
        const me = this;
        me.context.wordSpacing = wordSpacing;
        return me;
    }

    /**
     * Measures text using the canvas context.
     *
     * @param {string} text - Text to measure.
     * @returns {TextMetrics|number} A TextMetrics object or 0 on failure.
     */
    measureText(text) {
        const me = this;
        const measurement = me.context.measureText(text);
        return measurement || 0;
    }

    /**
     * Draws filled text at logical (CSS) coordinates.
     *
     * @param {string} text - Text to draw.
     * @param {number} x - Logical X coordinate (CSS px).
     * @param {number} y - Logical Y coordinate (CSS px).
     * @param {number|undefined} [maxWidth=undefined] - Optional max width.
     * @returns {Canvas} The current Canvas instance.
     */
    fillText(text, x, y, maxWidth = undefined) {
        const me = this;
        if (maxWidth) {
            me._context.fillText(text, x, y, maxWidth);
        } else {
            me._context.fillText(text, x, y);
        }
        return me;
    }

    /**
     * Draws stroked text at logical (CSS) coordinates.
     *
     * @param {string} text - Text to draw.
     * @param {number} x - Logical X coordinate (CSS px).
     * @param {number} y - Logical Y coordinate (CSS px).
     * @param {number|undefined} [maxWidth=undefined] - Optional max width.
     * @returns {Canvas} The current Canvas instance.
     */
    strokeText(text, x, y, maxWidth = undefined) {
        const me = this;
        if (maxWidth) {
            me._context.strokeText(text, x, y, maxWidth);
        } else {
            me._context.strokeText(text, x, y);
        }
        return me;
    }

    /**
     * Applies scaling to the current transform.
     *
     * @param {number} x - Scale factor in X.
     * @param {number} y - Scale factor in Y.
     * @returns {Canvas} The current Canvas instance.
     */
    scale(x, y) {
        const me = this;
        me.context.scale(x, y);
        return me;
    }

    /**
     * Applies translation to the current transform.
     *
     * @param {number} x - Translation in X.
     * @param {number} y - Translation in Y.
     * @returns {Canvas} The current Canvas instance.
     */
    translate(x, y) {
        const me = this;
        me.context.translate(x, y);
        return me;
    }

    /**
     * Rotates the current transform.
     *
     * @param {number} angle - Rotation angle in radians.
     * @returns {Canvas} The current Canvas instance.
     */
    rotate(angle) {
        const me = this;
        me.context.rotate(angle);
        return me;
    }

    /**
     * Creates a linear gradient object.
     *
     * @param {number} x0 - Start X.
     * @param {number} y0 - Start Y.
     * @param {number} x1 - End X.
     * @param {number} y1 - End Y.
     * @returns {CanvasGradient} The created linear gradient.
     */
    createLinearGradient(x0, y0, x1, y1) {
        return this.context.createLinearGradient(x0, y0, x1, y1);
    }

    /**
     * Creates a pattern from an image source.
     *
     * @param {CanvasImageSource} image - Image source.
     * @param {string|null} repetition - Repetition option (e.g., 'repeat', 'repeat-x').
     * @returns {CanvasPattern|null} The created pattern or null.
     */
    createPattern(image, repetition = null) {
        return this.context.createPattern(image, repetition);
    }

    /**
     * Creates a radial gradient.
     *
     * @param {number} x0 - Inner circle X.
     * @param {number} y0 - Inner circle Y.
     * @param {number} r0 - Inner radius.
     * @param {number} x1 - Outer circle X.
     * @param {number} y1 - Outer circle Y.
     * @param {number} r1 - Outer radius.
     * @returns {CanvasGradient} The created radial gradient.
     */
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }

    /**
     * Returns an ImageData object for the entire canvas backing store.
     *
     * @returns {ImageData} The ImageData object.
     */
    getImageData() {
        const me = this;
        return me.context.getImageData(0, 0, me.element.width, me.element.height);
    }

    /**
     * Draws an image onto the canvas.
     *
     * @param {CanvasImageSource} image - Source image.
     * @param {number} x - Destination X coordinate.
     * @param {number} y - Destination Y coordinate.
     * @param {number} width - Destination width.
     * @param {number} height - Destination height.
     * @returns {Canvas} The current Canvas instance.
     */
    drawImage(image, x, y, width, height) {
        const me = this;
        me.context.drawImage(image, x, y, width, height);
        return me;
    }
}
