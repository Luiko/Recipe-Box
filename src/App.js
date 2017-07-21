import React, { Component } from 'react';

import {
  Modal,
  Button,
  FormControl,
  ControlLabel,
  DropdownButton,
  Collapse
} from 'react-bootstrap';

class Overlay extends Component {
  constructor(props) {
    super(props);
    const { recipe } = this.props;
    this.state = {
      recipeName: recipe? recipe.name : '',
      ingredients: recipe? recipe.ingredients.join(', ') : ''
    }
    this.editName = this.editName.bind(this);
    this.editIngredients = this.editIngredients.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  editName(e) {
    this.setState({ recipeName: e.target.value });
  }
  
  editIngredients(e) {
    this.setState({ ingredients: e.target.value });
  }
  
  handleClick() {
    const name = this.state.recipeName;
    const { ingredients } = this.state;
    if (!name || !ingredients) return;
    this.setState({ recipeName: '', ingredients: '' });
    this.props.close();
    this.props.handleClick(name, ingredients);
  }
  
  componentWillReceiveProps(nextProps) {
    const { recipe } = nextProps;
    this.setState({
      recipeName: recipe? recipe.name : '',
      ingredients: recipe? recipe.ingredients.join(', ') : ''
    });
  }

  render() {
    return (
      <div className="static-modal">
        <Modal show={this.props.show} onHide={this.props.close}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ControlLabel htmlFor="recipe-name">Recipe</ControlLabel>
            <FormControl
              type="text"
              id="recipe-name"
              placeholder="recipe name"
              value={this.state.recipeName}
              onChange={this.editName}
            />
            <ControlLabel htmlFor="ingredients">Ingredients</ControlLabel>
            <FormControl
              type="text"
              componentClass="textarea"
              id="ingredients"
              placeholder="ingredients separated by commas or line breaks"
              value={this.state.ingredients}
              onChange={this.editIngredients} 
            />
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.props.close}>Close</Button>
            <Button bsStyle="primary" onClick={this.handleClick}>{this.props.buttonName}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class DialogRecipe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }
  close() {
    this.setState({ show: false });
  }
  open() {
    this.setState({ show: true });
  }
  render() {
    return (
      <div>
        <Button 
          onClick={this.open} 
          bsStyle={this.props.bsStyle}>
          {this.props.buttonName}
        </Button>
        <Overlay
          title={this.props.title}
          buttonName={this.props.buttonName}
          close={this.close}
          open={this.open}
          show={this.state.show}
          handleClick={this.props.handleClick}
          recipe={this.props.recipe}
        />
      </div>
    );
  }
}

class IngredientsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      open: false, 
      didToggle: false, 
      deleteRecipeAnimation: false  
    };
    this.toggle = this.toggle.bind(this);
    this.ingredientsChanged = this.ingredientsChanged.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
  }

  toggle() {
    this.props.update();
    this.setState(prevState => ({ open: !prevState.open, didToggle: true }));
  }

  deleteRecipe() {
    this.setState({ deleteRecipeAnimation: true });
    setTimeout(() => {
      this.props.deleteRecipe(this.props.recipe.name);
    }, 111);
  }

  ingredientsChanged(nextRecipe) {
    const nextIngredientsLength = nextRecipe.ingredients.length;
    const ingredientsLength = this.props.recipe.ingredients.length;
    return nextIngredientsLength !== ingredientsLength
      || !nextRecipe.ingredients.reduce((equal, ingredient, i) => {
        return equal && this.props.recipe.ingredients[i] === ingredient;
      }, true)
    ;
  }
  
  componentWillReceiveProps({ recipe: nextRecipe }) {
    const { state } = this;
    const anotherRecipeIsOpen = state.open
      && !state.didToggle
      && !this.ingredientsChanged(nextRecipe);
    if (anotherRecipeIsOpen) {
      this.setState({ open: false, didToggle: true });
    }
  }
  
  shouldComponentUpdate({ recipe: nextRecipe }, nextState) {
    return nextState.deleteRecipeAnimation || nextState.didToggle
      & nextState.open !== this.state.open 
      || this.ingredientsChanged(nextRecipe);
  }

  render() {
    const { recipe } = this.props;
    return (
      <div className={this.state.deleteRecipeAnimation? "row delete-recipe" : "row"}>
        <dt className="bg-success">
          <DropdownButton
            open={false}
            bsStyle="link"
            title={recipe.name}
            onToggle={this.toggle}
            id={`dropdownButton-${recipe.name}`}
            />
        </dt>
        <dd>
          <Collapse in={this.state.open}>
            <div>
              <p className="text-center">Ingredients</p>
              <hr />
              { 
                recipe.ingredients
                  .map(ingredient => {
                    return (<p 
                      className="bg-info" 
                      key={ingredient}>
                      {ingredient}
                    </p>);
                  })
              }
              <Button 
                bsStyle="danger" 
                onClick={this.deleteRecipe}>
                Delete
              </Button>
              <DialogRecipe
                handleClick={this.props.editRecipe}
                recipe={recipe}
                title='Edit a Recipe'
                buttonName='Edit'
               />
            </div>
          </Collapse>
        </dd>
      </div>
    );
  }

  componentDidUpdate() {
    const toggled  = this.state.didToggle;
    const deleted = this.state.deleteRecipeAnimation;
    if (toggled && deleted) {
      this.setState({ 
        didToggle: false,
        deleteRecipeAnimation: false
      });
    }
    else {
      if (toggled)
        this.setState({ didToggle: false });
      if (deleted)
        this.setState({ deleteRecipeAnimation: false });
    }
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    let recipes;
    if (typeof localStorage !== 'undefined' && localStorage) {
      recipes = JSON.parse(localStorage.getItem('_luiko_recipes'));
    } else {
      recipes = this.props.recipes;
    }
    this.state = { recipes };
    this.handleRecipe = this.handleRecipe.bind(this);
    this.addRecipe = this.addRecipe.bind(this);
    this.editRecipe = this.editRecipe.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
  }
  
  saveRecipes(recipes) {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('_luiko_recipes', JSON.stringify(recipes));
    }
  }

  handleRecipe(recipeName, _ingredients, action) {
    function recipeRepeated(name) {
      if (name) {
        const array = this.state.recipes
          .filter(recipe => recipe.name.toUpperCase() === name.toUpperCase())
        ;
        if (array.length) return true;
        return false;
      }
    }
    if (recipeRepeated.call(this, recipeName)) {
      if (action === 'addRecipe') {
        console.log('Recipe repeated');
        return; 
      }
      if (action === 'editRecipe') {
        //nothing
      }
    }
    const commasOrLineBreaks = /(\s*[,\n]+\s*)+/;
    const ingredients = _ingredients.split(commasOrLineBreaks);
    const recipe = {
      name: recipeName,
      ingredients
    };

    function eraseInvalidIngredients(recipes) {
      return recipes.map(function (recipe) {
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
      });
    }

    const method =
      action === 'addRecipe'? 'POST': action === 'editRecipe'? 'PUT' : null
    ;
    const ajax = new XMLHttpRequest();
    ajax.open(method, '/' + recipe.name, true);
    ajax.setRequestHeader('Content-type', 'application/json');
    ajax.addEventListener('load',() => {
      if (ajax.status > 399)
        return console.error(
          ErrorEvent.name,
          'modification request',
          'status',
          ajax.status
        );
      this.setState(function (prevState) {
        let { recipes } = prevState;
        if (action === 'addRecipe') 
          recipes = [ ...prevState.recipes, recipe ];
        if (action === 'editRecipe') {
          recipes = recipes.map(_recipe => {
            if (_recipe.name === recipe.name) return recipe;
            else return _recipe;
          });
        }
        recipes = eraseInvalidIngredients(recipes);
        this.saveRecipes(recipes);
        return { recipes };
      });
    });
    ajax.addEventListener('error', () => {
      console.error(Error.name,'connection lost');
    });
    ajax.send(JSON.stringify(recipe));
  }

  addRecipe(recipeName, _ingredients) {
    this.handleRecipe(recipeName, _ingredients, 'addRecipe');
  }
  
  editRecipe(recipeName, _ingredients) {
    this.handleRecipe(recipeName, _ingredients, 'editRecipe');
  }

  deleteRecipe(recipe) {
    const ajax = new XMLHttpRequest();
    ajax.open('DELETE', '/' + recipe, true);
    ajax.addEventListener('load',() => {
      if (ajax.status > 399)
        return console.error(ErrorEvent.name, 'delete request');
      // console.log(ajax.response);
      this.setState(function (prevState) {
        const recipes = prevState.recipes
          .filter(_recipe => _recipe.name !== recipe);
        this.saveRecipes(recipes);
        return { recipes };
      });
    });
    ajax.addEventListener('error', () => {
      console.log(Error.name,'connection lost');
    });
    ajax.send(null);
  }

  componentWillMount() {
    const needReset = typeof localStorage !== 'undefined'
      && localStorage
      && !this.state.recipes;
    if (needReset) {
      const { recipes } = this.props;
      this.saveRecipes(recipes);
      this.setState({ recipes });
      console.log('reseted');
    }
  }

  render() {
    return (
      <div className="container">
        <dl>
          {this.state.recipes && this.state.recipes.map(function(recipe) {
            return <IngredientsForm
                     recipe={recipe}
                     deleteRecipe={this.deleteRecipe}
                     editRecipe={this.editRecipe}
                     key={recipe.name}
                     update={() => this.forceUpdate()}
                   />;
          }.bind(this))}
        </dl>
        <DialogRecipe 
          handleClick={this.addRecipe}
          title='Add a Recipe'
          buttonName='Add Recipe'
          bsStyle='primary'
        />
      </div>
    );
  }
}

export default App;
