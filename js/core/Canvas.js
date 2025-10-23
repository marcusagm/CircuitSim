/**
 * Canvas wrapper
 *
 * Provides an abstraction over the HTML Canvas 2D context.
 * Keeps responsibility for all drawing centralized here so other classes
 * do not access the raw context directly.
 */
export default class Canvas {
    /**
     * The HTML canvas element.
     * @type {HTMLCanvasElement}
     */
    _element = null;

    /**
     * The 2D rendering context of the canvas.
     * @type {CanvasRenderingContext2D}
     */
    _context = null;

    /**
     * The width of the canvas in CSS pixels.
     * @type {number}
     */
    _width = 100;

    /**
     * The height of the canvas in CSS pixels.
     * @type {number}
     */
    _height = 100;

    /**
     * The device pixel ratio, used for high-DPI displays.
     * @type {number}
     */
    _pixelRatio = 1;

    /**
     * Flag indicating whether antialiasing is enabled.
     * @type {boolean}
     */
    _antialiasing = false;

    /**
     * Image smoothing quality for the canvas
     * @type {QUALITY}
     */
    _imageSmoothingQuality = 'high';

    /**
     * Flag indicating if a re-render is needed.
     * @type {boolean}
     */
    needsRender = false;

    /**
     * Flag indicating if a render is currently in progress.
     * @type {boolean}
     */
    isRendering = false;

    /**
     * ID of active animation frame
     * @type {number}
     */
    animationFrameId = null;

    /**
     * Timestamp of the last render
     * @type {DOMHighResTimeStamp}
     */
    lastRenderTimestamp = 0;

    /**
     *
     */
    scene = null;

    /**
     * Array of callbacks to execute before render the canvas.
     * @type {Function[]}
     */
    beforeRenderCallbacks = [];

    /**
     * Array of callbacks to execute after render the canvas.
     * @type {Function[]}
     */
    afterRenderCallbacks = [];

    /**
     * Image smoothing quality for the canvas
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
     * @param {number} width - The initial width of the canvas.
     * @param {number} height - The initial height of the canvas.
     * @param {number} [pixelRatio=null] - The device pixel ratio.
     * @param {boolean} [antialiasing=false] - Whether to enable antialiasing. Defaults to false.
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
     * @returns {CanvasRenderingContext2D} The 2D rendering context.
     */
    get context() {
        return this._context;
    }

    /**
     * Returns the HTML canvas element
     *
     * @return {HTMLCanvasElement} HTML canvas element
     */
    get element() {
        return this._element;
    }

    /**
     * Get the width of the canvas
     *
     * @returns {number}
     */
    get width() {
        return this._width;
    }

    /**
     * Sets the width of the canvas.
     *
     * @param {number} value - The new width.
     * @returns {Canvas} The current Canvas instance.
     */
    set width(value) {
        const me = this;

        me._width = value;
        me._setupCanvas();
    }

    /**
     * Get the height of the canvas
     *
     * @returns {number}
     */
    get height() {
        return this._height;
    }

    /**
     * Sets the height of the canvas.
     *
     * @param {number} value - The new height.
     * @returns {Canvas} The current Canvas instance.
     */
    set height(value) {
        const me = this;

        me._height = value;
        me._setupCanvas();
    }

    /**
     * Get the pixel ratio value
     *
     * @returns {number}
     */
    get pixelRatio() {
        return this._pixelRatio;
    }

    /**
     * Sets the pixel ratio
     *
     * @param {number} value
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

        // Fix blurry lines in canvas renderin
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
     * Requests a re-render of the canvas. Uses requestAnimationFrame for efficiency.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    requestRender() {
        const me = this;

        me.needsRender = true;
        me.startRender();
        return me;
    }

    startRender() {
        const me = this;

        if (me.isRendering) return me;

        me.isRendering = true;
        me.animationFrameId = requestAnimationFrame(me.render);
        // me.animationFrameId = requestAnimationFrame(me.frame.bind(me));
        return me;
    }

    stopRender() {
        const me = this;

        me.isRendering = false;
        if (me.animationFrameId !== null) {
            cancelAnimationFrame(me.animationFrameId);
            me.animationFrameId = null;
        }
        return me;
    }

    frame(timestamp) {
        const me = this;
        // const delayFromLastTimestamp = timestamp - me.lastRenderTimestamp;

        me.lastTimestamp = timestamp;
        if (me.needsRender) {
            me.render();
        }
        // if (me.scene && me.scene.updateIfNeeded(delayFromLastTimestamp)) {
        //     me.render();
        // }
        if (me.isRendering) {
            me.animationFrameId = requestAnimationFrame(me.frame.bind(me));
        }

        return me;
    }

    /**
     * The main draw method that clears the canvas and executes drawing callbacks.
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
     * Executes callbacks registered to run before clearing the canvas.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    beforeRender() {
        const me = this;
        me.beforeRenderCallbacks.forEach(callback => callback());
        return me;
    }

    /**
     * Executes callbacks registered to run after clearing the canvas.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    afterRender() {
        const me = this;
        me.afterRenderCallbacks.forEach(callback => callback());
        return me;
    }

    /**
     * Adds a callback function to be executed before the canvas is rendered.
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
     * Adds a callback function to be executed after the canvas is rendered.
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
     * Remove references and listeners if applicable
     *
     * @returns {void}
     */
    dispose() {
        const me = this;
        // remove DOM references (if appended)
        if (me._element && me._element.parentNode) {
            me._element.parentNode.removeChild(me._element);
        }
        me._context = null;
        me._element = null;
    }

