const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    shoppingList: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
    themePreference: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);