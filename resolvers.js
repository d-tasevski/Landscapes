module.exports = {
	Query: {
		getUser() {
			return null;
		}
	},
	Mutation: {
		async signupUser(root, { username, email, password }, { User }) {
			const user = await User.findOne({
				username
			});
			if (user) {
				// There is already user with that username, abort
				throw new Error('User with that username already exists');
			}
			const newUser = await new User({
				username,
				email,
				password
			}).save();
			return newUser;
		}
	}
};
