/**
 * @class ElectronicMath
 * @description
 * Utility class for mathematical calculations in electronic circuit projects.
 * Includes unit conversions, physical laws, calculations for resistors, capacitors, inductors,
 * power, current, voltage, frequency, impedance, and more.
 * All methods are static for optimization and reusability.
 *
 * @example
 * // Calculate equivalent resistance in parallel
 * const equivalentResistance = ElectronicMath.calculateParallelResistance([100, 200, 300]);
 *
 * // Convert microfarads to farads
 * const farads = ElectronicMath.convertMicrofaradsToFarads(220);
 *
 * // Calculate current using Ohm's Law
 * const current = ElectronicMath.calculateCurrentOhm(12, 220);
 */
class ElectronicMath {
    // Physical constants
    static SPEED_OF_LIGHT = 299_792_458; // m/s
    static PLANCK_CONSTANT = 6.626_070_15e-34; // J·s
    static ELECTRON_CHARGE = 1.602_176_634e-19; // C
    static VACUUM_PERMEABILITY = 4 * Math.PI * 1e-7; // H/m
    static VACUUM_PERMITTIVITY = 8.854_187_817e-12; // F/m

    // Unit conversions
    /**
     * Converts ohms to kilo-ohms.
     * @param {number} resistanceOhms - Value in ohms.
     * @returns {number} Value in kilo-ohms.
     */
    static convertOhmsToKiloOhms(resistanceOhms) {
        return Number(resistanceOhms) / 1_000;
    }

    /**
     * Converts microfarads to farads.
     * @param {number} capacitanceMicrofarads - Value in microfarads.
     * @returns {number} Value in farads.
     */
    static convertMicrofaradsToFarads(capacitanceMicrofarads) {
        return Number(capacitanceMicrofarads) * 1e-6;
    }

    /**
     * Converts nanofarads to farads.
     * @param {number} capacitanceNanofarads - Value in nanofarads.
     * @returns {number} Value in farads.
     */
    static convertNanofaradsToFarads(capacitanceNanofarads) {
        return Number(capacitanceNanofarads) * 1e-9;
    }

    /**
     * Converts picofarads to farads.
     * @param {number} capacitancePicofarads - Value in picofarads.
     * @returns {number} Value in farads.
     */
    static convertPicofaradsToFarads(capacitancePicofarads) {
        return Number(capacitancePicofarads) * 1e-12;
    }

    /**
     * Converts milliamperes to amperes.
     * @param {number} currentMilliamperes - Value in milliamperes.
     * @returns {number} Value in amperes.
     */
    static convertMilliamperesToAmperes(currentMilliamperes) {
        return Number(currentMilliamperes) / 1_000;
    }

    /**
     * Converts microhenries to henries.
     * @param {number} inductanceMicrohenries - Value in microhenries.
     * @returns {number} Value in henries.
     */
    static convertMicrohenriesToHenries(inductanceMicrohenries) {
        return Number(inductanceMicrohenries) * 1e-6;
    }

    // Fundamental laws
    /**
     * Calculates electric current using Ohm's Law.
     * @param {number} voltageVolts - Voltage in volts.
     * @param {number} resistanceOhms - Resistance in ohms.
     * @returns {number} Current in amperes.
     */
    static calculateCurrentOhm(voltageVolts, resistanceOhms) {
        return Number(voltageVolts) / Number(resistanceOhms);
    }

    /**
     * Calculates voltage using Ohm's Law.
     * @param {number} currentAmperes - Current in amperes.
     * @param {number} resistanceOhms - Resistance in ohms.
     * @returns {number} Voltage in volts.
     */
    static calculateVoltageOhm(currentAmperes, resistanceOhms) {
        return Number(currentAmperes) * Number(resistanceOhms);
    }

    /**
     * Calculates resistance using Ohm's Law.
     * @param {number} voltageVolts - Voltage in volts.
     * @param {number} currentAmperes - Current in amperes.
     * @returns {number} Resistance in ohms.
     */
    static calculateResistanceOhm(voltageVolts, currentAmperes) {
        return Number(voltageVolts) / Number(currentAmperes);
    }

    // Resistors
    /**
     * Calculates equivalent resistance of resistors in series.
     * @param {number[]} resistanceListOhms - Array of resistances in ohms.
     * @returns {number} Equivalent resistance in ohms.
     */
    static calculateSeriesResistance(resistanceListOhms) {
        if (!Array.isArray(resistanceListOhms))
            throw new TypeError('resistanceListOhms must be an array');
        return resistanceListOhms.reduce((total, resistance) => total + Number(resistance), 0);
    }

