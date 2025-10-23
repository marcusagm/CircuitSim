import Shape from './Shape.js';
import HandleBox from '../components/HandleBox.js';

/**
 * Description: Represents a raster image placed on the canvas.
 *
 * Properties summary:
 *  - uniqueId {string} (inherited): read-only identifier.
 *  - positionX {number} (inherited): X coordinate of image top-left (pixels).
 *  - positionY {number} (inherited): Y coordinate of image top-left (pixels).
 *  - imageUrl {string} : source URL for the image.
 *  - width {number} : rendered width in pixels.
 *  - height {number} : rendered height in pixels.
 *  - loaded {boolean} : whether the image finished loading successfully.
 *  - image {HTMLImageElement} : internal Image instance (not serialized directly).
 *  - isSelected {boolean} (inherited): selection state.
 *  - hitMargin {number} (inherited): extra pixels used for hit-testing.
 *  - zIndex {number} (inherited): rendering order.
 *
 * Typical usage:
 *   const img = new ImageShape(10, 20, 'https://.../photo.png');
 *   canvas.addShape(img);
 *   canvas.render();
 *
 * Notes:
 *  - Image loading is asynchronous. width/height default to image natural size when not provided.
 *  - Setters perform validation and emit standardized warnings on invalid assignments.
 *  - The internal image is recreated when imageUrl changes; CORS and load errors are logged to console.
 *
 * @class ImageShape
 */
export default class ImageShape extends Shape {
    /**
     * Internal image URL backing field.
     * @type {string}
     * @private
     */
    _imageUrl = '';

    /**
     * Internal Image element backing field.
     * @type {HTMLImageElement|null}
     * @private
     */
    _image = null;

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
     * Internal loaded state backing field.
     * @type {boolean}
     * @private
     */
    _loaded = false;

    /**
     * Optional external drawing manager that can be used to request rendering.
     * This is not required; set by host if available.
     * @type {Object|undefined}
     * @private
     */
    _drawingManager = undefined;

    /**
     * Creates a new ImageShape.
     *
     * @param {number} positionX - Top-left X coordinate in pixels.
     * @param {number} positionY - Top-left Y coordinate in pixels.
     * @param {string} imageUrl - URL of the image to load.
     * @param {number} [width=0] - Desired render width in pixels. If 0 uses natural width after load.
     * @param {number} [height=0] - Desired render height in pixels. If 0 uses natural height after load.
     */
    constructor(positionX, positionY, imageUrl, width = 0, height = 0) {
        super(positionX, positionY);
        const me = this;

        me._drawingManager = undefined;

        // Use setters to centralize validation and load image
        me.imageUrl = imageUrl;
        me.width = width;
        me.height = height;
        me._loaded = false;
    }

    /**
     * imageUrl getter.
     * @returns {string} Image source URL.
     */
    get imageUrl() {
        return this._imageUrl;
    }

