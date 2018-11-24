import Vue from 'vue';
import Vuex from 'vuex';
import { gql } from 'apollo-boost';

import { defaultClient as apolloClient } from './main';

import { GET_POSTS } from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		posts: [],
		isLoading: false,
	},
	mutations: {
		setPosts(state, payload) {
			state.posts = payload;
		},
		setLoading(state, payload) {
			state.loading = payload;
		},
	},
	actions: {
		async getPosts({ commit }) {
			try {
				commit('setLoading', true);
				// Use Apolloclient to fire getPosts query
				const { data } = await apolloClient.query({
					query: GET_POSTS,
				});
				// Commit will pass data from action to mutation func
				commit('setPosts', data.getPosts);
				commit('setLoading', false);
			} catch (err) {
				commit('setLoading', false);
				throw new Error(err);
			}
		},
	},
	getters: {
		posts: state => state.posts,
		isLoading: state => state.isLoading,
	},
});
