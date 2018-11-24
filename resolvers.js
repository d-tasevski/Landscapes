const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = ({ username, email }, secret, expiresIn) =>
	jwt.sign({ username, email }, secret, { expiresIn });

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
		async signinUser(root, { username, password }, { User }) {
			const user = await User.findOne({ username });
			if (!user) throw new Error('User not found!');

			const isValidPass = await bcrypt.compare(password, user.password);
			if (!isValidPass) throw new Error('Invalid credentials');

			return { token: createToken(user, process.env.JWT_SECRET, '1hr') };
		},
		async signupUser(root, { username, email, password }, { User }) {
			const user = await User.findOne({ username });
			if (user) throw new Error('User with that username already exists');

			const newUser = await new User({
				username,
				email,
				password,
			}).save();

			return { token: createToken(newUser, process.env.JWT_SECRET, '1hr') };
		},
	},
};
