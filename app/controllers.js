angular.module('bbConfig', ['ngResource', 'ui.bootstrap'], function($routeProvider, $locationProvider){

  $routeProvider.when('/', {
    templateUrl:'templates/index.html',
    controller: 'MainController'
  });

  $routeProvider.otherwise(function(){
    console.log("Route otherwise");
  });

  //  $locationProvider.html5Mode(true);
  console.log("Started module");
});

angular.module('bbConfig').factory('crypto', function($resource, $http) {

});

angular.module('bbConfig').controller("MainController",  
  function($scope, crypto) {

    var client = $scope.client = {
    };

    $scope.imgRegexp = RegExp("\.(png|gif|jpg|svg)$", "i");

    function addX(list){
      return function(u){
        if (!client[list]){ 
          client[list] = [];
        }
        client[list].push(u);
      };
    };

    function removeX(list){
      return function(u){
        client[list] =  client[list].filter(function(t){
          return t !== u;
        });
      };
    };


    // keyed by client confidentiality
    $scope.authMethods = {};
    $scope.authMethods.confidential = [
      {
        value: "client_secret_post",
        title: "Client Secret Post",
        definition: "the client uses the HTTP POST parameters defined in OAuth2.0 section 2.3.1"
      },
      {
        value: "client_secret_basic",
        title: "Client Secret Basic",
        definition: "the client uses the HTTP Basic defined in OAuth2.0 section 2.3.1"
      },
      {
        value: "none",
        title: "None (only option for public clients)",
        definition: "this is a public client as defined in OAuth 2.0 and does not have a client secret"
      } 
    ];

    $scope.authMethods.public = $scope.authMethods.confidential.slice(-1);

    $scope.addUri = addX('redirect_uris');
    $scope.removeUri = removeX('redirect_uris');

    $scope.addContact = addX('contacts');
    $scope.removeContact = removeX('contacts');

  }
);


angular.module('bbConfig').directive("focusOnChange", function() {
  return function(scope, element, attrs) {
    console.log("watching", attrs.focusOnChange);
    scope.$watch(attrs.focusOnChange, 
      function (newValue, oldValue) { 
        if (oldValue === undefined && element.val()==="") { return; }
        console.log("a change", element);
        element.val("");
        element.focus();
      },true);
  };    
});

angular.module('bbConfig').directive("shiftUpOnFocus", function() {
  return function(scope, element, attrs) {

    var fon = $(element).on("focus", function(){
      $(element).off("focus", fon);
      console.log("got ofc", scope, scope.client);
      scope.client.redirect_uris.push({value: ""});
      console.log($(element).prevAll("input"));
      $(element).prev("input").focus();
      scope.$apply();
      setTimeout(function(){
        $("input.redirect_uri").last().focus();
      });
    });
  };    
});


