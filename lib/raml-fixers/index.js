const yaml = require("js-yaml");

/**
 * RAML conversion post-processing library, see each included resource for
 * example of issues that it fixes
 */
const NullableFixer = require("./NullableFixer");
const ExtendedTypeFixer = require("./ExtendedTypeFixer");
const ExampleFixer = require("./ExampleFixer");

const fixers = [NullableFixer, ExtendedTypeFixer, ExampleFixer];

function fixRaml(input) {
    var spec = yaml.safeLoad(input);
    for (let i = 0; i < fixers.length; i++) {
        const Fixer = fixers[i];
        spec = new Fixer(spec).transform()
    }
    return "#%RAML 1.0\n" + yaml.safeDump(spec);
}

module.exports = fixRaml;
