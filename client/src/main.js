import '@babel/polyfill';
import Vue from 'vue';
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.use(VueApollo);

const defaultClient = new ApolloClient({
	uri: 'http://localhost:4000/graphql',
});

const apolloProvider = new VueApollo({ defaultClient });

new Vue({
	// Inject apollo to all components so that we can perform queries and mutations
	provider: apolloProvider.provide(),
	router,
	store,
	render: h => h(App),
}).$mount('#app');
