let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
const uuidv4 = require('uuid/v4');
let SALT_FACTOR = 12;

let userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  apiKey: { type: String, default: uuidv4() },
  displayName: String,
  bio: String
});

var noop = function () {};

userSchema.pre('save', function (done) {
  var user = this;
  if (!user.isModified('password')) {
    return done();
  }
  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) { return done(err); }
    bcrypt.hash(user.password, salt, noop, function (err, hashedPassword) {
      if (err) { return done(err); }
      user.password = hashedPassword;
      done();
    });
  });
});

userSchema.methods.checkPassword = function (guess, done) {
  bcrypt.compare(guess, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};

userSchema.methods.name = function () {
  return this.displayName || this.username;
};
var User = mongoose.model('User', userSchema);
module.exports = User;
