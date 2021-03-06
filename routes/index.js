var express  = require('express');
var router   = express.Router();
var multer   = require('multer'); // 1
const shell = require('shelljs');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var getDownloadFilename = require('../lib/getDownloadFilename').getDownloadFilename;


var storage  = multer.diskStorage({ // 2
  destination(req, file, cb) {
    cb(null, 'uploadedFiles/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}__${file.originalname}`);
  },
});
var uploadWithOriginalFilename = multer({ storage: storage }); // 3-2

router.get('/', function(req,res){
  res.render('index');
});

router.post('/uploadFileWithOriginalFilename', uploadWithOriginalFilename.single('attachment'), function(req,res){ // 5
  var pathFile = '/home/ohs/RAZEN/PDF-compression/uploadedFiles/' + req.file.filename
  var newFile = '/home/ohs/RAZEN/PDF-compression/newFile/' + req.file.filename

  if (shell.exec('gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/default -dNOPAUSE -dBATCH -sOutputFile=' + newFile + ' ' + pathFile).code) {
    shell.echo('Error');
    shell.exit(1);
  }

  res.render('confirmation', { file_:req.file });
});

router.get('/:file_name', async function(req, res, next) {
  await sleep(4000)
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 

  var file = '/home/ohs/RAZEN/PDF-compression/newFile/' + req.params.file_name;
  // var file = './newFile/' + req.params.file_name;
  
  try {
    if (fs.existsSync(file)) { // 파일이 존재하는지 체크
      var filename = path.basename(file); // 파일 경로에서 파일명(확장자포함)만 추출
      var mimetype = 'pdf'; // 파일의 타입(형식)을 가져옴
    
      res.setHeader('Content-disposition', 'attachment; filename=' + getDownloadFilename(req, filename)); // 다운받아질 파일명 설정
      res.setHeader('Content-type', mimetype); // 파일 형식 지정
    
      var filestream = fs.createReadStream(file);
      filestream.pipe(res);
    } else {
      res.send('해당 파일이 없습니다.');  
      return;
    }
  } catch (e) { // 에러 발생시
    console.log(e);
    res.send('파일을 다운로드하는 중에 에러가 발생하였습니다.');
    return;
  }
});


module.exports = router;