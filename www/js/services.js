angular.module('starter.services', ['starter.config'])
// POPUP MESSAGES
.factory('POPUP', function($ionicPopup, $timeout) {
  var self = this;
  self.showAlert = function(title, message, callback){
    var alertPopup = $ionicPopup.alert({
         title: title,
         template: message
    });
    alertPopup.then(function(res) {
        console.log('callback popup');
        if (callback){
            callback();
        }
    });
  };
  return self;
})
// LOCAL STORAGE wrapper
.factory('LOCAL_STORAGE', function() {
  var self = this;
  self.storage = window.localStorage;
  self.prefix = '_';

  self.setStorage = function(key_name, value) {
    self.storage.setItem(self.prefix+key_name, JSON.stringify(value));
  }
  self.getStorage = function(key_name) {
    return JSON.parse(self.storage.getItem(self.prefix+key_name));
  }    
  return self;
})
.factory('GEO', function(LOCAL_STORAGE) {
  var self = this;

  self.getCurrentPosition = function(callback) {
    navigator.geolocation.getCurrentPosition(function(location){
        LOCAL_STORAGE.setStorage('location',location);
        callback(location);
    });
  };    
  return self;
})
// DB wrapper
.factory('DB', function($q, DB_CONFIG) {
    var self = this;
    self.db = null;
    self.id = null;
 
    self.init = function() {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];
            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });
            /* Drop tables for initialise */
            //init user table
            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log('Table ' + table.name + ' initialized');
        });
    };
    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                //console.log ('resultSQL');
                //console.log (result);
                deferred.resolve(result);
            }, function(transaction, error) {
                console.log ('errorSQL');
                console.log (error);
                deferred.reject(error);
            });
        });
        return deferred.promise;
    };
    self.fetchAll = function(result) {
        var output = [];
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        return output;
    };
    self.fetch = function(result) {
        //console.log ("fetch");
        //console.log (result);
        if (result.rows.length>0){
            return result.rows.item(0);    
        } else {
            return false;
        }
        
    };
    return self;
})
// Resource service example
.factory('Document', function(DB) {
    //var user = {};
    var table_name = 'user';
    var self = this;
    // add element
    self.addUser = function(id_fb,name,gender,token) {
        self.getUser().then(function(documents){
            console.log ('result');
            console.log (documents);
            //initialisation
            if (documents == false){
                var settings = {"toogle_woman":true,"toogle_man":true,"toogle_other":true,"range_distance":25,"range_age_min":18,"range_age_max":100};
                return DB.query('REPLACE INTO '+table_name+' (id_fb,name,gender,token,settings) VALUES (\''+id_fb+'\',\''+name+'\',\''+gender+'\',\''+token+'\',\''+JSON.stringify(settings)+'\')');
            }else {
                //update
                self.updateUser(id_fb,name,gender,token);
            }
        });
        //var settings = {"toogle_woman":true,"toogle_man":true,"toogle_other":true,"range_distance":25,"range_age_min":18,"range_age_max":100};
        //return DB.query('REPLACE INTO '+table_name+' (id_fb,name,gender,token,settings) VALUES (\''+id_fb+'\',\''+name+'\',\''+gender+'\',\''+token+'\',\''+JSON.stringify(settings)+'\')');
    };
    /* update user */
    self.updateUser = function(id_fb,name,gender,token) {
        return DB.query('UPDATE '+table_name+' SET name=\''+name+'\',gender=\''+gender+'\',token=\''+token+'\' WHERE id_fb=\''+id_fb+'\'');
    };
    /* update server token */
    self.updateTokenServer = function(id_fb,server_token) {
        //self.user.server_token = server_token;
        return DB.query('UPDATE '+table_name+' SET server_token=\''+server_token+'\' WHERE id_fb=\''+id_fb+'\'')
    };
    /* update geolocation */
    self.updateGeolocation = function(id_fb,geolocation) {
        //self.user.geolocation = geolocation;
        return DB.query('UPDATE '+table_name+' SET geolocation=\''+geolocation+'\' WHERE id_fb=\''+id_fb+'\'')
    };
    /* update settings */
    self.updateSettings = function(id_fb,settings) {
        //self.user.settings = settings;
        return DB.query('UPDATE '+table_name+' SET settings=\''+settings+'\' WHERE id_fb=\''+id_fb+'\'');
    };
    /* get master user app */
    self.getUser = function() {
        return DB.query('SELECT * FROM '+table_name)
        .then(function(result){
            return DB.fetch(result);
        });
    };
    return self;
})
// USER
.factory('USER', function(LOCAL_STORAGE, SERVER_HTTP) {
    var self = this;
    // global vars
    self.user = LOCAL_STORAGE.getStorage('user');
    self.settings = LOCAL_STORAGE.getStorage('settings');

    self.updateProperty = function(prop, value){
        self.user[prop] = value;
        LOCAL_STORAGE.setStorage('user',self.user);
    };
    self.getUser = function(){
        return self.user;
    };
    self.getSettings = function(){
        return self.settings;
    };
    self.setSettings = function(settings){
        self.settings = settings;
        // send to server
        SERVER_HTTP.sendSettings(settings, function(){
            LOCAL_STORAGE.setStorage('settings',settings);
        });
    };
    self.sendUserToServer = function(){
        console.log ('self.user');
        console.log (self.user);

        SERVER_HTTP.sendUser(self.user, function(){
            console.log("user sended");
        });

    };
    return self;
})
// HTTP SERVICE
.factory('SERVER_HTTP', function($http, POPUP, LOCAL_STORAGE) {
    var self = this;
    self.getMessages = function(callback){
        // set messages to server 
          $http.get(GLOBAL_URL+'/messages/'+LOCAL_STORAGE.getStorage('servtoken'))
          .success(function(data, status, headers, config) {
            console.log("ok get messages to SERVER");
            console.log (data);
            callback(data.result);
          }).error(function(data, status, headers, config) {
            console.log("problem avec get messages SERVER NodeJS");
            POPUP.showAlert('Error !', 'Error with Server getMessages !');
            return false;
          });
    };
    self.sendUser = function(user, callback){
        console.log ('send user htttp');
        $http.post(GLOBAL_URL+'/user', {
          server_token: LOCAL_STORAGE.getStorage('servtoken'),
          objectFB:user,
        }).success(function(data, status, headers, config) {
          // success SERVER
          LOCAL_STORAGE.setStorage('servtoken',data.server_token);
          callback(data.result);
        }).error(function(data, status, headers, config) {
          console.log("problem send user SERVER NodeJS");
            POPUP.showAlert('Error !', 'Error with Server !');
        });
    };
    self.sendMessage = function(id_receiver,message,callback){
          // set messages to server 
          $http.post(GLOBAL_URL+'/messages', {
            server_token: LOCAL_STORAGE.getStorage('servtoken'),
            message: message,
            id_receiver: id_receiver
          }).success(function(data, status, headers, config) {
            console.log("ok set messages to SERVER");
            console.log (data);
            callback(data.result);
            //$scope.messages = data.result;
            // assign messages or text
          }).error(function(data, status, headers, config) {
            console.log("problem avec set messages SERVER NodeJS");
            POPUP.showAlert('Error !', 'Error with Server !');
            return false;
          });
        
    };
    self.sendSettings = function(settings,callback){
          // set messages to server 
          $http.post(GLOBAL_URL+'/user/settings', {
            settings:settings,
            server_token:LOCAL_STORAGE.getStorage('servtoken')
          }).success(function(data, status, headers, config) {
            console.log("ok set settings to SERVER");
            console.log (data);
            callback(data.result);
            //$scope.messages = data.result;
            // assign messages or text
          }).error(function(data, status, headers, config) {
            console.log("problem avec set settings SERVER NodeJS");
            POPUP.showAlert('Error !', 'Error with Server !');
            return false;
          });
        
    };
    self.sendMyLocation = function(location){
      /* Send to SERVER my POSITION with my serverkey */
      $http.post(GLOBAL_URL+'/user/geolocation', {
        server_token:LOCAL_STORAGE.getStorage('servtoken'),
        geolocation:location
      }).success(function(data, status, headers, config) {
        console.log("ok send geolocation to SERVER");
        console.log (data);
      }).error(function(data, status, headers, config) {
        console.log("problem avec send location SERVER NodeJS");
        POPUP.showAlert('Error !', 'Error with Server !');
      });
    };
    self.getProximityProfils = function(location, settings,callback){
        // Get from SERVER list of user proximity
      $http.post(GLOBAL_URL+'/proximity', {
        server_token:LOCAL_STORAGE.getStorage('servtoken'),
        geolocation:location,
        settings:settings
      }).success(function(data, status, headers, config) {
        console.log("ok get proximity to SERVER");
        console.log (data);
        callback(data);
      }).error(function(data, status, headers, config) {
        console.log("problem avec proximity SERVER NodeJS");
      });
    };

    self.getOneUserProfil = function(id_profil,callback){
        $http.get(GLOBAL_URL+'/user/'+id_profil+'/'+LOCAL_STORAGE.getStorage('servtoken'), {
          //server_token:,
        }).success(function(data, status, headers, config) {
          console.log("ok get details user to SERVER");
          console.log (data);
          callback(data);
          
        }).error(function(data, status, headers, config) {
          console.log("problem avec get details user SERVER NodeJS");
        });
    };

    self.getMessagesByProfilToSend = function(id_profil,callback){
        $http.get(GLOBAL_URL+'/messages/'+LOCAL_STORAGE.getStorage('servtoken')+'/'+id_profil, {
          //server_token:,
        }).success(function(data, status, headers, config) {
          console.log("ok get messages to SERVER");
          console.log (data);
          callback(data);
        }).error(function(data, status, headers, config) {
          console.log("problem avec get messages SERVER NodeJS");
        });
    };
    return self;
})
.factory('GMAP', function($http) {
    var self = this;
    self.initialize = function(location) {
        console.log ('init gmap');
        console.log (location);
        var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("gmap"),
            mapOptions);
        
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
      }
      //google.maps.event.addDomListener(window, 'load', initialize);

    return self;
})    
;