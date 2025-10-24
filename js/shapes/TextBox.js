/**
 * TextBox shape
 * Draws multi-line text within a constrained width with simple word-wrapping.
 *
 * Extends the base Shape class to provide specific drawing and interaction logic for text boxes.
 */
import Shape from './Shape.js';
import HandleBox from '../components/HandleBox.js';

export default class TextBox extends Shape {
    /**
     * The text content of the box.
     * @type {string}
     */
    textContent = null;

    /**
     * The width of the text box. Can be explicitly set or dynamically calculated.
     * @type {number}
     */
    width = 0;

    /**
     * The height of the text box. Can be explicitly set or dynamically calculated.
     * @type {number}
     */
    height = 0;

    /**
     * Background color of the text box
     * @type {string}
     */
    fillColor = 'transparent';

    /**
     * Border color
     * @type {string}
     */
    strokeColor = '#000000';

    /**
     *  Border thickness
     * @type {string}
     */
    strokeWidth = 1;

    /**
     * Text color
     * @type {string}
     */
    textColor = '#000000';

    /**
     * Font size in pixels
     * @type {string}
     */
    fontSize = 16;

    /**
     * Font family
     * @type {string}
     */
    fontFamily = 'Arial';

    /**
     * Line height multiplier for text wrapping
     * @type {string}
     */
    lineHeight = 1.2;

    /**
     * The line dash pattern for the shape's stroke (e.g., [5, 5] for dashed line).
     * An empty array means a solid line.
     * @type {number[]}
     */
    lineDash = [];

    /**
     * Offset for the line dash pattern
     * @type {string}
     */
    lineDashOffset = 0;

    /**
     * Vertical alignment of text baseline (e.g. 'top').
     * @type {string}
     */
    textBaseline = 'top';

    /**
     * Horizontal alignment of text: 'left' | 'right' | 'center' | 'justify'
     * @type {string}
     */
    textAlign = 'left';

    /**
     * Text rendering hint
     * @type {string}
     */
    textRendering = 'auto';

    /**
     * Spacing between words (string accepted by your Canvas API, kept for compatibility)
     * @type {string}
     */
    wordSpacing = '0px';

    /**
     * If true, broken words will append hyphenChar when split across lines.
     * @type {boolean}
     */
    hyphenate = false;

    /**
     * Character used when hyphenating broken words.
     * @type {string}
     */
    hyphenChar = '-';

    /**
     * Text direction
     * @type {string}
     */
    direction = 'ltr';

    /**
     * Padding around text (in pixels)
     * @type {number}
     */
    padding = 10;

    /**
     * Indent in pixels for the first line of each paragraph.
     * @type {number}
     */
    firstLineIndent = 0;

    /**
     * Indent in pixels for subsequent lines of each paragraph.
     * @type {number}
     */
    restIndent = 0;

    /**
     * Internal cached lines produced by last layout.
     * @type {string[]}
     */
    _lines = [];

    /**
     * Creates an instance of TextBox.
     *
     * @param {number} positionX - The X coordinate of the top-left corner of the text box.
     * @param {number} positionY - The Y coordinate of the top-left corner of the text box.
     * @param {string} textContent - The text content of the box.
     * @param {number} [width=0] - The initial width of the text box. If 0, it will be calculated based on text.
     * @param {number} [height=0] - The initial height of the text box. If 0, it will be calculated based on text.
     */
    constructor(positionX, positionY, textContent, width = 0, height = 0) {
        super(positionX, positionY);

        const me = this;

        me.textContent = textContent;
        me.width = width;
        me.height = height;
    }

