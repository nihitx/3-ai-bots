var fs = require("fs");
var request = require('request');
const apiai = require('apiai');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const youtube = require('./youtube.js');
const yelp = require('yelp-fusion');
const app = express();
const GooglePlaces = require('googleplaces');
const config = require('./config.js');
const googlePlaces = new GooglePlaces(config.googlePlacesKey(), 'json');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicPath));

const ai = apiai(config.apiAiKey());
const alarm = apiai(config.apiAiAlarm());
const restaurant_agent = apiai(config.restaurantAgent());

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
yelp.accessToken(config.yelpClientId(), config.yelpSecretKey()).then(response => {
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

app.post('/textSearch',(req,res,next)=>{
  console.log('in google text search');
  var param = req.body.text
  var parameters = {
      query: param
  };

  googlePlaces.textSearch(parameters, function (error, response) {
      if (error) throw error;
      var arr = [];
      response.results.forEach((entry)=>{
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
  googlePlaces.placeDetailsRequest({placeid: 'ChIJWy-H8soLkkYRgBBHQCr7eL8'},function(error,response){
    if (error) throw error;
    var storeReview = [];
    response.result.reviews.forEach((entry)=>{
      var review = {
        reviews : entry.text
      }
      storeReview.push(review);
    });
    return res.send(storeReview[0]);
  });
});

/* restaurant agent */
app.post('/getRestaurant', (req, res , next )=> {
  var answer = req.body.text;
  var request = restaurant_agent.textRequest(answer , {
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

// for facebook verification
app.get('/webhook', function (req, res) {
  console.log('getting fb verification');
	if (req.query['hub.verify_token'] === 'facebookiscallingme') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			if (text === 'Generic'){
				console.log("welcome to chatbot")
				//sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = fb_access_token;

function sendTextMessage(sender, text) {
  console.log(sender);
  console.log(text);
	let messageData = { text:text }

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}



app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
