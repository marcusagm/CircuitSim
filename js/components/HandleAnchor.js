/**
 * Description:
 *  HandleAnchor represents an anchor point with directional control handles used for editing curves.
 *  It is similar to Illustrator's anchor: a central anchor point with a left and right direction handle.
 *  The class provides drawing routines for the anchor and its direction lines, and centralizes
 *  property validation via getters/setters.
 *
 * Properties summary:
 *  - x {number} : anchor center X coordinate (world).
 *  - y {number} : anchor center Y coordinate (world).
 *  - leftDirectionX {number} : left direction control X coordinate (world).
 *  - leftDirectionY {number} : left direction control Y coordinate (world).
 *  - rightDirectionX {number} : right direction control X coordinate (world).
 *  - rightDirectionY {number} : right direction control Y coordinate (world).
 *  - parentComponent {object|null} : optional owner reference.
 *  - size {number} : visual diameter of the anchor circle in pixels.
 *  - fillColor {string} : anchor fill CSS color.
 *  - borderSize {number} : border thickness in pixels.
 *  - borderColor {string} : border CSS color.
 *
 * Typical usage:
 *   const anchor = new HandleAnchor(100, 100, 50, 100, 150, 100, component);
 *   anchor.draw(canvasInstance);
 *
 * Notes:
 *  - Setters validate input and log warnings (do not throw) using a consistent message format.
 *  - draw(canvas) assumes the rendering manager has saved canvas state; methods call canvas.restore() per project convention.
 *  - drawDirectionLine does not mutate the passed direction object.
 *
 * @class HandleAnchor
 */
export default class HandleAnchor {
    /**
     * Internal X coordinate backing field (anchor center).
     * @type {number}
     * @private
     */
    _positionX = 0;

    /**
     * Internal Y coordinate backing field (anchor center).
     * @type {number}
     * @private
     */
    _positionY = 0;

    /**
     * Internal left direction X backing field.
     * @type {number}
     * @private
     */
    _leftDirectionX = 0;

    /**
     * Internal left direction Y backing field.
     * @type {number}
     * @private
     */
    _leftDirectionY = 0;

    /**
     * Internal right direction X backing field.
     * @type {number}
     * @private
     */
    _rightDirectionX = 0;

    /**
     * Internal right direction Y backing field.
     * @type {number}
     * @private
     */
    _rightDirectionY = 0;

    /**
     * Internal size backing field (diameter).
     * @type {number}
     * @private
     */
    _size = 10;

    /**
     * Internal fillColor backing field.
     * @type {string}
     * @private
     */
    _fillColor = '#00ccff66';

    /**
     * Internal borderSize backing field.
     * @type {number}
     * @private
     */
    _borderSize = 2;

    /**
     * Internal borderColor backing field.
     * @type {string}
     * @private
     */
    _borderColor = '#00ccffff';

    /**
     * Internal parentComponent backing field.
     * @type {object|null}
     * @private
     */
    _parentComponent = null;

    /**
     * Creates an instance of HandleAnchor.
     *
     * @param {number} positionX - Anchor center X coordinate in world pixels.
     * @param {number} positionY - Anchor center Y coordinate in world pixels.
     * @param {number} leftDirectionX - Left control X coordinate in world pixels.
     * @param {number} leftDirectionY - Left control Y coordinate in world pixels.
     * @param {number} rightDirectionX - Right control X coordinate in world pixels.
     * @param {number} rightDirectionY - Right control Y coordinate in world pixels.
     * @param {object|null} parentComponent - Optional owner reference.
     * @param {number} [size=10] - Visual diameter in pixels.
     * @param {string} [fillColor='#00ccff66'] - Fill CSS color.
     * @param {number} [borderSize=2] - Border thickness in pixels.
     * @param {string} [borderColor='#00ccffff'] - Border CSS color.
     */
    constructor(
        positionX,
        positionY,
        leftDirectionX,
        leftDirectionY,
        rightDirectionX,
        rightDirectionY,
        parentComponent = null,
        size = 10,
        fillColor = '#00ccff66',
        borderSize = 2,
        borderColor = '#00ccffff'
    ) {
        const me = this;
        me.positionX = positionX;
        me.positionY = positionY;
        me.leftDirectionX = leftDirectionX;
        me.leftDirectionY = leftDirectionY;
        me.rightDirectionX = rightDirectionX;
        me.rightDirectionY = rightDirectionY;
        me.parentComponent = parentComponent;
        me.size = size;
        me.fillColor = fillColor;
        me.borderSize = borderSize;
        me.borderColor = borderColor;
    }

    /**
     * X getter.
     * @returns {number} Anchor center X coordinate.
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
                `[HandleAnchor] invalid x assignment (${value}). Keeping previous value: ${me._positionX}`
            );
            return;
        }
        me._positionX = numberValue;
    }

    /**
     * Y getter.
     * @returns {number} Anchor center Y coordinate.
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
                `[HandleAnchor] invalid y assignment (${value}). Keeping previous value: ${me._positionY}`
            );
            return;
        }
        me._positionY = numberValue;
    }

    /**
     * leftDirectionX getter.
     * @returns {number} Left control X coordinate.
     */
    get leftDirectionX() {
        return this._leftDirectionX;
    }