    /**
     * Draws the text box on the given canvas context.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {void}
     */
    draw(canvas) {
        const me = this;

        // configure font & metrics on the canvas before layout
        canvas
            .setStrokeDash(me.lineDash)
            .setStrokeDashOffset(me.lineDashOffset)
            .setFont(me.fontSize + 'px ' + me.fontFamily)
            .setTextAlign(me.textAlign)
            .setTextBaseline(me.textBaseline);

        // layout lines and get text height
        const layoutResult = me.layoutLines(canvas);
        const wrappedLines = layoutResult.lines;
        const computedBoxHeight = layoutResult.boxHeight;

        // calculate actual box width: if explicit width use it, otherwise compute from lines
        const actualBoxWidth =
            me.width > 0
                ? me.width
                : Math.max(me.getMaxLineWidth(canvas, wrappedLines) + me.padding * 2, 0);

        // calculate actual box height: if explicit height use it, otherwise use computed box height
        const actualBoxHeight = me.height > 0 ? me.height : computedBoxHeight;

        // Draw background
        canvas.rectangle(me.positionX, me.positionY, actualBoxWidth, actualBoxHeight);
        if (me.fillColor !== 'transparent') {
            canvas.setFillColor(me.fillColor).fill();
        }
        if (me.strokeColor !== 'transparent' || me.strokeWidth === 0) {
            canvas.setStrokeColor(me.strokeColor).setStrokeWidth(me.strokeWidth).stroke();
        }

        // Draw text
        canvas
            .setFillColor(me.textColor)
            .setTextRendering(me.textRendering)
            .setDirection(me.direction)
            .setWordSpacing(me.wordSpacing);

        const startingX = me.positionX + me.padding;
        // let currentBaselineY = me.positionY + me.padding + (me.fontSize * me.lineHeight) / 2;
        let currentBaselineY = me.positionY + me.padding;
        const maximumTextWidth = actualBoxWidth - me.padding * 2;

        for (const lineText of wrappedLines) {
            canvas.fillText(lineText, startingX, currentBaselineY, maximumTextWidth);
            currentBaselineY += me.fontSize * me.lineHeight;
        }

        canvas.restore();

        if (me.isSelected) {
            me.drawSelectionHandles(canvas);
        }
    }

    /**
     * Find the largest prefix length (characters) of inputString that fits into maxWidth (pixels).
     * Uses binary search and reads width from canvas.measureText(...).width
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string} inputString - Input string to test.
     * @param {number} maxWidth - Maximum width in pixels.
     * @returns {number} Number of characters from start of inputString that fit (0 if none).
     */
    largestPrefixThatFits(canvas, inputString, maxWidth) {
        let lowerBound = 1;
        let upperBound = inputString.length;
        let bestFitLength = 0;

        while (lowerBound <= upperBound) {
            const middle = Math.floor((lowerBound + upperBound) / 2);
            const candidate = inputString.slice(0, middle);
            const candidateWidth = canvas.measureText(candidate).width;
            if (candidateWidth <= maxWidth) {
                bestFitLength = middle;
                lowerBound = middle + 1;
            } else {
                upperBound = middle - 1;
            }
        }

        return bestFitLength;
    }

    /**
     * Return an approximation string of spaces whose rendered width is approximately targetWidth.
     * This uses repeated ' ' characters measured via canvasContext.measureText.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} targetWidth - Target width in pixels.
     * @returns {string} A string containing repeated spaces.
     */
    spacesForWidth(canvas, targetWidth) {
        const singleSpaceWidth = Math.max(1, canvas.measureText(' ')).width;
        const spaceCount = Math.max(0, Math.round(targetWidth / singleSpaceWidth));
        return ' '.repeat(spaceCount);
    }

    /**
     * Justify a line by distributing extra space between words.
     * Expects lineTokens array which alternates words and space tokens (e.g. ['word','  ','word', ...]).
     * Returns a single string with additional spaces approximated to fill availableWidth.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string[]} lineTokens - Tokens (words and space tokens) that compose the line.
     * @param {number} availableWidth - Pixel width available for the text (indent already accounted).
     * @returns {string} Justified line string.
     */
    justifyLineTokens(canvas, lineTokens, availableWidth) {
        const me = this;

        const words = [];
        for (let index = 0; index < lineTokens.length; index++) {
            const token = lineTokens[index];
            if (!/^\s+$/.test(token)) {
                words.push(token);
            }
        }

        if (words.length <= 1) {
            return lineTokens.join('');
        }

        let wordsTotalWidth = 0;
        for (const word of words) {
            wordsTotalWidth += me.measureText(word).width;
        }

        const gapCount = words.length - 1;
        const extraPixelsToDistribute = Math.max(0, availableWidth - wordsTotalWidth);

        const pixelsPerGap = Math.floor(extraPixelsToDistribute / gapCount);
        const remainderPixels = extraPixelsToDistribute - pixelsPerGap * gapCount;

        // build result by iterating words and inserting computed spaces between them
        let resultString = '';
        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
            resultString += words[wordIndex];
            if (wordIndex < gapCount) {
                const extraForThisGap = pixelsPerGap + (wordIndex < remainderPixels ? 1 : 0);
                const gapSpaceString = me.spacesForWidth(canvas, extraForThisGap);
                resultString += gapSpaceString.length > 0 ? gapSpaceString : ' ';
            }
        }

