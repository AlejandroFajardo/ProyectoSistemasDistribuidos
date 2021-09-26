const express = require('express');
const getSize = require('get-folder-size');
var server = express();
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/photos')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
var upload = multer({ storage: storage });
server.use(express.static(__dirname+'/public'));
const internalIp = require("internal-ip")
async function get_ip(){
  process.env.MY_IP =  await internalIp.v4();
}
get_ip();


server.get('/s_status',(req,res)=>{
    getSize('./public/photos', (err, size) => {
        if (err) { throw err; }
        res.status(200).json({
            size:(size / 1024 / 1024).toFixed(2)
        });        
      });
});

server.post('/photo', upload.single('photo'), function (req, res) {
      res.status(200).json({
        ok:true,
        fileurl:`http://${process.env.MY_IP}:3000/photos/${encodeURIComponent(req.file.originalname)}`,
        imagesize : parseFloat(req.file.size/1024/1024).toFixed(3)+ ' Mb',
        servername:process.env.WHOAMI
    });
});

server.listen(3000,()=>{
    console.log('su servidor express esta escuchando en el puerto 3000');
})