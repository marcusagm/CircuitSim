import Group from '../shapes/Group.js';
import Component from '../components/Component.js';

/**
 * Description:
 *  Manages all drawable elements on the canvas, including shapes, groups and components.
 *  Provides methods for adding, removing, finding and drawing elements, as well as
 *  selection, clipboard, grouping and component filtering utilities.
 *
 * Properties summary:
 *  - _canvas {import('./Canvas.js').default|null} : Canvas wrapper instance used for drawing.
 *  - _grid {import('./Grid.js').default|null} : Grid instance used to draw background grid.
 *  - _elements {Array<import('../shapes/Shape.js').default>} : Managed drawable elements.
 *  - _selectionRectangle {{x:number,y:number,width:number,height:number}|null} : Current selection rectangle.
 *  - _clipboard {Array<import('../shapes/Shape.js').default>} : Internal clipboard for copy/paste.
 *  - _availableComponentDefinitions {Array<object>} : Component definitions available to the project.
 *
 * Typical usage:
 *   const manager = new DrawingManager(canvasWrapper, gridInstance);
 *   manager.addElement(new Shape(...));
 *   manager.drawAll();
 *
 * Notes / Additional:
 *  - All selection, grouping, duplication and clipboard operations follow WireToucan conventions.
 *  - This class uses mathematical transforms on elements instead of relying on canvas transform state.
 */
export default class DrawingManager {
    /**
     * Internal canvas reference.
     *
     * @type {import('./Canvas.js').default|null}
     * @private
     */
    _canvas = null;

    /**
     * Internal grid reference.
     *
     * @type {import('./Grid.js').default|null}
     * @private
     */
    _grid = null;

    /**
     * Internal list of drawable elements.
     *
     * @type {Array<import("../shapes/Shape.js").default>}
     * @private
     */
    _elements = [];

    /**
     * Internal selection rectangle (backing field).
     *
     * @type {{x:number,y:number,width:number,height:number}|null}
     * @private
     */
    _selectionRectangle = null;

    /**
     * Internal clipboard for copy/paste operations.
     *
     * @type {Array<import("../shapes/Shape.js").default>}
     * @private
     */
    _clipboard = [];

    /**
     * Internal list of available component definitions.
     *
     * @type {Array<object>}
     * @private
     */
    _availableComponentDefinitions = [];

    /**
     * Internal reference to the registered afterRender callback (used for cleanup).
     *
     * @type {Function|null}
     * @private
     */
    _afterRenderCallback = null;

    /**
     * Creates an instance of DrawingManager.
     *
     * @param {import('./Canvas.js').default} canvas - Canvas wrapper instance.
     * @param {import('./Grid.js').default} grid - Grid instance used to render background.
     */
    constructor(canvas, grid) {
        const me = this;
        me.canvas = canvas;
        me.grid = grid;

        // register a stable callback so we can remove it on dispose
        me._afterRenderCallback = () => me.drawAll();

        me._canvas.addAfterRenderCallback(me._afterRenderCallback);
    }

    /**
     * Canvas getter.
     *
     * @returns {import('./Canvas.js').default|null} The canvas wrapper instance.
     */
    get canvas() {
        return this._canvas;
    }

    /**
     * Canvas setter with validation.
     *
     * @param {import('./Canvas.js').default} value - Canvas wrapper instance.
     * @returns {void}
     */
    set canvas(value) {
        const me = this;
        const prev = me._canvas;
        if (!value) {
            console.warn(
                `[DrawingManager] invalid canvas assignment (${value}). Keeping previous value: ${prev}`
            );
            return;
        }
        me._canvas = value;
    }

    /**
     * Grid getter.
     *
     * @returns {import('./Grid.js').default|null} The grid instance.
     */
    get grid() {
        return this._grid;
    }

    /**
     * Grid setter with validation.
     *
     * @param {import('./Grid.js').default} value - Grid instance.
     * @returns {void}
     */
    set grid(value) {
        const me = this;
        const prev = me._grid;
        if (!value) {
            console.warn(
                `[DrawingManager] invalid grid assignment (${value}). Keeping previous value: ${prev}`
            );
            return;
        }
        me._grid = value;
    }

    /**
     * Elements getter.
     *
     * @returns {Array<import("../shapes/Shape.js").default>} Array of managed elements.
     */
    get elements() {
        return this._elements;
    }

