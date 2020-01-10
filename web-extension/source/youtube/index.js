import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import reducer from '../redux/reducers';

const ads = document.getElementById('offer-module');
if (ads) {
    ads.remove();
}

const container =  document.getElementById('secondary-inner');
const content = document.createElement('div');
content.classList = 'style-scope ytd-watch-flexy';
content.id = 'cosmo';
container.prepend(content);

const store = createStore(reducer, applyMiddleware(thunkMiddleware, createLogger()));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  content
);
