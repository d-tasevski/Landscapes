import Vue from 'vue';
import Vuex from 'vuex';
import { gql } from 'apollo-boost';

import { defaultClient as apolloClient } from './main';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		posts: [],
	},
	mutations: {
		setPosts(state, payload) {
			state.posts = payload;
		},
	},
	actions: {
		async getPosts({ commit }) {
			try {
				// Use Apolloclient to fire getPosts query
				const { data } = await apolloClient.query({
					query: gql`
						query {
							getPosts {
								_id
								title
								imageUrl
								description
								likes
							}
						}
					`,
				});
				// Commit will pass data from action to mutation func
				commit('setPosts', data.getPosts);
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	getters: {
		posts: state => state.posts,
	},
});
