# Lorese

Lorese is a really lightweight state manager for frontend applications. It uses a single store for caching the data, and it should considered the source of truth for your app.

It is compound by 3 main parts:
* LO - loaders: Allow to fetch data asynchronously, and returns an object that can be consumed directly in a declarative way.
* RE - reducers: Set the data in the store, updating the cache and emiting events to allow you refresh your UI.
* SE - selectors: Create selectors to access the data in the store. Best practice is not to allow your UI get the store directly, instead create selectors with logic reusable across your app.


## How to use it
```js
import Lorese from 'lorese';

// We will have a store with 2 attributes
const store = {
  todoIds: null, // This will be a list with our todo's ids
  todos: {} // A map with the todos indexed by id
}

// Create our state manager
const stateManager = Lorese(store);
const {loader, selector, reducer} = stateManager;

// Selectors will give sense to our store
const getTodos = selector( store => {
  // If our todos aren't loaded just return
  if( !store.todoIds ) return;

  // Return our todo's
  return store.todoIds.map( id => store.todos[id] );
})

// Use a reducer to update our store
const onTodosLoaded = selector( (store, todos) => {
  let ids = [];
  let allTodos = {...store.todos};
  todos.forEach( todo => {
    ids.push(todo.id);
    allTodos[todo.id] = todo;
  })

  // Return the store updated
  return {
    todoIds: ids,
    todos: allTodos
  };
});

// Create a loader to fetch our todos
const loadTodos = stateManager.loader({
  selector: getTodos, // if the selector returns undefined, the load() method

  async load(){
    let todoList = await api.fetchTodos();
    // Using the reducer here will update the store and refresh the UI
    onTodosLoaded( todoList );
  }
})

// ...
// Within your UI you can use the loader declaratively
const {isLoading, data: todos} = loadTodos();
isLoading ? renderLoading() : renderTodos(todos);
```
