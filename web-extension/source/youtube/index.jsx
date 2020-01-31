import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import reducer from '../redux/reducers';
import App from './App';


function getContainer() {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      const container = document.getElementById('secondary-inner');
      if (container) {
        clearInterval(interval);
        resolve(container);
      }
    }, 1000);
  });
}


function createApp() {
  getContainer()
    .then(container => {
      const ads = document.getElementById('offer-module');
      if (ads) {
        ads.remove();
      }

      const content = document.createElement('div');
      content.classList = 'style-scope ytd-watch-flexy';
      content.id = 'taqche';
      container.prepend(content);
      const store = createStore(reducer, applyMiddleware(thunkMiddleware, createLogger()));

      ReactDOM.render(
        <Provider store={store}>
          <App />
        </Provider>,
        content,
      );
    });
}

createApp();
