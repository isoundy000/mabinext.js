var Code = require('../../../../../shared/code');
var PlayerModel = require('../../../models/playerModel').PlayerModel;
var async = require('async');
var channelUtil = require('../../../util/channelUtil');
var messageService = require('../../../domain/messageService');
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
    var playerIds = [];
    var players = [];

    async.waterfall([
            function(cb) {
                // auth token
                //self.app.rpc.auth.authRemote.auth(session, token, cb);
                self.app.rpc.auth.authRemote.authByUsernameAndPassword(session, username, password, cb);
            },
            function(code, user, cb) {
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
                PlayerModel.find({ userId: user._id }, function(err, result) {
                    if (!err) {
                        for (var i = 0; i < result.length; i++) {
                            var playerObj = result[i].getPlainObject();
                            playerIds.push(result[i].id);
                            players.push(playerObj);
                        }
                        utils.invokeCallback(cb, null, players);
                    } else {
                        next(null, { code: Code.ENTRY.FA_USER_NOT_EXIST });
                    }
                });
            },
            function(res, cb) {
                players = res;
                console.log("kick " + uid);
                messageService.pushMessageByUids([{ sid: session.frontendId, uid: uid }],
                    'onServerKick', {});
                self.app.get('sessionService').kick(uid, cb);
            },
            function(cb) {
                console.log("kick OK" + uid);
                session.bind(uid, cb);
            },
            function(callback) {
                session.set("playerIds", playerIds);
                session.on('closed', onUserLeave.bind(null, self.app));
                session.pushAll(callback);
                console.log(session.settings);
            }
        ],
        function(err) {
            if (err) {
                console.log(err);
                next(err, { code: Code.FAIL });
                return;
            }
            if (!players || players.length === 0) {
                next(null, { code: Code.OK });
                return;
            } else {
                next(null, { code: Code.OK, players: players });
            }
        });
};

Handler.prototype.enter = function(msg, session, next) {
    var self = this;
    var playerId = msg.id;
    var uid = session.uid;
    var playerIds = session.get("playerIds");
    var player;
    if (playerIds && playerIds.indexOf(playerId) != -1) {
        async.waterfall([function(callback) {
                PlayerModel.findOne({ id: playerId, userId: uid }, function(err, result) {
                    if (!err && result) {
                        utils.invokeCallback(callback, null, result);
                    } else {
                        next(err, { code: Code.ENTRY.FA_USER_NOT_EXIST });
                    }
                });
            },
            function(result, callback) {
                //session.set('serverId', self.app.get('areaIdMap')[player.areaId]);
                player = result;
                session.set('playerName', player.name);
                session.set('playerId', player.id);
                session.pushAll(callback);
            },
            function(callback) {
                self.app.rpc.chat.chatRemote.add(session, uid, player.name,
                    channelUtil.getGlobalChannelName(), callback);
            }
        ], function(err) {
            if (err) {
                console.log(err);
                next(err, { code: Code.FAIL });
                return;
            }
            console.log("finished")
            next(null, { code: Code.OK });
        });
    } else {
        next(err, { code: Code.ENTRY.FA_USER_NOT_EXIST });
    }
}

var onUserLeave = function(app, session, reason) {
    if (!session || !session.uid) {
        return;
    }

    app.rpc.area.playerRemote.playerLeave(session, {
            playerId: session.get('playerId'),
            instanceId: session.get('instanceId')
        },
        function(err) {
            if (!!err) {
                logger.error('user leave error! %j', err);
            }
        });

    app.rpc.chat.chatRemote.kick(session, session.uid, null);
}