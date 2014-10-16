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
        return result.rows.item(0);
    };
    return self;
})
// Resource service example
.factory('Document', function(DB) {
    //var user = {};
    var table_name = 'user';
    var self = this;
    self.setUserFB = function (user_fb){
        self.user_fb = user_fb;
    }

    self.all = function() {
        return DB.query('SELECT * FROM '+table_name+'')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    self.getById = function(id) {
        return DB.query('SELECT * FROM '+table_name+' WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };
    self.countAll = function() { // SELECT COUNT(column_name) FROM table_name;
        return DB.query('SELECT COUNT(id_fb) as ct FROM '+table_name+'')
        .then(function(result){
            return DB.fetch(result);
        });
    };
    // add element
    self.addUser = function(id_fb,name,gender,token) {
        return DB.query('REPLACE INTO '+table_name+' (id_fb,name,gender,token) VALUES (\''+id_fb+'\',\''+name+'\',\''+gender+'\',\''+token+'\')');
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
// view templates vars
.factory('Globals', function(DB, Document) {
    var self = this;

    var settings = {"toogle_woman":true,"toogle_man":true,"toogle_other":true,"range_distance":20};

    /* init config settings */
    self.addDefaultsSettings = function(id_fb) {
        return DB.query('UPDATE user SET settings=\''+settings+'\' WHERE id_fb=\''+id_fb+'\'');
    };
    self.getDefaultsSettings = function() {
        return self.settings;
    };
    /// OTER NOT TESTED //
    /* OBJECT USER FB */
    var user_fb = {};
    /* TEMPLATES VARS ARRAY */
    var template_vars = [];

    self.setUser_fb = function (user_fb){
        self.user_fb = user_fb;
    }

    
    self.setVar = function(id,value) {
        self.template_vars.push(id,value);
    };
    self.getVar = function(id) {

        self.template_vars.push(id,value);
    };
    
    return self;
});