/* istanbul ignore file */
const fs = require('fs');

const {entry} = require('./api');

if (process.argv[2]) {
  let limit = process.argv[2];
  let preview = process.argv[3] === '-p';
  let sort = process.argv[4];
  let src = process.argv[5];
  let web = process.argv[6];
  let terminal = true;
  try {
    if (fs.lstatSync(web).isDirectory() && fs.lstatSync(src).isDirectory() && limit) {
      entry({src, web, limit, sort, preview, terminal});
    }
  } catch (e) {}
}

function start (options = {}) {
  return entry(options);
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
});

module.exports = start;
