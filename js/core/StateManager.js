'use strict';

/**
 * Manages the state history for multiple objects, allowing undo/redo operations and state restoration.
 * Each object is tracked by a unique identifier, and its states are stored in chronological order.
 * Useful for implementing undo/redo functionality in applications that require state management per object.
 *
 * @example
 * const StateManager = require('./StateManager');
 * const manager = new StateManager();
 * manager.initializeObjectState('obj1', { value: 1 });
 * manager.addObjectState('obj1', { value: 2 });
 * manager.undoObjectState('obj1'); // Returns { value: 1 }
 * manager.redoObjectState('obj1'); // Returns { value: 2 }
 */
class StateManager {
    /**
     * Constructs a new StateManager instance.
     * Initializes the internal Map to store object states.
     *
     * @constructor
     * @example
     * const manager = new StateManager();
     */
    constructor() {
        // Stores states for each object by a unique identifier
        // Each entry: { states: [...], currentIndex: number }
        this.objectStates = new Map();
    }

    /**
     * Initializes state management for a new object.
     * If the object is already initialized, does nothing.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @param {any} initialState - The initial state of the object.
     * @returns {void}
     * @example
     * manager.initializeObjectState('obj1', { value: 1 });
     */
    initializeObjectState(objectId, initialState) {
        if (!this.objectStates.has(objectId)) {
            this.objectStates.set(objectId, {
                states: [initialState],
                currentIndex: 0
            });
        }
    }

    /**
     * Adds a new state for the specified object.
     * If not at the latest state, removes all states ahead before adding the new state.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @param {any} newState - The new state to add.
     * @throws {Error} If the object is not initialized.
     * @returns {void}
     * @example
     * manager.addObjectState('obj1', { value: 2 });
     */
    addObjectState(objectId, newState) {
        const objectData = this.objectStates.get(objectId);
        if (!objectData) {
            throw new Error(`Object with id "${objectId}" is not initialized.`);
        }
        // Remove states ahead if not at the end
        if (objectData.currentIndex < objectData.states.length - 1) {
            objectData.states = objectData.states.slice(0, objectData.currentIndex + 1);
        }
        objectData.states.push(newState);
        objectData.currentIndex = objectData.states.length - 1;
    }

    /**
     * Removes the latest state for the specified object.
     * Will not remove the initial state; at least one state remains.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @throws {Error} If the object is not initialized.
     * @returns {void}
     * @example
     * manager.removeLatestObjectState('obj1');
     */
    removeLatestObjectState(objectId) {
        const objectData = this.objectStates.get(objectId);
        if (!objectData) {
            throw new Error(`Object with id "${objectId}" is not initialized.`);
        }
        if (objectData.states.length > 1) {
            objectData.states.pop();
            objectData.currentIndex = objectData.states.length - 1;
        }
    }

    /**
     * Restores the state of the object to a specific point in history.
     * Sets the current index to the specified state index.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @param {number} stateIndex - The index of the state to restore (0-based).
     * @throws {Error} If the object is not initialized or the index is out of bounds.
     * @returns {any} The restored state.
     * @example
     * manager.restoreObjectState('obj1', 0); // Restores to the initial state
     */
    restoreObjectState(objectId, stateIndex) {
        const objectData = this.objectStates.get(objectId);
        if (!objectData) {
            throw new Error(`Object with id "${objectId}" is not initialized.`);
        }
        if (stateIndex < 0 || stateIndex >= objectData.states.length) {
            throw new Error(`State index "${stateIndex}" is out of bounds.`);
        }
        objectData.currentIndex = stateIndex;
        return objectData.states[stateIndex];
    }

    /**
     * Gets the current state of the specified object.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @throws {Error} If the object is not initialized.
     * @returns {any} The current state.
     * @example
     * const currentState = manager.getCurrentObjectState('obj1');
     */
    getCurrentObjectState(objectId) {
        const objectData = this.objectStates.get(objectId);
        if (!objectData) {
            throw new Error(`Object with id "${objectId}" is not initialized.`);
        }
        return objectData.states[objectData.currentIndex];
    }

    /**
     * Removes all states for the specified object.
     * After calling this, the object will need to be re-initialized.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @returns {void}
     * @example
     * manager.clearObjectStates('obj1');
     */
    clearObjectStates(objectId) {
        this.objectStates.delete(objectId);
    }

    /**
     * Clears all states for all objects.
     * After calling this, all objects will need to be re-initialized.
     *
     * @returns {void}
     * @example
     * manager.clearAllStates();
     */
    clearAllStates() {
        this.objectStates.clear();
    }

    /**
     * Lists all states registered for the specified object.
     * Returns a shallow copy of the states array.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @throws {Error} If the object is not initialized.
     * @returns {Array<any>} Array of all states for the object.
     * @example
     * const states = manager.listObjectStates('obj1');
     */
    listObjectStates(objectId) {
        const objectData = this.objectStates.get(objectId);
        if (!objectData) {
            throw new Error(`Object with id "${objectId}" is not initialized.`);
        }
        return [...objectData.states];
    }

    /**
     * Moves to the previous state (undo) for the specified object.
     * If already at the earliest state, does nothing.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @throws {Error} If the object is not initialized.
     * @returns {any} The previous state after undo.
     * @example
     * manager.undoObjectState('obj1');
     */
    undoObjectState(objectId) {
        const objectData = this.objectStates.get(objectId);
        if (!objectData) {
            throw new Error(`Object with id "${objectId}" is not initialized.`);
        }
        if (objectData.currentIndex > 0) {
            objectData.currentIndex -= 1;
        }
        return objectData.states[objectData.currentIndex];
    }

    /**
     * Moves to the next state (redo) for the specified object.
     * If already at the latest state, does nothing.
     *
     * @param {string} objectId - Unique identifier for the object.
     * @throws {Error} If the object is not initialized.
     * @returns {any} The next state after redo.
     * @example
     * manager.redoObjectState('obj1');
     */
    redoObjectState(objectId) {
        const objectData = this.objectStates.get(objectId);
        if (!objectData) {
            throw new Error(`Object with id "${objectId}" is not initialized.`);
        }
        if (objectData.currentIndex < objectData.states.length - 1) {
            objectData.currentIndex += 1;
        }
        return objectData.states[objectData.currentIndex];
    }
}

module.exports = StateManager;
