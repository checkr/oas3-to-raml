const yaml = require("js-yaml");

/**
 * RAML conversion post-processing library, see each included resource for
 * example of issues that it fixes
 */
const fixNullables = require("./nullable-fixer");
const fixExtendedTypes = require("./extended-type-fixer");
const fixExamples = require("./example-fixer");

/**
 * Transform input using specified function
 * 
 * NOTE: this function trades efficiency (decode YAML, transform, encode YAML)
 * for simpler invocation interface
 */
function transform(ramlTransformer, input) {
    const output = ramlTransformer(yaml.safeLoad(input));
    return "#%RAML 1.0\n" + yaml.safeDump(output);
}

module.exports = {
    fixNullables: transform.bind(null, fixNullables),
    fixExtendedTypes: transform.bind(null, fixExtendedTypes),
    fixExamples: transform.bind(null, fixExamples)
};
