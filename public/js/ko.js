function AppViewModel() {
  var masnad = this;
  /* input for flower bot */
  masnad.input = ko.observable();
  /* output for flower bot */
  masnad.ai = ko.observable();

  /* input for wake me up bot */
  masnad.inputYoutube = ko.observable();
  /* output for wake me up bot */
  masnad.wakemeupOutput = ko.observable();
/* stores the artist */
  masnad.inputYoutubeArtist = ko.observable();
  /* store the time */
  masnad.time = ko.observable();

/* flower ai */
  masnad.information = function() {
      $.ajax({
          type: 'POST',
          url: 'https://mysterious-tor-96602.herokuapp.com/api',
          contentType: 'application/json; charset=utf-8',
          data: ko.toJSON({
            text : masnad.input()
          })
      })
      .done(function(result) {
        masnad.ai(result);
        masnad.input(null);
      })
      .fail(function(xhr, status, error) {
          console.log(error);
      })
      .always(function(data){
      });
  }
  /* wake me up ai  */
  masnad.callYoutube = function() {
    var youtubevid = masnad.inputYoutubeArtist() + ' music video';
    console.log(youtubevid);
      $.ajax({
          type: 'GET',
          url: `https://mysterious-tor-96602.herokuapp.com/youtube?text=${youtubevid}`,
          contentType: 'application/json; charset=utf-8',
      })
      .done(function(result) {
        var x = JSON.parse(result);
        window.open(x.urlLong);
      })
      .fail(function(xhr, status, error) {
          console.log(error);
      })
      .always(function(data){
      });
  }

  masnad.youtube = function() {
      $.ajax({
          type: 'POST',
          url: `https://mysterious-tor-96602.herokuapp.com/alarm`,
          contentType: 'application/json; charset=utf-8',
          data: ko.toJSON({
            text : masnad.inputYoutube()
          })
      })
      .done(function(result) {
        /* store the artist */
        if(result.parameters){
          if(result.parameters["music-artist"]){
            masnad.inputYoutubeArtist(result.parameters["music-artist"]);
          }
        }
        /* out put result */
        if(result.fulfillment){
          masnad.wakemeupOutput(result.fulfillment.speech);
        }
        /* store the time */
        if(result.parameters){
          if(result.parameters["time"] != null){
            masnad.time(result.parameters["time"]);
            console.log(masnad.time());
          }
        }
        masnad.inputYoutube(null);
        if(result.action == 'alarm.confirm'){
          var x = masnad.time(); //any value you will pass
          console.log(x);
          let date1 = new Date();
          date1.setHours(x.split(":")[0]);
          date1.setMinutes(x.split(":")[1]);
          date1.setSeconds(x.split(":")[2]);

          var t = date1 - new Date();
          var timeleft = t / 1000;
          var downloadTimer = setInterval(function(){
          timeleft--;
          document.getElementById("countdowntimer").textContent = timeleft;
          if(timeleft <= 0)
              clearInterval(downloadTimer);
          },1000);
          setTimeout(function(){
            masnad.callYoutube();
          },t)

        }
      })
      .fail(function(xhr, status, error) {
          console.log(error);
      })
      .always(function(data){
      });
  }

  /* Find best food near me ai */
  masnad.restInfo = ko.observable();
  masnad.displayRestInfo = ko.observable(null);
  masnad.callrestaurantagent = function() {
      $.ajax({
          type: 'POST',
          url: 'https://mysterious-tor-96602.herokuapp.com/getRestaurant',
          contentType: 'application/json; charset=utf-8',
          data: ko.toJSON({
            text : masnad.restInfo()
          })
      })
      .done(function(result) {
        console.log(result);
        masnad.displayRestInfo(result.fulfillment.speech);
        masnad.restInfo(null);
        if(result.actionIncomplete == false){
          console.log('calling googleplaces');
          masnad.googleplaces(result.parameters);
        }
      })
      .fail(function(xhr, status, error) {
          console.log(error);
      })
      .always(function(data){
      });
  }
  masnad.storeGooglePlaces = ko.observableArray();
  masnad.googleplaces = function(param){
    var address = param.address;
    var food_type = param["food-type"];
    var makeSentence = `${food_type} restaurant in ${address}`
    $.ajax({
        type: 'POST',
        url: 'https://mysterious-tor-96602.herokuapp.com/textSearch',
        contentType: 'application/json; charset=utf-8',
        data: ko.toJSON({
          text : makeSentence
        })
    })
    .done(function(result) {
      $.each(result, function (index, place) {
          masnad.storeGooglePlaces.push(place);
      });
      console.log(masnad.storeGooglePlaces());
    })
    .fail(function(xhr, status, error) {
        console.log(error);
    })
    .always(function(data){
    });
  }

}
    $(document).ready(function () {
        $.ajaxSetup({ cache: false });
        ko.applyBindings(new AppViewModel(), document.getElementById('KnockoutBind'));
    });