    /**
     * Elements setter.
     *
     * @param {Array<import("../shapes/Shape.js").default>} value - New elements array.
     * @returns {void}
     */
    set elements(value) {
        const me = this;
        const prev = me._elements;
        if (!Array.isArray(value)) {
            console.warn(
                `[DrawingManager] invalid elements assignment (${value}). Keeping previous value: ${JSON.stringify(prev)}`
            );
            return;
        }
        me._elements = value;
    }

    /**
     * Selection rectangle getter.
     *
     * @returns {{x:number,y:number,width:number,height:number}|null} Current selection rectangle or null.
     */
    get selectionRectangle() {
        return this._selectionRectangle;
    }

    /**
     * Selection rectangle setter.
     *
     * @param {{x:number,y:number,width:number,height:number}|null} value - New selection rectangle or null.
     * @returns {void}
     */
    set selectionRectangle(value) {
        const me = this;
        const prev = me._selectionRectangle;
        if (value !== null && (typeof value !== 'object' || Number.isNaN(Number(value.x)))) {
            console.warn(
                `[DrawingManager] invalid selectionRectangle assignment (${value}). Keeping previous value: ${JSON.stringify(prev)}`
            );
            return;
        }
        me._selectionRectangle = value;
    }

    /**
     * Clipboard getter.
     *
     * @returns {Array<import("../shapes/Shape.js").default>} Current clipboard contents.
     */
    get clipboard() {
        return this._clipboard;
    }

    /**
     * Clipboard setter.
     *
     * @param {Array<import("../shapes/Shape.js").default>} value - New clipboard array.
     * @returns {void}
     */
    set clipboard(value) {
        const me = this;
        const prev = me._clipboard;
        if (!Array.isArray(value)) {
            console.warn(
                `[DrawingManager] invalid clipboard assignment (${value}). Keeping previous value: ${JSON.stringify(prev)}`
            );
            return;
        }
        me._clipboard = value;
    }

    /**
     * Available component definitions getter.
     *
     * @returns {Array<object>} Array of component definition objects.
     */
    get availableComponentDefinitions() {
        return this._availableComponentDefinitions;
    }

    /**
     * Available component definitions setter.
     *
     * @param {Array<object>} value - New array of component definitions.
     * @returns {void}
     */
    set availableComponentDefinitions(value) {
        const me = this;
        const prev = me._availableComponentDefinitions;
        if (!Array.isArray(value)) {
            console.warn(
                `[DrawingManager] invalid availableComponentDefinitions assignment (${value}). Keeping previous value: ${JSON.stringify(prev)}`
            );
            return;
        }
        me._availableComponentDefinitions = value;
    }

    /**
     * Adds an element to the manager.
     *
     * @param {import("../shapes/Shape.js").default} element - Element to add.
     * @returns {void}
     */
    addElement(element) {
        const me = this;
        me.elements = me.elements.concat([element]);
        if (element && element.drawingManager === undefined) {
            element.drawingManager = me;
        }
        me.canvas.requestRender();
    }

    /**
     * Removes an element from the manager.
     *
     * @param {import("../shapes/Shape.js").default} element - Element to remove.
     * @returns {void}
     */
    removeElement(element) {
        const me = this;
        me.elements = me.elements.filter(existing => existing !== element);
        me.canvas.requestRender();
    }

    /**
     * Draws all managed content: background grid, elements and overlay.
     *
     * @returns {void}
     */
    drawAll() {
        const me = this;
        me.drawBackground();
        me.drawElements();
        me.drawOverlay();
    }

    /**
     * Draws the background grid.
     *
     * @returns {void}
     */
    drawBackground() {
        const me = this;
        me.grid.draw();
    }

    /**
     * Draws all managed elements.
     *
     * @returns {void}
     */
    drawElements() {
        const me = this;
        me.elements.forEach(element => {
            element.draw(me.canvas);
        });
    }

    /**
     * Draws overlay elements (selection rectangle, guides, etc).
     *
     * @returns {void}
     */
    drawOverlay() {
        const me = this;
        me.drawSelectionRectangle();
    }

