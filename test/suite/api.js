const path = require('path');

const api = require('../../src/api');

const options = {
  src: path.join(__dirname, 'images/src'),
  web: path.join(__dirname, 'images/web'),
  limit: '100-1000',
  upper: 1000,
  lower: 100,
  terminal: true,
  preview: true
};
const img = `/dummy/carpetBackground.jpg`;

describe('api', () => {
  it('should execute entry', async () => {
    const data = await api.entry(options);
    expect(data.length).to.equal(2);
  });

  it('should pad the string', () => {
    const test = api.pad('X', 3);
    expect(test.length).to.equal(3);
  });

  it('should return stats object', async () => {
    const stats = await api.stats(path.join(__dirname, 'api.js'));
    expect(stats.file).to.be.true();
  });

  it('should sort array on first in directory tree', () => {
    const result = api.sort([
      {file: '/ccc'},
      {file: '/ddd'},
      {file: '/aaa'},
      {file: '/bbb'}
    ]);
    expect(result[0].file).to.equal('/aaa');
    expect(result[3].file).to.equal('/ddd');
  });

  it('should write data to console', () => {
    const logStub = sinon.stub(console, 'log');
    api.terminal([{size: 222, websize: 111, percent: 10, diff: 1, file: 'abc'}]);
    expect(console.log).to.be.calledTwice()
    logStub.restore();
  });

  it('should preview data', () => {
    const resolveStub = sinon.stub(Promise, 'resolve').returns({then: () => {}});
    const data = [{size: 222, websize: 111, percent: 10, diff: 1, file: 'abc'}];
    api.preview(0, data, {});
    expect(Promise.resolve).to.be.calledWith(true)
    resolveStub.restore();
  });

  it('should return data', async () => {
    const data = await api.read(options.src, options);
    expect(data.length).to.equal(2);
  });

  it('should return file info', async () => {
    const file = path.join(options.src, img);
    const result = await api.processFile(file, {size: 800 * 1024}, options);
    expect(result.size).to.equal(800);
    expect(result.file).to.equal(img);
  });

  it('should return stats', async () => {
    const file = path.join(options.src, img);
    const result = await api.stats(file);
    expect(result.file).to.equal(true);
  });

  it('should return difference', async () => {
    const src = path.join(options.src, img);
    const web = path.join(options.web, img);
    const result = await api.difference(src, web);
    expect(result).to.equal('0.15');
  });

  it('should return folders', async () => {
    const result = await api.readDir(options.src);
    expect(result.length).to.equal(3);
  });
});
