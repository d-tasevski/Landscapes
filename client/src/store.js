/* eslint-disable no-console */
import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as apolloClient } from './main';

import { GET_POSTS, SIGNIN_USER, SIGNUP_USER } from './queries';

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
			commit('setLoading', true);
			// Use Apolloclient to fire getPosts query
			await apolloClient
				.query({
					query: GET_POSTS,
				})
				.then(({ data }) => {
					// Commit will pass data from action to mutation func
					commit('setPosts', data.getPosts);
					commit('setLoading', false);
				})
				.catch(err => {
					commit('setLoading', false);
					throw new Error(err);
				});
		},
		async signinUser({ commit }, payload) {
			return await apolloClient
				.mutate({
					mutation: SIGNIN_USER,
					variables: payload,
				})
				.then(({ data }) => localStorage.setItem('token', data.signinUser.token))
				.catch(err => console.error(err));
		},
	},
	getters: {
		posts: state => state.posts,
		isLoading: state => state.isLoading,
	},
});
