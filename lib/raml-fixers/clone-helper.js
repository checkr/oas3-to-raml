const _ = require("lodash");

/**
 * Customizer that invokes callback on plain object after deep clone
 */
function customizer(callback, input) {
    // Clone plain object first and then invoke callback
    if (callback && _.isPlainObject(input)) {
        const output = _.cloneDeepWith(input,
            _.after(2, customizer.bind(null, callback)));
        return callback(output);
    }
    // Let caller handle cloning for all other cases
    return undefined;
}

/**
 * Invert lodash cloneDeepWith to invoke callback after deep clone is complete
 */
function clone(input, callback) {
    return _.cloneDeepWith(input, customizer.bind(null, callback));
}

module.exports = clone;