    /**
     * Calculates equivalent resistance of resistors in parallel.
     * @param {number[]} resistanceListOhms - Array of resistances in ohms.
     * @returns {number} Equivalent resistance in ohms.
     */
    static calculateParallelResistance(resistanceListOhms) {
        if (!Array.isArray(resistanceListOhms))
            throw new TypeError('resistanceListOhms must be an array');
        const sumOfInverses = resistanceListOhms.reduce(
            (total, resistance) => total + 1 / Number(resistance),
            0
        );
        return sumOfInverses === 0 ? Infinity : 1 / sumOfInverses;
    }

    // Capacitors
    /**
     * Calculates equivalent capacitance of capacitors in series.
     * @param {number[]} capacitanceListFarads - Array of capacitances in farads.
     * @returns {number} Equivalent capacitance in farads.
     */
    static calculateSeriesCapacitance(capacitanceListFarads) {
        if (!Array.isArray(capacitanceListFarads))
            throw new TypeError('capacitanceListFarads must be an array');
        const sumOfInverses = capacitanceListFarads.reduce(
            (total, capacitance) => total + 1 / Number(capacitance),
            0
        );
        return sumOfInverses === 0 ? 0 : 1 / sumOfInverses;
    }

    /**
     * Calculates equivalent capacitance of capacitors in parallel.
     * @param {number[]} capacitanceListFarads - Array of capacitances in farads.
     * @returns {number} Equivalent capacitance in farads.
     */
    static calculateParallelCapacitance(capacitanceListFarads) {
        if (!Array.isArray(capacitanceListFarads))
            throw new TypeError('capacitanceListFarads must be an array');
        return capacitanceListFarads.reduce((total, capacitance) => total + Number(capacitance), 0);
    }

    // Inductors
    /**
     * Calculates equivalent inductance of inductors in series.
     * @param {number[]} inductanceListHenries - Array of inductances in henries.
     * @returns {number} Equivalent inductance in henries.
     */
    static calculateSeriesInductance(inductanceListHenries) {
        if (!Array.isArray(inductanceListHenries))
            throw new TypeError('inductanceListHenries must be an array');
        return inductanceListHenries.reduce((total, inductance) => total + Number(inductance), 0);
    }

    /**
     * Calculates equivalent inductance of inductors in parallel.
     * @param {number[]} inductanceListHenries - Array of inductances in henries.
     * @returns {number} Equivalent inductance in henries.
     */
    static calculateParallelInductance(inductanceListHenries) {
        if (!Array.isArray(inductanceListHenries))
            throw new TypeError('inductanceListHenries must be an array');
        const sumOfInverses = inductanceListHenries.reduce(
            (total, inductance) => total + 1 / Number(inductance),
            0
        );
        return sumOfInverses === 0 ? 0 : 1 / sumOfInverses;
    }

    // Power
    /**
     * Calculates electric power (P = V * I).
     * @param {number} voltageVolts - Voltage in volts.
     * @param {number} currentAmperes - Current in amperes.
     * @returns {number} Power in watts.
     */
    static calculateElectricPower(voltageVolts, currentAmperes) {
        return Number(voltageVolts) * Number(currentAmperes);
    }

    /**
     * Calculates power dissipated in a resistor (P = I^2 * R).
     * @param {number} currentAmperes - Current in amperes.
     * @param {number} resistanceOhms - Resistance in ohms.
     * @returns {number} Power in watts.
     */
    static calculateResistorPower(currentAmperes, resistanceOhms) {
        return Math.pow(Number(currentAmperes), 2) * Number(resistanceOhms);
    }

    /**
     * Calculates power using voltage and resistance (P = V^2 / R).
     * @param {number} voltageVolts - Voltage in volts.
     * @param {number} resistanceOhms - Resistance in ohms.
     * @returns {number} Power in watts.
     */
    static calculatePowerByVoltageAndResistance(voltageVolts, resistanceOhms) {
        return Math.pow(Number(voltageVolts), 2) / Number(resistanceOhms);
    }

    // Frequency and period
    /**
     * Calculates frequency from period (f = 1 / T).
     * @param {number} periodSeconds - Period in seconds.
     * @returns {number} Frequency in hertz.
     */
    static calculateFrequencyByPeriod(periodSeconds) {
        return 1 / Number(periodSeconds);
    }

