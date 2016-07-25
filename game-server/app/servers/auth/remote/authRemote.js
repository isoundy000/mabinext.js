// var tokenService = require('../../../../../shared/token');
var UserModel = require('../../../models/userModel').UserModel;
var Code = require('../../../../../shared/code');

var DEFAULT_SECRET = 'pomelo_session_secret';
var DEFAULT_EXPIRE = 6 * 60 * 60 * 1000; // default session expire time: 6 hours

module.exports = function(app) {
    return new Remote(app);
};

var Remote = function(app) {
    this.app = app;
    var session = app.get('session') || {};
    this.secret = session.secret || DEFAULT_SECRET;
    this.expire = session.expire || DEFAULT_EXPIRE;
};

/**
 * Auth token and check whether expire.
 *
 * @param  {String}   token token string
 * @param  {Function} cb
 * @return {Void}
 */
Remote.prototype.authByToken = function(token, cb) {
    // var res = tokenService.parse(token, this.secret);
    // if (!res) {
    //     cb(null, Code.ENTRY.FA_TOKEN_ILLEGAL);
    //     return;
    // }

    // if (!checkExpire(res, this.expire)) {
    //     cb(null, Code.ENTRY.FA_TOKEN_EXPIRE);
    //     return;
    // }

    // userDao.getUserById(res.uid, function(err, user) {
    //     if (err) {
    //         cb(err);
    //         return;
    //     }

    //     cb(null, Code.OK, user);
    // });
};

Remote.prototype.authByUsernameAndPassword = function(username, password, callback) {
    if (!username || !password) {
        callback(null, Code.ENTRY.FA_TOKEN_INVALID);
        return;
    }

    UserModel.findOne({ email: username }, function(err, item) {
        if (!err) {
            if (item) {
                item.comparePassword(password, function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        if (result) {
                            callback(null, Code.OK, item);
                        } else {
                            callback(null, Code.ENTRY.FA_TOKEN_INVALID, item);
                        }
                    }
                })
            } else {
                callback(null, Code.OK, null);
            }
        } else {
            callback(err);
        }
    });
}

/**
 * Check the token whether expire.
 *
 * @param  {Object} token  token info
 * @param  {Number} expire expire time
 * @return {Boolean}        true for not expire and false for expire
 */
var checkExpire = function(token, expire) {
    if (expire < 0) {
        // negative expire means never expire
        return true;
    }

    return (Date.now() - token.timestamp) < expire;
};