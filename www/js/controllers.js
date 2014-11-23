angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$http, LOCAL_STORAGE, SERVER_HTTP) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  $scope.fbLogin = function() {
      openFB.login(
          function(response) {
              if (response.status === 'connected') {
                  console.log('Facebook login succeeded');
                  console.log(response);
                  // set fbtoken storage token
                  LOCAL_STORAGE.setStorage('fbtoken',response.authResponse.token);
                  // ON LOGIN : set my facebook identity to server
                  openFB.api({ // get api facebook
                    path: '/me',
                    params: {fields: GLOBAL_SCOPE_FB_ME},
                    success: function(user) { // set OK LOGIN FB !!!
                      console.log ('user return fb');
                      console.log (user);
                        // On sucess fb me: SEND infos TO SERVER && update sql with token
                        $http.post(GLOBAL_URL+'/user', {
                          objectFB:user,
                        }).success(function(data, status, headers, config) {
                          // success SERVER
                          LOCAL_STORAGE.setStorage('servtoken',data.server_token);
                          LOCAL_STORAGE.setStorage('user',user);
                        }).error(function(data, status, headers, config) {
                          console.log("problem LOGIN avec SERVER NodeJS");
                        });
                    },
                    error: function(error) {
                        alert('Facebook error: ' + error.error_description);
                    }
                  });
                alert ("Vous etes connecte avec Facebook ! (API-V2) Albulms && infos ! ");
              } else {
                  alert('Facebook login failed');
              }
          },
          {scope: GLOBAL_SCOPE_FB});
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})
.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})
.controller('ProfileCtrl', function($scope, $http, USER) {
  $scope.sendAllInfosSettings = function(){
    console.log ('sendAllInfosSettings');
    USER.sendUserToServer();
  };
  $scope.updateDescription = function(desc){
    console.log ("settingsSaves")
    USER.updateProperty('description', desc);
  };
  $scope.updateBirthday = function(birthday){
    USER.updateProperty('birthday', birthday);
  };
  $scope.updateSettings = function(toogle_woman,toogle_man,toogle_other,range_distance,range_age_min,range_age_max){
    $scope.toogle_woman = toogle_woman;
    $scope.toogle_man = toogle_man;
    $scope.toogle_other = toogle_other;
    $scope.range_distance = range_distance;
    $scope.range_age_min = range_age_min;
    $scope.range_age_max = range_age_max;
    /* fomat var setting for store */
    var settings = {"toogle_woman":toogle_woman,"toogle_man":toogle_man,"toogle_other":toogle_other,"range_distance":range_distance,"range_age_min":range_age_min,"range_age_max":range_age_max};
    // updade settings
    USER.setSettings(settings);
  };

  // on INIT, get User && settings
  var user = USER.getUser(),
      setting = USER.getSettings();
      console.log (user);
  $scope.user = user;

  // si setting ok
  if (setting != null){
    $scope.toogle_woman = setting.toogle_woman;
    $scope.toogle_man = setting.toogle_man;
    $scope.toogle_other = setting.toogle_other;
    $scope.range_distance = setting.range_distance;
    $scope.range_age_min = setting.range_age_min;
    $scope.range_age_max = setting.range_age_max;
  } else {
    $scope.toogle_woman = true;
    $scope.toogle_woman = true;
    $scope.toogle_man = true;
    $scope.toogle_other = true;
    $scope.range_distance = 20;
    $scope.range_age_min = 18;
    $scope.range_age_max = 100;
    // init settings for first http
    setting = {};
    setting.toogle_woman = true;
    setting.toogle_man = true;
    setting.toogle_other = true;
    setting.range_distance = 20;
    setting.range_age_min = 18;
    setting.range_age_max = 100;
  }
})
.controller('SearchCtrl', function($scope, $http, GEO, GMAP, LOCAL_STORAGE, SERVER_HTTP) {
  $scope.profilDetailsView = function (profile){
    console.log (profile);
  };
    // ON INIT - search geoloc for proximity
    GEO.getCurrentPosition(function(location){
      console.log ("ok geoloc");
      console.log (location);
      $scope.location = location;
      //GMAP.initialize(location);
        // get user references
        var documents_user = LOCAL_STORAGE.getStorage('user');
        var settings = LOCAL_STORAGE.getStorage('settings');
        // post to server news infos
        SERVER_HTTP.sendMyLocation(location);

        SERVER_HTTP.getProximityProfils(location, settings, function(response){

          console.log ("ok get profil");
          console.log(response);
          $scope.profiles = response;

          // ici peuple les varible de vue
        });


    }, function(){
      console.log ("error GEOLOCALISATION !");
    });
})
/* MULTI PAGE MESSAGE */
.controller('MessagesCtrl', function($scope, SERVER_HTTP) {
  //console.log ($stateParams);
  //$scope.id_receiver = $stateParams.id_receiver;
  
  // init: first get server message ever sended
  SERVER_HTTP.getMessages(function(response){
    console.log (response);
    $scope.messages = response;
  });
})
/* UNIQUE PAGE MESSAGE */
.controller('MessageCtrl', function($scope, $stateParams, $http, POPUP, SERVER_HTTP) {
  $scope.id_receiver = $stateParams.id_receiver;
  $scope.getMessages = function(){
    // get messages to server 
    SERVER_HTTP.getMessagesByProfilToSend($stateParams.id_receiver, function(response){
      $scope.messages = response.result;
      if (response.result.length == 0){
        console.log ('message initial');
        $scope.message = "Prenez les devant, écrivez lui !";
      }
    });
  };
  $scope.sendMessage = function(message){
    console.log (message);
    if (message == 'undefined' || message == undefined || message.length == 0){
      POPUP.showAlert("Error","Veullez remplir le message !");
      return false;
    }
    SERVER_HTTP.sendMessage($stateParams.id_receiver,message, function(response){
      console.log("message send ! ");
      $scope.messages = response;
      //update message send with server //
      $scope.getMessages();
    });
  };
  $scope.getMessages();
  
})
.controller('UserDetailsCtrl', function($scope, $stateParams, $http, SERVER_HTTP) {

    console.log ($stateParams.profile);
    //ON INIT -  get details one profil from server 
    SERVER_HTTP.getOneUserProfil($stateParams.profile, function(response){
      $scope.profile = response.result;  
    });
    
  
})
.controller('PlaylistCtrl', function($scope, $stateParams) {
});
