const http = require('http')
const fs = require('fs');//文件系统
var process = require('child_process');//执行sh
const formidable = require('formidable')
const config = require('./config.json')
const getImgUrl = require('./helper.js')
var port = config.port || 8088
const url = config.url || '/upload'
var log4js = require('log4js')
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'app.log', category: 'GithubPicBed' }
  ]
})
var log = log4js.getLogger('GithubPicBed')

// function to create directory recursively
var mkDirs = function(dirpath, mode) {
  if (fs.existsSync(dirpath)) {
      return;
  } else {
      mkDirs(path.dirname(dirpath), mode);
      fs.mkdirSync(dirpath, mode);
  }
};

var listDir = function(prefix, folder) {
  let fileList = []; 
  let files = fs.readdirSync(folder);
  for (let i in files) {
      let file = files[i];
      let fileName = folder + "/" + file
      let stats = fs.statSync(fileName);
      if (stats.isDirectory()) {
          fileList = fileList.concat(listDir(prefix, fileName));
      } else {
          fileList.push({name: fileName.replace(prefix, ""), size: stats.size});
      }
  }   
  return fileList;
}

//获取随机数
function GetRandomNum(Min,Max)
{   
var Range = Max - Min;   
var Rand = Math.random();   
return(Min + Math.round(Rand * Range));   
}   

var tasks = []
function addTask(file, response) {
  tasks.push({
    "file":file,
    "response":response
  })

  function uploadFile() {
    if(tasks.length) {
      let file = tasks[0]["file"]
      let response = tasks[0]["response"]
      getImgUrl(file).then((result)=>{
        // 处理结果
        if (result) {
          response.writeHead(200, {"Content-Type": "text/json"})
          response.write(JSON.stringify({
            status:'success',
            url:result
          }))
        } else {
          response.writeHead(500, {"Content-Type": "text/json"})
          response.write(JSON.stringify({
            status:'false'
          }))
        }
        response.end()

        // 第一个任务退出
        tasks.shift()
        // 自动执行队列中的任务
        uploadFile()
      })
    }
  }

  // 第一个任务手动执行
  if(tasks.length==1) {
    uploadFile()
  }
}
http.createServer(function (req, res) {
  var content = ""
  if (req.url == url) {
    var form = new formidable.IncomingForm()
    form.parse(req, function (err, fields, files) {
      if(err) {
        res.send(err)
        return
      }
      if (!files.file) {
        res.writeHead(500, {"Content-Type": "text/json"})
        log.error('no file found')
        res.write(JSON.stringify({
          status: 'false',
          info: 'plz upload a pic'
        }))
        res.end()
        return
      }
      log.info(`response ${files.file.path}`)

      let path = files.file.path

      console.log("准备写入文件");
      let bitmap = fs.readFileSync(path)
      let base64Img = Buffer.from(bitmap).toString('base64')
      let fileName =  new Date().getTime() +'.jpg'; 
      let filePath =  '../images/' + fileName; 
      console.log(`文件名: ${filePath}`);
      fs.writeFile(filePath, bitmap,  function(err) {
        if (err) {
          res.writeHead(400, {"Content-Type": "text/json"})
          res.write(err)
          res.end()
          return console.error(err);
        }
        process.exec('chmod 777 ./upImage.sh',function(err){
          console.error(err)
          if (err) {
            res.writeHead(400, {"Content-Type": "text/json"})
            res.write(err)
            res.end()
            return console.error(err);
          }
          res.writeHead(200, {"Content-Type": "text/json"})
          res.write(JSON.stringify(
            {
              'url':'https://gongkuihua.github.io/imageRespository/images/' + fileName
            }
          ))
          res.end()
        })
        console.log("数据写入成功！");
        console.log("--------我是分割线-------------")
        console.log("读取写入的数据！");
        
      });
      
      // fs.writeFile('./data/写入的文件.md','我是被nodejs写入的文件',function(error){
      //   if(error){
      //     console.log('写入成功')
      //   }else{
      //   console.log('写入成功')
      // });

      // addTask(files.file.path, res)
    })
  } else {
      res.writeHead(404, {"Content-Type": "text/plain"})
      res.write('not fonud')
      res.end()
  }
}).listen(port)


log.info(`app run at ${port}`)