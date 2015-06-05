/*jslint nomen: true */
/*jslint node:true */

var Hapi = require('hapi');
var _ = require('lodash');

var redisOptions = {
    "host": "ch00sm33",
    "port": "6379"
};

var redisKeys = {
    "dpaDDspace": "dpa.ddspace"
};

var redis = require("redis"),
    redisClient = redis.createClient(redisOptions.port, redisOptions.host);

function saveData2Redis(key, data) {
    "use strict";
    redisClient.set(key, data);
}

function getDataFromRedis(key, callback) {
    "use strict";
    var ret = null;

    redisClient.get(key, function (err, data) {
        ret = data;
        //console.log(JSON.parse(ret));
        callback(JSON.parse(ret));
    });
}

// Create a server with a host and port
//var server = new Hapi.Server();

var server = new Hapi.Server({ connections: { routes: { cors: { origin: ['http://backupreport.eu.mt.mtnet'] } } } });

var winston = require('winston');

var r = require('winston-redis').Redis;

var os = require("os");
var hostName = os.hostname();

var winstonOptions = {
    name: "redis",
    host: "ch00sm33",
    container: "winston.logging." + hostName + ".web.index",
    length: 10000
};

winston.add(winston.transports.Redis, winstonOptions);

//winston.info('info', 'Program Started');

server.connection({
    port: 8000
});

var ddSpace = null;
getDataFromRedis(redisKeys.dpaDDspace, function (val) {
    "use strict";
    ddSpace = val;
    winston.info('info', 'Loaded values from redis:');
});



// Add the routecd dp
server.route({
    method: 'GET',
    path: '/set/ddspace/{data}',
    handler: function (request, reply) {
        "use strict";
        var d = request.params.data;
        ddSpace = JSON.parse(d);
        //ddSpace = j;
        _.forEach(ddSpace, function (n) {
            winston.info('info', 'Recieved data from DPA for DD:' + n.hostname);
        });
        saveData2Redis(redisKeys.dpaDDspace, JSON.stringify(ddSpace));
        reply('Thanks for the information that you uploaded.');
    }
});

server.route({
    method: 'GET',
    path: '/get/ddspace/{data}',
    handler: function (request, reply) {
        "use strict";
        var d = request.params.data,
            ret = '';
        //console.log(ddSpace);
        ret = _.filter(ddSpace, _.matches({'hostname': d}));
        winston.info('info', 'Request:' + d + ' sending:' + JSON.stringify(ret[0]));
        reply(ret[0]);
    }
});


// Start the server
server.start(function () {
    "use strict";
    winston.info('info', "Server running at", server.info.uri);
});

