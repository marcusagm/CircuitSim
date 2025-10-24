/**
 * @fileoverview Logic script for the Resistor component.
 * This script defines functions that can be executed by the Resistor component.
 */

/**
 * Initializes the resistor component logic.
 * @param {import("../Component.js").default} component - The component instance.
 */
export function init(component) {
    console.log(
        `Resistor ${component.id || component.constructor.name} initialized with resistance: ${component.getParameter('resistance')}`
    );
    // Perform any initial setup for the resistor
}

/**
 * Called when a parameter of the resistor component changes.
 * @param {import("../Component.js").default} component - The component instance.
 * @param {string} parameterName - The name of the parameter that changed.
 * @param {*} parameterValue - The new value of the parameter.
 */
export function onParameterChange(component, parameterName, parameterValue) {
    console.log(
        `Resistor ${component.id || component.constructor.name}: Parameter ${parameterName} changed to ${parameterValue}`
    );
    if (parameterName === 'resistance') {
        // Example: Update internal simulation model based on new resistance
        console.log(`Resistor resistance updated to: ${parameterValue}`);
    }
}

/**
 * Example function to get the effective resistance value.
 * @param {import("../Component.js").default} component - The component instance.
 * @returns {string} The effective resistance value.
 */
export function getEffectiveResistance(component) {
    return component.getParameter('resistance');
}
