module.exports = {
	Query: {
		getUser() {
			return null;
		},
		async getPosts(root, args, { Post }) {
			const posts = await Post.find({})
				.sort({ createdDate: 'desc' })
				// populate createdBy field with author data
				.populate({ path: 'createdBy', model: 'User' });
			return posts;
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
