
var GLOBAL_URL = 'http://localhost:8080/api';
var GLOBAL_SCOPE_FB = 'email,publish_actions,public_profile,user_about_me,user_friends,';
var GLOBAL_SCOPE_FB_SEC = 'id,name,about,bio,birthday,email,favorite_athletes,favorite_teams,first_name,hometown,inspirational_people,installed';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.services', 'starter.controllers'])

.run(function($ionicPlatform, DB) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  // INIT SQL
  DB.init();
  // init geolocation permanent
  

})

.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
  //Enable cross domain calls
  $httpProvider.defaults.useXDomain = true;
  //Remove the header used to identify ajax call  that would prevent CORS from working
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.search', {
      url: "/search",
      views: {
        'menuContent' :{
          templateUrl: "templates/search.html",
          controller: "SearchCtrl"
        }
      }
    })

    .state('app.browse', {
      url: "/browse",
      views: {
        'menuContent' :{
          templateUrl: "templates/browse.html"
        }
      }
    })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })
    .state('app.acceuil', {
      url: "/acceuil",
      views: {
        'menuContent' :{
          templateUrl: "templates/acceuil.html"
          //controller: 'PlaylistsCtrl'
        }
      }
    })
    .state('app.profil', {
      url: "/profil",
      views: {
        'menuContent' :{
          templateUrl: "templates/profil.html",
          controller: 'ProfileCtrl'
        }
      }
    })
    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/acceuil');
});

// INIT FBLogin
openFB.init({appId: '1475373929411664'});

