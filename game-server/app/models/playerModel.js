var autoIncrement = require('mongoose-auto-increment');
var player = require('../domain/entities/player');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    availablePlayerStatuses = [
        { name: 'new', description: 'new player, login time 0' },
        { name: 'normal', description: 'normal' },
        { name: 'delete-pending', description: 'Deployed' },
        { name: 'deleted', description: 'Deployed' },
        { name: 'banned', description: 'In Review' }
    ],

    PlayerModel = new Schema({
        id: { type: Number },
        userId: { type: Schema.Types.ObjectId, ref: 'UserModel' },
        name: { type: String, validate: /.+/, unique: true },
        hp: { type: Number },
        mp: { type: Number },
        maxhp: { type: Number },
        maxmp: { type: Number },
        x: { type: Number },
        y: { type: Number },
        z: { type: Number },
        status: { type: Number },
        createtime: { type: Date, default: Date.now }
    });

PlayerModel.plugin(autoIncrement.plugin, { model: 'Player', field: 'id' });

PlayerModel.methods.createObject = function() {
    return new player(this);
}

exports.PlayerModel = mongoose.model('Player', PlayerModel);
exports.playerStatuses = availablePlayerStatuses;