var Code = require('../../../../../shared/code');

var messageService = require('../../../domain/messageService');
var actionManager = require('../../../domain/action/actionManager');

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');

var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');

var PlayerModel = require('../../../models/playerModel').PlayerModel;
var formula = require('../../../consts/formula');

var i = 1;

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var players = {};
var movecount = 0;

/**
 * Character enter scene, and response the related information such as
 * CharacterInfo, AreaInfo and MapData to client.
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
Handler.prototype.enter = function(msg, session, next) {
    var area = session.area;
    var playerId = session.get("playerId");
    var uid = session.uid;
    var areaId = 1;
    //var areaId = session.get('areaId');
    //var teamId = session.get('teamId') || consts.TEAM.TEAM_ID_NONE;
    //var isCaptain = session.get('isCaptain');
    //var isInTeamInstance = session.get('isInTeamInstance');
    var instanceId = session.get('instanceId');
    //utils.myPrint("1 ~ EnterScene: areaId = ", areaId);
    console.log("1 ~ EnterScene: playerId = " + playerId);
    //utils.myPrint("1 ~ EnterScene: teamId = ", teamId);

    PlayerModel.findOne({ id: playerId, userId: uid }, function(err, result) {
        if (err || !result) {
            logger.error('Get player failed! ' + err);
            next(new Error('fail to get player form playermodel'), {
                route: msg.route,
                code: consts.MESSAGE.ERR
            });
            return;
        }

        var p = formula.getRandomPosition(5, 20);
        var player = result.createObject();
        console.log(JSON.stringify(player));
        player.x = p.x;
        player.y = 0;
        player.z = p.y;

        //player.serverId = session.frontendId;
        //player.teamId = teamId;
        //player.isCaptain = isCaptain;
        //player.isInTeamInstance = isInTeamInstance;
        //player.instanceId = instanceId;
        // areaId = player.areaId;
        player.areaId = 1;
        player.instanceId = 0;
        player.serverId = session.frontendId;
        utils.myPrint("2 ~ GetPlayerAllInfo: player.instanceId = ", player.instanceId);

        //pomelo.app.rpc.chat.chatRemote.add(session, session.uid,player.name, channelUtil.getAreaChannelName(areaId), null);
        //var map = area.map;

        // temporary code
        //Reset the player's position if current pos is unreachable
        // if (!map.isReachable(player.x, player.y)) {
        //     // {
        //     var pos = map.getBornPoint();
        //     player.x = pos.x;
        //     player.y = pos.y;
        // }
        // temporary code
        var data = {
            entities: area.getAreaInfo({ x: player.x, y: player.z }, player.range),
            player: player.getInfo()
                // map: {
                //     name: map.name,
                //     width: map.width,
                //     height: map.height,
                //     tileW: map.tileW,
                //     tileH: map.tileH,
                //     weightMap: map.collisions
                // }
        };
        console.log(session.settings);
        //utils.myPrint("1.5 ~ GetPlayerAllInfo data = ", JSON.stringify(data));
        next(null, data);

        //utils.myPrint("2 ~ GetPlayerAllInfo player.teamId = ", player.teamId);
        //utils.myPrint("2 ~ GetPlayerAllInfo player.isCaptain = ", player.isCaptain);


        if (!area.addEntity(player)) {
            logger.error("Add player to area faild! areaId : " + player.areaId);
            next(new Error('fail to add user into area'), {
                route: msg.route,
                code: consts.MESSAGE.ERR
            });
            return;
        }

        //session.set('serverId', self.app.get('areaIdMap')[player.areaId]);

        //if (player.teamId > consts.TEAM.TEAM_ID_NONE) {
        // send player's new info to the manager server(team manager)
        //var memberInfo = player.toJSON4TeamMember();
        //memberInfo.backendServerId = pomelo.app.getServerId();
        // pomelo.app.rpc.manager.teamRemote.updateMemberInfo(session, memberInfo,
        //     function(err, ret) {});
        //}

    });
};

Handler.prototype.move = function(msg, session, next) {
    movecount++;
    console.log("movecount\t" + movecount);
    next(null, null);
}