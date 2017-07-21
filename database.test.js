const test = require('tape');
const cp = require('child_process');
const fs = require('fs');
const db = require('./database');
let recipes = require('./src/recipes');
require('dotenv').config();

test('create default data', t => {
  t.plan(1);
  const result = cp.execSync('node database init').toString();
  t.equal(result, 'default database created\n', 'should created database');
});

test('data file exist', t => {
  fs.open(process.env.DB, 'r', (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        t.fail('file do not exist');
        return;
      }
      t.fail('something happened, error: ' + err.code);
      return;
    }
    t.pass('file exists');
    t.end();
  });
});

test('get recipes view from database', t => {
  t.plan(1);
  db.getRecipes()
    .then(data => {
      t.deepEqual(data, recipes, 'should return recipes view');
    }).catch(err => t.error(err, "can't get data")
  );
});

test('delete recipe', t => {
  t.plan(1);
  recipes = recipes.filter(recipe => {
    if (recipe.name !== 'Spaghetti')
      return recipe;
  });
  db.deleteRecipe('Spaghetti').then(() => db.getRecipes())
    .then(_recipes => {
      t.deepEqual(_recipes, recipes, 'should delete Spaghetti recipe');
    }).catch(err => t.error(err, "can't delete recipe")
  );
});

test('add recipe', t => {
  t.plan(1);
  const newrecipe = { name: 'Pizza', ingredients: ['pepperoni', 'cheese', 'flour', 'Tomato Sauce'] }
  recipes = [...recipes, newrecipe ];
  db.addRecipe(newrecipe).then(() => db.getRecipes())
    .then(_recipes => {
      t.deepEqual(_recipes, recipes, 'should add pizza recipe');
    }).catch(err => t.error(err, "can't add recipe")
  );
});

test('update recipe', t => {
  t.plan(1);
  const newrecipe = {
    name: 'Pizza',
    ingredients: ['cheese', 'flour', 'Tomato Sauce', 'ham', 'pineapple', ]
  };
  recipes = recipes.map(recipe => {
    return recipe.name === newrecipe.name? newrecipe : recipe;
  });
  db.updateRecipe(newrecipe).then(() => db.getRecipes())
    .then(_recipes => {
      t.deepEqual(_recipes, recipes, 'should update pizza recipe');
    }).catch(err => t.error(err, "can't update recipe")
  );
});
