angular.module('starter.services', ['starter.config'])
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
.factory('SERVER_HTTP', function($http, DB, Document) {
    var self = this;
    var server_token = null;
    self.login = function(user){
       /* On sucess fb me: SEND infos TO SERVER && update sql with token*/
        $http.post(GLOBAL_URL+'/user', {
          objectFB:user,
        }).success(function(data, status, headers, config) {
            self.server_token = data.server_token;
          // success SERVER
          console.log("LOGIN ok SERVER, update token..");
          console.log(data);
          /* add user UNIQUE HERE && finally update token server */
          Document.addUser(user.id,user.name,user.gender,token);
          Document.updateTokenServer(user.id, self.server_token);

        }).error(function(data, status, headers, config) {
          console.log("problem LOGIN avec SERVER NodeJS");
        });
    };
    self.sendMessage = function(id_receiver,message){
            
          // set messages to server 
          $http.post(GLOBAL_URL+'/messages', {
            server_token: self.server_token,
            message: message,
            id_receiver: id_receiver
          }).success(function(data, status, headers, config) {
            console.log("ok set messages to SERVER");
            console.log (data);
            return data.result;
            //$scope.messages = data.result;
            // assign messages or text
          }).error(function(data, status, headers, config) {
            console.log("problem avec set messages SERVER NodeJS");
            return false;
          });
        
    };
    self.sendSettings = function(settings){
        
          // set messages to server 
          $http.post(GLOBAL_URL+'/user/settings', {
            settings:settings,
            server_token:self.server_token
          }).success(function(data, status, headers, config) {
            console.log("ok set messages to SERVER");
            console.log (data);
            return data.result;
            //$scope.messages = data.result;
            // assign messages or text
          }).error(function(data, status, headers, config) {
            console.log("problem avec set messages SERVER NodeJS");
            return false;
          });
        
    };

    return self;
});