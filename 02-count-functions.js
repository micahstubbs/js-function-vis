const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');
const jsonfile = require('jsonfile');
const csvWriter = require('csv-write-stream');

const projectRepoName = 'drift';
const inputFile = `${projectRepoName}-clean.csv`;
const workingDirectory = '/Users/m/workspace';

const data = d3.csvParse(fs.readFileSync(inputFile, 'utf8'));
const outputData = [];

data.forEach(d => {
  // read file
  const currentFile = fs.readFileSync(`${workingDirectory}/${d.file}`, 'utf8');
  
  // define function declaration regex patterns
  // http://davidbcalhoun.com/2011/different-ways-of-defining-functions-in-javascript-this-is-madness/
  const constructorRegex = new RegExp('new Function\s?\\(', 'g');
  const declarationRegex = new RegExp('function \w+\s?\\(', 'g');
  const expressionRegex = new RegExp('\w+ = function\s?\\(', 'g');
  const groupingOrIIFERegex = new RegExp('\\(function\s?\\(', 'g');
  const namedExpressionRegex = new RegExp('\w+ = function\s+\w+\s?\\(', 'g');
  const arrowRegex = new RegExp('=>', 'g');
 
  // intitialize counts
  let constructorCount = 0;
  let declarationCount = 0;
  let expressionCount = 0;
  let groupingOrIIFECount = 0;
  let arrowCount = 0;

  // count number of function declarations
  const constructorMatch = currentFile.match(constructorRegex);
  if (constructorMatch !== null) {
   constructorCount = constructorMatch.length;
  }

  const declarationMatch = currentFile.match(declarationRegex);
  if (declarationMatch !== null) {
    declarationCount = declarationMatch.length;
  }

  const expressionMatch = currentFile.match(expressionRegex)
  if (expressionMatch !== null) {
    expressionCount = expressionMatch.length;
  }

  const groupingOrIIFEMatch = currentFile.match(groupingOrIIFERegex);
  if (groupingOrIIFEMatch !== null) {
    groupingOrIIFECount = groupingOrIIFEMatch.length;
  }
  
  const arrowMatch = currentFile.match(arrowRegex);
  if (arrowMatch !== null) {
    arrowCount = arrowMatch.length; 
    if (d.file.match('/notebook/')) {
      console.log('d.file', d.file);
      // console.log('arrowMatch', arrowMatch);
      console.log('arrowMatch.length', arrowMatch.length);
    }
  }

  const totalCount = [
    constructorCount, 
    declarationCount,
    expressionCount,
    groupingOrIIFECount,
    arrowCount
  ].reduce(function(a, b) {
    return a + b;
  }, 0);

  // add number of function declarations to d
  d.constructorCount = constructorCount;
  d.declarationCount = declarationCount;
  d.expressionCount = expressionCount;
  d.groupingOrIIFECount = groupingOrIIFECount;
  d.arrowCount = arrowCount;
  d.totalCount = totalCount;

  // add `d` to the outputData array
  outputData.push(d);
})

const outputFile = `${projectRepoName}-function-counts.csv`;
// write a csv file
const writer = csvWriter();
writer.pipe(fs.createWriteStream(outputFile));
outputData.forEach(d => {
  writer.write(d);
})
writer.end();
