/**
 * ShortcutManager
 *
 * Manages keyboard shortcuts, allowing you to associate functions with key combinations.
 * Supports registering, updating, removing, and listing shortcuts, and triggers callbacks when shortcuts are activated.
 *
 * Usage example:
 * ```javascript
 * const manager = new ShortcutManager(window);
 * manager.register('saveShortcut', ['Control', 'S'], (event) => { console.log('Save!'); });
 * manager.updateShortcut('saveShortcut', ['Control', 'Shift', 'S']);
 * manager.unregister('saveShortcut');
 * manager.clear();
 * manager.destroy();
 *
 * // List registered shortcuts:
 * const shortcuts = manager.getRegisteredShortcuts();
 *
 * // Register shortcuts using constants:
 * manager.register('closeShortcut', [ShortcutManager.KEYS.CTRL, ShortcutManager.KEYS.W], () => { ... });
 * ```
 */
class ShortcutManager {
    /**
     * Special key constants for use in shortcut definitions.
     * Example: ShortcutManager.KEYS.CTRL
     * @type {Object<string, string>}
     */
    static KEYS = {
        CTRL: "Control",
        SHIFT: "Shift",
        ALT: "Alt",
        META: "Meta",
        ENTER: "Enter",
        ESC: "Escape",
        SPACE: " ",
        TAB: "Tab",
        BACKSPACE: "Backspace",
        DELETE: "Delete",
        UP: "ArrowUp",
        DOWN: "ArrowDown",
        LEFT: "ArrowLeft",
        RIGHT: "ArrowRight",
    };

    /**
     * Creates a new ShortcutManager instance.
     *
     * @param {Window|HTMLElement} [targetElement=window] - The target element to listen for keyboard events. Defaults to window.
     *
     * @example
     * const manager = new ShortcutManager(document);
     */
    constructor(targetElement = window) {
        this.shortcutRegistry = new Map(); // Map<shortcutKey, { shortcutString, callbackFunction }>
        this.currentlyPressedKeys = new Set();
        this.targetElement = targetElement;
        this.keyDownListener = this.handleKeyDownEvent.bind(this);
        this.initializeEventListeners();
    }

    /**
     * Initializes keyboard event listeners on the target element.
     * Internal method.
     *
     * @private
     * @returns {void}
     */
    initializeEventListeners() {
        this.targetElement.addEventListener(
            "keydown",
            this.keyDownListener,
            true
        );
        this.targetElement.addEventListener(
            "keyup",
            (keyboardEvent) => {
                this.currentlyPressedKeys.delete(keyboardEvent.key);
            },
            true
        );
    }

    /**
     * Normalizes a key combination into a standardized string.
     *
     * @param {Array<string>} keyList - List of keys (e.g., ['Control', 'Shift', 'A']).
     * @returns {string} - Normalized shortcut string (e.g., 'Control+Shift+A').
     *
     * @example
     * ShortcutManager.normalizeShortcut(['Control', 'S']); // 'Control+S'
     */
    static normalizeShortcut(keyList) {
        const modifierKeys = [
            ShortcutManager.KEYS.CTRL,
            ShortcutManager.KEYS.SHIFT,
            ShortcutManager.KEYS.ALT,
            ShortcutManager.KEYS.META,
        ];
        const sortedKeys = [...keyList].sort((firstKey, secondKey) => {
            const firstKeyIndex = modifierKeys.indexOf(firstKey);
            const secondKeyIndex = modifierKeys.indexOf(secondKey);
            if (firstKeyIndex !== -1 && secondKeyIndex !== -1)
                return firstKeyIndex - secondKeyIndex;
            if (firstKeyIndex !== -1) return -1;
            if (secondKeyIndex !== -1) return 1;
            return firstKey.localeCompare(secondKey);
        });
        return sortedKeys.join("+");
    }

    /**
     * Registers a shortcut associated with a unique key.
     *
     * @param {string} shortcutKey - Unique key to identify the shortcut.
     * @param {Array<string>|string} keyCombination - Array of keys or a string (e.g., 'Control+S').
     * @param {Function} callbackFunction - Function called when the shortcut is triggered. Receives the KeyboardEvent.
     * @returns {void}
     *
     * @example
     * manager.register('saveShortcut', ['Control', 'S'], (event) => { ... });
     */
    register(shortcutKey, keyCombination, callbackFunction) {
        const shortcutString =
            typeof keyCombination === "string"
                ? keyCombination
                : ShortcutManager.normalizeShortcut(keyCombination);
        this.shortcutRegistry.set(shortcutKey, {
            shortcutString,
            callbackFunction,
        });
    }

