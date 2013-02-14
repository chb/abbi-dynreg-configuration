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

    $scope.$watch("client", function(cnew, cold){
      $scope.jwt = "";  
    }, true);

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

        if (client[list].length === 0) {
          delete client[list]
        }
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

    function save(func, filename){
      return function(){
        saveAs(
          new Blob([func()]
          , {type: "text/json;charset=" + document.characterSet}
          )
          ,filename
        );
      };
    };

    $scope.saveJson = save(
      function(){ return JSON.stringify($scope.client, undefined, 2); },
      "registrationRequest.json"
    );

    $scope.saveJWT = save(
      function(){ return $scope.jwt; },
      "signedRegistrationRequest.json"
    );

    $scope.signJson = function(){

      keypair = jwcrypto.loadFromPEM($scope.pem);
      window.public = keypair.publicKey;
      console.log("signing..", new Date().getTime());
      jwcrypto.sign({
        publicKey: JSON.parse(keypair.publicKey.serialize()),
        registration: $scope.client
      }, keypair.secretKey, function(err, jws) {
        console.log("signed...", new Date().getTime());
        $scope.jwt = jws.toString();
        $scope.$apply();
      }); 
    };


    $scope.loadDemo = function(){
      $scope.clientType = "public"
      $scope.pem = "\
-----BEGIN RSA PRIVATE KEY-----\
MIIEpQIBAAKCAQEA4xOyA7dm+sBx0dBhkKHTpwv6bKWNQK7ufoMrEUaC3U4b+pb1\
MFE1hPK2zNbnJ6fvE0qpltTTVHYc5jSw30/tNZPmHQOFAuHQS9nTrpT27yoeRmIa\
775DpWb5Q1c0n3jYodURBExVkA6p5N7AyEroQxObfa+iIdzsD8tiHGK5O5sJcicx\
ik/40Jid4VE5+FzhLZQMO1bo20peGHuJx/f46VWujmV/iSI6XFk4lIO65MZmnndi\
iM456KMV8WRMO3ZUPLHUxBLgODYBYH4berJOpDLzqnc5G0dftA0he6j+1xjdA2rE\
7oFpyUXQF30WVgkfVAluwrHvPl2onCCVIRNwsQIDAQABAoIBAFY2ehWzIiP9wLj6\
NrCk4CjCAXgSesieIepifo12ieTf7Pt9KOYJTxqE1CZ9SRHjTn+yjyS29O1SUrKM\
OsLuI4998ZX+aheoCF9j+lyELiSrhwcN5FA1mpVHvUd16oLJbOY0cNuC59Fj39kH\
QYZJ+ljNLvHPJu1YZT+x5jQEv3MDOL8YNu+lJ/RDDuUObKcNLcvot3/ReJJRDvnP\
1ZymLGun/CL5tTGI4Ss5EhMzPA5+Xy5Ux04kGL/0eRWRp15xVDbNJx3Htziswd9i\
E59PoLBC6yYvrQX53AjE2RxL51bv7NPZeMLgVRebYvSQRegrLsrIuTmgH6NrOMjc\
pZj8f6kCgYEA9LlDWneyeXgHp3nGAvSEd1j5Q/Wik8TyaG5j0ZERkdBiGTrAPR8h\
mEL4lTLaGzvPzR8GojIOZvQ9hCwkuSUNSCkK5xz1hMR11ZfbOR3sBdKIpmyQCPLG\
50GXH7VnHLsv0BC4/13kTAJS9GZtEn5yqyLARMbzP5w6QHxj+dTb2MsCgYEA7YpF\
3oXobEGiB5XO5WQWGErwOYCwZevq2K7RKqOMp6ZP6j0YONp/MiNQU+jsUmAIllzk\
UPIHyy0NtwkFlB2LHbsIbHB+kudKm7jK2vC7VmFmhtis+8sCyQqO2EI0Ga3fF/rM\
eXzZM6v82lWF2vivYirUXj7lDKWLliy6DOMg+PMCgYEAyVzrS7Qz2XjnK2mqgWH6\
4U0HhWDHTjl+kGlMnvJz93v0S/gol+JWvTdV3UYDauczG/+McMcpTJNpTqkX6nPP\
UvHac8JDTuRsZLzX+E5jl4LdR7sKZSKGgWBZ3hBgcKahN92aqxzxrY03/ruMwevj\
pGcqtyzQmCWPVOJFTRtVbjMCgYEArUYWHXJUztM5nIrc91wA+guAHJIRGufy0ckD\
7zSKX6jj1pxmVOKdsjcsW2knKhe/a9+q9Jj4sm7U+FVualL6rd9HD8MnsYViWSF9\
aCP+o848+dSIqsu15mz7Milo0+qPOHDMQzqdPiIROjr0f3y0gsl3TKBYeNcxcYSC\
2u+7l50CgYEA08zb5JoeeeUmpd8W8HUYXT1tAkPVn+sszNPCUtjSnrV5RveZgJaA\
iLk1IYdmdjFJbjYxwi5pdRHz7Ed0JU11e/Y2KaQmv66tKV+DmrKVTbwcFDd//MWk\
UOkWx1slg9nsAjutb49x3MU9xRhaVSkarIFWI/LWFQ9fLWkJU0O6E4k=\
-----END RSA PRIVATE KEY-----\
";

      $scope.client = {
        "client_name": "Blood Pressure Grapher",
        "tos_url": "https://bpgrapher.org/tos",
        "logo_url": "http://dev.smartplatforms.org/images/smart.png",
        "redirect_uris": [
          "https://bpgrapher.org/after-auth"
        ],
        "client_url": "https://bpgrapher.org",
        "token_endpoint_auth_method": "none",
        "contacts": [
          "contact@bpgrapher.org"
        ]
      } 

     $scope.signJson();
    };

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