    /**
     * Draws the selection rectangle if one exists.
     *
     * @returns {void}
     */
    drawSelectionRectangle() {
        const me = this;
        if (!me.selectionRectangle || !me.canvas) return;
        const rect = me.selectionRectangle;
        me.canvas
            .setStrokeColor('rgba(0, 120, 215, 0.8)')
            .setStrokeWidth(1)
            .setFillColor('rgba(0, 120, 215, 0.1)')
            .rectangle(rect.x, rect.y, rect.width, rect.height)
            .fill()
            .stroke()
            .restore();
    }

    /**
     * Finds the topmost element at the given canvas coordinates.
     *
     * @param {number} coordinateX - X coordinate in canvas logical pixels.
     * @param {number} coordinateY - Y coordinate in canvas logical pixels.
     * @returns {import("../shapes/Shape.js").default|null} The topmost element or null if none.
     */
    findElementAt(coordinateX, coordinateY) {
        const me = this;
        for (let index = me.elements.length - 1; index >= 0; index--) {
            const element = me.elements[index];
            if (element.isHit(me.canvas, coordinateX, coordinateY) === true) return element;
        }
        return null;
    }

    /**
     * Deselects all managed elements.
     *
     * @returns {void}
     */
    deselectAll() {
        const me = this;
        me.elements.forEach(element => element.deselect());
        me.canvas.requestRender();
    }

    /**
     * Returns an array with all currently selected elements.
     *
     * @returns {Array<import("../shapes/Shape.js").default>} Selected elements.
     */
    getAllSelectedElements() {
        const me = this;
        return me.elements.filter(element => element && element.isSelected);
    }

    /**
     * Sets the selection rectangle used for marquee selection.
     *
     * @param {number} startX - Starting X coordinate.
     * @param {number} startY - Starting Y coordinate.
     * @param {number} endX - Ending X coordinate.
     * @param {number} endY - Ending Y coordinate.
     * @returns {void}
     */
    setSelectionRectangle(startX, startY, endX, endY) {
        const me = this;
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        me.selectionRectangle = { x, y, width, height };
        me.canvas.requestRender();
    }

    /**
     * Clears the current selection rectangle.
     *
     * @returns {void}
     */
    clearSelectionRectangle() {
        const me = this;
        me.selectionRectangle = null;
        me.canvas.requestRender();
    }

    /**
     * Selects elements that intersect the current selection rectangle.
     *
     * @param {boolean} [isIncremental=false] - When true, keep existing selection and only add.
     * @returns {void}
     */
    selectElementsInRectangle(isIncremental = false) {
        const me = this;
        if (!me.selectionRectangle) return;
        const rect = me.selectionRectangle;

        me.elements.forEach(element => {
            const boundingBox = element.getBoundingBox();
            const intersects =
                boundingBox.x < rect.x + rect.width &&
                boundingBox.x + boundingBox.width > rect.x &&
                boundingBox.y < rect.y + rect.height &&
                boundingBox.y + boundingBox.height > rect.y;

            if (intersects) {
                element.select();
            } else if (!isIncremental) {
                element.deselect();
            }
        });

        me.clearSelectionRectangle();
        me.canvas.requestRender();
    }

    /**
     * Copies currently selected elements into the internal clipboard (cloned).
     *
     * @returns {void}
     */
    copySelectedElements() {
        const me = this;
        me.clipboard = me.getAllSelectedElements().map(element => element.clone());
        console.info(`[DrawingManager] Copied ${me.clipboard.length} element(s).`);
    }

    /**
     * Pastes elements from clipboard to the canvas with an optional offset.
     *
     * @param {number} [offsetX=10] - Horizontal offset applied to pasted elements.
     * @param {number} [offsetY=10] - Vertical offset applied to pasted elements.
     * @returns {void}
     */
    pasteElements(offsetX = 10, offsetY = 10) {
        const me = this;
        if (!Array.isArray(me.clipboard) || me.clipboard.length === 0) {
            console.warn('[DrawingManager] Clipboard is empty.');
            return;
        }

        me.deselectAll();

        me.clipboard.forEach(element => {
            const cloned = element.clone();
            cloned.move(offsetX, offsetY);
            cloned.select();
            cloned.drawingManager = me;
            me.addElement(cloned);
        });

        me.canvas.requestRender();
    }

