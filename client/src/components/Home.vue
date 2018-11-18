<template>
	<v-container>
		<div><h1>Home</h1></div>
		<ApolloQuery :query="getPostsQuery">
			<template
				slot-scope="{
					result: {
						loading,
						error,
						data: { getPosts },
					},
				}"
			>
				<div v-if="loading">Loading...</div>
				<div v-else-if="error">{{ error.message }}</div>
				<ul v-else v-for="post in getPosts" :key="post._id">
					<li>{{ post.title }} {{ post.imageUrl }} {{ post.description }}</li>
					<li>{{ post.likes }}</li>
				</ul>
			</template>
		</ApolloQuery>
	</v-container>
</template>

<script>
// @ is an alias to /src
import { gql } from 'apollo-boost';

export default {
	name: 'home',
	data() {
		return {
			getPostsQuery: gql`
				query {
					getPosts {
						_id
						title
						categories
						imageUrl
						description
						likes
						createdBy {
							username
							email
						}
					}
				}
			`,
			result({ data, loading }) {
				if (!loading) {
					this.posts = data.getPosts;
				}
			},
			error(err) {
				throw new Error(err);
			},
		};
	},
};
</script>