    /**
     * Reset transform and apply correct scaling once
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
     * Enables or disables antialiasing for the canvas context.
     *
     * @param {boolean} enabled - True to enable, false to disable.
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
     * @param {QUALITY} quality - The quality setting (e.g., 'low', 'medium', 'high').
     * @returns {Canvas} The current Canvas instance.
     */
    setQuality(quality) {
        const me = this;

        if (Object.values(Canvas.QUALITY).includes(quality.toLowerCase()) === false) {
            throw new Error("The value: '" + quality + "'is invalid.");
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
     * Begins a new path by emptying the list of sub-paths.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    beginPath() {
        const me = this;
        me.context.beginPath();
        return me;
    }

    /**
     * Closes the current path by connecting the last point to the first point.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    closePath() {
        const me = this;
        me.context.closePath();
        return me;
    }

    /**
     * Sets the line width for strokes.
     *
     * @param {number} width - The line width in pixels.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeWidth(width) {
        const me = this;
        me.context.lineWidth = width;
        return me;
    }

    /**
     * Sets the style of the line endings.
     *
     * @param {CanvasLineCap} capType - The line cap style ('butt', 'round', 'square').
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeCap(capType) {
        const me = this;
        me.context.lineCap = capType;
        return me;
    }

    /**
     * Sets the line dash pattern for strokes.
     *
     * @param {number[]} segments - An array of numbers that specifies distances to alternately draw a line and a gap.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeDash(offset) {
        const me = this;
        me.context.setLineDash(offset);
        return me;
    }

    /**
     * Sets the line dash offset for strokes.
     *
     * @param {number} offset - The offset for the line dash pattern.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeDashOffset(offset) {
        const me = this;
        me.context.lineDashOffset = offset;
        return me;
    }

    /**
     * Sets the style of the line corners.
     *
     * @param {CanvasLineJoin} joinType - The line join style ('bevel', 'round', 'miter').
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeJoin(joinType) {
        const me = this;
        me.context.lineJoin = joinType;
        return me;
    }

    /**
     * Sets the color or style to use for strokes.
     *
     * @param {string|CanvasGradient|CanvasPattern} color - The color or style.
     * @returns {Canvas} The current Canvas instance.
     */
    setStrokeColor(color) {
        const me = this;
        me.context.strokeStyle = color;
        return me;
    }

    /**
     * Sets the maximum miter length for miter joins.
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
     * Sets the color or style to use for fills.
     *
     * @param {string|CanvasGradient|CanvasPattern} color - The color or style.
     * @returns {Canvas} The current Canvas instance.
     */
    setFillColor(color) {
        const me = this;
        me.context.fillStyle = color;
        return me;
    }

    /**
     * Sets the global composite operation type.
     *
     * @param {GlobalCompositeOperation} type - The composite operation type.
     * @returns {Canvas} The current Canvas instance.
     */
    setCompositionType(type) {
        const me = this;
        me.context.globalCompositeOperation = type;
        return me;
    }

    /**
     * Sets the filter property for the canvas context.
     *
     * @param {string} filter - The filter string (e.g., 'blur(5px)').
     * @returns {Canvas} The current Canvas instance.
     */
    setFilter(filter) {
        const me = this;
        me.context.filter = filter;
        return me;
    }

    /**
     * Sets the text direction for the canvas context.
     *
     * @param {CanvasDirection} direction - The text direction ('ltr', 'rtl', 'inherit').
     * @returns {Canvas} The current Canvas instance.
     */
    setDirection(direction) {
        const me = this;
        me.context.direction = direction;
        return me;
    }

    /**
     * Sets the font property for the canvas context.
     *
     * @param {string} font - The font string (e.g., '10px sans-serif').
     * @returns {Canvas} The current Canvas instance.
     */
    setFont(font) {
        const me = this;
        me.context.font = font;
        return me;
    }

    /**
     * Sets the text alignment for the canvas context.
     *
     * @param {CanvasTextAlign} align - The text alignment ('start', 'end', 'left', 'right', 'center').
     * @returns {Canvas} The current Canvas instance.
     */
    setTextAlign(align) {
        const me = this;
        me.context.textAlign = align;
        return me;
    }

    /**
     * Sets the text baseline for the canvas context.
     *
     * @param {CanvasTextBaseline} baseline - The text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom').
     * @returns {Canvas} The current Canvas instance.
     */
    setTextBaseline(baseline) {
        const me = this;
        me.context.textBaseline = baseline;
        return me;
    }

    /**
     * Sets the text rendering hint for the canvas context.
     *
     * @param {string} textRendering - The text rendering hint.
     * @returns {Canvas} The current Canvas instance.
     */
    setTextRendering(textRendering) {
        const me = this;
        me.context.textRendering = textRendering;
        return me;
    }

    /**
     * Sets the word spacing for the canvas context.
     *
     * @param {string} wordSpacing - The word spacing value.
     * @returns {Canvas} The current Canvas instance.
     */
    setWordSpacing(wordSpacing) {
        const me = this;
        me.context.wordSpacing = wordSpacing;
        return me;
    }

    /**
     * Sets the global alpha (transparency) value for the canvas context.
     *
     * @param {number} alpha - The alpha value (0.0 to 1.0).
     * @returns {Canvas} The current Canvas instance.
     */
    setGlobalAlpha(alpha) {
        const me = this;
        me.context.globalAlpha = alpha;
        return me;
    }

    /**
     * Sets shadow properties for the canvas context.
     *
     * @param {number} blur - The blur level.
     * @param {string} color - The shadow color.
     * @param {number} offsetX - The horizontal offset.
     * @param {number} offsetY - The vertical offset.
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
     * Clears a rectangular area of the canvas.
     *
     * @param {number} x - The X coordinate of the top-left corner.
     * @param {number} y - The Y coordinate of the top-left corner.
     * @param {number} width - The width of the rectangle to clear.
     * @param {number} height - The height of the rectangle to clear.
     * @returns {Canvas} The current Canvas instance.
     */
    clear(x, y, width, height) {
        const me = this;
        me.context.clearRect(x, y, width, height);
        return me;
    }

    /**
     * Clears the entire canvas.
     *
     * @returns {Canvas} The current Canvas instance.
     */
    clearAll() {
        const me = this;
        me.clear(0, 0, me.element.width, me.element.height);
        return me;
    }

    /**
     * Returns an ImageData object representing the underlying pixel data of the
     * area of the canvas denoted by the rectangle whose corners are (sx, sy)
     * and (sx+sw, sy+sh).
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
     * @param {CanvasImageSource} image - The image to draw.
     * @param {number} x - The X coordinate of the destination rectangle.
     * @param {number} y - The Y coordinate of the destination rectangle.
     * @param {number} width - The width of the destination rectangle.
     * @param {number} height - The height of the destination rectangle.
     * @returns {Canvas} The current Canvas instance.
     */
    drawImage(image, x, y, width, height) {
        const me = this;
        me.context.drawImage(image, x, y, width, height);
        return me;
    }

    /**
     * Draws a line between two points.
     *
     * @param {number} x1 - The X coordinate of the first point.
     * @param {number} y1 - The Y coordinate of the first point.
     * @param {number} x2 - The X coordinate of the second point.
     * @param {number} y2 - The Y coordinate of the second point.
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
     * Moves the starting point of a new sub-path to the specified coordinates.
     *
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @returns {Canvas} The current Canvas instance.
     */
    moveTo(x, y) {
        const me = this;
        me.context.moveTo(Math.round(x), Math.round(y));
        return me;
    }

    /**
     * Adds a straight line to the current sub-path by connecting the sub-path's
     * last point to the specified coordinates.
     *
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     * @returns {Canvas} The current Canvas instance.
     */
    lineTo(x, y) {
        const me = this;
        me.context.lineTo(Math.round(x), Math.round(y));
        return me;
    }

    /**
     * createLinearGradient function.
     *
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @returns
     */
    createLinearGradient(x0, y0, x1, y1) {
        return this.context.createLinearGradient(x0, y0, x1, y1);
    }

    /**
     *
     * @param {CanvasImageSource} image
     * @param {string} repetition
     * @returns
     */
    createPattern(image, repetition = null) {
        return this.context.createPattern(image, repetition);
    }

    /**
     *
     * @param {number} x0
     * @param {number} y0
     * @param {number} r0
     * @param {number} x1
     * @param {number} y1
     * @param {number} r1
     * @returns
     */
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }

    /**
     * Draws a circle.
     *
     * @param {number} x - The X coordinate of the center of the circle.
     * @param {number} y - The Y coordinate of the center of the circle.
     * @param {number} radius - The radius of the circle.
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
     * Draws an ellipse.
     *
     * @param {number} x1 - The X coordinate of the top-left corner of the bounding box.
     * @param {number} y1 - The Y coordinate of the top-left corner of the bounding box.
     * @param {number} x2 - The X coordinate of the bottom-right corner of the bounding box.
     * @param {number} y2 - The Y coordinate of the bottom-right corner of the bounding box.
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
     * Draws a rectangle.
     *
     * @param {number} x - The X coordinate of the top-left corner of the rectangle.
     * @param {number} y - The Y coordinate of the top-left corner of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
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
     * Draws a polygon.
     *
     * @param {number} centerX - The X coordinate of the center of the polygon.
     * @param {number} centerY - The Y coordinate of the center of the polygon.
     * @param {number} radius - The radius of the polygon.
     * @param {number} sides - The number of sides of the polygon.
     * @param {number} angle - The rotation angle of the polygon in radians.
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
     * Draw a Star.
     *
     * @param {int} centerX Point X of the center of the star
     * @param {int} centerY Point Y of the center of the star
     * @param {int} points The number of points on the exterior of the star
     * @param {float} radiusOuter The radius of the inner points of the star
     * @param {float} radiusInner The radius of the outer points of the star
     * @param {float} angle The angle of the star
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
     *
     * @param {*} anchor1x
     * @param {*} anchor1y
     * @param {*} anchor2x
     * @param {*} anchor2y
     * @param {*} anchor3x
     * @param {*} anchor3y
     * @param {*} anchor4x
     * @param {*} anchor4y
     * @returns {Canvas} The current Canvas instance.
     */
    bezierCurveTo(anchor1x, anchor1y, anchor2x, anchor2y, anchor3x, anchor3y, anchor4x, anchor4y) {
        const me = this;
        me.context.moveTo(anchor1x, anchor1y);
        me.context.bezierCurveTo(anchor2x, anchor2y, anchor3x, anchor3y, anchor4x, anchor4y);
        return me;
    }

    /**
     *
     * @param {*} anchor1x
     * @param {*} anchor1y
     * @param {*} anchor2x
     * @param {*} anchor2y
     * @param {*} anchor3x
     * @param {*} anchor3y
     * @returns {Canvas} The current Canvas instance.
     */
    quadraticCurveTo(anchor1x, anchor1y, anchor2x, anchor2y, anchor3x, anchor3y) {
        const me = this;
        me.context.moveTo(anchor1x, anchor1y);
        me.context.quadraticCurveTo(anchor2x, anchor2y, anchor3x, anchor3y);
        return me;
    }

    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {Path2D} path
     * @param {CanvasFillRule} fillRule
     * @returns
     */
    isPointInPath(x, y, path = null, fillRule = undefined) {
        if (path) {
            return this._context.isPointInPath(path, x, y, fillRule);
        }
        return this._context.isPointInPath(x, y, fillRule);
    }

    /**
     *
     * @returns {Canvas} The current Canvas instance.
     */
    fill() {
        const me = this;
        me.context.fill();
        return me;
    }

    /**
     * Draw text at logical (CSS) coordinates.
     * The canvas transform already maps logical -> device pixels.
     * @param {string} text
     * @param {number} x logical x (CSS px)
     * @param {number} y logical y (CSS px)
     * @param {object} [maxWidth=undefined] Max width of the text. Defaults to undefined
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
     * Draw text at logical (CSS) coordinates.
     * The canvas transform already maps logical -> device pixels.
     * @param {string} text
     * @param {number} x logical x (CSS px)
     * @param {number} y logical y (CSS px)
     * @param {object} [maxWidth=undefined] Max width of the text. Defaults to undefined
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
     * Measure text width using the provided canvas context. Wrapper so all measurements go through one method.
     *
     * @param {string} text - The text to measure.
     * @returns {number} Width in pixels.
     */
    measureText(text) {
        const me = this;
        const measurement = me.context.measureText(text);
        return measurement || 0;
    }

    /**
     *
     * @returns {Canvas} The current Canvas instance.
     */
    stroke() {
        const me = this;
        me.context.stroke();
        return me;
    }

    /**
     *
     * @param {*} x
     * @param {*} y
     * @returns {Canvas} The current Canvas instance.
     */
    scale(x, y) {
        const me = this;
        me.context.scale(x, y);
        return me;
    }

    /**
     *
     * @param {*} x
     * @param {*} y
     * @returns {Canvas} The current Canvas instance.
     */
    translate(x, y) {
        const me = this;
        me.context.translate(x, y);
        return me;
    }

    /**
     *
     * @param {*} angle
     * @returns {Canvas} The current Canvas instance.
     */
    rotate(angle) {
        const me = this;
        me.context.rotate(angle);
        return me;
    }
}