    /**
     * Updates the shortcut associated with a unique key.
     *
     * @param {string} shortcutKey - Unique key of the shortcut.
     * @param {Array<string>|string} newKeyCombination - New key combination.
     * @param {Function} [newCallbackFunction] - New callback function (optional).
     * @returns {boolean} - Returns true if updated, false if the key does not exist.
     *
     * @example
     * manager.updateShortcut('saveShortcut', ['Control', 'Shift', 'S']);
     */
    updateShortcut(shortcutKey, newKeyCombination, newCallbackFunction) {
        if (!this.shortcutRegistry.has(shortcutKey)) return false;
        const shortcutString =
            typeof newKeyCombination === "string"
                ? newKeyCombination
                : ShortcutManager.normalizeShortcut(newKeyCombination);
        const callbackFunction =
            newCallbackFunction ||
            this.shortcutRegistry.get(shortcutKey).callbackFunction;
        this.shortcutRegistry.set(shortcutKey, {
            shortcutString,
            callbackFunction,
        });
        return true;
    }

    /**
     * Removes a shortcut by its unique key.
     *
     * @param {string} shortcutKey - Unique key of the shortcut.
     * @returns {void}
     *
     * @example
     * manager.unregister('saveShortcut');
     */
    unregister(shortcutKey) {
        this.shortcutRegistry.delete(shortcutKey);
    }

    /**
     * Removes all registered shortcuts.
     *
     * @returns {void}
     *
     * @example
     * manager.clear();
     */
    clear() {
        this.shortcutRegistry.clear();
    }

    /**
     * Returns a list of all registered shortcuts.
     *
     * @returns {Array<{shortcutKey: string, shortcutString: string, callbackFunction: Function}>} - Array of registered shortcuts.
     *
     * @example
     * const shortcuts = manager.getRegisteredShortcuts();
     */
    getRegisteredShortcuts() {
        return Array.from(this.shortcutRegistry.entries()).map(
            ([shortcutKey, { shortcutString, callbackFunction }]) => ({
                shortcutKey,
                shortcutString,
                callbackFunction,
            })
        );
    }

    /**
     * Handles keyboard events and triggers registered shortcut callbacks.
     * Internal method.
     *
     * @private
     * @param {KeyboardEvent} keyboardEvent - The keyboard event.
     * @returns {void}
     */
    handleKeyDownEvent(keyboardEvent) {
        this.currentlyPressedKeys.add(keyboardEvent.key);

        const pressedKeyList = [];
        if (keyboardEvent.ctrlKey) {
            pressedKeyList.push(ShortcutManager.KEYS.CTRL);
        }

        if (keyboardEvent.shiftKey) {
            pressedKeyList.push(ShortcutManager.KEYS.SHIFT);
        }
        if (keyboardEvent.altKey) {
            pressedKeyList.push(ShortcutManager.KEYS.ALT);
        }
        if (keyboardEvent.metaKey) {
            pressedKeyList.push(ShortcutManager.KEYS.META);
        }

        if (
            !pressedKeyList.includes(keyboardEvent.key) &&
            !Object.values(ShortcutManager.KEYS).includes(keyboardEvent.key)
        ) {
            pressedKeyList.push(keyboardEvent.key);
        } else if (
            Object.values(ShortcutManager.KEYS).includes(keyboardEvent.key) &&
            !pressedKeyList.includes(keyboardEvent.key)
        ) {
            pressedKeyList.push(keyboardEvent.key);
        }

        const shortcutString =
            ShortcutManager.normalizeShortcut(pressedKeyList);

        for (const {
            shortcutString: registeredShortcutString,
            callbackFunction,
        } of this.shortcutRegistry.values()) {
            if (registeredShortcutString === shortcutString) {
                keyboardEvent.preventDefault();
                callbackFunction(keyboardEvent);
            }
        }
    }

    /**
     * Destroys the ShortcutManager and removes event listeners.
     *
     * @returns {void}
     *
     * @example
     * manager.destroy();
     */
    destroy() {
        this.targetElement.removeEventListener(
            "keydown",
            this.keyDownListener,
            true
        );
        this.clear();
    }
}
