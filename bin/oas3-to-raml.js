#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const version = require('../package.json').version;

// Import converters
const { convertFromOas3ToOas2, convertFromOas2ToRaml } = require('../lib/converters');
const { fixNullables, fixExtendedTypes, fixExamples } = require('../lib/raml-fixers');

// Conversion steps, each step contains:
// * desc: Descriptive summary of step (e.g. 'converting from X to Y')
// * action: function to call (input: string spec, output: string spec)
const steps = [
  { desc: 'Convert from OpenAPI 3.0 to 2.0', action: convertFromOas3ToOas2 },
  { desc: 'Convert from OpenAPI 2.0 to RAML', action: convertFromOas2ToRaml },
  { desc: 'Fix \'nullable\' types', action: fixNullables },
  { desc: 'Fix extended types', action: fixExtendedTypes },
  { desc: 'Fix numeric examples', action: fixExamples }
];

/**
 * Convert input specification using specified steps
 */
async function convert (input, steps) {
  let output = '';
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    console.log(step.desc);
    try {
      output = await step.action(input);
    } catch (err) {
      console.log(' => Error: ' + err.message);
      process.exit(1);
    }
    input = output;
  }

  return output;
}

function main (args) {
  if (!args.inputFile || !args.outputFile) {
    console.log('Missing required arguments');
    console.log('Use --help option for more information');
    process.exit(1);
  }

  let input;
  try {
    input = fs.readFileSync(args.inputFile).toString();
  } catch (err) {
    console.log('Unable to read input spec \'' + args.inputFile + '\': ' + err.message);
    process.exit(1);
  }

  convert(input, steps)
    .then(output => fs.writeFileSync(args.outputFile, output))
    .catch(err => {
      console.log('Unable to save RAML spec to \'' + args.outputFile + '\': ' + err.message);
      process.exit(1);
    });
}

program
  .version(version)
  .usage('[options]')
  .option('-i, --input-file [filename]', 'Filename of input OpenAPI 3.0 Specification')
  .option('-o, --output-file [filename]', 'Filename of output RAML Specification')
  .action(main)
  .parse(process.argv);
