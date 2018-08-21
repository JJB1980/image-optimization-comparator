/* istanbul ignore file */
const {entry} = require('./app');

if (process.argv[2]) {
  const limit = process.argv[2];
  const preview = process.argv[3] === '-p';
  const sort = process.argv[4];
  const src = process.argv[5];
  const web = process.argv[6];
  const terminal = true;
  entry({src, web, limit, sort, preview, terminal});
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
});

module.exports = (options = {}) => {
  return entry(options);
};
