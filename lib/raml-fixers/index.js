const fs = require("fs");
const readline = require("readline");

/**
 * RAML conversion post-processing library, see each "Fixer" class below for
 * example of issues that it fixes
 */
const NullableFixer = require("./NullableFixer");
const ExtendedTypeFixer = require("./ExtendedTypeFixer");
const ExampleFixer = require("./ExampleFixer");

const BlockProcessor = require("./BlockProcessor");

async function transformBlock(blockTransformType, filename) {
    const is = fs.createReadStream(filename);
    const rl = readline.createInterface({input: is});
    const processor = new BlockProcessor(blockTransformType);
    for await(line of rl) {
        processor.addLine(line);
    }
    return processor.getOutput();
}

var fixNullables = transformBlock.bind(null, NullableFixer);
var fixExtendedTypes = transformBlock.bind(null, ExtendedTypeFixer);
var fixExamples = transformBlock.bind(null, ExampleFixer);

module.exports = {
    fixNullables: fixNullables,
    fixExtendedTypes: fixExtendedTypes,
    fixExamples: fixExamples
}