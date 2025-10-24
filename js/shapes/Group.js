/**
 * @fileoverview Represents a group of drawable elements on the canvas.
 * This composite shape allows multiple elements to be treated as a single unit for operations like moving, rotating, and resizing.
 */

import Shape from './Shape.js';

class Group extends Shape {
    /**
     * Constructs an instance of Group.
     * @param {Array<Shape>} children - An array of Shape objects to be included in the group.
     */
    constructor(children = []) {
        // Calculate initial bounding box for the group
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        children.forEach(child => {
            const bounds = child.getBounds(); // Assuming shapes have a getBounds method
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        super(minX, minY, maxX - minX, maxY - minY);

        /**
         * The array of child Shape objects within this group.
         * @type {Array<Shape>}
         */
        this.children = children;

        // Adjust children positions relative to the group's origin
        this.children.forEach(child => {
            child.x -= this.x;
            child.y -= this.y;
        });
    }

    /**
     * Draws the group and all its child elements on the canvas.
     * @param {Canvas} canvas - The canvas instance to draw on.
     * @returns {void}
     */
    draw(canvas) {
        canvas.save();
        canvas.context.translate(this.x, this.y);
        // Apply group-level transformations if any (e.g., rotation, scale)

        this.children.forEach(child => {
            child.draw(canvas);
        });

        if (this.isSelected) {
            this.drawSelectionHandles(canvas);
        }

        canvas.restore();
    }

    /**
     * Checks if the group or any of its children are hit by the given coordinates.
     * @param {number} coordinateX - The X coordinate to check.
     * @param {number} coordinateY - The Y coordinate to check.
     * @returns {boolean} True if the group or a child is hit, false otherwise.
     */
    isHit(coordinateX, coordinateY) {
        // Transform coordinates to group's local space
        const localX = coordinateX - this.x;
        const localY = coordinateY - this.y;

        for (const child of this.children) {
            if (child.isHit(localX, localY)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Moves the group and all its child elements by the specified delta.
     * @param {number} deltaX - The change in X coordinate.
     * @param {number} deltaY - The change in Y coordinate.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
        // Children positions are relative, so only group's position needs update
    }

    /**
     * Rotates the group and its children around its center.
     * @param {number} angleDegrees - The angle to rotate in degrees.
     * @returns {void}
     */
    rotate(angleDegrees) {
        // This is more complex for a group. For now, we'll just rotate the bounding box.
        // A full implementation would involve rotating each child around the group's center.
        // For simplicity, we'll update the group's internal rotation state and let children handle their own rotation relative to the group.
        console.warn(
            'Group rotation is not fully implemented for individual child rotation. Only bounding box might update.'
        );
        // Placeholder for actual rotation logic
    }

    /**
     * Flips the group and its children horizontally.
     * @returns {void}
     */
    flipHorizontal() {
        // This is more complex for a group. For now, we'll just flip the bounding box.
        // A full implementation would involve flipping each child relative to the group's center Y-axis.
        console.warn(
            'Group horizontal flip is not fully implemented for individual child flipping.'
        );
        // Placeholder for actual flip logic
    }

    /**
     * Flips the group and its children vertically.
     * @returns {void}
     */
    flipVertical() {
        // This is more complex for a group. For now, we'll just flip the bounding box.
        // A full implementation would involve flipping each child relative to the group's center X-axis.
        console.warn('Group vertical flip is not fully implemented for individual child flipping.');
        // Placeholder for actual flip logic
    }

    /**
     * Clones the group and all its child elements.
     * @returns {Group} A new Group instance with cloned children.
     */
    clone() {
        const clonedChildren = this.children.map(child => child.clone());
        const newGroup = new Group(clonedChildren);
        newGroup.x = this.x;
        newGroup.y = this.y;
        newGroup.width = this.width;
        newGroup.height = this.height;
        return newGroup;
    }

    /**
     * Edits the properties of the group. Currently, groups do not have specific editable properties beyond position and dimensions.
     * @param {Object} properties - An object containing properties to update.
     * @returns {void}
     */
    edit(properties) {
        // For now, groups don't have specific editable properties like color or line style.
        // Future implementation might allow editing properties of all children simultaneously.
        console.warn(
            'Edit method for Group is not fully implemented to propagate properties to children.'
        );
    }

    /**
     * Checks if the group is within the specified area.
     * @param {number} minX - The minimum X coordinate of the area.
     * @param {number} minY - The minimum Y coordinate of the area.
     * @param {number} maxX - The maximum X coordinate of the area.
     * @param {number} maxY - The maximum Y coordinate of the area.
     * @returns {boolean} True if the group is within the area, false otherwise.
     */
    isWithinArea(minX, minY, maxX, maxY) {
        // Check if any part of the group's bounding box is within the selection area
        const groupMinX = this.x;
        const groupMinY = this.y;
        const groupMaxX = this.x + this.width;
        const groupMaxY = this.y + this.height;

        return groupMinX < maxX && groupMaxX > minX && groupMinY < maxY && groupMaxY > minY;
    }

    /**
     * Draws selection handles for the group.
     * @param {Canvas} canvas - The canvas instance to draw on.
     * @returns {void}
     */
    drawSelectionHandles(canvas) {
        canvas.save();
        canvas.setStrokeColor('#00F');
        canvas.setStrokeWidth(1);
        canvas.setStrokeDash([5, 5]);
        canvas.rectangle(0, 0, this.width, this.height); // Draw relative to group's origin
        canvas.context.stroke();
        canvas.restore();
    }

    /**
     * Selects the group.
     * @returns {void}
     */
    select() {
        super.select();
        this.children.forEach(child => child.select()); // Optionally select children too
    }

    /**
     * Deselects the group.
     * @returns {void}
     */
    deselect() {
        super.deselect();
        this.children.forEach(child => child.deselect()); // Optionally deselect children too
    }
}

export default Group;
