angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$http, Document) {
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
                  // ON LOGIN : set my facebook identity to server
                  openFB.api({ // get api facebook
                    path: '/me',
                    params: {fields: 'id,name,birthday,gender,about,is_verified'},
                    success: function(user) { // set
                      // global app assign user
                        $scope.$apply(function() {
                            $scope.user = user;
                            //GLOBALS_VARS['user'] user;
                            var token = response.authResponse.token;
                                // insert or update item
                                /*Document.addUser(user.id,user.name,user.gender,token).then(function(documents){
                                    $scope.documents = documents;
                                    console.log("addUser");
                                    console.log(documents);
                                });*/
                            console.log ("userfb conected");
                            console.log(user);
                        });
                        /*
                        //SEND FIRST INFOS Conect infos TO SERVER && update sql
                        $http.post(GLOBAL_URL+'/user', {                            id:user.id,
                          name:user.name,
                          gender:user.gender
                        }).success(function(data, status, headers, config) {
                          console.log("ok SERVER");
                          // this callback will be called asynchronously
                          // when the response is available
                          //redirect to profil with update infos server
                        }).error(function(data, status, headers, config) {
                          console.log("problem avec SERVER NodeJS");
                          // called asynchronously if an error occurs
                          // or server returns response with an error status.
                        });
                        */
                    },
                    error: function(error) {
                        alert('Facebook error: ' + error.error_description);
                    }
                  });
                alert ("Vous etes connecte avec Facebook ! Veuillez noter que FB est la seule plateforme de conection ici (API-V2) !");
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
////////////////////////////////
    // SQL storage examples
    //$scope.documents = [];
    //$scope.document = null;
    /*Document.countAll().then(function(documents){
        $scope.documents = documents;
        console.log("countAll");
        console.log(documents);
    });*/


    /*Document.countAll().then(function(documents){
        $scope.documents = documents;
        console.log("countAll");
        console.log(documents);
    });*/
    /*Document.all().then(function(documents){
        $scope.documents = documents;
        console.log(documents);
    });*/
    // Get one document, example with id = 2
    /*Document.getById(0).then(function(document) {
        $scope.document = document;
    });*/
///////////////////////////////////////
})
/*.controller('DocumentCtrl', function($scope, Document) {
    
})*/
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
.controller('ProfileCtrl', function($scope, $http) {
  // request api with all infos
    openFB.api({
        path: '/me',
        params: {fields: ''},
        success: function(user) {
          console.log ("ccccc");
          console.log (user);
            // set view user
            $scope.$apply(function() {
                $scope.user = user;
            });
            // set to SERVER NODE news (if needed timing)
            console.log (user);
            //SEND user infos TO SERVER
            /*
            $http.post(GLOBAL_URL+'/user', {
              objectFB:user
            }).success(function(data, status, headers, config) {
              console.log("ok send user info to SERVER");
              console.log ('data receive all ok');
              //console.log (data);

              // insert or update item User
              Document.addUser(user.id,user.name,user.gender,token, data.server_token).then(function(documents){
                  //$scope.documents = documents;
                  console.log("addUser");
                  console.log(documents);
              });

              // this callback will be called asynchronously
              // when the response is available
              //redirect to profil with update infos server
            }).error(function(data, status, headers, config) {
              console.log("problem avec PROFIL SERVER NodeJS");
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
            */
            // HTTP NODE JS
        },
        error: function(error) {
            alert('Facebook error: ' + error.error_description);
        }
    });
})
.controller('SearchCtrl', function($scope, $http) {
    // search geoloc for proximity
    navigator.geolocation.getCurrentPosition(function(location){
      console.log ("ok geoloc");
      console.log (location);
      /* Send to SERVER my POSITION */
      $http.post(GLOBAL_URL+'/user/geolocation', {
        
        geolocation:location
      }).success(function(data, status, headers, config) {
        console.log("ok send user info to SERVER");
        console.log ('data receive geoloc ! ');
        console.log (data);

        //$scope.location = data;
        // insert or update item
        /*Document.updateTokenServer(user.token, data.server_token).then(function(documents){
            $scope.documents = documents;
            console.log("updateToken");
            console.log(documents);
        });*/

        // this callback will be called asynchronously
        // when the response is available
        //redirect to profil with update infos server
      }).error(function(data, status, headers, config) {
        console.log("problem avec PROFIL SERVER NodeJS");
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
    }, function(){
      console.log ("error GEOLOCALISATION !");
    });
})
.controller('PlaylistCtrl', function($scope, $stateParams) {
});
