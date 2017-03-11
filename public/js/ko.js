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
          url: 'http://localhost:3000/api',
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
  /* youtube ai */
  // masnad.youtube = function() {
  //   var youtubevid = masnad.inputYoutube();
  //     $.ajax({
  //         type: 'GET',
  //         url: `http://localhost:3000/youtube?text=${youtubevid}`,
  //         contentType: 'application/json; charset=utf-8',
  //     })
  //     .done(function(result) {
  //       var x = JSON.parse(result);
  //       window.open(x.urlLong);
  //     })
  //     .fail(function(xhr, status, error) {
  //         console.log(error);
  //     })
  //     .always(function(data){
  //     });
  // }

  masnad.youtube = function() {
      $.ajax({
          type: 'POST',
          url: `http://localhost:3000/alarm`,
          contentType: 'application/json; charset=utf-8',
          data: ko.toJSON({
            text : masnad.inputYoutube()
          })
      })
      .done(function(result) {
        /* store the artist */
        masnad.inputYoutubeArtist(result.parameters["music-artist"]);
        /* out put result */
        masnad.wakemeupOutput(result.fulfillment.speech);
        /* store the time */
        if(result.parameters["time"] != null){
          masnad.time(result.parameters["time"]);
          console.log(masnad.time());
        }
        masnad.inputYoutube(null);
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
