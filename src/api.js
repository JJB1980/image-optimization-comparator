const fs = require('fs');
const path = require('path');
const opn = require('opn');
const resemble = require('resemblejs');

let _lowerLimit, _upperLimit, _preview, _weblocation, _srclocation, _terminal, _data;

const isTest = process.env.NODE_ENV === 'test';

function entry (options) {
  const {src, web, limit, preview, terminal} = options;
  _weblocation = web;
  _srclocation = src;
  [_lowerLimit, _upperLimit] = limit.split('-');
  _upperLimit = _upperLimit || _lowerLimit;
  _preview = preview;
  _terminal = terminal;
  _data = [];
  if (!_weblocation || !_srclocation || !_lowerLimit) return;
  return start();
}

async function start () {
  try {
    if (_terminal) console.log('Calculating...');
    await read(_srclocation);
    _data = sort();
    if (_terminal) terminal();
    if (_preview) preview(0);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  } finally {
    return _data;
  }
}

function sort () {
  return _data.sort((a, b) => {
    const [,value1] = a.file.split('/');
    const [,value2] = b.file.split('/');
    if (value1 < value2) return -1;
    if (value1 > value2) return 1;
    return 0;
  });
}

function terminal () {
  _data.forEach(({size, websize, percent, diff, file}) => {
    console.log(`${pad(size, 3)}  ${pad(websize, 3)}  ${pad(percent, 2)}%  ${pad(diff, 4)}`, file);
  });
  console.log(`${_data.length} files Complete.`);
}

function preview (index) {
  if (index >= _data.length) return;
  const file = _data[index].file;
  Promise.all([
    isTest ? Promise.resolve(true) : opn(`${_srclocation}${file}`, {wait: true}),
    isTest ? Promise.resolve(true) : opn(`${_weblocation}${file}`, {wait: true})
  ]).then(() => {
    preview(index + 1);
  });
}

async function read (loc) {
  return new Promise(async (resolve, reject) => {
    const files = await readDir(loc);
    let count = files.length;
    files.forEach(async (file, index, array) => {
      const fullPath = path.join(loc, file);
      const result = await stats(fullPath);
      if (result.file) {
        await processFile(fullPath, result);
      } else if (result.directory) {
        await read(fullPath);
      } else {
        reject({err: 'NA'});
      }
      count--;
      if (count === 0) resolve(true)
    });
  });
}

async function processFile (fullPath, result) {
  const size = Math.round(result.size / 1024);
  if (/\.(jpeg|jpg|png)$/.test(fullPath) && size >= _lowerLimit && size <= _upperLimit) {
    const srcfile = fullPath.replace(_srclocation, '');
    const webfile = path.join(_weblocation, srcfile);
    const webstats = await stats(webfile);
    const websize = Math.round(webstats.size / 1024);
    const percent = Math.round(websize / size * 100);
    const diff = await difference(fullPath, webfile);
    _data.push({size, websize, percent, diff, file: srcfile});
  }
}

function pad (arg, len) {
  return arg.toString().padStart(len, ' ');
}

function stats (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stat) => {
      if (err || !stat) reject({err: err || 'no stats.'});
      resolve({
        file: stat.isFile(),
        directory: stat.isDirectory(),
        size: stat.isFile() ? stat.size : '-'
      });
    });
  });
}

function difference (src, web) {
  return new Promise((resolve, reject) => {
    resemble(src).compareTo(web).onComplete(data => {
      resolve(data.misMatchPercentage);
    })
  });
}

function readDir (dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject({err});
      resolve(files);
    });
  });
}

module.exports = {
  entry,
  readDir,
  difference,
  stats,
  pad,
  processFile,
  read,
  preview,
  terminal,
  sort,
  start
};
