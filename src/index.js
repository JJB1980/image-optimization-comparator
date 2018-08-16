/* istanbul ignore file */
const fs = require('fs');

const {entry} = require('./api');

if (process.argv[2]) {
  let limit = process.argv[2];
  let preview = process.argv[3] === '-p';
  let src = process.argv[4];
  let web = process.argv[5];
  let terminal = true;

  try {
    if (fs.lstatSync(web).isDirectory() && fs.lstatSync(src).isDirectory() && limit) {
      entry({src, web, limit, preview, terminal});
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
