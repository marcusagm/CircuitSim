import Tool from './Tool.js';
import Component from '../components/Component.js';
import Line from '../shapes/Line.js';
import Wire from '../components/Wire.js';
import ImageShape from '../shapes/Image.js';
import SVGDrawing from '../shapes/SVGDrawing.js';
import TextBox from '../shapes/TextBox.js';
import Point from '../shapes/Point.js';

/**
 * Description:
 *  Tool for editing the properties of the currently selected shapes.
 *
 * Properties summary:
 *  - canvas {import('../core/Canvas.js').default} : Canvas instance (inherited).
 *  - drawingManager {import('../core/DrawingManager.js').default} : Drawing manager (inherited).
 *
 * Typical usage:
 *   const tool = new PropertiesTool(canvas, drawingManager);
 *   tool.activate(); // Opens property prompts for all selected shapes
 *
 * Notes / Additional:
 *  - This is a "command tool" that runs immediately when activated; it does not react to mouse moves.
 *  - Edits are applied via each shape's public edit() to ensure setters/validation run.
 */
export default class PropertiesTool extends Tool {
    /**
     * Creates an instance of PropertiesTool.
     *
     * @param {import('../core/Canvas.js').default} canvas - The canvas instance.
     * @param {import('../core/DrawingManager.js').default} drawingManager - The drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    /**
     * Activate the tool by prompting property edits on all selected shapes.
     *
     * @returns {void}
     */
    activate() {
        // This tool is usually activated programmatically (e.g., by a button click)
        // rather than by setting it as the active tool for mouse events.
        // It's a command tool.

        this.editSelectedShapesProperties();
    }

    /**
     * Deactivate the tool.
     *
     * @returns {void}
     */
    deactivate() {
        // No action required for this command-style tool.
    }

