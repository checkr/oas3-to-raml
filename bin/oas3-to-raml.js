#!/usr/bin/env node

const program = require("commander");
const fs = require("fs");
const version = require("../package.json").version;

// Import converters and post-conversion helpers/fixers
const converters = require("../lib/converters");
const fixRaml = require("../lib/raml-fixers");

// Conversion flow, each step contains:
// * desc: Descriptive summary of step (e.g. "converting from X to Y")
// * action: function to call
const flow = [
    {desc: "Convert from OpenAPI 3.0 to 2.0", action: converters.convertFromOas3ToOas2},
    {desc: "Convert from OpenAPI 2.0 to RAML", action: converters.convertFromOas2ToRaml},
    {desc: "Fix-up RAML", action: fixRaml}
];

/**
 * Convert input specification using flow steps defined in global var "flow"
 * 
 * @param {*} inputFile 
 * @param {*} workDir
 * @returns Output filename created on last conversion
 */
async function convert(input) {
    var output;

    for (let i = 0; i < flow.length; i++) {
        const step = flow[i];

        console.log(step.desc);
        try {
            output = await step.action(input);
        }
        catch (err) {
            console.log(" => Error: " + err.message);
            process.exit(1);
        }
        input = output;
    }

    return output;
}

function main(args) {
    if (!args.inputFile || !args.outputFile) {
        console.log("Missing required arguments");
        console.log("Use --help option for more information");
        process.exit(1);
    }

    var input;
    try {
        input = fs.readFileSync(args.inputFile).toString();
    }
    catch (err) {
        console.log("Unable to read input spec '" + args.inputFile + "': " + err.message);
        process.exit(1);
    }

    convert(input).then(output => {
        try {
            fs.writeFileSync(args.outputFile, output);
        }
        catch (err) {
            console.log("Unable to save RAML spec to '" + args.outputFile + "': " + err.message);
            process.exit(1);
        }
    });
}

program
    .version(version)
    .usage("[options]")
    .option("-i, --input-file [filename]", "Filename of input OpenAPI 3.0 Specification")
    .option("-o, --output-file [filename]", "Filename of output RAML Specification")
    .action(main)
    .parse(process.argv);
