const start = require('./');

begin();

async function begin () {
  const data = start({
    src: '/Users/john/grit/github.cwx.io/poker/webclient-themes/src/assets/casino',
    web: '/Users/john/grit/github.cwx.io/poker/webclient-themes/web/casino',
    limit: '100-1000',
    terminal: true,
    preview: false,
    sort: 'percent'
  });

  // console.log(data);
}