    /**
     * Open prompts to edit the properties of the selected shapes and apply edits via edit().
     *
     * @returns {void}
     */
    editSelectedShapesProperties() {
        const me = this;
        const selectedShapes = me.drawingManager.getAllSelectedElements();

        if (!Array.isArray(selectedShapes) || selectedShapes.length === 0) {
            console.warn('[PropertiesTool] No shapes selected for editing.');
            return;
        }

        selectedShapes.forEach(shape => {
            const propertiesToEdit = {};
            const shapeName = shape.constructor.name;

            // --- Common properties ---

            // Stroke / color
            if ('strokeColor' in shape) {
                const newColor = prompt(
                    `[${shapeName}] Edit stroke color (current: ${shape.strokeColor}):`,
                    shape.strokeColor
                );
                if (newColor !== null) propertiesToEdit.strokeColor = newColor;
            } else if ('color' in shape) {
                const newColor = prompt(
                    `[${shapeName}] Edit color (current: ${shape.color}):`,
                    shape.color
                );
                if (newColor !== null) propertiesToEdit.color = newColor;
            }

            // Stroke / line width
            if ('strokeWidth' in shape) {
                const newWidth = prompt(
                    `[${shapeName}] Edit stroke width (current: ${shape.strokeWidth}):`,
                    shape.strokeWidth
                );
                if (newWidth !== null) {
                    const widthVal = parseFloat(newWidth);
                    if (!isNaN(widthVal)) propertiesToEdit.strokeWidth = widthVal;
                }
            } else if ('lineWidth' in shape) {
                const newWidth = prompt(
                    `[${shapeName}] Edit line width (current: ${shape.lineWidth}):`,
                    shape.lineWidth
                );
                if (newWidth !== null) {
                    const widthVal = parseFloat(newWidth);
                    if (!isNaN(widthVal)) propertiesToEdit.lineWidth = widthVal;
                }
            }

            // Fill color
            if ('fillColor' in shape) {
                const newFillColor = prompt(
                    `[${shapeName}] Edit fill color (leave empty for none, current: ${shape.fillColor || ''}):`,
                    shape.fillColor || ''
                );
                if (newFillColor !== null)
                    propertiesToEdit.fillColor = newFillColor === '' ? null : newFillColor;
            }

            // Line dash pattern
            if ('lineDash' in shape) {
                const newLineDashStr = prompt(
                    `[${shapeName}] Edit line dash pattern (e.g., 5,5 for dashed, leave empty for solid):`,
                    Array.isArray(shape.lineDash) ? shape.lineDash.join(',') : ''
                );
                if (newLineDashStr !== null) {
                    const newLineDash = newLineDashStr
                        .split(',')
                        .map(s => parseFloat(s.trim()))
                        .filter(n => !Number.isNaN(n) && n > 0);
                    propertiesToEdit.lineDash = newLineDash;
                }
            }

            // --- Specific properties by shape type ---

            if (shape instanceof Component) {
                // Parameters (JSON)
                if ('parameters' in shape) {
                    const currentParams = JSON.stringify(shape.parameters, null, 2);
                    const newParams = prompt(
                        `[${shapeName}] Edit parameters (JSON):`,
                        currentParams
                    );
                    if (newParams !== null) {
                        try {
                            propertiesToEdit.parameters = JSON.parse(newParams);
                        } catch (e) {
                            console.warn(`[${shapeName}] Invalid JSON for parameters.`);
                        }
                    }
                }

                // Rotation
                const newRotation = prompt(
                    `[${shapeName}] Edit rotation (degrees):`,
                    shape.rotation
                );
                if (newRotation !== null) {
                    const rotationVal = parseFloat(newRotation);
                    if (!isNaN(rotationVal)) propertiesToEdit.rotation = rotationVal;
                }

                // Flip options
                propertiesToEdit.flipHorizontal = confirm(
                    `[${shapeName}] Flip horizontally? (current: ${shape.flipHorizontal})`
                );
                propertiesToEdit.flipVertical = confirm(
                    `[${shapeName}] Flip vertically? (current: ${shape.flipVertical})`
                );
            } else if (shape instanceof TextBox) {
                const newText = prompt(`[${shapeName}] Edit text:`, shape.text);
                const newFontSize = prompt(`[${shapeName}] Edit font size:`, shape.fontSize);
                const newFontFamily = prompt(`[${shapeName}] Edit font family:`, shape.fontFamily);
                if (newText !== null) propertiesToEdit.text = newText;
                if (newFontSize !== null) {
                    const sizeVal = parseFloat(newFontSize);
                    if (!isNaN(sizeVal)) propertiesToEdit.fontSize = sizeVal;
                }
                if (newFontFamily !== null) propertiesToEdit.fontFamily = newFontFamily;
            } else if (shape instanceof ImageShape) {
                const newImageUrl = prompt(`[${shapeName}] Edit image URL:`, shape.imageUrl);
                if (newImageUrl !== null) propertiesToEdit.imageUrl = newImageUrl;
            } else if (shape instanceof SVGDrawing) {
                const newSvgContent = prompt(`[${shapeName}] Edit SVG content:`, shape.svgContent);
                if (newSvgContent !== null) propertiesToEdit.svgContent = newSvgContent;
            } else if (shape instanceof Point) {
                const newRadius = prompt(`[${shapeName}] Edit point radius:`, shape.radius);
                if (newRadius !== null) {
                    const radiusVal = parseFloat(newRadius);
                    if (!isNaN(radiusVal)) propertiesToEdit.radius = radiusVal;
                }
            }

            // Apply edits through shape.edit() so setters validate/coerce
            if (Object.keys(propertiesToEdit).length > 0) {
                try {
                    shape.edit(propertiesToEdit);
                } catch (err) {
                    console.error(`[PropertiesTool] Failed to apply edits to ${shapeName}:`, err);
                }
            }
        });

        me.canvas.requestRender();
    }

    /**
     * Placeholder for mouse down event.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseDown(event) {
        // Tool does not handle mouse events directly.
    }

    /**
     * Placeholder for mouse move event.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseMove(event) {
        // Tool does not handle mouse events directly.
    }

    /**
     * Placeholder for mouse up event.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onMouseUp(event) {
        // Tool does not handle mouse events directly.
    }

    /**
     * Placeholder for context menu (right-click) event.
     *
     * @param {MouseEvent} event - The mouse event.
     * @returns {void}
     */
    onContextMenu(event) {
        // Tool does not handle context menu directly.
    }

    /**
     * Placeholder for key down event.
     *
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {void}
     */
    onKeyDown(event) {
        // Tool does not handle key events directly.
    }
}
