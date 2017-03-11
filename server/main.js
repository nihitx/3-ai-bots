var fs = require("fs");
const apiai = require('apiai');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const youtube = require('./youtube.js');
const app = express();

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicPath));

const ai = apiai("421d601de1d041b5ba3be26ee637c4ee");
const alarm = apiai("51cd809a3978471385f60add9b42c149");

/* ai getting built here */
app.post('/api', (req, res , err )=> {
  var answer = req.body.text;
  console.log(answer);
  var request = ai.textRequest(answer , {
      sessionId: '0503657881'
  });
  request.on('response', function(response) {
       return res.send(response.result.fulfillment.speech);
  });
  request.on('error', function(error) {
      return res.send(error);
  });
  request.end();
});

/* alarm getting built here */
app.post('/alarm', (req, res , err )=> {
  var alarmRequest = req.body.text;
  var request = alarm.textRequest(alarmRequest , {
      sessionId: '0503657881'
  });
  request.on('response', function(response) {
       return res.send(response.result);
  });
  request.on('error', function(error) {
      return res.send(error);
  });
  request.end();
});

/* youtube part here */
app.get('/youtube', (req,res,next)=>{
  var play = req.query.text ;
  youtube.search_youtube(play, (err,result)=>{
    if(err){
      return res.end(err);
    }else{
      return res.end(JSON.stringify(result));
    }
 });
});

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
