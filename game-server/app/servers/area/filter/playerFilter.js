var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

module.exports = function() {
    return new Filter();
};

var Filter = function() {};

/**
 * Area filter
 */
Filter.prototype.before = function(msg, session, next) {
    console.log(session.settings);
    var area = pomelo.app.areaManager.getArea(session.get('instanceId'));
    session.area = area;
    var playerId = session.get('playerId');
    var player = area.getPlayer(playerId);

    if (!player) {
        var route = msg.__route__;

        if (route.search(/^area\.resourceHandler/i) == 0 || route.search(/enter$/i) >= 0) {
            next();
            return;
        } else {
            next(new Error('No player exist!'));
            return;
        }
    }

    if (player.died) {
        next(new Error("You can't move a dead man!!!"));
        return;
    }

    next();
};