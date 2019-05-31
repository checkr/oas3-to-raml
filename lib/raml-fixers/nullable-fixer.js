const _ = require('lodash');

/**
 * Convert 'nullable' types not supported by RAML 1.0 specification to
 * 'typename | nil'. For example:
 *
 *  type: string
 *  nullable: true
 *
 *  -- converts to --
 *  type: string | nil
 *
 */
function customizer(input) {
    if (!_.isPlainObject(input) || !('nullable' in input)) {
        // Let caller handle cloning
        return;
    }

    let output = _.cloneDeep(input);
    if ('type' in output && output.nullable === true) {
        output.type += ' | nil';
    }
    delete output.nullable;
    return output;
}

function fixNullables(input) {
    return _.cloneDeepWith(input, customizer);
}

module.exports = fixNullables;
