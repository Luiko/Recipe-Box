const express = require('express');
const bodyPaser = require('body-parser');
const serverRender = require('./lib/index').default;
const db = require('./database');

require('dotenv').config();
const app = express();

app.use(express.static('public'));
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const recipes = app.get('recipes');
  const render = app.get('render');
  if (recipes) {
    if (render) return res.status(200).send(render);
    const _render = template(serverRender(recipes));
    app.set('render', _render);
    res.status(200).send(_render);
  }
  db.getRecipes().then(recipes => {
    app.set('recipes', recipes);
    const render = template(serverRender(recipes));
    app.set('render', render);
    res.status(200).send(render);
  }).catch(error => {
    console.error(error);
    res.status(500).send('Something unexpected happened.');
  });
});

app.post('/:recipe', (req, res) => {
  const { recipe: name } = req.params;
  const recipe = req.body;
  db.addRecipe(recipe).then(() => {
    res.status(201).send(`recipe ${name} added`);
    app.set('recipes', null);
  }).catch(error => {
    console.error(error);
    res.status(500).send('Something unexpected happened.');
  });
});

app.delete('/:recipe', (req, res) => {
  const { recipe } = req.params;
  db.deleteRecipe(recipe).then(() => {
    res.status(200).send(`recipe ${recipe} deleted`);
    app.set('recipes', null);
  }).catch(error => {
    console.error(error);
    res.status(500).send('Something unexpected happened.');
  });
});

app.put('/:recipe', (req, res) => {
  const { recipe: name } = req.params;
  const recipe = req.body;
  db.updateRecipe(recipe).then(() => {
    res.status(201).send(`recipe ${name} updated`);
    app.set('recipes', null);
  }).catch(error => {
    console.error(error);
    res.status(500).send('Something unexpected happened.');
  });
});

app.use(function (req, res) {
  res.status(404).send('Error: resource not found');
});

const PORT = process.env.PORT || process.argv[2] || 8090;

app.listen(PORT, 'localhost', function () {
  console.log('app is linstening on port ' + PORT);
});

function template(clientApp) {
  return `<!DOCTYPE html>
<html>
  <head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Save the recipes you like more">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
  <link rel="stylesheet" href="index.css">
  </head>
  <body>
    <header><h1>Recipe Box</h1></header>
    <main id="root">${clientApp}</main>
    <footer>
      <p class="text-center">
        Copyright &copy; 2017-2018 invoked by 
        <a href="https://github.com/Luiko">luiko</a>
      </p>
    </footer>
    <script src="bundle.js" type="text/javascript"></script>
  </body>
</html>`;
}

module.exports = app;
