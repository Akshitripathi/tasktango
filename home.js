// SELECT ELEMENTS
const forms = document.querySelectorAll('.todoform');
const todoInputs = document.querySelectorAll('.newtodo');
const todosLists = document.querySelectorAll('.todos-list');
const notificationEl = document.querySelector('.notification');


// Accessing the data-category attribute
const category = notificationEl.getAttribute('data-category');
// VARS
let todos = Array.from({ length: forms.length }, () => []); // Array of todos for each page
let EditTodoId = -1;

// 1st render
renderTodos();

// FORM SUBMIT
// FORM SUBMIT
// FORM SUBMIT
forms.forEach((form, pageIndex) => {
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const todoInput = this.querySelector('.newtodo');
    const deadlineInput = this.querySelector('.deadline'); // Get the deadline input
    const category = this.closest('.page').dataset.category;
    saveTodo(todoInput, deadlineInput, pageIndex);
    
    // Render todos and store in localStorage
    renderTodos();
    localStorage.setItem('todos', JSON.stringify(todos));

    // Reset input values
    todoInput.value = '';
    deadlineInput.value = '';
  });
});
function loadTodos() {
  const storedTodos = localStorage.getItem('todos');
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
    renderTodos(); // Render the loaded todos
  }
}
loadTodos();
// SAVE TODO
// Update the saveTodo function to include the deadline
// Update the saveTodo function to include the deadline
// Update the saveTodo function to pass the category value to showNotification
function saveTodo(todoInput, deadlineInput, pageIndex) {
  const todoValue = todoInput.value;
  const deadlineValue = deadlineInput.value;
  const category = todoInput.closest('.page').getAttribute('data-category'); // Get the category of the current todo
  // Calculate deadline in milliseconds
  const now = new Date();
  const deadlineDate = new Date(deadlineValue);
  if (deadlineDate < now) {
    showNotification("Deadline cannot be set for past dates", category);
    return; // Exit the function early
  }
  const deadlineMs = deadlineDate.getTime() - now.getTime();

  

  // check if the todo is empty
  const isEmpty = todoValue === '';

  // check for duplicate todos
  const isDuplicate = todos[pageIndex].some((todo) => todo.value.toUpperCase() === todoValue.toUpperCase());

  if (isEmpty) {
    showNotification("Todo's input is empty", category);
  } else if (isDuplicate) {
    showNotification('Todo already exists!', category);
  } else {
    if (EditTodoId >= 0) {
      todos[pageIndex] = todos[pageIndex].map((todo, index) => ({
        ...todo,
        value: index === EditTodoId ? todoValue : todo.value,
        deadline: index === EditTodoId ? deadlineValue : todo.deadline,
        deadlineMs: index === EditTodoId ? deadlineMs : todo.deadlineMs,
      }));
      EditTodoId = -1;
    } else {
      todos[pageIndex].push({
        value: todoValue,
        checked: false,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        deadline: deadlineValue,
        deadlineMs: deadlineMs,
        category: category,
      });
    }

    renderTodos(); // Move the renderTodos function call inside the else block
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Reset input value
  todoInput.value = '';
  deadlineInput.value = '';
}


// Update the renderTodos function to include the deadline
function renderTodos() {
  todosLists.forEach((todosList, pageIndex) => {
    const currentTodos = todos[pageIndex];

    if (currentTodos.length === 0) {
      todosList.innerHTML = '<center>Nothing to do!</center>';
      return;
    }

    // CLEAR ELEMENT BEFORE A RE-RENDER
    todosList.innerHTML = '';

    // RENDER TODOS
    currentTodos.forEach((todo, index) => {
      // Calculate time remaining
      const deadlineDate = new Date(todo.deadline);
      const currentDate = new Date();
      const timeRemaining = deadlineDate - currentDate;
      let deadlineEmoji = '⏳'; // Default hourglass emoji
    
      if (timeRemaining <= 0) {
        deadlineEmoji = '⌛'; // Deadline passed emoji
      } else if (timeRemaining < (1 / 3) * 86400000) {
        deadlineEmoji = '🔥'; // Urgent emoji
      } else if (timeRemaining < (2 / 3) * 86400000) {
        deadlineEmoji = '⏰'; // Soon emoji
      }
    
      todosList.innerHTML += `
        <div class="todo" id=${index}>
          <i
            class="bi ${todo.checked ? 'bi-check-circle-fill' : 'bi-circle'}"
            style="color : ${todo.color}"
            data-action="check"
          ></i>
          <p class="${todo.checked ? 'checked' : ''}" data-action="check">${todo.value}</p>
          <p class="deadline-text">${deadlineEmoji}</p> <!-- Display deadline emoji -->
          <i class="bi bi-pencil-square" data-action="edit"></i>
          <i class="bi bi-trash" data-action="delete"></i>
        </div>
      `;
    });
    
  });
}


// Function to update the deadline emoji every second
function updateDeadlineEmoji() {
  const currentDate = new Date();
  todosLists.forEach((todosList, pageIndex) => {
    todos[pageIndex].forEach((todo, index) => {
      const deadlineDate = new Date(todo.deadline);
      const timeRemaining = deadlineDate - currentDate;
      let deadlineEmoji = '⏳'; // Default hourglass emoji
    
      if (timeRemaining <= 0) {
        deadlineEmoji = '⌛'; // Deadline passed emoji
        todo.checked = true;
      } else if (timeRemaining < (1 / 3) * 86400000) {
        deadlineEmoji = '🔥'; // Urgent emoji
      } else if (timeRemaining < (2 / 3) * 86400000) {
        deadlineEmoji = '⏰'; // Soon emoji
      }
      const todoElement = todosList.querySelector(`.todo[id="${index}"] .deadline-text`);

      // const todoElement = todosList.querySelector(`.todo[id="${index}"].todoElement`);
      if (todoElement) {
        todoElement.textContent =deadlineEmoji;
      }
    });
  });
}

// Call the updateDeadlineEmoji function every second to update the emoji
setInterval(updateDeadlineEmoji, 1000);


// CLICK EVENT LISTENER FOR ALL THE TODOS
todosLists.forEach((todosList, pageIndex) => {
  todosList.addEventListener('click', (event) => {
    const target = event.target;
    const parentElement = target.parentNode;

    if (parentElement.className !== 'todo') return;

    // t o d o id
    const todo = parentElement;
    const todoId = Number(todo.id);

    // target action
    const action = target.dataset.action;

    action === 'check' && checkTodo(todoId, pageIndex);
    action === 'edit' && editTodo(todoId, pageIndex);
    action === 'delete' && deleteTodo(todoId, pageIndex);
  });
});

// CHECK A TODO
function checkTodo(todoId, pageIndex) {
  todos[pageIndex] = todos[pageIndex].map((todo, index) => ({
    ...todo,
    checked: index === todoId ? !todo.checked : todo.checked,
  }));

  renderTodos();
  localStorage.setItem('todos', JSON.stringify(todos));
}

// EDIT A TODO
function editTodo(todoId, pageIndex) {
  todoInputs.forEach((todoInput, index) => {
    if (index === pageIndex) {
      todoInput.value = todos[pageIndex][todoId].value;
      EditTodoId = todoId;
    }
  });
}

// DELETE TODO
function deleteTodo(todoId, pageIndex) {
  todos[pageIndex] = todos[pageIndex].filter((todo, index) => index !== todoId);
  EditTodoId = -1;

  // re-render
  renderTodos();
  localStorage.setItem('todos', JSON.stringify(todos));
}



function showNotification(msg, category) {
  const notificationEl = document.querySelector(`.notification[data-category="${category}"]`);
  if (notificationEl) {
    notificationEl.textContent = msg;
    notificationEl.classList.add('notif-enter');
    setTimeout(() => {
      notificationEl.classList.remove('notif-enter');
    }, 2000);
  } else {
    console.error('Notification element not found');
  }
}





function setIndex() {
  let pages = document.querySelectorAll(".page");
  for (var i = 0; i < pages.length; i++) {
    pages[i].style.zIndex = pages.length - i;
  }
}

setIndex();

function previous() {
  let active = document.querySelector(".active");
  let prevSib = active.previousElementSibling;
  active.className = "page";
  prevSib.className = "page active";
  setIndex();
  prevSib.style.transform = "rotateY(0deg)";
  let prevSib2 = prevSib.previousElementSibling;
  if (prevSib2 && prevSib2.className == "page") {
    prevSib2.style.zIndex = "9998";
  }

  // Show next arrow if navigating to a page before the last page
  if (prevSib.nextElementSibling !== null && prevSib.nextElementSibling.id !== "last") {
    document.querySelector(".controls .btn:last-child").style.display = "block";
  }
}


function next() {
  let active = document.querySelector(".active");
  let nextSib = active.nextElementSibling;
  active.style.transform = "rotateY(180deg)";
  active.className = "page";
  setIndex();
  active.style.zIndex = "9998";
  if (nextSib) {
    nextSib.className = "page active";
    if (nextSib.nextElementSibling === null || nextSib.nextElementSibling.id === "last") {
      document.querySelector(".controls .btn:last-child").style.display = "none";
    } else {
      document.querySelector(".controls .btn:last-child").style.display = "block";
    }
  }
}

function showPage(category) {
  const pages = document.querySelectorAll(".page");
  let pageIndex = 0;

  // Find the index of the clicked category
  pages.forEach((page, index) => {
      if (page.dataset.category === category) {
          pageIndex = index;
      }
  });

  // Calculate the number of pages to move
  const currentPageIndex = [...pages].findIndex(page => page.classList.contains("active"));
  const pagesToMove = pageIndex - currentPageIndex;

  // Move the pages
  if (pagesToMove > 0) {
      for (let i = 0; i < pagesToMove; i++) {
          next();
      }
  } else if (pagesToMove < 0) {
      for (let i = 0; i > pagesToMove; i--) {
          previous();
      }
  }
}