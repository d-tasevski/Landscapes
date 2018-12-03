/* eslint-disable no-console */
import Vue from 'vue';
import Vuex from 'vuex';

import { defaultClient as apolloClient } from './main';
import router from './router';

import {
	GET_POSTS,
	SIGNIN_USER,
	SIGNUP_USER,
	GET_CURRENT_USER,
	ADD_POST,
	SEARCH_POSTS,
} from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		posts: [],
		loading: false,
		user: null,
		error: null,
		authError: null,
		searchResults: [],
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
		setToken(state, payload) {
			localStorage.setItem('token', payload);
		},
		setError(state, payload) {
			state.error = payload;
		},
		setAuthError(state, payload) {
			state.authError = payload;
		},
		setSearchResults(state, payload) {
			if (payload !== null) {
				state.searchResults = payload;
			}
		},
		clearSearchResults: state => (state.searchResults = []),
		clearUser: state => (state.user = null),
		clearError: state => (state.error = null),
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
		addPost({ commit }, payload) {
			return apolloClient
				.mutate({
					mutation: ADD_POST,
					variables: payload,
					update(
						cache,
						{
							data: { addPost },
						}
					) {
						// Read the query you want to update
						const data = cache.readQuery({ query: GET_POSTS });
						// Create updated data
						data.getPosts.unshift(addPost);
						// Write updated data back to the query
						cache.writeQuery({ query: GET_POSTS, data });
					},
					// optimistic response ensures that the data is added immediately as we specified for the update func
					optimisticResponse: {
						__typename: 'Mutation',
						addPost: {
							__typename: 'Post',
							_id: -1, // add it to beginning of the array and ensure there is no id conflicts
							...payload,
						},
					},
				})
				.then(({ data }) => {})
				.catch(err => {
					throw new Error(err);
				});
		},
		searchPosts: ({ commit }, payload) => {
			apolloClient
				.query({
					query: SEARCH_POSTS,
					variables: payload,
				})
				.then(({ data }) => {
					commit('setSearchResults', data.searchPosts);
				})
				.catch(err => {
					commit('setError', err);
					console.error(err);
				});
		},
		signupUser: ({ commit }, payload) => {
			commit('clearError');
			commit('setLoading', true);
			return apolloClient
				.mutate({
					mutation: SIGNUP_USER,
					variables: payload,
				})
				.then(({ data }) => {
					commit('setLoading', false);
					localStorage.setItem('token', data.signupUser.token);
					// to make sure created method is run in main.js (we run getCurrentUser), reload the page
					router.go();
				})
				.catch(err => {
					commit('setLoading', false);
					commit('setError', err);
					console.error(err);
				});
		},
		async signinUser({ commit }, payload) {
			// Clear token to prevent errors (if token is malformed for example)
			// commit('setToken', '');
			commit('clearError');
			commit('setLoading', true);

			return await apolloClient
				.mutate({
					mutation: SIGNIN_USER,
					variables: payload,
				})
				.then(({ data }) => {
					commit('setLoading', false);
					commit('setToken', data.signinUser.token);
					// To make sure that the created method in main.js is run reload the page :/
					router.go();
				})
				.catch(err => {
					commit('setLoading', false);
					commit('setError', err);
					// throw new Error(err);
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
		loading: state => state.loading,
		user: state => state.user,
		error: state => state.error,
		authError: state => state.authError,
		userFavorites: state => state.user && state.user.favorites,
		searchResults: state => state.searchResults,
	},
});
