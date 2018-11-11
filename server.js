require('dotenv').config({
	path: '.env.local'
});
const fs = require('fs');
const path = require('path');
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const filePath = path.join(__dirname, 'typeDefs.gql');
const typeDefs = fs.readFileSync(filePath, 'utf-8');
const resolvers = require('./resolvers');

const User = require('./models/User');
const Post = require('./models/Post');

mongoose
	.connect(
		process.env.MONGO_URI,
		{
			useNewUrlParser: true,
			useCreateIndex: true
		}
	)
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error('Connection to MongoDB failed:', err));

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: {
		User,
		Post
	}
});

// By default we will listen on port 4000
server.listen().then(({ url }) => console.info(`Server up and running on port ${url}`));