    /**
     * Calculates period from frequency (T = 1 / f).
     * @param {number} frequencyHertz - Frequency in hertz.
     * @returns {number} Period in seconds.
     */
    static calculatePeriodByFrequency(frequencyHertz) {
        return 1 / Number(frequencyHertz);
    }

    // Impedance
    /**
     * Calculates impedance of a series RC circuit.
     * @param {number} resistanceOhms - Resistance in ohms.
     * @param {number} capacitanceFarads - Capacitance in farads.
     * @param {number} frequencyHertz - Frequency in hertz.
     * @returns {number} Impedance in ohms.
     */
    static calculateRCImpedance(resistanceOhms, capacitanceFarads, frequencyHertz) {
        const capacitiveReactance =
            1 / (2 * Math.PI * Number(frequencyHertz) * Number(capacitanceFarads));
        return Math.hypot(Number(resistanceOhms), capacitiveReactance);
    }

    /**
     * Calculates impedance of a series RL circuit.
     * @param {number} resistanceOhms - Resistance in ohms.
     * @param {number} inductanceHenries - Inductance in henries.
     * @param {number} frequencyHertz - Frequency in hertz.
     * @returns {number} Impedance in ohms.
     */
    static calculateRLImpedance(resistanceOhms, inductanceHenries, frequencyHertz) {
        const inductiveReactance = 2 * Math.PI * Number(frequencyHertz) * Number(inductanceHenries);
        return Math.hypot(Number(resistanceOhms), inductiveReactance);
    }

    /**
     * Calculates impedance of a series RLC circuit.
     * @param {number} resistanceOhms - Resistance in ohms.
     * @param {number} inductanceHenries - Inductance in henries.
     * @param {number} capacitanceFarads - Capacitance in farads.
     * @param {number} frequencyHertz - Frequency in hertz.
     * @returns {number} Impedance in ohms.
     */
    static calculateRLCImpedance(
        resistanceOhms,
        inductanceHenries,
        capacitanceFarads,
        frequencyHertz
    ) {
        const inductiveReactance = 2 * Math.PI * Number(frequencyHertz) * Number(inductanceHenries);
        const capacitiveReactance =
            1 / (2 * Math.PI * Number(frequencyHertz) * Number(capacitanceFarads));
        return Math.hypot(Number(resistanceOhms), inductiveReactance - capacitiveReactance);
    }

    // Reactance
    /**
     * Calculates capacitive reactance (Xc = 1 / (2πfC)).
     * @param {number} capacitanceFarads - Capacitance in farads.
     * @param {number} frequencyHertz - Frequency in hertz.
     * @returns {number} Capacitive reactance in ohms.
     */
    static calculateCapacitiveReactance(capacitanceFarads, frequencyHertz) {
        return 1 / (2 * Math.PI * Number(frequencyHertz) * Number(capacitanceFarads));
    }

    /**
     * Calculates inductive reactance (Xl = 2πfL).
     * @param {number} inductanceHenries - Inductance in henries.
     * @param {number} frequencyHertz - Frequency in hertz.
     * @returns {number} Inductive reactance in ohms.
     */
    static calculateInductiveReactance(inductanceHenries, frequencyHertz) {
        return 2 * Math.PI * Number(frequencyHertz) * Number(inductanceHenries);
    }

    // Energy
    /**
     * Calculates energy stored in a capacitor (E = 0.5 * C * V^2).
     * @param {number} capacitanceFarads - Capacitance in farads.
     * @param {number} voltageVolts - Voltage in volts.
     * @returns {number} Energy in joules.
     */
    static calculateCapacitorEnergy(capacitanceFarads, voltageVolts) {
        return 0.5 * Number(capacitanceFarads) * Math.pow(Number(voltageVolts), 2);
    }

    /**
     * Calculates energy stored in an inductor (E = 0.5 * L * I^2).
     * @param {number} inductanceHenries - Inductance in henries.
     * @param {number} currentAmperes - Current in amperes.
     * @returns {number} Energy in joules.
     */
    static calculateInductorEnergy(inductanceHenries, currentAmperes) {
        return 0.5 * Number(inductanceHenries) * Math.pow(Number(currentAmperes), 2);
    }

