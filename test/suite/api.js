const path = require('path');

const api = require('../../src/api');

const srcDir = path.join(__dirname, 'images/src');
const webDir = path.join(__dirname, 'images/web');

describe('api', () => {
  it('should pad the string', () => {
    const test = api.pad('X', 3);
    expect(test.length).to.equal(3);
  });

  it('should return stats object', async () => {
    const stats = await api.stats(path.join(__dirname, 'api.js'));
    expect(stats.file).to.be.true();
  });

  it('should execute entry', async () => {
    const options = {
      src: srcDir,
      web: webDir,
      limit: '100-1000',
      terminal: true,
      preview: true
    };
    const data = await api.entry(options);
    expect(data.length).to.equal(2);
  });
});
