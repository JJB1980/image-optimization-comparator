const entry = require('./');

start();

async function start () {
  const data = await entry({
    web: '/Users/john/grit/github.cwx.io/poker/webclient-themes/web/casino',
    src: '/Users/john/grit/github.cwx.io/poker/webclient-themes/src/assets/casino',
    limit: '420-500',
    terminal: false,
    preview: false
  });

  console.log(data);
}
