/* eslint-disable no-console */
import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as apolloClient } from './main';
import router from './router';

import { GET_POSTS, SIGNIN_USER, SIGNUP_USER, GET_CURRENT_USER } from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		posts: [],
		isLoading: false,
		user: null,
	},
	mutations: {
		setPosts(state, payload) {
			state.posts = payload;
		},
		setLoading(state, payload) {
			state.loading = payload;
		},
		setUser(state, payload) {
			state.user = payload;
		},
		clearUser(state) {
			state.user = null;
		},
		setToken(state, payload) {
			localStorage.setItem('token', payload);
		},
	},
	actions: {
		async getCurrentUser({ commit }) {
			commit('setLoading', true);
			await apolloClient
				.query({ query: GET_CURRENT_USER })
				.then(({ data }) => {
					commit('setLoading', false);
					commit('setUser', data.getCurrentUser);
				})
				.catch(err => {
					commit('setLoading', false);
					throw new Error(err);
				});
		},
		async getPosts({ commit }) {
			commit('setLoading', true);
			// Use Apollo client to fire getPosts query
			await apolloClient
				.query({ query: GET_POSTS })
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
			// Clear token to prevent errors (if token is malformed for example)
			commit('setToken', '');
			return await apolloClient
				.mutate({
					mutation: SIGNIN_USER,
					variables: payload,
				})
				.then(({ data }) => {
					commit('setToken', data.signinUser.token);
					// To make sure that the created method in main.js is run reload the page :/
					router.go();
				})
				.catch(err => {
					throw new Error(err);
				});
		},
		async signoutUser({ commit }) {
			// clear user in state
			commit('clearUser');
			// remove token from local storage
			commit('setToken', '');
			// end the session
			await apolloClient.resetStore();
			// redirect to home page (to kick users out of private pages)
			router.push('/');
		},
	},
	getters: {
		posts: state => state.posts,
		isLoading: state => state.isLoading,
		user: state => state.user,
	},
});
