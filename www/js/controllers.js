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
.controller('SearchCtrl', function($scope, $http, GEO, LOCAL_STORAGE, SERVER_HTTP) {
  $scope.profilDetailsView = function (profile){
    console.log (profile);
  };
    // search geoloc for proximity
    GEO.getCurrentPosition(function(location){
      console.log ("ok geoloc");
      console.log (location);

        // get user references
        var documents_user = LOCAL_STORAGE.getStorage('user');
        var setting = LOCAL_STORAGE.getStorage('settings');
        // post to server news infos
        SERVER_HTTP.sendMyLocation(location);

        /*SERVER_HTTP.getProximityProfils(function(response){

          console.log ("ok get profil");
          console.log(response);
        });*/


    }, function(){
      console.log ("error GEOLOCALISATION !");
    });
})
/* MULTI PAGE MESSAGE */
.controller('MessagesCtrl', function($scope, SERVER_HTTP) {
  //console.log ($stateParams);
  //$scope.id_receiver = $stateParams.id_receiver;
  
  // init: first get server message ever sended

  // set messages to server
  SERVER_HTTP.getMessages(function(data){
    console.log (data);
    $scope.messages = data.result;
  }); 
  /*$http.get(GLOBAL_URL+'/messages/'+documents.server_token, {
      server_token:documents.server_token,
    }).success(function(data, status, headers, config) {
      console.log("ok set messages to SERVER");
      console.log (data);
      $scope.messages = data.result;
      // assign messages or text
    }).error(function(data, status, headers, config) {
      console.log("problem avec set messages SERVER NodeJS");
    });*/
  




})
/* UNIQUE PAGE MESSAGE */
.controller('MessageCtrl', function($scope, $stateParams, $http, Document, SERVER_HTTP) {
  $scope.id_receiver = $stateParams.id_receiver;

  $scope.sendMessage = function(message){

    if (message.lenght == 0){
      alert ("remplir le message !");
      return false;
    }
    // recup filed && send info to server
    console.log (message);

    SERVER_HTTP.sendMessage($stateParams.id_receiver,message, function(data){
      console.log("message send ! ");
      $scope.messages = data.result;
    });
    //update message send with server //
  };

  
  console.log ($stateParams);
  // init get local user
  Document.getUser().then(function(documents){
    console.log ('getuser');
    console.log (documents);
    // get messages to server 
    $http.get(GLOBAL_URL+'/messages/'+documents.server_token+'/'+$stateParams.id_receiver, {
      //server_token:,
    }).success(function(data, status, headers, config) {
      console.log("ok get messages to SERVER");
      console.log (data);
      $scope.messages = data.result;
      // assign messages or text
      if (data.result != null){
        console.log ("messages a afficher");
      }else {

        $scope.message = "Prenez les devant, écrivez lui !";
      }
    }).error(function(data, status, headers, config) {
      console.log("problem avec get messages SERVER NodeJS");
    });
  });
})
.controller('UserDetailsCtrl', function($scope, $stateParams, $http, Document) {

  console.log ($stateParams.profile);
  // init get local user
  Document.getUser().then(function(documents){
    console.log ('getuser');
    console.log (documents);
    // get details profil to server 
    $http.get(GLOBAL_URL+'/user/'+$stateParams.profile+'/'+documents.server_token, {
      //server_token:,
    }).success(function(data, status, headers, config) {
      console.log("ok get details user to SERVER");
      console.log (data);
      $scope.profile = data.result;
    }).error(function(data, status, headers, config) {
      console.log("problem avec get details user SERVER NodeJS");
    });
  });
})
.controller('PlaylistCtrl', function($scope, $stateParams) {
});
