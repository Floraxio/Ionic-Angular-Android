angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$http) {
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
                          console.log (user);
                            $scope.user = user;
                            console.log ("user");
                            console.log(user);
                        });
                        //SEND TO SERVER
                        $http.post(GLOBAL_URL+'/user', {                            id:user.id,
                          name:user.name,
                          gender:user.gender
                        }).
                        success(function(data, status, headers, config) {
                          console.log("ok");
                          // this callback will be called asynchronously
                          // when the response is available
                          //redirect to profil with update infos server
                        }).
                        error(function(data, status, headers, config) {
                          console.log("problem");
                          // called asynchronously if an error occurs
                          // or server returns response with an error status.
                        });
                    },
                    error: function(error) {
                        alert('Facebook error: ' + error.error_description);
                    }
                  });
                alert ("Vous etes connecte avec Facebook !");
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
.controller('ProfileCtrl', function($scope) {
    openFB.api({
        path: '/me',
        params: {fields: 'id,name'},
        success: function(user) {
            $scope.$apply(function() {
              console.log (user);
                $scope.user = user;
            });
        },
        error: function(error) {
            alert('Facebook error: ' + error.error_description);
        }
    });
})
.controller('PlaylistCtrl', function($scope, $stateParams) {
});
