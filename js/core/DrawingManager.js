/**
 * @fileoverview Manages all drawable elements on the canvas, including shapes and components.
 * Provides functionalities for adding, removing, finding, and drawing elements, as well as managing selection.
 */
import Group from '../shapes/Group.js'; // Assuming Group.js is created for grouping functionality
import Component from '../components/Component.js'; // Import Component for filtering

class DrawingManager {
    /**
     * Creates an instance of DrawingManager.
     * @param {Canvas} canvas - The canvas instance.
     * @param {Grid} grid - The grid instance.
     */
    constructor(canvas, grid) {
        /**
         * The canvas instance this manager operates on.
         * @type {Canvas}
         */
        this.canvas = canvas;
        /**
         * The grid instance associated with the canvas.
         * @type {Grid}
         */
        this.grid = grid;
        /**
         * Array of all drawable elements managed by this instance.
         * @type {Array<import("../shapes/Shape.js").default>}
         */
        this.elements = []; // Renamed from drawableElements
        /**
         * The currently active selection rectangle coordinates for area selection.
         * @type {{startX: number, startY: number, endX: number, endY: number}|null}
         */
        this.selectionRectangle = null;
        /**
         * An array to hold cloned elements for copy/paste operations.
         * @type {Array<import("../shapes/Shape.js").default>}
         */
        this.clipboard = [];
        /**
         * An array of available component definitions loaded from JSON.
         * @type {Array<object>}
         */
        this.availableComponentDefinitions = [];

        this.canvas.afterRenderCallbacks.push(() => {
            this.drawAll(); // Desenha todos os elementos gerenciados
        });
    }

    /**
     * Adds an element to the manager.
     * @param {import("../shapes/Shape.js").default} element - The element to add.
     * @returns {void}
     */
    addElement(element) {
        this.elements.push(element);
        // Ensure the element has a reference to its drawing manager for operations like requesting redraws
        if (element.drawingManager === undefined) {
            element.drawingManager = this;
        }
        this.canvas.requestRender();
    }

    /**
     * Removes an element from the manager.
     * @param {import("../shapes/Shape.js").default} element - The element to remove.
     * @returns {void}
     */
    removeElement(element) {
        this.elements = this.elements.filter(existingElement => existingElement !== element);
        this.canvas.requestRender();
    }

    /**
     * Draws all managed elements on the canvas.
     * @returns {void}
     */
    drawAll() {
        this.drawBackground();
        this.drawElements();
        this.drawOverlay();
    }

    drawBackground() {
        this.grid.draw();
    }

    drawElements() {
        this.elements.forEach(element => element.draw(this.canvas));
    }

    drawOverlay() {
        this.drawSelectionRectangle();
    }

    /**
     * Finds the topmost element at the given coordinates.
     * Iterates in reverse order to get the topmost element.
     * @param {number} coordinateX - The X coordinate to check.
     * @param {number} coordinateY - The Y coordinate to check.
     * @returns {import("../shapes/Shape.js").default|null} The found element or null.
     */
    findElementAt(coordinateX, coordinateY) {
        // Iterate in reverse order to get the topmost element
        for (let elementIndex = this.elements.length - 1; elementIndex >= 0; elementIndex--) {
            const element = this.elements[elementIndex];
            if (element.isHit && element.isHit(this.canvas, coordinateX, coordinateY)) {
                return element;
            }
        }
        return null;
    }

    /**
     * Deselects all currently selected elements.
     * @returns {void}
     */
    deselectAll() {
        this.elements.forEach(element => element.deselect());
        this.canvas.requestRender();
    }

    getAllSelectedElements() {
        return this.elements.filter(el => el.isSelected);
    }

    /**
     * Sets the selection rectangle for area selection.
     * @param {number} startX - The starting X coordinate.
     * @param {number} startY - The starting Y coordinate.
     * @param {number} endX - The ending X coordinate.
     * @param {number} endY - The ending Y coordinate.
     * @returns {void}
     */
    setSelectionRectangle(startX, startY, endX, endY) {
        const rx = Math.min(startX, endX);
        const ry = Math.min(startY, endY);
        const rw = Math.abs(endX - startX);
        const rh = Math.abs(endY - startY);
        this.selectionRectangle = { x: rx, y: ry, width: rw, height: rh };
        this.canvas.requestRender();
    }

    /**
     * Clears the selection rectangle.
     * @returns {void}
     */
    clearSelectionRectangle() {
        this.selectionRectangle = null;
        this.canvas.requestRender();
    }

    drawSelectionRectangle() {
        if (this.selectionRectangle) {
            this.canvas
                .setStrokeColor('rgba(0, 120, 215, 0.8)')
                .setStrokeWidth(1)
                // .setStrokeDash([5, 5])
                .setFillColor('rgba(0, 120, 215, 0.1)')
                .rectangle(
                    this.selectionRectangle.x,
                    this.selectionRectangle.y,
                    this.selectionRectangle.width,
                    this.selectionRectangle.height
                )
                .fill()
                .stroke()
                .restore();
        }
    }

    /**
     * Selects elements within the defined selection rectangle.
     * @returns {void}
     */
    selectElementsInRectangle(isIncremental = false) {
        if (!this.selectionRectangle) return;

        const rect = this.selectionRectangle;
        const minX = Math.min(rect.startX, rect.endX);
        const minY = Math.min(rect.startY, rect.endY);
        const maxX = Math.max(rect.startX, rect.endX);
        const maxY = Math.max(rect.startY, rect.endY);

        this.elements.forEach(element => {
            const boundingBox = element.getBoundingBox();
            if (
                boundingBox.x < rect.x + rect.width &&
                boundingBox.x + boundingBox.width > rect.x &&
                boundingBox.y < rect.y + rect.height &&
                boundingBox.y + boundingBox.height > rect.y
            ) {
                if (element.isSelected === false) element.select();
            } else {
                if (element.isSelected === true && isIncremental === false) element.deselect();
            }
        });
        this.clearSelectionRectangle();
        this.canvas.requestRender();
    }

