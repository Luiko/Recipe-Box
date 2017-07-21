const driver = require('sqlite');
const fs = require('fs');
require('dotenv').config();

function truncateDBFile() {
  return new Promise((resolve, reject) => {
    fs.truncate(process.env.DB, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function exectDefaulthDB() {
  return new Promise((resolve, reject) => {
    fs.readFile('default.sql', (err, data) => {
      if (err) return reject(err);
      resolve(data.toString());
    });
  });
}
if (process.argv[2] === 'init')
  Promise.resolve().then(() => truncateDBFile())
    .then(() => driver.open(process.env.DB), () => driver.open(process.env.DB))
    .then(driver => exectDefaulthDB(driver).then(data => driver.exec(data)))
    .then(driver => {
      process.stdout.write('default database created\n');
      driver.close();
    }).catch(console.error);

function getRecipes() {
  const query = `select r.name as recipe, i.name as ingredient
  from recipes r, recipe_ingredient ri, ingredients i
  where r.id = ri.idrecipe and ri.idingredient = i.id`
  return Promise.resolve().then(() => driver.open(process.env.DB))
    .then(driver => driver.all(query))
    .then(data => data.reduce((array, value) => {
      const index = array.reduce((result, recipe, index) => {
        return result < 0 && recipe.name === value.recipe? index : result;
      }, -1);
      if (index < 0) 
        return [...array, { name: value.recipe, ingredients: [ value.ingredient ] }];
      array[index].ingredients.push(value.ingredient);
      return array;
    }, []));
    // .catch(console.error);
}

function deleteRecipe(name) {
  return Promise.resolve().then(() => driver.open(process.env.DB))
    .then(driver => driver.exec(`delete from recipe_ingredient
where idrecipe in (select id from recipes where name = "${name}");
delete from ingredients where id not in
(select idingredient from recipe_ingredient);
delete from recipes where name = "${name}"`));
}

function eraseInvalidIngredients(recipe) {
  let { ingredients } = recipe;
  const notRepeat = [];
  const haveWords = /[a-z]/i;
  ingredients = ingredients.filter(function (ingredient) {
    return ingredient &&
      haveWords.test(ingredient) &&
      notRepeat.indexOf(ingredient) === -1 &&
      notRepeat.push(ingredient);
  });
  return Object.assign({}, recipe, { ingredients });
}

function addRecipe(_recipe) {
  const recipe = eraseInvalidIngredients(_recipe);
  const { name } = recipe;
  const getIDIngredientQuery = `select id from ingredients where name = `;
  const getIDRecipeQuery = `select id from recipes where name = "${name}"`;
  const insertIngredients = recipe.ingredients.map(ingredient => {
    return `insert or ignore into ingredients(name) values("${ingredient}");
insert into recipe_ingredient(idrecipe,idingredient)
values((${getIDRecipeQuery}),(${getIDIngredientQuery}"${ingredient}"));`;
  }).join('\n');
  return Promise.resolve().then(() => driver.open(process.env.DB))
    .then(driver => driver.exec(`insert into recipes(name) values("${name}");
${insertIngredients}`));
}

function updateRecipe(_recipe) {
  const recipe = eraseInvalidIngredients(_recipe);
  const ingredients = recipe.ingredients
    .map(ingredient => `"${ingredient}"`).join(',');
  const getIDIngredientQuery = `select id from ingredients where id not in
  (select idingredient from recipe_ingredient) and name = `;
  const getIDRecipeQuery = `select id from recipes
where name = "${recipe.name}"`;
  const insertIngredients = recipe.ingredients.map(ingredient => {
    return `insert or ignore into ingredients(name) values("${ingredient}");
insert or ignore into recipe_ingredient(idrecipe,idingredient)
values((${getIDRecipeQuery}),(${getIDIngredientQuery}"${ingredient}"));`;
  }).join('\n');
  return Promise.resolve().then(() => driver.open(process.env.DB))
    .then(driver => driver.exec(`delete from recipe_ingredient
where idingredient in (select id from ingredients where id not in
(select id from ingredients where name in (${ingredients})))
and idrecipe in (select id from recipes where name = '${recipe.name}');
delete from ingredients where id not in
(select idingredient from recipe_ingredient);
${insertIngredients}`))
}

module.exports = { getRecipes, deleteRecipe, addRecipe, updateRecipe };
