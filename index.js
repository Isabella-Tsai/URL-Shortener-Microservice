require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Start of the program
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/url', { useNewUrlParser: true, useUnifiedTopology: true });

var urlSchema = new mongoose.Schema({
  original: {type: String, required: true},
  short: String
})

var URL = mongoose.model('URL', urlSchema)

app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }),(req,res) => {
  let inputUrl = req.body['url']

 var validUrl = require('valid-url')

  if(!validUrl.isWebUri(inputUrl)){
    res.json({error: 'invalid url' })
    return
  }

  // use shortid to generate unique shorturl
  const shortid = require('shortid')
  let shortUrl=''

  URL.findOne({})
      .sort({short: -1})
      .exec((error, result) => {
        if(!error && result != undefined){
          shortUrl = shortid.generate();
        }
        if(!error){
          URL.findOneAndUpdate(
            {original: inputUrl},
            {original: inputUrl, short: shortUrl},
            {new: true, upsert: true},
            (error, savedUrl) =>{
              if(!error){
                res.json({
                  'original_url':inputUrl,
                  'short_url':savedUrl.short})
              }
            }
          )
        }
      })
})

//When you visit /api/shorturl/<short_url>, you will be redirected to the original URL.
app.get('/api/shorturl/:input', (req, res) =>{
  let input = req.params.input

  URL.findOne({short:input}, (error, result) =>{
    if(!error && result != undefined){
      res.redirect(result.original)
    }else{
      res.json('URL not found')
    }
  })  
})