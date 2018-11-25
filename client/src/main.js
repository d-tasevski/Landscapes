/* eslint-disable no-console */
import '@babel/polyfill';
import Vue from 'vue';
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';

import FormAlert from './components/Shared/FormAlert';

// Global components
Vue.component('form-alert', FormAlert);

// Vue Graphql setup
Vue.use(VueApollo);

export const defaultClient = new ApolloClient({
	uri: 'http://localhost:4000/graphql',
	// include auth token with requests that we make to backend
	fetchOptions: { credentials: 'include' },
	request(operation) {
		// If no token is storage, add it
		if (!localStorage.getItem('token')) {
			localStorage.setItem('token', '');
		}
		// operation adds the token to the authorization header, which is sent to backend
		operation.setContext({ headers: { authorization: localStorage.getItem('token') } });
	},
	onError({ graphQLErrors, networkError }) {
		if (networkError) {
			console.error('[Network Error]', networkError);
		}
		if (graphQLErrors) {
			for (const err of graphQLErrors) {
				console.dir('[graphQL Error]', err);
				if (err.name === 'AuthenticationError') {
					// set auth auth error in state (to show the snackbar)
					store.commit('setAuthError', err);
					// signout user (to clear the token)
					store.dispatch('signoutUser');
				}
			}
		}
	},
});

const apolloProvider = new VueApollo({ defaultClient });

new Vue({
	// Inject apollo to all components so that we can perform queries and mutations
	apolloProvider,
	router,
	store,
	render: h => h(App),
	created() {
		// execute getCurrentUser query on mount (this will be run on every page refresh as well)
		this.$store.dispatch('getCurrentUser');
	},
}).$mount('#app');
