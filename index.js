var Hapi = require('hapi');
var _ = require('lodash');

// Create a server with a host and port
//var server = new Hapi.Server();

var server = new Hapi.Server({ connections: { routes: { cors: { origin: ['http://backupreport.eu.mt.mtnet'] } } } });

var winston = require('winston');

require('winston-redis').Redis;

var options = {
    name: "redis",
    host: "ch00sm33",
    container: "winston.logging.ch00sdpaapp.web.index",
    length: 10000
};

winston.add(winston.transports.Redis, options);

winston.info('info','Program Started');

server.connection({
    port: 8000
});

var ddSpace = null;


// Add the routecd dp
server.route({
    method: 'GET',
    path:'/set/ddspace/{data}',
    handler: function (request, reply) {
       //console.log(request);
        var d = request.params.data;
        j = JSON.parse(d);
        ddSpace = j;
        _.forEach(j,function (n) {
            //console.log(n.hostname);
            winston.info('info','Recieved data from DPA for DD:' + n.hostname);
        })
        //console.log(j.hostname);
        reply('hello world');
    }
});

server.route({
    method: 'GET',
    path:'/get/ddspace/{data}',
    handler: function (request, reply) {
       //console.log(request);
        var d = request.params.data;
        //console.log()
        var ret = '';

        ret = _.filter(ddSpace, _.matches({'hostname': d}));
        //j = JSON.parse(ret);
        //console.log('Request:' + d + ' sending:' + JSON.stringify(ret[0]));
        winston.info('info','Request:' + d + ' sending:' + JSON.stringify(ret[0]));
        reply(ret[0]);
    }
});


// Start the server



server.start(function () {
    "use strict";
    //console.log("info", "Server running at", server.info.uri);
    winston.info('info',"Server running at", server.info.uri);
  // console.log('info', "Web Socket", serverValues.webServerPort);
    //console.log('Server running at:', server.info.uri);
});
