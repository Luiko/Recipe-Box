import React from 'react';
import ReactDOMServer from 'react-dom/server';
//import 'bootstrap/dist/css/bootstrap.css';
//import './index.css';
import App from './App';

function serverRender(recipes) {
  return ReactDOMServer.renderToString(<App recipes={recipes} />);
}

export default serverRender;
