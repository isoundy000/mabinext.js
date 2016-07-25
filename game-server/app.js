var pomelo = require('pomelo');
var db = require('./db');

var dataApi = require('./app/util/dataApi');

var playerFilter = require('./app/servers/area/filter/playerFilter');

var scene = require('./app/domain/area/scene');
var areaService = require('./app/services/areaService');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'mabinext');

// app configuration
app.configure('production|development', 'connector', function() {
    app.set('connectorConfig', {
        connector: pomelo.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true
    });
});

// Configure for area server
app.configure('production|development', 'area', function() {
    app.filter(pomelo.filters.serial());
    app.before(playerFilter());

    //Load scene server and instance server
    var server = app.curServer;
    if (server.instance) {
        instancePool.init(require('./config/instance.json'));
        app.areaManager = instancePool;
    } else {
        scene.init(dataApi.area.findById(server.area));
        app.areaManager = scene;
        /*
         kill -SIGUSR2 <pid>
         http://localhost:3272/inspector.html?host=localhost:9999&page=0
        */
        /*
        // disable webkit-devtools-agent
        var areaId = parseInt(server.area);
        if(areaId === 3) { // area-server-3
          require('webkit-devtools-agent');
          var express = require('express');
          var expressSvr = express.createServer();
          expressSvr.use(express.static(__dirname + '/devtools_agent_page'));
          var tmpPort = 3270 + areaId - 1;
          expressSvr.listen(tmpPort);
        }
        */
    }

    //Init areaService
    areaService.init();
});

// start app
app.start();

process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
});