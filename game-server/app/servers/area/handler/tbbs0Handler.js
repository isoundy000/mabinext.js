// requires
var Code = require('../../../../../shared/code');


//

// exports
module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};
//


//
/**
 * Turn-based Battle System 0
 *
 */
//


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

};

Handler.prototype.action = function(msg, session, next) {

};

Handler.prototype.exit = function(msg, session, next) {

};