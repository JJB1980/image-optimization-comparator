const entry = require('./');

start();

async function start () {
  const data = await entry({
    web: '/src/images',
    src: '/web/images',
    limit: '420-500',
    terminal: false,
    preview: false
  });

  console.log(data);
}
