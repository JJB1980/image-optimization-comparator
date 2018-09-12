const path = require('path');

const api = require('../../src/app');

const _options = {
  src: path.join(__dirname, 'images/src'),
  web: path.join(__dirname, 'images/web'),
  limit: '100-1000',
  upper: 1000,
  lower: 100,
  terminal: true,
  preview: true
};
const _img = `/dummy/carpetBackground.jpg`;
const _file = path.join(_options.src, _img);
const _data = [
  {file: '/ccc', size: 4, websize: 3, percent: 10},
  {file: '/ccc', size: 4, websize: 3, percent: 20},
  {file: '/ddd', size: 3, websize: 2, percent: 30},
  {file: '/aaa', size: 2, websize: 1, percent: 50},
  {file: '/bbb', size: 1, websize: 1, percent: 30}
];

describe('api', () => {
  it('should execute entry and return data', async () => {
    const data = await api.entry(_options);
    expect(data.data.length).to.equal(2);
  });

  it('should pad the string', () => {
    const test = api.pad('X', 3);
    expect(test).to.equal('  X');
  });

  it('should return stats object', async () => {
    const stats = await api.stats(_file);
    expect(stats.file).to.be.true();
  });

  context('with sort', () => {
    it('should sort on file name', () => {
      const result = api.sort(_data, _options);
      expect(result[0].file).to.equal('/aaa');
      expect(result[4].file).to.equal('/ddd');
    });

    it('should sort on size', () => {
      const result = api.sort(_data, Object.assign(_options, {sort: 'size'}));
      expect(result[0].file).to.equal('/bbb');
      expect(result[4].file).to.equal('/ccc');
    });

    it('should sort on percent', () => {
      const result = api.sort(_data, Object.assign(_options, {sort: 'percent'}));
      expect(result[0].file).to.equal('/ccc');
      expect(result[4].file).to.equal('/aaa');
    });
  });

  it('should aggregate data', () => {
    const result = api.aggregate(_data);
    expect(result.size).to.equal(14);
    expect(result.websize).to.equal(10);
    expect(result.percent).to.equal(71);
  });

  context('with terminal and preview', () => {
    const data = [{size: 222, websize: 111, percent: 10, diff: 1, file: 'abc'}];

    it('should write data to console', async () => {
      const logStub = sinon.stub(console, 'log');
      api.terminal(data, {size: 222, websize: 111, percent: 10});
      const call = console.log;
      logStub.restore();
      await new Promise((resolve) => {
        setTimeout(() => {
          expect(call.getCall(0).args[0]).to.equal('\u001b[33m222\u001b[39m  \u001b[34m111\u001b[39m  \u001b[36m10%\u001b[39m  \u001b[35m   1\u001b[39m  \u001b[32mabc\u001b[39m');
          resolve(true);
        }, 100);
      });
    });

    it('should preview data', () => {
      const resolveStub = sinon.stub(Promise, 'resolve').returns({then: () => {}});
      api.preview(0, data, {});
      expect(Promise.resolve).to.be.calledWith(true)
      resolveStub.restore();
    });
  });

  it('should return data', async () => {
    const data = await api.read(_options.src, _options);
    expect(data.length).to.equal(2);
  });

  context('with processFile', () => {
    const size = 800 * 1024;

    it('should return file info', async () => {
      const result = await api.processFile(_file, {size}, _options);
      expect(result.size).to.equal(800);
      expect(result.file).to.equal(_img);
    });

    it('should not return file info', async () => {
      const result = await api.processFile(_file, {size}, Object.assign(_options, {lower: 100, upper: 500}));
      expect(result).to.be.null();
    });
  });

  it('should return stats', async () => {
    const result = await api.stats(_file);
    expect(result.file).to.be.true();
  });

  it('should return difference', async () => {
    const web = path.join(_options.web, _img);
    const result = await api.difference(_file, web);
    expect(result).to.equal('0.15');
  });

  it('should return directories/files', async () => {
    const result = await api.readDir(_options.src);
    expect(result.length).to.equal(2);
  });
});
