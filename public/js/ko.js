function AppViewModel() {
  var masnad = this;
  masnad.input = ko.observable();
  masnad.ai = ko.observable();

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

}
    $(document).ready(function () {
        $.ajaxSetup({ cache: false });
        ko.applyBindings(new AppViewModel(), document.getElementById('KnockoutBind'));
    });
