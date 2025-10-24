import Tool from './Tool.js';
import TextBox from '../shapes/TextBox.js';
import ImageShape from '../shapes/Image.js';
import SVGDrawing from '../shapes/SVGDrawing.js';
import Wire from '../components/Wire.js';
import Component from '../components/Component.js';
import Point from '../shapes/Point.js';
import Line from '../shapes/Line.js';
import Freehand from '../shapes/Freehand.js';
import ThreePointCurve from '../shapes/ThreePointCurve.js';
import BezierCurve from '../shapes/BezierCurve.js';
import Rectangle from '../shapes/Rectangle.js';
import Circle from '../shapes/Circle.js';

/**
 * Description:
 *  Tool to edit properties of selected elements on the canvas.
 *  Prompts the user for new values such as stroke color, fill color, text content,
 *  font size/family, image URL, SVG content, and component-specific parameters.
 *
 * Properties summary:
 *  - canvas {import("../core/Canvas.js").default} : Reference to the canvas.
 *  - drawingManager {import("../core/DrawingManager.js").default} : Reference to the drawing manager.
 *
 * Typical usage:
 *  const tool = new PropertiesTool(canvasInstance, drawingManager);
 *
 * Notes / Additional:
 *  - All input values are validated before assignment.
 *  - All changes are applied via the element's `edit()` method.
 *  - Mouse move and mouse up events are no-op for this tool.
 */
export default class PropertiesTool extends Tool {
    /**
     * Creates an instance of PropertiesTool.
     *
     * @param {import("../core/Canvas.js").default} canvas - Canvas instance.
     * @param {import("../core/DrawingManager.js").default} drawingManager - Drawing manager instance.
     */
    constructor(canvas, drawingManager) {
        super(canvas, drawingManager);
    }

    /**
     * Activates the tool.
     * No operation required for this tool.
     */
    activate() {}

    /**
     * Deactivates the tool.
     * No operation required for this tool.
     */
    deactivate() {}

    /**
     * Handles mouse down events and triggers property editing for the clicked element.
     *
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseDown(event) {
        const me = this;
        const { x, y } = me.getMouseCoords(event);
        const clickedElement = me.drawingManager.findElementAt(x, y);

        if (!clickedElement) return;

        const newProperties = {};

        // COMMON STROKE AND LINE PROPERTIES
        if (clickedElement.strokeColor !== undefined) {
            const newStrokeColor = prompt(
                'New stroke color (e.g., #FF0000 or red):',
                clickedElement.strokeColor
            );
            if (newStrokeColor !== null) newProperties.strokeColor = newStrokeColor;
        }

        if (clickedElement.color !== undefined) {
            const newColor = prompt(
                'New stroke color (e.g., #FF0000 or red):',
                clickedElement.color
            );
            if (newColor !== null) newProperties.color = newColor;
        }

        if (clickedElement.lineWidth !== undefined) {
            const newLineWidth = prompt('New line width:', clickedElement.lineWidth);
            if (newLineWidth !== null) {
                const parsedWidth = parseFloat(newLineWidth);
                if (!isNaN(parsedWidth) && parsedWidth > 0) {
                    newProperties.lineWidth = parsedWidth;
                } else {
                    console.warn(
                        `[PropertiesTool] Invalid lineWidth value (${newLineWidth}). Skipping.`
                    );
                }
            }
        }

        if (clickedElement.lineDash !== undefined) {
            const newLineDashStr = prompt(
                'New line dash pattern (comma-separated, e.g., 5,5 for dashed, empty for solid):',
                clickedElement.lineDash.join(',')
            );
            if (newLineDashStr !== null) {
                newProperties.lineDash = newLineDashStr
                    .split(',')
                    .map(s => parseFloat(s.trim()))
                    .filter(n => !isNaN(n) && n >= 0);
            }
        }

        // SHAPE-SPECIFIC PROPERTIES
        if (clickedElement instanceof TextBox) {
            const newTextContent = prompt('New text content:', clickedElement.textContent);
            const newFontSize = prompt('New font size (e.g., 16px):', clickedElement.fontSize);
            const newFontFamily = prompt(
                'New font family (e.g., Arial):',
                clickedElement.fontFamily
            );
            const newFillColor = prompt('New fill color:', clickedElement.fillColor);

            if (newTextContent !== null) newProperties.textContent = newTextContent;
            if (newFontSize !== null) newProperties.fontSize = newFontSize;
            if (newFontFamily !== null) newProperties.fontFamily = newFontFamily;
            if (newFillColor !== null) newProperties.fillColor = newFillColor;
        } else if (clickedElement instanceof ImageShape) {
            const newImageUrl = prompt('New image URL:', clickedElement.imageUrl);
            if (newImageUrl !== null) newProperties.imageUrl = newImageUrl;
        } else if (clickedElement instanceof SVGDrawing) {
            const newSvgContent = prompt('New SVG content:', clickedElement.svgContent);
            if (newSvgContent !== null) newProperties.svgContent = newSvgContent;
        } else if (clickedElement instanceof Point) {
            const newRadius = prompt('New point radius:', clickedElement.radius);
            const newFillColor = prompt('New fill color:', clickedElement.fillColor);
            if (newRadius !== null) {
                const parsedRadius = parseFloat(newRadius);
                if (!isNaN(parsedRadius) && parsedRadius > 0) {
                    newProperties.radius = parsedRadius;
                } else {
                    console.warn(`[PropertiesTool] Invalid radius value (${newRadius}). Skipping.`);
                }
            }
            if (newFillColor !== null) newProperties.fillColor = newFillColor;
        } else if (clickedElement instanceof Rectangle || clickedElement instanceof Circle) {
            const newFillColor = prompt('New fill color:', clickedElement.fillColor);
            if (newFillColor !== null) newProperties.fillColor = newFillColor;
        } else if (clickedElement instanceof Component) {
            const newComponentName = prompt('New component name:', clickedElement.componentName);
            const newComponentDescription = prompt(
                'New component description:',
                clickedElement.componentDescription
            );
            const newLogicScriptPath = prompt(
                'New logic script path:',
                clickedElement.logicScriptPath
            );
            const newParametersJson = prompt(
                'Edit parameters (JSON format):',
                JSON.stringify(clickedElement.parameters)
            );

            if (newComponentName !== null) newProperties.componentName = newComponentName;
            if (newComponentDescription !== null)
                newProperties.componentDescription = newComponentDescription;
            if (newLogicScriptPath !== null) newProperties.logicScriptPath = newLogicScriptPath;

            if (newParametersJson !== null) {
                try {
                    newProperties.parameters = JSON.parse(newParametersJson);
                } catch (error) {
                    alert('Invalid JSON for parameters. Please enter valid JSON.');
                    console.error('[PropertiesTool] Invalid JSON for parameters:', error);
                }
            }
        }

        // APPLY COLLECTED PROPERTIES
        if (Object.keys(newProperties).length > 0) {
            clickedElement.edit(newProperties);
            me.canvas.requestRender();
        }
    }

    /**
     * Handles mouse move events.
     * No operation for this tool.
     *
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseMove(event) {
        // No operation
    }

    /**
     * Handles mouse up events.
     * No operation for this tool.
     *
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseUp(event) {
        // No operation
    }
}
