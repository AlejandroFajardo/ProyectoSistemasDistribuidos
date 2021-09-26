const express = require('express');
const {check_storage,send_to} = require('./util/tools')
const { db_client } = require('./db/db');
var server = express();
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage });
var fs = require('fs');
server.set('view engine', 'hbs');
server.use(express.static(__dirname+'/public'));

server.get('/',(req,res)=>{
    res.render('home',{});
})

server.post('/sendfile',upload.single('photo'),(req,res)=>{
    let best = check_storage().then((resp)=>{
        if( resp === null){
            res.status(500).json({
                message:'ninguno de los servidores tiene suficiente memoria' 
            });
        }else{  
            send_to('./temp/'+req.file.originalname,resp.url).then((resp)=>{
                const query = {
                    text: 'INSERT INTO RECORDS(SERVER_URL,NOMBRE,SIZE,SERVERNAME) VALUES($1,$2,$3,$4)',
                    values: [''+resp.fileurl, ''+req.file.originalname , ''+resp.imagesize,resp.servername],
                }  
                db_client.query(query,(err, respo) => {
                    if (err) throw err;
                    fs.unlinkSync('./temp/'+req.file.originalname);
                    res.render('home',{message:'se guardo el archivo en la bd'})
                  })                
            }).catch((err)=>{
                res.status(400).json(err)
            })
        }
    });
});

server.get('/records', (req,res)=>{
    db_client.query('SELECT * FROM RECORDS', (err, response) => {
        if (err) throw err            
        else {
            let records = response.rows;
            res.render('records',{records});
        }
    })
})

server.listen(3000,()=>{
    console.log('su servidor express esta escuchando en el puerto 3000');
});