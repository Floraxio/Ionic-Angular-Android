angular.module('starter.config', [])
.constant('DB_CONFIG', {
    name: 'DB',
    tables: [
      {
            name: 'user',
            columns: [
                {name: 'id_fb', type: 'string primary key'},
                {name: 'name', type: 'text'},
                {name: 'gender', type: 'text'},
                {name: 'token', type: 'text'},
                {name: 'server_token', type: 'text'},
                {name: 'geolocation', type: 'text'},
                {name: 'others', type: 'text'},
                {name: 'psyco', type: 'text'},

            ]
        }
    ]
});