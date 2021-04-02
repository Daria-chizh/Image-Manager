const http = require('http');
const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');

const app = new Koa();

app.use(cors());
app.use(koaStatic(path.resolve(__dirname, '../upload')));
app.use(koaBody({ multipart: true, uploadDir: './upload' }));

const images = [];

function listImages() {
  return images;
}

function uploadImage(files) {
  const tempPath = files.photo.path;
  const tempFileName = tempPath.split(path.sep).pop();
  const originalName = files.photo.name;
  const originalExtension = originalName.split('.').pop() || 'jpg';
  const newFileName = `${tempFileName}.${originalExtension}`;
  fs.copyFileSync(tempPath, path.resolve(__dirname, '../upload/', newFileName));
  images.push(newFileName);
  return { fileName: newFileName };
}

function removeImage(params) {
  const { fileName } = params;
  images.splice(images.indexOf(fileName), 1);
  fs.unlinkSync(path.resolve(__dirname, '../upload/', fileName));
}

app.use(async (ctx) => {
  const { method } = ctx.request.query;

  switch (method) {
    case 'uploadImage':
      ctx.response.body = uploadImage(ctx.request.files);
      return;
    case 'listImages':
      ctx.response.body = listImages();
      return;
    case 'removeImage':
      removeImage(ctx.request.body);
      ctx.response.status = 200;
      return;
    default:
      ctx.response.status = 404;
  }
});

http.createServer(app.callback()).listen(process.env.PORT || 7777, () => console.log('Server is working'));
