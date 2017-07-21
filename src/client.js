import React from 'react';
import ReactDOM from 'react-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './index.css';
import App from './App';
import recipes from './recipes.json'

ReactDOM.render(<App recipes={recipes} />, document.getElementById('root'));