    /**
     * Copies selected elements to an internal clipboard.
     * @returns {void}
     */
    copySelectedElements() {
        this.clipboard = this.elements
            .filter(element => element.isSelected)
            .map(element => element.clone());
        console.log(`Copied ${this.clipboard.length} elements to clipboard.`);
    }

    /**
     * Pastes elements from the clipboard to the canvas with an offset.
     * @param {number} offsetX - The X offset for pasted elements.
     * @param {number} offsetY - The Y offset for pasted elements.
     * @returns {void}
     */
    pasteElements(offsetX = 10, offsetY = 10) {
        if (!this.clipboard || this.clipboard.length === 0) {
            console.warn('Clipboard is empty.');
            return;
        }

        this.deselectAll();
        const pastedElements = [];
        this.clipboard.forEach(clonedElement => {
            const newElement = clonedElement.clone();
            newElement.move(offsetX, offsetY);
            newElement.select();
            newElement.drawingManager = this; // Set drawingManager reference for the new element
            this.addElement(newElement);
            pastedElements.push(newElement);
        });
        this.canvas.requestRender();
    }

    /**
     * Duplicates selected elements with an offset.
     * @param {number} offsetX - The X offset for duplicated elements.
     * @param {number} offsetY - The Y offset for duplicated elements.
     * @returns {void}
     */
    duplicateSelectedElements(offsetX = 10, offsetY = 10) {
        const selected = this.elements.filter(element => element.isSelected);
        if (selected.length === 0) {
            console.warn('No elements selected for duplication.');
            return;
        }

        this.deselectAll();
        const duplicatedElements = [];
        selected.forEach(originalElement => {
            const newElement = originalElement.clone();
            newElement.move(offsetX, offsetY);
            newElement.select();
            newElement.drawingManager = this; // Set drawingManager reference for the new element
            this.addElement(newElement);
            duplicatedElements.push(newElement);
        });
        this.canvas.requestRender();
        console.log(`Duplicated ${duplicatedElements.length} elements.`);
    }

    /**
     * Groups selected elements into a single Group element.
     * @returns {void}
     */
    groupSelectedElements() {
        const selected = this.elements.filter(element => element.isSelected);
        if (selected.length < 2) {
            console.warn('Select at least two elements to group.');
            return;
        }

        this.deselectAll();

        // Remove selected elements from the main list
        this.elements = this.elements.filter(element => !selected.includes(element));

        const group = new Group(selected);
        group.select();
        this.addElement(group);
        this.canvas.requestRender();
        console.log(`Grouped ${selected.length} elements.`);
    }

    /**
     * Ungroups a selected Group element, adding its children back to the main elements list.
     * @returns {void}
     */
    ungroupSelectedElements() {
        const selectedGroups = this.elements.filter(
            element => element.isSelected && element instanceof Group
        );
        if (selectedGroups.length === 0) {
            console.warn('No groups selected to ungroup.');
            return;
        }

        this.deselectAll();

        selectedGroups.forEach(group => {
            // Remove the group itself
            this.removeElement(group);
            // Add its children back to the main list
            group.children.forEach(child => {
                child.select(); // Select the ungrouped children
                child.drawingManager = this; // Ensure drawingManager is set for children
                this.addElement(child);
            });
        });
        this.canvas.requestRender();
        console.log(`Ungrouped ${selectedGroups.length} groups.`);
    }

    /**
     * Sets the array of available component definitions.
     * @param {Array<object>} definitions - An array of component definition objects.
     * @returns {void}
     */
    setAvailableComponentDefinitions(definitions) {
        this.availableComponentDefinitions = definitions;
    }

    /**
     * Retrieves available component definitions, optionally filtered by a search query.
     * @param {string} [searchQuery=""] - The query string to filter components by name or description.
     * @returns {Array<object>} An array of filtered component definitions.
     */
    getFilteredComponentDefinitions(searchQuery = '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        if (!lowerCaseQuery) {
            return this.availableComponentDefinitions;
        }
        return this.availableComponentDefinitions.filter(
            def =>
                def.name.toLowerCase().includes(lowerCaseQuery) ||
                (def.description && def.description.toLowerCase().includes(lowerCaseQuery))
        );
    }

    /**
     * Retrieves all components currently on the canvas.
     * @returns {Array<import("../components/Component.js").default>} An array of Component instances.
     */
    getProjectComponents() {
        return this.elements.filter(element => element instanceof Component);
    }

    /**
     * Retrieves all components currently on the canvas, optionally filtered by a search query.
     * @param {string} [searchQuery=""] - The query string to filter components by name or description.
     * @returns {Array<import("../components/Component.js").default>} An array of filtered Component instances.
     */
    getFilteredProjectComponents(searchQuery = '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const projectComponents = this.getProjectComponents();

        if (!lowerCaseQuery) {
            return projectComponents;
        }
        return projectComponents.filter(
            comp =>
                comp.componentName.toLowerCase().includes(lowerCaseQuery) ||
                (comp.componentDescription &&
                    comp.componentDescription.toLowerCase().includes(lowerCaseQuery))
        );
    }
}

export default DrawingManager;
