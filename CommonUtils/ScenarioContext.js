const Log = require('./Log.js');

class ScenarioContext {

    static #VALUES = {};

    static reset() {
        this.#VALUES = {};
        Log.info("Scenario context has been reset");
    }

    /**
     * Sets a scenario context value with a given name
     * @param {string} name Name of the value
     * @param {string} value Value
     */
    static setValue(name, value) {
        if (this.#VALUES[name] != null)
            Log.warning(`A variable named "${name}" with value "${this.#VALUES[name]}" already exists in the scenario context. Overwriting it with new value: "${value}"`);
        else
            Log.info(`Adding variable named "${name}" with value "${value}" to scenario context`);

        this.#VALUES[name] = value;
    }

    /**
     * Returns the values in of this context as an object
     * @returns Object of values
     */
    static getAllValues() {
        return this.#VALUES;
    }

    /**
     * Retrieves a scenario context value by name
     * @param {string} name Name of the value
     */
    static getValue(name) {
        if (this.#VALUES[name] == null)
            throw new Error(`Scenario context does not contain a variable named ${name}`)

        return this.#VALUES[name];
    }

    /**
    * Returns true if the named value exists. A value of null returns false!
    * @param {string} name Name of the value
    */
    static hasValue(name) {
        return this.#VALUES[name] != null;
    }
}

module.exports = ScenarioContext;