    /**
     * Duplicates currently selected elements and inserts the duplicates with an offset.
     *
     * @param {number} [offsetX=10] - Horizontal offset for duplicated elements.
     * @param {number} [offsetY=10] - Vertical offset for duplicated elements.
     * @returns {void}
     */
    duplicateSelectedElements(offsetX = 10, offsetY = 10) {
        const me = this;
        const selected = me.getAllSelectedElements();
        if (!selected.length) {
            console.warn('[DrawingManager] No elements selected for duplication.');
            return;
        }

        me.deselectAll();

        selected.forEach(element => {
            const clone = element.clone();
            clone.move(offsetX, offsetY);
            clone.select();
            clone.drawingManager = me;
            me.addElement(clone);
        });

        me.canvas.requestRender();

        console.info(`[DrawingManager] Duplicated ${selected.length} element(s).`);
    }

    /**
     * Groups currently selected elements into a single Group element.
     *
     * @returns {void}
     */
    groupSelectedElements() {
        const me = this;
        const selected = me.getAllSelectedElements();
        if (selected.length < 2) {
            console.warn('[DrawingManager] Select at least two elements to group.');
            return;
        }

        me.deselectAll();

        me.elements = me.elements.filter(element => !selected.includes(element));

        const group = new Group(selected);
        group.select();
        me.addElement(group);

        me.canvas.requestRender();

        console.info(`[DrawingManager] Grouped ${selected.length} element(s).`);
    }

    /**
     * Ungroups selected Group elements, reinserting their children into the manager.
     *
     * @returns {void}
     */
    ungroupSelectedElements() {
        const me = this;
        const groups = me.getAllSelectedElements().filter(element => element instanceof Group);
        if (!groups.length) {
            console.warn('[DrawingManager] No groups selected to ungroup.');
            return;
        }

        me.deselectAll();

        groups.forEach(group => {
            me.removeElement(group);
            if (Array.isArray(group.children)) {
                group.children.forEach(child => {
                    child.select();
                    child.drawingManager = me;
                    me.addElement(child);
                });
            }
        });

        me.canvas.requestRender();

        console.info(`[DrawingManager] Ungrouped ${groups.length} group(s).`);
    }

    /**
     * Sets available component definitions.
     *
     * @param {Array<object>} definitions - Array of component definition objects.
     * @returns {void}
     */
    setAvailableComponentDefinitions(definitions) {
        const me = this;
        me.availableComponentDefinitions = definitions;
    }

    /**
     * Returns component definitions filtered by a search query.
     *
     * @param {string} [searchQuery=''] - Query to filter by (name or description).
     * @returns {Array<object>} Filtered component definitions.
     */
    getFilteredComponentDefinitions(searchQuery = '') {
        const me = this;
        const query = String(searchQuery || '').toLowerCase();
        if (!query) return me.availableComponentDefinitions;
        return me.availableComponentDefinitions.filter(
            def =>
                String(def.name || '')
                    .toLowerCase()
                    .includes(query) ||
                (def.description && String(def.description).toLowerCase().includes(query))
        );
    }

    /**
     * Returns all Component instances present on the canvas.
     *
     * @returns {Array<import("../components/Component.js").default>} Array of Component instances.
     */
    getProjectComponents() {
        const me = this;
        return me.elements.filter(element => element instanceof Component);
    }

    /**
     * Returns Component instances filtered by a search query.
     *
     * @param {string} [searchQuery=''] - Query to filter components by name/description.
     * @returns {Array<import("../components/Component.js").default>} Filtered components.
     */
    getFilteredProjectComponents(searchQuery = '') {
        const me = this;
        const query = String(searchQuery || '').toLowerCase();
        const components = me.getProjectComponents();
        if (!query) return components;
        return components.filter(
            comp =>
                String(comp.componentName || '')
                    .toLowerCase()
                    .includes(query) ||
                (comp.componentDescription &&
                    String(comp.componentDescription).toLowerCase().includes(query))
        );
    }

    /**
     * Dispose internal references to help garbage collection.
     *
     * @returns {void}
     */
    dispose() {
        const me = this;

        // remove registered callback (if canvas supported removal)
        if (me._afterRenderCallback) {
            me._canvas.removeAfterRenderCallback(me._afterRenderCallback);
            me._afterRenderCallback = null;
        }

        // clear collections and break references
        me._elements = [];
        me._clipboard = [];
        me._availableComponentDefinitions = [];
        me._selectionRectangle = null;

        me._canvas.dispose();
        me._canvas = null;
        me._grid = null;
    }
}