    /**
     * leftDirectionX setter with validation.
     *
     * @param {number} value - New left control X coordinate.
     * @returns {void}
     */
    set leftDirectionX(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[HandleAnchor] invalid leftDirectionX assignment (${value}). Keeping previous value: ${me._leftDirectionX}`
            );
            return;
        }
        me._leftDirectionX = numberValue;
    }

    /**
     * leftDirectionY getter.
     * @returns {number} Left control Y coordinate.
     */
    get leftDirectionY() {
        return this._leftDirectionY;
    }

    /**
     * leftDirectionY setter with validation.
     *
     * @param {number} value - New left control Y coordinate.
     * @returns {void}
     */
    set leftDirectionY(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[HandleAnchor] invalid leftDirectionY assignment (${value}). Keeping previous value: ${me._leftDirectionY}`
            );
            return;
        }
        me._leftDirectionY = numberValue;
    }

    /**
     * rightDirectionX getter.
     * @returns {number} Right control X coordinate.
     */
    get rightDirectionX() {
        return this._rightDirectionX;
    }

    /**
     * rightDirectionX setter with validation.
     *
     * @param {number} value - New right control X coordinate.
     * @returns {void}
     */
    set rightDirectionX(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[HandleAnchor] invalid rightDirectionX assignment (${value}). Keeping previous value: ${me._rightDirectionX}`
            );
            return;
        }
        me._rightDirectionX = numberValue;
    }

    /**
     * rightDirectionY getter.
     * @returns {number} Right control Y coordinate.
     */
    get rightDirectionY() {
        return this._rightDirectionY;
    }

    /**
     * rightDirectionY setter with validation.
     *
     * @param {number} value - New right control Y coordinate.
     * @returns {void}
     */
    set rightDirectionY(value) {
        const me = this;
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
            console.warn(
                `[HandleAnchor] invalid rightDirectionY assignment (${value}). Keeping previous value: ${me._rightDirectionY}`
            );
            return;
        }
        me._rightDirectionY = numberValue;
    }

    /**
     * size getter.
     * @returns {number} Diameter in pixels.
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
                `[HandleAnchor] invalid size assignment (${value}). Size must be a positive number. Keeping previous value: ${me._size}`
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
     * @param {string} value - New fill CSS color.
     * @returns {void}
     */
    set fillColor(value) {
        const me = this;
        if (typeof value !== 'string') {
            console.warn(
                `[HandleAnchor] invalid fillColor assignment (${value}). Keeping previous value: ${me._fillColor}`
            );
            return;
        }
        me._fillColor = value;
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
                `[HandleAnchor] invalid borderSize assignment (${value}). Keeping previous value: ${me._borderSize}`
            );
            return;
        }
        me._borderSize = numberValue;
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
                `[HandleAnchor] invalid borderColor assignment (${value}). Keeping previous value: ${me._borderColor}`
            );
            return;
        }
        me._borderColor = value;
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
                `[HandleAnchor] invalid parentComponent assignment (${value}). Keeping previous value.`
            );
            return;
        }
        me._parentComponent = value;
    }

    /**
     * Returns the top-left coordinate of the anchor drawing rectangle (accounts for size and border).
     *
     * @returns {{x:number,y:number}} Top-left coordinate.
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
     * Draws the anchor and its direction lines.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;
        const absPos = me.getAbsolutePosition();
        const radius = Math.max(0, (me.size - me.borderSize) / 2);

        canvas
            .setStrokeColor(me.borderColor)
            .setFillColor(me.fillColor)
            .setStrokeWidth(me.borderSize)
            .circle(absPos.x + me.size / 2, absPos.y + me.size / 2, radius)
            .fill()
            .stroke();

        // draw left/right direction lines and small handle circles at their ends
        const left = { x: me.leftDirectionX, y: me.leftDirectionY };
        const right = { x: me.rightDirectionX, y: me.rightDirectionY };
        me.drawDirectionLine(canvas, { x: absPos.x, y: absPos.y }, left);
        me.drawDirectionLine(canvas, { x: absPos.x, y: absPos.y }, right);
    }

    /**
     * Draws a direction line from the anchor center to the given direction coordinate and a small handle there.
     * This method does not mutate the `direction` parameter.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {{x:number,y:number}} anchorPos - The anchor center absolute position {x,y}.
     * @param {{x:number,y:number}} direction - The target control point absolute coordinate {x,y}.
     * @returns {void}
     */
    drawDirectionLine(canvas, anchorPos, direction) {
        const me = this;
        if (!direction || typeof direction.x !== 'number' || typeof direction.y !== 'number')
            return;

        const dx = direction.x - anchorPos.x;
        const dy = direction.y - anchorPos.y;
        const length = Math.hypot(dx, dy);
        if (length === 0) return;

        const normX = me.size / 2 + direction.x; //dx / length;
        const normY = me.size / 2 + direction.y; //dy / length;

        // line end coordinates computed from provided absolute control point (keeps original length)
        const endX = anchorPos.x + normX;
        const endY = anchorPos.y + normY;

        canvas
            .setStrokeColor(me.borderColor)
            .setStrokeWidth(1)
            .line(anchorPos.x + me.size / 2, anchorPos.y + me.size / 2, endX, endY)
            .stroke();

        const radiusDivider = 4;
        const handleRadius = Math.max(0, (me.size - me.borderSize) / radiusDivider);
        canvas
            .setFillColor(me.fillColor)
            .setStrokeColor(me.borderColor)
            .setStrokeWidth(1)
            .circle(endX, endY, handleRadius)
            .fill()
            .stroke()
            .restore();
    }
}
