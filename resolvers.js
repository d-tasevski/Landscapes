const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { handleError } = require('./helpers');

const createToken = ({ username, email }, secret, expiresIn) =>
	jwt.sign({ username, email }, secret, { expiresIn });

module.exports = {
	Query: {
		async getCurrentUser(root, args, { User, currentUser }) {
			if (!currentUser) return null;

			const user = await User.findOne({ username: currentUser.username })
				.populate({
					path: 'favorites',
					model: 'Post',
				})
				.catch(err => handleError(err));

			return user;
		},
		async getPosts(root, args, { Post }) {
			const posts = await Post.find({})
				.sort({ createdDate: 'desc' })
				// populate createdBy field with author data
				.populate({ path: 'createdBy', model: 'User' })
				.catch(err => handleError(err));

			return posts;
		},
		async getPost(root, { postId }, { Post }) {
			const post = await Post.findById(postId)
				.populate({
					path: 'messages.messageUser',
					model: 'User',
				})
				.catch(err => handleError(err));

			return post;
		},
		async infiniteScrollPosts(root, { pageNum, pageSize }, { Post }) {
			let posts;
			if (pageNum === 1) {
				posts = await Post.find({})
					.sort({ createdDate: 'desc' })
					.populate({ path: 'createdBy', model: 'User' })
					.limit(pageSize);
			} else {
				// If page number is greater than one, figure out how many documents to skip
				const skips = pageSize * (pageNum - 1);
				posts = await Post.find({})
					.sort({ createdDate: 'desc' })
					.populate({ path: 'createdBy', model: 'User' })
					.skip(skips)
					.limit(pageSize);
			}
			const totalDocs = await Post.countDocuments();
			const hasMore = totalDocs > pageSize * pageNum;

			return { posts, hasMore };
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
			})
				.save()
				.catch(err => handleError(err));

			return newPost;
		},
		async addPostMessage(root, { messageBody, userId, postId }, { Post }) {
			const newMsg = {
				messageBody,
				messageUser: userId,
			};
			const post = await Post.findOneAndUpdate(
				{ _id: postId },
				// prepend a new msg to beginning of messages array
				{ $push: { messages: { $each: [newMsg], $position: 0 } } },
				// return fresh document after update
				{ new: true }
			).populate({ path: 'messages.messageUser', model: 'User' });

			return post.messages[0];
		},
		async likePost(root, { postId, username }, { Post, User }) {
			// Find post, increment it's "like" value
			const post = await Post.findOneAndUpdate(
				{ _id: postId },
				{ $inc: { likes: 1 } },
				{ new: true }
			);
			// Find user and id of the post to their favorites
			const user = await User.findOneAndUpdate(
				{ username },
				{ $addToSet: { favorites: postId } },
				{ new: true }
			).populate({ path: 'favorites', model: 'Post' });

			// Return only likes from "post" and favorites from the "user"
			return { likes: post.likes, favorites: user.favorites };
		},
		async unlikePost(root, { postId, username }, { Post, User }) {
			// Find post, increment it's "like" value
			const post = await Post.findOneAndUpdate(
				{ _id: postId },
				{ $inc: { likes: -1 } },
				{ new: true }
			);
			// Find user and id of the post to their favorites
			const user = await User.findOneAndUpdate(
				{ username },
				{ $pull: { favorites: postId } },
				{ new: true }
			).populate({ path: 'favorites', model: 'Post' });

			// Return only likes from "post" and favorites from the "user"
			return { likes: post.likes, favorites: user.favorites };
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
			})
				.save()
				.catch(err => handleError(err));

			return { token: createToken(newUser, process.env.JWT_SECRET, '1hr') };
		},
	},
};
