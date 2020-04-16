var ENTER_KEY = 13;

var helper = {
  createId: function() {
    var i;
    var random;
    var id = "";

    for (var i = 0; i < 12; i++) {
      random = (Math.random() * 8) | 0;
      if (i === 4 || i === 8) {
        id += "-";
      }
      id += random.toString();
    }
    return id;
  },

  pluralize: function(count, word) {
    return count === 1 ? word : word + "s";
  },
  store: function(name, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(name, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(name);
      return (store && JSON.parse(store)) || [];
    }
  }
};
var App = {
  init: function() {
    this.todos = helper.store('todos');
    var ul  = document.getElementById('todo-list');
    this.todoTemplate = Handlebars.compile(document.querySelector("#todo-template").innerHTML);
    this.event();
    //this.lastActiveInput = this.todos[0].id; // needed for resesting
    this.render();
    this.lastActiveInput = this.todos[0].id; // needed for resesting
  },
  
  event: function() {
    var todosUl = document.getElementById("todo-list");
    todosUl.addEventListener('keyup', function(e){
      var elementClicked = event.target;
        if (elementClicked.className === 'edit') {
          App.update(e);
        }
    })
    
    todosUl.addEventListener('click', function(e){
      var elementClicked = event.target;
        if (elementClicked.className === 'delete') {
          App.delete(e);
        }
      
    })
    
		todosUl.addEventListener('change', function (e) {
      var elementClicked = event.target;
        if (elementClicked.className === 'toggle') {
          App.toggle(e);
        }
    })
    
    todosUl.addEventListener('keyup', function (e) {
      var elementClicked = event.target;
        if (elementClicked.className === 'edit') {
          App.create(e);
        }
    })
    
    todosUl.addEventListener('click', function(e) {
      var elClicked = event.target;
      if (elClicked.className === 'add') {
        App.createNestedTodo(e);
      }
    })
    
  },
  render: function () {
   // if there are no todos, start with a blank todo. 
   // allows the user to enter a todo, avoids blank screen
    if (this.todos.length === 0){
      this.todos.push({
        id: helper.createId(),
        todoText: '',
        completed: false,
        nestedTodos: false,
      });
    } 
    helper.store('todos', this.todos);
    document.getElementById('todo-list').innerHTML = (this.todoTemplate(this.todos));
    this.renderNestedTodos(this.todos);
    this.whereToFocus();
   
    
  },
  
  renderNestedTodos: function(todo) {
    for (var i = 0; i < todo.length; i++) {
      if (todo[i].nestedTodo) {
        var id = todo[i].id;
        var liSelectorString = 'li' + '[data-id=' + '"' + id + '"' + ']';
        var li = document.querySelector(liSelectorString);
        var newUl = document.createElement('ul');
        li.appendChild(newUl);
        newUl.setAttribute('data-id', id);
        newUl.innerHTML = (this.todoTemplate(todo[i].nestedTodo));
        newUl.style.marginLeft = '2%';
        this.renderNestedTodos(todo[i].nestedTodo);
      }
    }
  },
  getNestedTodoIndex: function (todo, dataId){

    for (var i = 0; i < todo.length; i++) {
      if (todo[i].id === dataId) {
        return i;
      }
      if (todo[i].nestedTodo) {
        if (this.getNestedTodoIndex(todo[i].nestedTodo, dataId) !== undefined) {
          return this.getNestedTodoIndex(todo[i].nestedTodo, dataId);
        }
      }
    }
  },
  whereToFocus: function() {
    
    var selectorString = 'input' + '[find-id=' + '"' + this.lastActiveInput +'"' + ']';
    var input = document.querySelector(selectorString);
    console.log('input', input);
      if (input !== null) {
        input.focus();
        // focus, clear, fill in text
        // make sure you do not put focus behind newly entered text. focus will appear after the text
        var val = input.getAttribute('value');
        // makes input blank
        input.value = '';
        // inserts a value so that the focus appears after val
        input.value = val;
      } else {    
        var lastTodoId = App.todos[App.todos.length - 1].id;
        var lastTodoSelectorString = 'input' + '[find-id=' + '"' + lastTodoId +'"' + ']';
        input = document.querySelector(lastTodoSelectorString);
        input.focus();
        var val = input.getAttribute('value');
        input.value = '';
        input.value = val;
      }
  },
  create: function (e) {
    var input = e.target;
    var val = input.value;
    var closestLi = input.closest('li');
    var dataId = closestLi.getAttribute('data-id');
    var subIndex = this.getNestedTodoIndex(this.todos, dataId);

    if (e.which !== ENTER_KEY) {
        return;
    }
    // this.todos.push(new Todo(val));
    // val = "";
  
    this.createNextEmptyTodo(this.todos, dataId, subIndex);
    
    this.render();
    
  },
  
  // method is used to insert a new blank todo 
  createNextEmptyTodo: function(todo, dataId, subIndex) {
    for (var i = 0; i < todo.length; i++) {
      if (todo[i].id === dataId) {
        
        todo.splice(subIndex + 1, 0, {
          id: helper.createId(),
          todoText: '',
          completed: false,
          nestedTodo: false
        })
        // leave lastActiveInput location so that we can focus on the next blank todo by adding 1 to i
         this.lastActiveInput = todo[i + 1].id;
      }
      if (todo[i].nestedTodo) {
        this.createNextEmptyTodo(todo[i].nestedTodo, dataId, subIndex);
      }
    }
  },
  createNestedTodo: function(e){
    var elementClicked = e.target;
    var liElement = elementClicked.closest('li');
    var dataId = liElement.getAttribute('data-id');
    
    // subIndex will be used in recursive function
    //var subIndex = this.getSubTodoIndex(this.todos, dataId);
    this.createNextEmptyNestedTodo(this.todos,dataId );
    this.render();
  },
  createNextEmptyNestedTodo: function(todo, dataId) {
    for (var i = 0; i < todo.length; i++){
      if (todo[i].id === dataId){
        //make sure nestedTodo is an array, if its not we make it so by making
        // todo[i].nestedTodo = []; a blank array
        if (Array.isArray(todo[i].nestedTodo) === false) {
          todo[i].nestedTodo = [];
        }
        //create new blank todo using splice and adding an object with no text value to this.todos
        todo[i].nestedTodo.splice(0, 0, {
          id: helper.createId(),
          todoText: '',
          completed: false,
          nestedTodo: false
        })
        // focus on new nestedTodo that was just created
        this.lastActiveInput = todo[i].nestedTodo[0].id;
      }
      if (this.createNextEmptyNestedTodo(todo[i].nestedTodo, dataId) !== undefined) {
        this.createNextEmptyNestedTodo(todo[i].nestedTodo, dataId);
      }
      
    }
    //oush empty array to todo[i].nestedTodo
  },
  update: function (e) {
    var input = e.target;
    var val = input.value;
    var closestLi = e.target.closest('li');
    var dataId = closestLi.getAttribute('data-id');

    this.updateRecurser(this.todos, val, dataId);
    this.lastActiveInput = dataId;
    this.render();
  },
  updateRecurser: function(todo, val, dataId) {
    for (var i = 0; i < todo.length; i++) {
      if (todo[i].id === dataId) {
        todo[i].todoText = val;
      }
      if (todo[i].nestedTodo) {
        this.updateRecurser(todo[i].nestedTodo, val, dataId);
      }
    }
  },
  delete: function (e) {
			// this.todos.splice(this.getNestedTodoIndex(e.target), 1);
			// this.render();
    var input = e.target;
    var closestLi = e.target.closest('li');
    var dataId = closestLi.getAttribute('data-id');
    var subIndex = this.getNestedTodoIndex(this.todos, dataId);
    this.deleteRecursivley(this.todos, subIndex, dataId);
    this.lastActiveInput = dataId;
    this.render();
	},
  deleteRecursivley: function(todo,subIndex,dataId) {
    for (var i = 0; i < todo.length; i++){
      if (todo[i].id === dataId) {
        todo.splice(subIndex, 1);
      }
      if (todo[i]) {
      if (todo[i].nestedTodo) {
        this.deleteRecursivley(todo[i].nestedTodo, subIndex, dataId);
      } else {
        todo[i].nestedTodo = false;
      }
          // if (todo[i].nestedTodo.length === 0) {
          //   todo[i].nestedTodo = false;
          // }
      }
    }  
  },
  toggle: function(e){
      var elementClicked = e.target;
      var closestLi = elementClicked.closest('li');
      var dataId = closestLi.getAttribute('data-id');
      var position = this.getNestedTodoIndex(this.todos, dataId);
	
      this.toggleRecursively(this.todos, position, dataId);
			this.render();
  },
  toggleRecursively: function(todo, position, dataId){
      for (var i = 0; i < todo.length; i++) {
        if (todo[i].id === dataId) {
          todo[i].completed = !todo[i].completed;
        } 
        if (todo[i].nestedTodo) {
          this.toggleRecursively(todo[i].nestedTodo, position, dataId);
        }
      }
  },
    
   store: function() {
    helper.store("todos", this.todos);
  },
 
  
  
};
App.init();