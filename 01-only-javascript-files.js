const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');
const jsonfile = require('jsonfile');
const csvWriter = require('csv-write-stream');

const projectRepoName = 'drift';
const inputFile = `${projectRepoName}.tsv`;
const data = d3.tsvParse(fs.readFileSync(inputFile, 'utf8'));

const outputData = [];


data.forEach(d => {
  const gitRegex = new RegExp(`${projectRepoName}/.git`);
  if(
    // only javascript files
    d.file.match(/\.js/) !== null &&
    // only files in the `src` directory
    d.file.match(/src/) !== null &&
    // ignore json files
    d.file.match(/\.json/) === null &&
    // ignore version control files
    d.file.match(gitRegex) === null &&
    // ignore built files
    d.file.match(/build/) === null &&
    // ignore node dependencies
    d.file.match(/node_modules/) === null &&
    // ignore binaries
    d.file.match(/\.jar/) === null &&
    d.file.match(/\.tar\.gz/) === null &&
    d.file.match(/\.whl/) === null &&
    d.file.match(/\.bin/) === null &&
    d.file.match(/\.pdf/) === null &&
    // ignore images (which are also binary files)
    d.file.match(/\.png/) === null &&
    d.file.match(/\.gif/) === null && 
    // ignore other large files & folders for now
    d.file.match(/\.ipynb/) === null
  ) {
    outputData.push(d);
  }
})

const outputFile = 'drift-clean.csv';
// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream(outputFile));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();
