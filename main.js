var fs = require("fs");
const apiai = require('apiai');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const publicPath = path.join(__dirname, 'public');
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicPath));


const ai = apiai("");

app.post('/api', (req, res , err )=> {
  var answer = req.body.text;
  console.log(answer);
  var request = ai.textRequest(answer , {
      sessionId: '98324798237409845038'
  });
  request.on('response', function(response) {
       return res.send(response.result.fulfillment.speech);
  });
  request.on('error', function(error) {
      return res.send(error);
  });
  request.end();
});

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
