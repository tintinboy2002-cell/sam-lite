import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './assets/css/App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Main from './App';
import store from './store';
import { Provider } from 'react-redux';
import { ReactReduxContext } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <Provider store={store}>
  <BrowserRouter>
    <Main />
  </BrowserRouter>,
  </Provider>
);