    // Voltage divider
    /**
     * Calculates output voltage in a voltage divider.
     * @param {number} inputVoltageVolts - Input voltage in volts.
     * @param {number} resistance1Ohms - Resistance R1 in ohms.
     * @param {number} resistance2Ohms - Resistance R2 in ohms.
     * @returns {number} Output voltage in volts.
     */
    static calculateVoltageDivider(inputVoltageVolts, resistance1Ohms, resistance2Ohms) {
        return (
            Number(inputVoltageVolts) *
            (Number(resistance2Ohms) / (Number(resistance1Ohms) + Number(resistance2Ohms)))
        );
    }

    // Current divider
    /**
     * Calculates output current in a current divider.
     * @param {number} totalCurrentAmperes - Total current in amperes.
     * @param {number} branchResistanceOhms - Resistance of the desired branch in ohms.
     * @param {number[]} branchResistancesOhms - Array of all branch resistances in ohms.
     * @returns {number} Current in the desired branch in amperes.
     */
    static calculateCurrentDivider(
        totalCurrentAmperes,
        branchResistanceOhms,
        branchResistancesOhms
    ) {
        const equivalentResistance =
            ElectronicMath.calculateParallelResistance(branchResistancesOhms);
        return Number(totalCurrentAmperes) * (equivalentResistance / Number(branchResistanceOhms));
    }

    // RC filter
    /**
     * Calculates cutoff frequency of an RC filter (fc = 1 / (2πRC)).
     * @param {number} resistanceOhms - Resistance in ohms.
     * @param {number} capacitanceFarads - Capacitance in farads.
     * @returns {number} Cutoff frequency in hertz.
     */
    static calculateRCCutoffFrequency(resistanceOhms, capacitanceFarads) {
        return 1 / (2 * Math.PI * Number(resistanceOhms) * Number(capacitanceFarads));
    }

    // RL filter
    /**
     * Calculates cutoff frequency of an RL filter (fc = R / (2πL)).
     * @param {number} resistanceOhms - Resistance in ohms.
     * @param {number} inductanceHenries - Inductance in henries.
     * @returns {number} Cutoff frequency in hertz.
     */
    static calculateRLCutoffFrequency(resistanceOhms, inductanceHenries) {
        return Number(resistanceOhms) / (2 * Math.PI * Number(inductanceHenries));
    }

    // RLC filter
    /**
     * Calculates resonance frequency of an RLC circuit (fr = 1 / (2π√(LC))).
     * @param {number} inductanceHenries - Inductance in henries.
     * @param {number} capacitanceFarads - Capacitance in farads.
     * @returns {number} Resonance frequency in hertz.
     */
    static calculateRLCResonanceFrequency(inductanceHenries, capacitanceFarads) {
        return 1 / (2 * Math.PI * Math.sqrt(Number(inductanceHenries) * Number(capacitanceFarads)));
    }

    // Electric charge
    /**
     * Calculates electric charge (Q = I * t).
     * @param {number} currentAmperes - Current in amperes.
     * @param {number} timeSeconds - Time in seconds.
     * @returns {number} Electric charge in coulombs.
     */
    static calculateElectricCharge(currentAmperes, timeSeconds) {
        return Number(currentAmperes) * Number(timeSeconds);
    }

    // Electromotive force
    /**
     * Calculates electromotive force (emf = -dΦ/dt).
     * @param {number} fluxChangeWebers - Change in magnetic flux in webers.
     * @param {number} timeChangeSeconds - Change in time in seconds.
     * @returns {number} Electromotive force in volts.
     */
    static calculateElectromotiveForce(fluxChangeWebers, timeChangeSeconds) {
        return -Number(fluxChangeWebers) / Number(timeChangeSeconds);
    }

    // Resistivity
    /**
     * Calculates resistance of a wire (R = ρ * L / A).
     * @param {number} resistivityOhmMeter - Material resistivity in ohm·meter.
     * @param {number} lengthMeters - Wire length in meters.
     * @param {number} crossSectionAreaSquareMeters - Cross-sectional area in square meters.
     * @returns {number} Resistance in ohms.
     */
    static calculateWireResistance(
        resistivityOhmMeter,
        lengthMeters,
        crossSectionAreaSquareMeters
    ) {
        return (
            (Number(resistivityOhmMeter) * Number(lengthMeters)) /
            Number(crossSectionAreaSquareMeters)
        );
    }
}

export default ElectronicMath;
