import Tool from './Tool.js';

/**
 * Description:
 *  Tool that provides rotate and flip operations for selected elements.
 *  The tool itself handles basic click selection but rotation/flip actions
 *  are intended to be triggered by UI controls which call rotateSelected,
 *  flipSelectedHorizontal, flipSelectedVertical.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} (inherited) : Canvas instance.
 *  - drawingManager {import('../core/DrawingManager.js').default} (inherited) : Drawing manager.
 *  - _selectedElements {Array<import('../shapes/Shape.js').default>} : Internal list of currently selected elements for this tool.
 *
 * Typical usage:
 *   const tool = new RotateFlipTool(canvasInstance, drawingManager);
 *   tool.activate();
 *   // user clicks to select elements or UI buttons call:
 *   tool.rotateSelected(90);
 *   tool.flipSelectedHorizontal();
 *
 * Notes / Additional:
 *  - Transformations (rotate/flip) should be implemented by shape/component classes
 *    so that child elements (terminals, anchors) are updated mathematically (not via canvas transforms).
 *  - Methods are intentionally kept small to respect cyclomatic complexity constraints.
 */
export default class RotateFlipTool extends Tool {
    /**
     * Internal selected elements backing field.
     * @type {Array<import('../shapes/Shape.js').default>}
     * @private
     */
    _selectedElements = [];

    /**
     * Creates an instance of RotateFlipTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - Drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
        const me = this;
        me._selectedElements = [];
    }

    /**
     * selectedElements getter.
     *
     * @returns {Array<import('../shapes/Shape.js').default>} Currently selected elements tracked by the tool.
     */
    get selectedElements() {
        return this._selectedElements;
    }

    /**
     * selectedElements setter.
     *
     * @param {Array<import('../shapes/Shape.js').default>} value - New array of selected elements.
     * @returns {void}
     */
    set selectedElements(value) {
        const me = this;
        if (!Array.isArray(value)) {
            console.warn(
                `[RotateFlipTool] invalid selectedElements assignment (${value}). Keeping previous value: ${JSON.stringify(
                    me._selectedElements
                )}`
            );
            return;
        }
        me._selectedElements = value;
    }

    /**
     * Activate the tool.
     *
     * Subclasses may override to add activation behavior. This implementation is a no-op.
     *
     * @returns {void}
     */
    activate() {
        // no-op activation; selection handled on click
    }

    /**
     * Deactivate the tool.
     *
     * Clears internal selection tracking.
     *
     * @returns {void}
     */
    deactivate() {
        const me = this;
        me.selectedElements = [];
    }

    /**
     * Handle mouse down event to select/deselect elements.
     *
     * Left-click selects the clicked element (deselects others).
     * Ctrl/Cmd + click toggles selection of the clicked element.
     *
     * @param {MouseEvent} event - The mouse down event.
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const coords = me.getMouseCoords(event);
        const x = Number(coords.x) || 0;
        const y = Number(coords.y) || 0;

        const clickedElement = me.drawingManager.findElementAt(x, y);
        const metaOrCtrl = event.ctrlKey === true || event.metaKey === true;

        if (clickedElement === null) {
            me.drawingManager.deselectAll();
            me.selectedElements = [];
            me.canvas.requestRender();
            return;
        }

        if (metaOrCtrl) {
            if (clickedElement.isSelected) {
                clickedElement.deselect();
                me.selectedElements = me.selectedElements.filter(el => el !== clickedElement);
            } else {
                clickedElement.select();
                me.selectedElements = me.selectedElements.concat([clickedElement]);
            }
        } else {
            if (!clickedElement.isSelected) {
                me.drawingManager.deselectAll();
                clickedElement.select();
                me.selectedElements = [clickedElement];
            }
        }

        me.canvas.requestRender();
    }

    /**
     * Handle mouse move event. This tool does not use dragging.
     *
     * @param {MouseEvent} event - The mouse move event.
     * @returns {void}
     */
    onMouseMove(/* event */) {
        // no-op: this tool does not support drag interactions
    }

    /**
     * Handle mouse up event. This tool does not use dragging.
     *
     * @param {MouseEvent} event - The mouse up event.
     * @returns {void}
     */
    onMouseUp(/* event */) {
        // no-op
    }

    /**
     * Rotate all selected elements by the given angle (degrees).
     *
     * Delegates to each element's rotate(angle) method.
     *
     * @param {number} angleDegrees - Angle in degrees to rotate selected elements.
     * @returns {void}
     */
    rotateSelected(angleDegrees) {
        const me = this;
        const angle = Number(angleDegrees) || 0;

        const targets = me.drawingManager.getAllSelectedElements();
        targets.forEach(element => {
            element.rotate(angle);
        });

        me.canvas.requestRender();
    }

    /**
     * Flip all selected elements horizontally.
     *
     * Delegates to each element's flipHorizontal() method.
     *
     * @returns {void}
     */
    flipSelectedHorizontal() {
        const me = this;

        const targets = me.drawingManager.getAllSelectedElements();
        targets.forEach(element => {
            element.flipHorizontal();
        });

        me.canvas.requestRender();
    }

    /**
     * Flip all selected elements vertically.
     *
     * Delegates to each element's flipVertical() method.
     *
     * @returns {void}
     */
    flipSelectedVertical() {
        const me = this;

        const targets = me.drawingManager.getAllSelectedElements();
        targets.forEach(element => {
            element.flipVertical();
        });

        me.canvas.requestRender();
    }
}
