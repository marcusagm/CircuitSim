class Canvas {
    element = null;
    context = null;

    width = 100;
    height = 100;
    pixelRatio = 1;
    antialiasing = false;

    needsRender = false;
    isRendering = false;

    beforeClearCallbacks = [];
    afterClearCallbacks = [];

    constructor(width, height, pixelRatio = 1, antialiasing = false) {
        let me = this;

        me.element = document.createElement("canvas");
        me.context = me.element.getContext("2d");

        me.width = width;
        me.height = height;
        me.pixelRatio = pixelRatio;
        me.antialiasing = antialiasing;

        me.setupCanvas();

        me.requestRender = me.requestRender.bind(me);
        me.render = me.render.bind(me);
    }

    /**
     *
     */
    setupCanvas() {
        let me = this;
        // Give the canvas pixel dimensions of their CSS
        // size * the device pixel ratio.
        me.element.width = me.width * me.pixelRatio;
        me.element.height = me.height * me.pixelRatio;

        // Scale all drawing operations by the dpr, so you
        // don't have to worry about the difference.
        me.scale(me.pixelRatio, me.pixelRatio);
        me.translate(0.5, 0.5);
        me.enableAntialiasing(me.antialiasing);
        me.save();
    }

    set width(value) {
        let me = this;

        me.width = value;
        me.setupCanvas();

        return me;
    }

    set height(value) {
        let me = this;

        me.height = value;
        me.setupCanvas();

        return me;
    }

    requestRender() {
        let me = this;

        me.needsRender = true;
        if (!me.isRendering) {
            me.isRendering = true;
            requestAnimationFrame(me.render);
        }
        return me;
    }

    render() {
        let me = this;

        if (me.needsRender) {
            me.needsRender = false;
            me.draw();
        }
        me.isRendering = false;
        return me;
    }

    draw() {
        let me = this;
        me.beforeClear();
        me.clearAll();
        me.afterClear();
        return me;
    }

    afterClear() {
        let me = this;
        me.afterClearCallbacks.forEach((callback) => callback());
        return me;
    }

    beforeClear() {
        let me = this;
        me.beforeClearCallbacks.forEach((callback) => callback());
        return me;
    }

    addBeforeClearCallback(callback) {
        let me = this;
        if (typeof callback === "function") {
            me.beforeClearCallbacks.push(callback);
        }
        return me;
    }

    addAfterClearCallback(callback) {
        let me = this;
        if (typeof callback === "function") {
            me.afterClearCallbacks.push(callback);
        }
        return me;
    }

    /**
     *
     * @param {boolean} enabled
     */
    enableAntialiasing(enabled) {
        let me = this;
        me.context.imageSmoothingEnabled = enabled;
        return me;
    }

    save() {
        let me = this;
        me.context.save();
        return me;
    }

    restore() {
        let me = this;
        me.context.restore();
        return me;
    }

    beginPath() {
        let me = this;
        me.context.beginPath();
        return me;
    }

    closePath() {
        let me = this;
        me.context.closePath();
        return me;
    }

    /**
     *
     * @param {*} quality
     */
    setQuality(quality) {
        let me = this;
        me.context.imageSmoothingQuality = quality;
        return me;
    }

    /**
     *
     * @param {*} width
     */
    setStrokeWidth(width) {
        let me = this;
        me.context.lineWidth = width;
        return me;
    }

    /**
     *
     * @param {*} capType
     */
    setStrokeCap(capType) {
        let me = this;
        me.context.lineCap = capType;
        return me;
    }

    /**
     *
     * @param {*} offset
     */
    setStrokeDash(offset) {
        let me = this;
        me.context.setLineDash(offset);
        return me;
    }

    setStrokeDashOffset(offset) {
        let me = this;
        me.context.lineDashOffset = offset;
        return me;
    }

    /**
     *
     * @param {*} joinType
     */
    setStrokeJoin(joinType) {
        let me = this;
        me.context.lineJoin = joinType;
        return me;
    }

    /**
     *
     * @param {*} color
     */
    setStrokeColor(color) {
        let me = this;
        me.context.strokeStyle = color;
        return me;
    }

    /**
     *
     * @param {*} limit
     */
    setMiterLimit(limit) {
        let me = this;
        me.context.miterLimit = limit;
        return me;
    }

    /**
     *
     * @param {*} color
     */
    setFillColor(color) {
        let me = this;
        me.context.fillStyle = color;
        return me;
    }

    /**
     *
     * @param {*} type
     */
    setCompositionType(type) {
        let me = this;
        me.context.globalCompositeOperation = type;
        return me;
    }

    /**
     *
     * @param {*} filter
     */
    setFilter(filter) {
        let me = this;
        me.context.filter = filter;
        return me;
    }

    /**
     *
     * @param {*} direction
     */
    setDirection(direction) {
        let me = this;
        me.context.direction = direction;
        return me;
    }

    /**
     *
     * @param {*} font
     */
    setFont(font) {
        let me = this;
        me.context.font = font;
        return me;
    }

    /**
     *
     * @param {*} align
     */
    setTextAlign(align) {
        let me = this;
        me.context.textAlign = align;
        return me;
    }

    /**
     *
     * @param {*} baseline
     */
    setTextBaseline(baseline) {
        let me = this;
        me.context.textBaseline = baseline;
        return me;
    }

    setTextRendering(textRendering) {
        let me = this;
        me.context.textRendering = textRendering;
        return me;
    }

    setWordSpacing(wordSpacing) {
        let me = this;
        me.context.wordSpacing = wordSpacing;
        return me;
    }

    /**
     *
     * @param {*} alpha
     */
    setGlobalAlpha(alpha) {
        let me = this;
        me.context.globalAlpha = alpha;
        return me;
    }

    /**
     *
     * @param {*} blur
     * @param {*} color
     * @param {*} x
     * @param {*} y
     */
    setShadown(blur, color, x, y) {
        let me = this;
        me.context.shadowBlur = blur;
        me.context.shadowColor = color;
        me.context.shadowOffsetX = x;
        me.context.shadowOffsetY = y;
        return me;
    }

    /**
     *
     * @param {*} x
     * @param {*} y
     * @param {*} width
     * @param {*} height
     */
    clear(x, y, width, height) {
        let me = this;
        me.context.clearRect(x, y, width, height);
        return me;
    }

    /**
     *
     */
    clearAll() {
        let me = this;
        me.clear(0, 0, me.element.width, me.element.height);
        return me;
    }

    /**
     *
     */
    getImage() {
        let me = this;
        return me.context.getImageData(
            0,
            0,
            me.element.width,
            me.element.height
        );
    }

    /**
     *
     * @param {*} image
     * @param {*} x
     * @param {*} y
     */
    drawImage(image, x, y, width, height) {
        let me = this;
        me.context.drawImage(image, x, y, width, height);
        return me;
    }

    /**
     *
     * @param {*} x1
     * @param {*} y1
     * @param {*} x2
     * @param {*} y2
     */
    line(x1, y1, x2, y2) {
        let me = this;
        me.beginPath();
        me.context.moveTo(Math.round(x1), Math.round(y1));
        me.context.lineTo(Math.round(x2), Math.round(y2));
        me.closePath();
        return me;
    }

    moveTo(x, y) {
        let me = this;
        me.context.moveTo(Math.round(x), Math.round(y));
        return me;
    }

    lineTo(x, y) {
        let me = this;
        me.context.lineTo(Math.round(x), Math.round(y));
        return me;
    }

    /**
     *
     * @param {*} x
     * @param {*} y
     * @param {*} radius
     */
    circle(x, y, radius) {
        let me = this;
        me.beginPath();
        me.context.arc(x, y, radius, 0, Math.PI * 2, false);
        me.closePath();
        return me;
    }

    /**
     *
     * @param {*} x1
     * @param {*} y1
     * @param {*} x2
     * @param {*} y2
     */
    ellipse(x1, y1, x2, y2) {
        let me = this,
            radiusX = (x2 - x1) * 0.5,
            radiusY = (y2 - y1) * 0.5,
            centerX = x1 + radiusX,
            centerY = y1 + radiusY;

        me.beginPath();
        me.context.ellipse(
            centerX,
            centerY,
            radiusX,
            radiusY,
            0,
            Math.PI * 2,
            false
        );
        me.closePath();
        return me;
    }

    /**
     *
     * @param {*} x
     * @param {*} y
     * @param {*} width
     * @param {*} height
     */
    rectangle(x, y, width, height) {
        let me = this;

        me.beginPath();
        me.context.rect(x, y, width, height);
        me.closePath();
        return me;
    }

    /**
     *
     * @param {*} centerX
     * @param {*} centerY
     * @param {*} radius
     * @param {*} sides
     * @param {*} angle
     */
    polygon(centerX, centerY, radius, sides, angle) {
        let me = this,
            coordinates = [];

        for (let index = 0; index < sides; index++) {
            coordinates.push({
                x: centerX - radius * Math.cos(angle),
                y: centerY - radius * Math.sin(angle),
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
     *
     * @param {int} centerX Point X of the center of the star
     * @param {int} centerY Point Y of the center of the star
     * @param {int} points The number of points on the exterior of the star
     * @param {float} radiusOuter The radius of the inner points of the star
     * @param {float} radiusInner The radius of the outer points of the star
     * @param {float} angle The angle of the star
     */
    star(centerX, centerY, points, radiusOuter, radiusInner, angle) {
        let me = this,
            coordinates = [],
            totalPoints = 2 * points,
            radius = radiusOuter;

        for (let index = 0; index < totalPoints + 1; index++) {
            radius = index % 2 == 0 ? radiusOuter : radiusInner;
            coordinates.push({
                x: centerX - radius * Math.cos(angle),
                y: centerY - radius * Math.sin(angle),
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

    bezierCurveTo(
        anchor1x,
        anchor1y,
        anchor2x,
        anchor2y,
        anchor3x,
        anchor3y,
        anchor4x,
        anchor4y
    ) {
        let me = this;
        me.context.moveTo(anchor1x, anchor1y);
        me.context.bezierCurveTo(
            anchor2x,
            anchor2y,
            anchor3x,
            anchor3y,
            anchor4x,
            anchor4y
        );
        return me;
    }

    quadraticCurveTo(
        anchor1x,
        anchor1y,
        anchor2x,
        anchor2y,
        anchor3x,
        anchor3y
    ) {
        let me = this;
        me.context.moveTo(anchor1x, anchor1y);
        me.context.quadraticCurveTo(anchor2x, anchor2y, anchor3x, anchor3y);
        return me;
    }

    /**
     *
     */
    fill() {
        let me = this;
        me.context.fill();
        return me;
    }

    fillText(text, x, y, maxWidth = undefined) {
        let me = this;
        me.context.fillText(text, x, y, maxWidth);
        return me;
    }

    measureText(text) {
        let me = this;
        return me.context.measureText(text);
    }

    /**
     *
     */
    stroke() {
        let me = this;
        me.context.stroke();
        return me;
    }

    /**
     *
     * @param {*} x
     * @param {*} y
     */
    scale(x, y) {
        let me = this;
        me.context.scale(x, y);
        return me;
    }

    /**
     *
     * @param {*} x
     * @param {*} y
     */
    translate(x, y) {
        let me = this;
        me.context.translate(x, y);
        return me;
    }

    /**
     *
     * @param {*} angle
     */
    rotate(angle) {
        let me = this;
        me.context.rotate(angle);
        return me;
    }
}

export default Canvas;
