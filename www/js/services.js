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
            
            /* Drop user table */
            //self.dropUser();
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
    var table_name = 'user';
    var self = this;
    
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
    self.countAll = function() {
        return DB.query('SELECT COUNT(*) FROM '+table_name+'')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    // list tables in BDD
    /*self.getTables = function() {
        //var ee = DB.query;
        //console.log (ee);
        return DB.query('SELECT * FROM information_schema.tables')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };*/
    // add element
    self.addUser = function(id_fb,name,gender,token) {
        self.id = id_fb;
        return DB.query('REPLACE INTO '+table_name+' (id_fb,name,gender,token) VALUES (\''+id_fb+'\',\''+name+'\',\''+gender+'\',\''+token+'\')')
    };
    self.updateTokenServer = function(id_fb,server_token) {
        return DB.query('UPDATE '+table_name+' SET server_token=\''+server_token+'\' WHERE id_fb=\''+id_fb+'\'')
    };
    self.updateGeolocation = function(id_fb,geolocation) {
        return DB.query('UPDATE '+table_name+' SET geolocation=\''+geolocation+'\' WHERE id_fb=\''+id_fb+'\'')
    };
    self.updateSettings = function(id_fb,settings) {
        return DB.query('UPDATE '+table_name+' SET settings=\''+settings+'\' WHERE id_fb=\''+id_fb+'\'');
    };
    self.getUser = function() {
        return DB.query('SELECT * FROM '+table_name)
        .then(function(result){
            return DB.fetch(result);
        });
    };
    return self;
});