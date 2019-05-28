#!/usr/bin/env node

const program = require("commander");
const fs = require("fs");
const version = require("../package.json").version;

// Import converters and post-conversion helpers/fixers
const converters = require("../lib/converters");
const fixers = require("../lib/raml-fixers");

// Conversion flow, each step contains:
// * desc: Descriptive summary of step (e.g. "converting from X to Y")
// * action: function to call
// * suffix: descriptive output file suffix (e.g. "-nullable-fix")
// * ext: file extension (e.g. ".yaml")
const flow = [
    {desc: "Convert from OpenAPI 3.0 to 2.0", action: converters.convertFromOas3ToOas2, suffix: "-oas2", ext: "yaml"},
    {desc: "Convert from OpenAPI 2.0 to RAML", action: converters.convertFromOas2ToRaml, suffix: "-base", ext: "raml"},
    {desc: "Fix 'nullable' types", action: fixers.fixNullables, suffix: "-nullable-fix", ext: "raml"},
    {desc: "Fix extended types", action: fixers.fixExtendedTypes, suffix: "-extended-types-fix", ext: "raml"},
    {desc: "Fix numeric examples", action: fixers.fixExamples, suffix: "-examples-fix", ext: "raml"}
];

/**
 * Convert input specification using flow steps defined in global var "flow"
 * 
 * @param {*} inputFile 
 * @param {*} workDir
 * @returns Output filename created on last conversion
 */
async function convert(inputFile, workDir) {
    var outputFile;

    for (let i = 0; i < flow.length; i++) {
        const step = flow[i];

        console.log(step.desc + ":");
        outputFile = workDir + "/step-" + (i + 1) + step.suffix + "." + step.ext;
        const logFile = workDir + "/step-" + (i + 1) + step.suffix + ".log";

        try {
            // Perform conversion step
            const result = await step.action(inputFile);

            // Save output and non-fatal errors/warnings if any detected
            fs.writeFileSync(outputFile, result.output);
            if (result.errors) {
                fs.writeFileSync(logFile, result.errors);
            }
        }
        catch (err) {
            console.log(" => Error: " + err.message);
            process.exit(1);
        }

        console.log(" => Success");

        // Use output as input for next step
        inputFile = outputFile;
    }

    return outputFile;
}

function main(args) {
    if (!args.inputFile || !args.workDir || !args.outputFile) {
        console.log("Missing required arguments");
        console.log("Use --help option for more information");
        process.exit(1);
    }

    // Check that input file exists
    if (!fs.existsSync(args.inputFile)) {
        console.log("Input spec '" + args.inputFile + "' does not exist");
        process.exit(1);
    }

    // Create working directory, if needed
    try {
        fs.mkdirSync(args.workDir, {recursive: true});
    }
    catch (err) {
        console.log("Unable to create working directory '" + args.workDir + "': " + err.message);
        process.exit(1);
    }

    convert(args.inputFile, args.workDir).then(lastConversion => {
        // Move last output file from conversion to outputFile
        try {
            fs.copyFileSync(lastConversion, args.outputFile);
        }
        catch (err) {
            console.log("Unable to create output spec '" + args.outputFile + "': " + err.message);
            process.exit(1);
        }
    })
}

program
    .version(version)
    .usage("[options]")
    .option("-i, --input-file [filename]", "Filename of input OpenAPI 3.0 Specification")
    .option("-w, --work-dir [path]", "Work directory, it will contain logs and intermediary files")
    .option("-o, --output-file [filename]", "Filename of output RAML Specification")
    .action(main)
    .parse(process.argv);
