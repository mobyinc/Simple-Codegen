const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

if (process.argv.length < 4) {
  console.log('usage: filename.csv [add count]');
  return -1;
}

const filename = process.argv[2];
const addCount = process.argv[3];

console.log(`adding ${addCount} codes to ${filename}`);

const uniqueCodes = {};
const data = [];

function generateUniqueCode(length) {
  const maxTries = 1000;
  for (var i = 0; i < maxTries; i++) {
    let code = getRandomDigitString(length);
    if (!uniqueCodes[code]) return code;
  }
  throw Error('failed to generate unique code');
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDigit() {
  return getRandomInt(0, 9);
}

function getRandomDigitString(length) {
  let value = '';

  for (let i = 0; i < length; i++) {
    value += getRandomDigit();
  }

  return value;
}

function generateNewCodes() {
  for (var i = 0; i < addCount; i++) {
    let username = generateUniqueCode(6);
    let pin = getRandomDigitString(4);
    data.push({
      username,
      pin
    });
  }  
}

function updateFile() {
  const writer = createCsvWriter({
    path: filename,
    header: [
      { id: 'username', title: 'username' },
      { id: 'pin', title: 'pin' },
    ]
  });

  writer.writeRecords(data).then(() => {
    console.log('Finished!');
  });
}

// grab existing
fs.createReadStream(filename).pipe(csv())
  .on('data', row => {
    data.push(row);
    uniqueCodes[row.username] = row.pin;
  })
  .on('end', () => {
    generateNewCodes();
    updateFile();
  });

