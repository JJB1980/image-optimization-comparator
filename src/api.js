const colors = require('colors');
const fs = require('fs');
const opn = require('opn');
const path = require('path');
const resemble = require('resemblejs');

const _isTest = process.env.NODE_ENV === 'test';

function entry (options) {
  const {src, web, limit} = options;
  let [lower, upper] = limit.split('-');
  upper = upper || lower;
  if (!src || !web || !lower) return;
  return start(Object.assign(options, {lower, upper}));
}

async function start (options) {
  let sorted = null;
  try {
    if (options.terminal) console.log('Processing...');
    const data = await read(options.src, options);
    sorted = sort(data, options);
    if (options.terminal) terminal(sorted);
    if (options.preview) preview(0, sorted, options);
  } catch (error) {
    console.log(error);
  } finally {
    return sorted;
  }
}

function sort (data, {sort = 'file'}) {
  return data.sort((
    {size: sa, file: fa, percent: pa},
    {size: sb, file: fb, percent: pb}
  ) => {
    switch (sort) {
      case 'file':
        if (fa < fb) return -1;
        if (fa > fb) return 1;
        break;
      case 'size':
        if (sa < sb) return -1;
        if (sa > sb) return 1;
        break;
      case 'percent':
        if (pa < pb) return -1;
        if (pa > pb) return 1;
        break;
    }
    return 0;
  });
}

function terminal (data) {
  data.forEach(({size, websize, percent, diff, file}) => {
    console.log(`${pad(size, 3).yellow}  ${pad(websize, 3).blue}  ${`${pad(percent, 2)}%`.cyan}  ${pad(diff, 4).red}  ${file.green}`);
  });
  console.log(`${data.length} files found.`);
}

function pad (arg, len) {
  return arg.toString().padStart(len, ' ');
}

function preview (index, data, options) {
  if (index >= data.length) return;
  const {src, web} = options;
  const {file} = data[index];
  Promise.all([
    _isTest ? Promise.resolve(true) : opn(`${src}${file}`, {wait: true}),
    _isTest ? Promise.resolve(true) : opn(`${web}${file}`, {wait: true})
  ]).then(() => {
    preview(index + 1, data, options);
  });
}

async function read (loc, options) {
  let data = [];
  return new Promise(async resolve => {
    const files = await readDir(loc);
    let count = files.length;
    files.forEach(async (file, index, array) => {
      const fullPath = path.join(loc, file);
      const statsResult = await stats(fullPath);
      if (statsResult.file) {
        const result = await processFile(fullPath, statsResult, options);
        if (result) data.push(result);
      } else if (statsResult.directory) {
        const more = await read(fullPath, options);
        data = data.concat(more);
      }
      count--;
      if (count === 0) resolve(data)
    });
  });
}

async function processFile (fullPath, result, {lower, upper, src, web}) {
  const size = Math.round(result.size / 1024);
  if (/\.(jpeg|jpg|png)$/.test(fullPath) && size >= lower && size <= upper) {
    const srcfile = fullPath.replace(src, '');
    const webfile = path.join(web, srcfile);
    const webstats = await stats(webfile);
    const websize = Math.round(webstats.size / 1024);
    const percent = Math.round(websize / size * 100);
    const diff = await difference(fullPath, webfile);
    return {size, websize, percent, diff, file: srcfile};
  }
  return null;
}

function stats (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (error, stat) => {
      if (error || !stat) reject({error: error || 'no stats.'});
      resolve({
        file: stat.isFile(),
        directory: stat.isDirectory(),
        size: stat.isFile() ? stat.size : '-'
      });
    });
  });
}

function difference (src, web) {
  return new Promise(resolve => {
    resemble(src).compareTo(web).onComplete(data => {
      resolve(data.misMatchPercentage);
    })
  });
}

function readDir (dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, files) => {
      if (error) reject({error});
      resolve(files.filter(item => item !== '.DS_Store'));
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
