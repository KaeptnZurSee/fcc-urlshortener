'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cors = require('cors');
var dns = require('dns');
require('dotenv').config();

//mongoose stuff
const dbUrl = process.env.MONGO_URI;
const baseUrl = process.env.BASE_URL;

var {Schema} = mongoose;

var urlSchema = new Schema({
  url: String,
  urlCode: String
}) 

var Url = mongoose.model("Urls",urlSchema)
mongoose.connect(dbUrl, {useNewUrlParser: true}).then((err,res)=>{console.log("connected to MongoDB")});



var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

//API endpoints
app.post('/api/shorturl/new',(req,res,next)=>{
  if(isEmpty(req.body)){
    res.status(400).send("Didn't find any data, something went wrong")
  }
  else{
  let test = dns.resolve(req.body.url, (err,addresses,family)=>{ 
  return addresses
    }
                           
   
  );
    let url = new Url({url:req.body.url});
      createAndSaveUrl(url, res);
  }
  
  
})

app.get('/api/:urlCode',(req,res,next)=>{
  Url.findOne({urlCode:req.params.urlCode},(err,data)=>{
    const redirect = data.url;
    res.redirect(redirect);
  })
})



//functions
function createAndSaveUrl(urlObj, res){
  Url.findOne({url:urlObj.url},(err,url)=>{
    
    if(url==null || isEmpty(url)){
       let random = generateRandomString();

      urlObj.urlCode = random;
      urlObj.save(err=>{
        if(err){
          res.status(400).send("could not create a shortened Url")
            }
        else {
          res.status(200).json({url:urlObj.url, shortenedUrl: baseUrl + random})
          }
        }) 
       }
    
    else{ 
      res.status(200).json({url: url.url, shortenedUrl: baseUrl + url.urlCode});
        
      }
  })
  
  

}


function generateRandomString(){
  let randStr = Math.random().toString(36).substring(2,15);
  Url.findOne({urlCode:randStr},(err,url)=>{
    if(!url==null){
      randStr = randStr.substring(1,) + Math.random().toString(36).substring(2,3)
    }
  });
  
 
  return randStr;
}


function isEmpty(obj){
  if(obj == null)return true;
  return Object.entries(obj).length===0&& obj.constructor === Object;
}