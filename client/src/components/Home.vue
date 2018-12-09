<template>
	<v-container text-xs-center>
		<v-layout row>
			<v-dialog v-model="loading" persistent fullscreen>
				<v-container fill-height>
					<v-layout row justify-center align-center>
						<v-progress-circular
							indeterminate
							:size="70"
							:width="7"
							color="secondary"
						/>
					</v-layout>
				</v-container>
			</v-dialog>
		</v-layout>

		<!-- Post Carousel -->
		<v-flex xs12>
			<v-carousel
				v-if="!loading && posts.length > 0"
				v-bind="{ cycle: true }"
				interval="3000"
			>
				<v-carousel-item
					@click.native="goToPost(post._id);"
					v-for="post in posts"
					:key="post._id"
					:src="post.imageUrl"
				>
					<h1 id="carousel__title">{{ post.title }}</h1>
				</v-carousel-item>
			</v-carousel>
		</v-flex>

		<!-- Explore Posts button -->
		<v-layout class="mt-3 mb-3" row wrap v-if="!loading">
			<v-flex xs-12>
				<v-btn class="secondary" to="/posts" large dark> Explore Posts </v-btn>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'home',
	created() {
		this.handleGetCarouselPosts();
	},
	methods: {
		handleGetCarouselPosts() {
			// Reach out to Vuex store, fire action that gets posts for carousel
			return this.$store.dispatch('getPosts');
		},
		goToPost(postId) {
			this.$router.push(`/posts/${postId}`);
		},
	},
	computed: {
		// Spread needed getters from vuex store
		...mapGetters(['loading', 'posts']),
	},
};
</script>

<style>
#carousel__title {
	cursor: pointer;
	position: absolute;
	background-color: rgba(0, 0, 0, 0.5);
	color: white;
	border-radius: 5px 5px 0 0;
	padding: 0.5em;
	margin: 0 auto;
	bottom: 50px;
	left: 0;
	right: 0;
}
</style>
