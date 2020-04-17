// @flow
import React, { useEffect } from 'react';
import { hydrate } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux';
import { Route, BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from '@material-ui/styles';

import rootReducer from './reducers'
import App from './ui/app';

import { logger, crashReporter } from './helpers/redux-middlewares'

import theme from './theme'

// Grab the state from a global variable injected into the server-generated HTML
let preloadedState = window.__PRELOADED_STATE__

try {
	if (preloadedState && preloadedState.authData && preloadedState.authData.credential)
		preloadedState.authData.credential = JSON.parse(atob(preloadedState.authData.credential));
} catch (e) { console.log(e) }

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__

// Create Redux store with initial state
const store = createStore(
	rootReducer,
	preloadedState,
	applyMiddleware(
		thunkMiddleware,
		logger,
		crashReporter
	))

const Routes = () => {
	// remove the css sent inline in the html on client side
	// useEffect in similar to componentDidMount for function components
	useEffect(() => {
		const jssStyles = document.querySelector('#jss-server-side');
		//$FlowFixMe
		if (jssStyles) jssStyles.parentNode.removeChild(jssStyles);
	}, []);

	return (
		<Provider store={store}>
			<CookiesProvider>
				<BrowserRouter>
					<ThemeProvider theme={theme}>
						<Route component={App} />
					</ThemeProvider>
				</BrowserRouter>
			</CookiesProvider>
		</Provider>
	)
};

hydrate(<Routes />, document.getElementById('root'))