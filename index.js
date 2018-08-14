const fs = require('fs');
const path = require('path');
const opn = require('opn');
const resemble = require('resemblejs');

let _lowerLimit, _upperLimit, _preview, _weblocation, _srclocation, _terminal, _data;

if (process.argv[2]) {
  [_lowerLimit, _upperLimit] = (process.argv[2] || '0-0').split('-');
  _upperLimit = _upperLimit || _lowerLimit;
  _preview = process.argv[3] === '-p';
  _srclocation = process.argv[4];
  _weblocation = process.argv[5];
  _terminal = true;
  _data = [];
}

if (_weblocation && _srclocation && _lowerLimit != 0) {
  console.log(`Calculating sizes...`);
  console.log(`src: ${_srclocation}`);
  console.log(`web: ${_weblocation}`);
  start();
}

function entry (options = {}) {
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
    if (_preview) preview(0);
    if (_terminal) terminal();
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
}

function preview (index) {
  if (index >= _data.length) return;
  const file = _data[index].file;
  Promise.all([
    opn(`${_srclocation}${file}`, {wait: true}),
    opn(`${_weblocation}${file}`, {wait: true})
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
        throw new Error('Neither file nor directory...');
      }
      count--;
      if (count === 0) resolve()
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
    if (_terminal) {
      console.log(`${pad(size, 3)}  ${pad(websize, 3)}  ${pad(percent, 2)}%  ${pad(diff, 4)}`, srcfile);
    }
    _data.push({size, websize, percent, file: srcfile});
  }
}

function pad (arg, len) {
  return arg.toString().padStart(len, ' ');
}

function stats (arg) {
  return new Promise((resolve, reject) => {
    fs.stat(arg, (err, stat) => {
      if (err || typeof stat == 'undefined') reject({err: err || 'no stats.'});
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

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
});

module.exports = entry;