        return resultString;
    }

    /**
     * Align a single line (left / right / center).
     * This method returns a new string where leading spaces are added to approximate the alignment.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string} lineText - The line text (without indent).
     * @param {number} availableWidth - Width available for the text in pixels.
     * @returns {string} Aligned line string (leading spaces possible).
     */
    alignLineText(canvas, lineText, availableWidth) {
        const me = this;
        const measuredWidth = canvas.measureText(lineText);
        if (measuredWidth >= availableWidth || me.textAlign === 'left') {
            return lineText;
        }

        const extraSpacePixels = availableWidth - measuredWidth;

        if (me.textAlign === 'right') {
            return me.spacesForWidth(canvas, extraSpacePixels) + lineText;
        }

        if (me.textAlign === 'center') {
            const leftPaddingPixels = Math.floor(extraSpacePixels / 2);
            return me.spacesForWidth(canvas, leftPaddingPixels) + lineText;
        }

        // for anything else (including 'justify' fallback), return as-is
        return lineText;
    }

    /**
     * Calculate maximum width (in pixels) among provided lines.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string[]} lines - Array of line strings.
     * @returns {number} Maximum width in pixels.
     */
    getMaxLineWidth(canvas, lines) {
        let maximumWidth = 0;
        for (const line of lines) {
            const lineWidth = canvas.measureText(line).width;
            if (lineWidth > maximumWidth) {
                maximumWidth = lineWidth;
            }
        }
        return maximumWidth;
    }

    /**
     * Return true if token is whitespace sequence.
     * @param {string} token
     * @returns {boolean}
     */
    tokenIsSpace(token) {
        return /^\s+$/.test(token);
    }

    /**
     * Measure width of a space token.
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string} token
     * @returns {number}
     */
    spaceTokenWidth(canvas, token) {
        return canvas.measureText(token).width;
    }

    /**
     * Measure width of a word token.
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string} token
     * @returns {number}
     */
    wordTokenWidth(canvas, token) {
        return canvas.measureText(token).width;
    }

    /**
     * Try to append a space token to the current line.
     * Returns true if token was consumed (appended or skipped), false if it should remain for next line.
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string} token
     * @param {Array<string>} lineTokens
     * @param {number} lineWidth
     * @param {number} availableTextWidthForThisLine
     * @returns {{consumed:boolean, newLineWidth:number}}
     */
    appendSpaceTokenToLine(canvas, token, lineTokens, lineWidth, availableTextWidthForThisLine) {
        // preserves leading spaces if they fit; otherwise skip leading space
        if (lineTokens.length === 0) {
            const tokenW = this.spaceTokenWidth(canvas, token);
            if (tokenW > availableTextWidthForThisLine) {
                // skip leading space that doesn't fit
                return { consumed: true, newLineWidth: lineWidth };
            }
            lineTokens.push(token);
            return { consumed: true, newLineWidth: lineWidth + tokenW };
        }

        const tokenW = this.spaceTokenWidth(canvas, token);
        if (lineWidth + tokenW <= availableTextWidthForThisLine) {
            lineTokens.push(token);
            return { consumed: true, newLineWidth: lineWidth + tokenW };
        }

        // cannot append this space to a non-empty line
        return { consumed: false, newLineWidth: lineWidth };
    }

    /**
     * Try to append a word token to the current line.
     * Returns an object describing actions: consumed(boolean), newLineWidth(number), partRemaining(string|null)
     * If consumed = true and partRemaining is non-null: the original token was split and partRemaining is the leftover token.
     * If consumed = false: caller should finish current line and retry token on next line.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string} token
     * @param {Array<string>} lineTokens
     * @param {number} lineWidth
     * @param {number} availableTextWidthForThisLine
     * @returns {{consumed:boolean, newLineWidth:number, partRemaining:string|null}}
     */
    appendWordTokenToLine(canvas, token, lineTokens, lineWidth, availableTextWidthForThisLine) {
        // if token fits fully or line is empty (we allow first token to force fit check)
        const tokenW = this.wordTokenWidth(canvas, token);
        if (lineWidth + tokenW <= availableTextWidthForThisLine || lineTokens.length === 0) {
            lineTokens.push(token);
            return { consumed: true, newLineWidth: lineWidth + tokenW, partRemaining: null };
        }

        // token does not fit in remaining space and line not empty -> do not consume
        if (lineTokens.length > 0) {
            return { consumed: false, newLineWidth: lineWidth, partRemaining: null };
        }

        // line is empty and token is too long -> break token
        const fitLength =
            this.largestPrefixThatFits(canvas, token, availableTextWidthForThisLine) || 1;
        const isLastPart = fitLength >= token.length;
        let part = token.slice(0, fitLength);
        if (this.hyphenate && !isLastPart) part += this.hyphenChar;

        // ensure part fits (defensive)
        if (canvas.measureText(part).width > availableTextWidthForThisLine && part.length > 1) {
            let reduceTo = part.length - 1;
            while (
                reduceTo > 0 &&
                canvas.measureText(part.slice(0, reduceTo)).width > availableTextWidthForThisLine
            ) {
                reduceTo--;
            }
            part = reduceTo <= 0 ? token.slice(0, 1) : token.slice(0, reduceTo);
        }

        lineTokens.push(part);
        const newLineWidth = lineWidth + canvas.measureText(part).width;
        const leftover = fitLength < token.length ? token.slice(fitLength) : null;
        return { consumed: true, newLineWidth, partRemaining: leftover };
    }

    /**
     * Finalize a built line: apply alignment/justification (if finite width) and prefix indent spaces.
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {Array<string>} lineTokens
     * @param {boolean} isLastLineOfParagraph
     * @param {number} availableTextWidthForThisLine
     * @param {number} indentPixelsForThisLine
     * @returns {string} finalized line string
     */
    finalizeLineAndPush(
        canvas,
        lineTokens,
        isLastLineOfParagraph,
        availableTextWidthForThisLine,
        indentPixelsForThisLine
    ) {
        const me = this;
        let rawLine = lineTokens.join('');

        if (
            me.textAlign === 'justify' &&
            !isLastLineOfParagraph &&
            availableTextWidthForThisLine !== Infinity
        ) {
            rawLine = me.justifyLineTokens(canvas, lineTokens, availableTextWidthForThisLine);
        } else if (me.textAlign !== 'justify' && availableTextWidthForThisLine !== Infinity) {
            rawLine = me.alignLineText(canvas, rawLine, availableTextWidthForThisLine);
        }

        const indentString = me.spacesForWidth(canvas, indentPixelsForThisLine);
        return indentString + rawLine;
    }

    /**
     * Wrap a single paragraph into lines. Delegates branching to small helpers to keep complexity low.
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {string} paragraphText
     * @param {number} baseAvailableTextWidth
     * @param {boolean} explicitWidthWasProvided
     * @returns {string[]} array of wrapped lines for this paragraph
     */
    wrapParagraphIntoLines(
        canvas,
        paragraphText,
        baseAvailableTextWidth,
        explicitWidthWasProvided
    ) {
        const me = this;
        const tokens = paragraphText.match(/(\s+|\S+)/g) || [];
        if (tokens.length === 0) return [''];

        const paragraphLines = [];
        let tokenIndex = 0;
        let isFirstLineInParagraph = true;

        while (tokenIndex < tokens.length) {
            const indentPixelsForThisLine = isFirstLineInParagraph
                ? me.firstLineIndent
                : me.restIndent;
            const availableTextWidthForThisLine = explicitWidthWasProvided
                ? Math.max(0, baseAvailableTextWidth - indentPixelsForThisLine)
                : Infinity;

            const lineTokens = [];
            let lineWidth = 0;

            while (tokenIndex < tokens.length) {
                const token = tokens[tokenIndex];

                if (this.tokenIsSpace(token)) {
                    const { consumed, newLineWidth } = this.appendSpaceTokenToLine(
                        canvas,
                        token,
                        lineTokens,
                        lineWidth,
                        availableTextWidthForThisLine
                    );

                    if (consumed) {
                        lineWidth = newLineWidth;
                        tokenIndex++;
                        continue;
                    }

                    // space not consumed -> finish line
                    break;
                }

                // token is a word
                const appendResult = this.appendWordTokenToLine(
                    canvas,
                    token,
                    lineTokens,
                    lineWidth,
                    availableTextWidthForThisLine
                );

                if (appendResult.consumed) {
                    lineWidth = appendResult.newLineWidth;
                    if (appendResult.partRemaining) {
                        // replace token with leftover part for next iteration
                        tokens[tokenIndex] = appendResult.partRemaining;
                    } else {
                        tokenIndex++;
                    }
                    // after appending a word (or part), finish line if it was a broken word
                    if (appendResult.partRemaining) {
                        break;
                    }
                    continue;
                }

                // word not consumed -> finish line
                break;
            } // end inner token loop

            const isLastLineOfParagraph = tokenIndex >= tokens.length;
            const finalized = this.finalizeLineAndPush(
                canvas,
                lineTokens,
                isLastLineOfParagraph,
                availableTextWidthForThisLine,
                indentPixelsForThisLine
            );
            paragraphLines.push(finalized);
            isFirstLineInParagraph = false;
        }

        return paragraphLines;
    }

    /**
     * Wraps the current textContent into lines respecting the width, indentation, alignment,
     * preserving multiple spaces and supporting hyphenation. Returns the wrapped lines
     * and the computed text height and box height (both in pixels).
     *
     * Public API: returns an object { lines: string[], textHeight: number, boxHeight: number }
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @returns {{lines: string[], textHeight: number, boxHeight: number}} Wrapped lines and computed heights in pixels.
     */
    layoutLines(canvas) {
        const me = this;
        const text = (me.textContent || '').toString();
        const explicitBoxWidth = Math.max(0, Number(me.width) || 0);

        if (!text) {
            me._lines = [];
            return { lines: [], textHeight: 0, boxHeight: me.padding * 2 };
        }

        const paragraphArray = text.split(/\r?\n/);
        const wrappedLines = [];
        const explicitWidthWasProvided = explicitBoxWidth > 0;
        const baseAvailableTextWidth = explicitWidthWasProvided
            ? Math.max(0, explicitBoxWidth - me.padding * 2)
            : Infinity;

        for (let p = 0; p < paragraphArray.length; p++) {
            const paragraphText = paragraphArray[p];
            const paragraphLines = me.wrapParagraphIntoLines(
                canvas,
                paragraphText,
                baseAvailableTextWidth,
                explicitWidthWasProvided
            );
            wrappedLines.push(...paragraphLines);
        }

        const lineCount = wrappedLines.length;
        const computedTextHeight = lineCount * me.fontSize * me.lineHeight;
        const computedBoxHeight = computedTextHeight + me.padding * 2;

        me._lines = wrappedLines;
        return {
            lines: wrappedLines,
            textHeight: computedTextHeight,
            boxHeight: computedBoxHeight
        };
    }

    /**
     * Checks if the given coordinates hit the text box.
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     * @param {number} checkingXCoordinate - The X coordinate to check.
     * @param {number} checkingYCoordinate - The Y coordinate to check.
     * @returns {boolean} True if the coordinates hit the text box, false otherwise.
     */
    isHit(canvas, checkingXCoordinate, checkingYCoordinate) {
        const me = this;

        canvas
            .setFillColor(me.textColor)
            .setTextRendering(me.textRendering)
            .setDirection(me.direction)
            .setWordSpacing(me.wordSpacing)
            .setFont(me.fontSize + 'px ' + me.fontFamily)
            .setTextAlign(me.textAlign)
            .setTextBaseline(me.textBaseline);

        const layoutResult = me.layoutLines(canvas);
        const wrappedLines = layoutResult.lines;
        const calculatedTextHeight = layoutResult.textHeight;
        const actualWidth =
            me.width > 0 ? me.width : me.getMaxLineWidth(canvas, wrappedLines) + me.padding * 2;
        const actualHeight = me.height > 0 ? me.height : calculatedTextHeight + me.padding * 2;

        return (
            checkingXCoordinate >= me.positionX &&
            checkingXCoordinate <= me.positionX + actualWidth &&
            checkingYCoordinate >= me.positionY &&
            checkingYCoordinate <= me.positionY + actualHeight
        );
    }

    /**
     * Moves the text box by a given displacement.
     *
     * @param {number} deltaX - The displacement in the X direction.
     * @param {number} deltaY - The displacement in the Y direction.
     * @returns {void}
     */
    move(deltaX, deltaY) {
        super.move(deltaX, deltaY); // Updates positionX, positionY
    }

    /**
     * Edits the properties of the text box.
     *
     * @param {object} newProperties - An object containing new properties to apply (textContent, widthValue, heightValue, fillColor, strokeColor, strokeWidth, textColor, fontSize, fontFamily, lineDash, lineDashOffset, textBaseline, textAlign, textRendering, wordSpacing, direction, lineHeight).
     * @returns {void}
     */
    edit(newProperties) {
        const me = this;
        if (!newProperties || typeof newProperties !== 'object') return;

        const propertySetters = {
            strokeColor: value => (me.strokeColor = value),
            strokeWidth: value => (me.strokeWidth = value),
            lineDash: value => (me.lineDash = value),
            lineDashOffset: value => (me.lineDashOffset = value),
            textContent: value => (me.textContent = value),
            width: value => (me.width = value),
            height: value => (me.height = value),
            fillColor: value => (me.fillColor = value),
            textColor: value => (me.textColor = value),
            fontSize: value => (me.fontSize = value),
            fontFamily: value => (me.fontFamily = value),
            lineHeight: value => (me.lineHeight = value),
            textBaseline: value => (me.textBaseline = value),
            textAlign: value => (me.textAlign = value),
            textRendering: value => (me.textRendering = value),
            wordSpacing: value => (me.wordSpacing = value),
            direction: value => (me.direction = value),
            padding: value => (me.padding = value),
            firstLineIndent: value => (me.firstLineIndent = value),
            restIndent: value => (me.restIndent = value),
            hyphenate: value => (me.hyphenate = value),
            hyphenChar: value => (me.hyphenChar = value)
        };

        for (const key of Object.keys(newProperties)) {
            if (Object.prototype.hasOwnProperty.call(propertySetters, key)) {
                propertySetters[key](newProperties[key]);
            }
        }
    }

    /**
     * Draw selection handles
     *
     * @param {import('../core/Canvas.js').default} canvas - Canvas abstraction used by the project.
     */
    drawSelectionHandles(canvas) {
        const me = this;

        canvas
            .setFillColor(me.textColor)
            .setTextRendering(me.textRendering)
            .setDirection(me.direction)
            .setWordSpacing(me.wordSpacing)
            .setFont(me.fontSize + 'px ' + me.fontFamily)
            .setTextAlign(me.textAlign)
            .setTextBaseline(me.textBaseline);

        const layoutResult = me.layoutLines(canvas);
        const wrappedLines = layoutResult.lines;
        const calculatedTextHeight = layoutResult.textHeight;
        const actualWidth =
            me.width > 0 ? me.width : me.getMaxLineWidth(canvas, wrappedLines) + me.padding * 2;
        const actualHeight = me.height > 0 ? me.height : calculatedTextHeight + me.padding * 2;

        new HandleBox(me.positionX, me.positionY, actualWidth, actualHeight, this, false).draw(
            canvas
        );
    }
}
