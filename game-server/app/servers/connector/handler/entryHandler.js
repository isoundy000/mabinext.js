var Code = require('../../../../../shared/code');
var PlayerModel = require('../../../models/playerModel').PlayerModel;
var async = require('async');
//var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');
var logger = require('pomelo-logger').getLogger(__filename);

var mongoose = require('mongoose');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

Handler.prototype.echo = function(msg, session, next) {
    next(null, new Date().getTime());
}

/**
 * New client entry game server. Check token and bind user info into session.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
    // var token = msg.username,
    //     self = this;
    // if (!token) {
    //     next(new Error('invalid entry request: empty token'), { code: Code.FAIL });
    //     return;
    // }
    var self = this;
    var username = msg.username;
    var password = msg.password;

    var uid, players, player;
    async.waterfall([
            function(cb) {
                // auth token
                //self.app.rpc.auth.authRemote.auth(session, token, cb);
                self.app.rpc.auth.authRemote.authByUsernameAndPassword(session, username, password, cb);
            },
            function(code, user, cb) {
                console.log("auth checked");
                if (code !== Code.OK) {
                    console.log("auth ok");
                    next(null, { code: code });
                    return;
                }

                if (!user) {
                    console.log("auth FA_USER_NOT_EXIST");
                    next(null, { code: Code.ENTRY.FA_USER_NOT_EXIST });
                    return;
                }

                uid = user._id;
                console.log(uid);

                PlayerModel.find({ userId: user._id }, function(err, result) {
                    if (!err) {
                        var players = [];
                        for (var i = 0; i < result.length; i++) {
                            players.push(result[i].getPlainObject());
                        }
                        utils.invokeCallback(cb, null, players);
                    } else {
                        next(null, { code: Code.ENTRY.FA_USER_NOT_EXIST });
                    }
                });
            },
            function(res, cb) {
                console.log(" PlayerModel.findById callback");
                // generate session and register chat status

                console.log(cb);

                players = res;
                self.app.get('sessionService').kick(uid, cb);
            },
            function(cb) {
                console.log("session.bind");
                session.bind(uid, cb);
                console.log(session);
                console.log("session.bind(uid, cb)");
            },
            function(cb) {
                console.log(session.settings);
                if (!players || players.length === 0) {
                    next(null, { code: Code.OK });
                    return;
                } else {
                    next(null, { code: Code.OK, characters: players });
                }
                //player = players[0];

                //session.set('serverId', self.app.get('areaIdMap')[player.areaId]);
                //session.set('playername', player.name);
                //session.set('playerId', player.id);
                // session.on('closed', onUserLeave.bind(null, self.app));
                // session.pushAll(cb);
                // console.log("session.pushAll(cb);");
            },
            function(cb) {
                console.log("chatRemote");
                //			self.app.rpc.chat.chatRemote.add(session, player.userId, player.name,
                //				channelUtil.getGlobalChannelName(), cb);
                cb(null);
            }
        ],
        function(err) {
            if (err) {
                console.log(err);
                next(err, { code: Code.FAIL });
                return;
            }
            console.log("finished")
            next(null, { code: Code.OK, characters: [] });
        });
};

var onUserLeave = function(app, session, reason) {
    if (!session || !session.uid) {
        return;
    }

    //	//utils.myPrint('1 ~ OnUserLeave is running ...');
    //    
    //	//app.rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), instanceId: session.get('instanceId')},
    //    
    //    function(err){
    //		if(!!err){
    //			logger.error('user leave error! %j', err);
    //		}
    //	};

    //	//app.rpc.chat.chatRemote.kick(session, session.uid, null);
};