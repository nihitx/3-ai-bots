var fs = require("fs");
const apiai = require('apiai');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const youtube = require('./youtube.js');
const yelp = require('yelp-fusion');
const app = express();
const GooglePlaces = require('googleplaces');
const googlePlaces = new GooglePlaces('AIzaSyDL7jYTLJMNwi7J65KxRD-sc-Qa9_7Kfa0', 'json');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicPath));

const ai = apiai("421d601de1d041b5ba3be26ee637c4ee");
const alarm = apiai("51cd809a3978471385f60add9b42c149");

/* ai getting built here */
app.post('/api', (req, res , next )=> {
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
app.post('/alarm', (req, res , next )=> {
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

/* yelp fusion api running */
yelp.accessToken('x5n0_F1LpkuJBZ4RVDZRwQ', 'OXAjTT8vfv8irugCRTBJljwi0qxWv7S0JfJuuYXDSDaIs41AjPG6GadOI0Gnv8HZ').then(response => {
  const client = yelp.client(response.jsonBody.access_token);

 client.search({
   latitude : 60.164315,
   longitude: 24.936667,
   price : '1,2,3',
   limit : 5,
 }).then(response => {
   var x = response.jsonBody.businesses;
 });
}).catch(e => {
 console.log(e);
});

app.get('/googlePlace',(req,res,next)=>{
  parameters = {
          location: [60.164315, 24.936667],
          types: ['restaurant'],
          radius: '500',
        };
  googlePlaces.placeSearch(parameters, function (error, response) {
      var arr = [];
      if (error) throw error;
      //console.log(response.results[0].name);
      response.results.forEach((entry)=>{
        console.log(entry.name);
         var restaurantName = {
          "name" : entry.name,
          "rating" : entry.rating,
          "place_id" : entry.place_id
        }
        arr.push(restaurantName);
      });
      res.send(arr);
  });
});

app.get('/placeReview',(req,res,next)=>{
  googlePlaces.placeDetailsRequest({placeid: 'ChIJW-dOr8sLkkYRrIpvcMcvb_E'},function(error,response){
    if (error) throw error;
    var storeReview = [];
    response.result.reviews.forEach((entry)=>{
      var review = {
        reviews : entry.text
      }
      storeReview.push(review);
    });
    return res.send(storeReview);
  });
});


app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