    /**
     * imageUrl setter. Recreates internal Image and starts loading.
     * On invalid value, logs warning and keeps previous value.
     *
     * @param {string} value - New image URL.
     */
    set imageUrl(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[ImageShape] invalid imageUrl assignment (${value}). Keeping previous value: ${me._imageUrl}`
            );
            return;
        }

        // If same URL, do nothing
        if (value === me._imageUrl && me._image) return;

        me._imageUrl = value;
        me._loaded = false;

        // create and set up image element
        const img = new Image();
        // recommended: caller should set `img.crossOrigin = 'anonymous'` if needed for canvas export
        img.onload = function () {
            // `this` here is the DOM Image element
            try {
                // use setters so validation and side-effects are consistent
                if (me._width === 0) me.width = this.naturalWidth || this.width || 0;
                if (me._height === 0) me.height = this.naturalHeight || this.height || 0;
            } catch (err) {
                // just in case setters throw (they don't), swallow and log
                console.error('[ImageShape] error applying natural size after load', err);
            }
            me._loaded = true;
            // notify host/drawing manager if present
            if (
                me._drawingManager &&
                me._drawingManager.canvas &&
                typeof me._drawingManager.canvas.requestRender === 'function'
            ) {
                me._drawingManager.canvas.requestRender();
            }
        };
        img.onerror = function (ev) {
            console.error(`[ImageShape] error loading image: ${me._imageUrl}`, ev);
            me._loaded = false;
        };

        // assign src after callbacks set
        img.src = value;
        me._image = img;
    }

    /**
     * image getter.
     * @returns {HTMLImageElement|null} Internal Image element or null if none.
     */
    get image() {
        return this._image;
    }

    /**
     * width getter.
     * @returns {number} Render width in pixels.
     */
    get width() {
        return this._width;
    }

    /**
     * width setter with validation.
     * Accepts non-negative numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New width in pixels.
     */
    set width(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 0) {
            console.warn(
                `[ImageShape] invalid width assignment (${value}). Width must be a non-negative number. Keeping previous value: ${me._width}`
            );
            return;
        }
        me._width = v;
    }

    /**
     * height getter.
     * @returns {number} Render height in pixels.
     */
    get height() {
        return this._height;
    }

    /**
     * height setter with validation.
     * Accepts non-negative numbers only. On invalid value, logs a warning and keeps previous value.
     *
     * @param {number} value - New height in pixels.
     */
    set height(value) {
        const me = this;
        const v = Number(value);
        if (Number.isNaN(v) || v < 0) {
            console.warn(
                `[ImageShape] invalid height assignment (${value}). Height must be a non-negative number. Keeping previous value: ${me._height}`
            );
            return;
        }
        me._height = v;
    }

    /**
     * loaded getter.
     * @returns {boolean} True if image finished loading successfully.
     */
    get loaded() {
        return this._loaded;
    }

    /**
     * drawingManager getter.
     * @returns {Object|undefined} Optional external drawing manager.
     */
    get drawingManager() {
        return this._drawingManager;
    }

    /**
     * drawingManager setter.
     * @param {Object|undefined} value - Optional manager with `.canvas.requestRender()` method.
     */
    set drawingManager(value) {
        const me = this;
        me._drawingManager = value;
    }

    /**
     * Draws the image on the provided canvas.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    draw(canvas) {
        const me = this;

        if (me.loaded && me._image) {
            // use canonical positionX/positionY and validated width/height
            canvas.drawImage(me._image, me.positionX, me.positionY, me.width, me.height);
        }

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Hit test: returns true if the test point is inside the image bounds (including hitMargin).
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} testX - X coordinate to test.
     * @param {number} testY - Y coordinate to test.
     * @returns {boolean} True if the point hits the image, false otherwise.
     */
    isHit(canvas, testX, testY) {
        const me = this;
        if (!me.loaded) return false;
        const margin = Number(me.hitMargin) || 0;
        const minX = me.positionX - margin;
        const minY = me.positionY - margin;
        const maxX = me.positionX + me.width + margin;
        const maxY = me.positionY + me.height + margin;
        return testX >= minX && testX <= maxX && testY >= minY && testY <= maxY;
    }

    /**
     * Move the image by given deltas (updates canonical position).
     *
     * @param {number} deltaX - Horizontal shift in pixels.
     * @param {number} deltaY - Vertical shift in pixels.
     * @returns {void} Nothing.
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY);
    }

    /**
     * Edit image properties via setters.
     *
     * Supported properties: imageUrl, width, height, positionX, positionY
     *
     * @param {Object} newProperties - Object with properties to update.
     * @returns {void} Nothing.
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const keys = ['imageUrl', 'width', 'height', 'positionX', 'positionY'];
        keys.forEach(key => {
            if (key in newProperties) {
                me[key] = newProperties[key];
            }
        });
    }

    /**
     * Draws selection handles (box) around the image.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void} Nothing.
     */
    drawSelectionHandles(canvas) {
        const me = this;
        if (!me.loaded) return;
        new HandleBox(me.positionX, me.positionY, me.width, me.height, me, true).draw(canvas);
    }

    /**
     * Returns axis-aligned bounding box for the image (includes hitMargin).
     *
     * @returns {{x:number,y:number,width:number,height:number}} Bounding box of the image.
     */
    getBoundingBox() {
        const me = this;
        const margin = Number(me.hitMargin) || 0;
        return {
            x: me.positionX - margin,
            y: me.positionY - margin,
            width: me.width + margin * 2,
            height: me.height + margin * 2
        };
    }

    /**
     * Serializes the image shape to JSON.
     *
     * @returns {Object} JSON object representing the image.
     */
    toJSON() {
        const me = this;
        const base = super.toJSON();
        return Object.assign(base, {
            imageUrl: me.imageUrl,
            width: me.width,
            height: me.height,
            loaded: me.loaded
        });
    }

    /**
     * Recreates an ImageShape from JSON produced by toJSON().
     *
     * @param {Object} json - JSON object produced by toJSON().
     * @returns {ImageShape} New ImageShape instance.
     */
    static fromJSON(json) {
        if (!json || typeof json !== 'object')
            throw new TypeError('Invalid JSON for ImageShape.fromJSON');
        const instance = new ImageShape(
            Number(json.x) || 0,
            Number(json.y) || 0,
            json.imageUrl || '',
            Number(json.width) || 0,
            Number(json.height) || 0
        );
        instance.edit({
            positionX: Number(json.x) || 0,
            positionY: Number(json.y) || 0
        });
        if (json.id) instance.uniqueId = json.id;
        return instance;
    }
}
