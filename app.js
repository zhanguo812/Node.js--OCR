var AipOcr = require('./src/index').ocr
var fs = require('fs')
let express = require('express')
let router = express.Router()
let app = express()
let formidable = require('formidable');
//设置APPID/AK/SK（前往百度云控制台创建应用后获取相关数据）
var APP_ID = '22720991'
var API_KEY = 'mjkWQFg7w8PcM5BXVrwkzW4H'
var SECRET_KEY = 'BXmWtgZVDZTLc06hGdoUolHv7WXYEf9m'
var client = new AipOcr(APP_ID, API_KEY, SECRET_KEY)
//设置跨域
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  )
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
router.get('/', function (req, res) {
  var image = fs.readFileSync(req.query.img)
  var base64Img = new Buffer(image).toString('base64')
  client.generalBasic(base64Img).then(function (result) {
    res.send(JSON.stringify(result))
    res.end()
  })
})
router.post('/upload', function (req, res) {
  //创建上传表单
  let form = new formidable.IncomingForm()

  //设置编辑
  form.encoding = 'utf-8'

  //设置上传目录(判断有没有文件夹，没有就同步创建文件夹)
  if (fs.existsSync('./assets/')) {
    form.uploadDir = './assets/'
  } else {
    fs.mkdirSync('./assets/')
    form.uploadDir = './assets/'
  }

  //保留后缀
  form.keepExtensions = true

  //文件大小 2M
  // form.maxFieldsSize = 2 * 1024 * 1024;

  // 上传文件的入口文件
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err)
      res.send({
        msg: err,
      })
      return
    }
    let extName = '' //后缀名
    switch (files.file.type) {
      case 'image/pjpeg':
        extName = 'jpg'
        break
      case 'image/jpeg':
        extName = 'jpg'
        break
      case 'image/png':
        extName = 'png'
        break
      case 'image/x-png':
        extName = 'png'
        break
    }

    if (extName.length == 0) {
      res.send({
        msg: '图片格式不正确，只支持png和jpg格式图片',
      })
      return
    }

    let index = files.file.name.indexOf('.')
    let name = files.file.name.substring(0, index)

    let avatarName = Math.random() + '---' + name + '.' + extName
    let newPath = form.uploadDir + avatarName
    fs.rename(files.file.path, newPath, () => {
      console.log('上传成功')
      res.send({
        msg: '上传成功',
        url: newPath,
      })
      res.end()
    }) //重命名
  })
})

app.use(router)
app.listen(8000, function () {
  console.log('端口号:8000的服务器已经启动.....')
})