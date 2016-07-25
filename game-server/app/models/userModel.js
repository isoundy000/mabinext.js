var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    //    availableUserStatuses = [
    //        {name: 'ready', title: 'Ready'},
    //        {name: 'working', title: 'Working'},
    //        {name: 'review', title: 'In Review'},
    //        {name: 'deployed', title: 'Deployed'}
    //    ],
    UserModel = new Schema({
        email: { type: String, validate: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, unique: true },
        password: { type: String, validate: /.+/ },
        nickname: { type: String, validate: /.+/ },
        createtime: { type: Date, default: Date.now }
    });

var compare = function(candidatePassword, password, callBack) {
    if (candidatePassword == password) {
        return callBack(null, true);
    } else {
        a
        return callBack(null, false);
    }
}

UserModel.methods.comparePassword = function(candidatePassword, callBack) {
    compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callBack(err);
        callBack(null, isMatch);
    });
};

exports.UserModel = mongoose.model('User', UserModel);
//exports.userStatuses = availableUserStatuses;