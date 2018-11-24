/* eslint-disable func-names */
const mongoose = require('mongoose');
const md5 = require('md5');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	joinDate: {
		type: Date,
		default: Date.now,
	},
	favorites: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true,
		ref: 'Post',
	},
});

// Create and add avatar to user
UserSchema.pre('save', function(next) {
	this.avatar = `http://gravatar.com/avatar/${md5(this.username)}?d=indenticon`;
	return next();
});
// Hash password
UserSchema.pre('save', function(next) {
	// Check if this field is not updated/modified
	if (!this.isModified('password')) return next();

	return bcrypt.genSalt(10, (err, salt) => {
		if (err) return next(err);

		bcrypt.hash(this.password, salt, (err, hash) => {
			if (err) return next(err);

			this.password = hash;
			return next();
		});
	});
});

module.exports = mongoose.model('User', UserSchema);
