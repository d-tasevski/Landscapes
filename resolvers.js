module.exports = {
	Query: {
		getUser() {
			return null;
		},
	},
	Mutation: {
		async addPost(root, { title, imageUrl, categories, description, creatorId }, { Post }) {
			const newPost = await new Post({
				title,
				imageUrl,
				categories,
				description,
				createdBy: creatorId,
			}).save();
			return newPost;
		},
		async signupUser(root, { username, email, password }, { User }) {
			const user = await User.findOne({
				username,
			});
			if (user) {
				// There is already user with that username, abort
				throw new Error('User with that username already exists');
			}
			const newUser = await new User({
				username,
				email,
				password,
			}).save();
			return newUser;
		},
	},
};
