async function fetchTasks() {
  try {
    const response = await fetch('/tasks/');
    const tasks = await response.json();
    
    taskCardsContainers = document.querySelectorAll(".task-cards");

    tasks.forEach(task => {
      const taskCard = document.createElement('div');
      taskCard.className = 'task-card';
      taskCard.draggable = true;
      taskCard.id = `task-card-${task.id}`;
      
      const taskTitle = document.createElement('h3');
      taskTitle.textContent = task.name;
      taskCard.appendChild(taskTitle);
      
      const taskDescription = document.createElement('p');
      taskDescription.textContent = task.description;
      taskCard.appendChild(taskDescription);
      
      // TODO rework this using enum
      if (task.status === "To Do") {
        taskCardsContainers[0].appendChild(taskCard);
      } else if (task.status === "In Progress") {
        taskCardsContainers[1].appendChild(taskCard);
      } else if (task.status === "Completed"){
        taskCardsContainers[2].appendChild(taskCard);
      } else{
        throw new Error('Unexpected task status');
      }
      
      taskCard.addEventListener("dragstart", dragstartHandler);
      taskCard.addEventListener("dragend", dragendHandler);
      taskCard.addEventListener("dblclick", dbclickHandler);
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

const trashbox = document.getElementById("trash-dropbox");

window.addEventListener("DOMContentLoaded", fetchTasks);

// --- Drag event ---
function dragstartHandler(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
  trashbox.classList.add('show');
}

function dragoverHandler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

async function dropHandler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/plain");
  const taskCard = [...document.querySelectorAll(".task-card")].find(element => element.id === data);

  if (ev.target.id === "trash-dropbox" || ev.target.parentNode.id === "trash-dropbox") {
    const taskId = taskCard.id.split('-')[2];
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      taskCard.remove();
    } else {
      alert('Unable to delete task. Please check the server logs for more information.');
    }
    return;
  }
  else {
    let dropElem = ev.target.closest('.task-cards');
    const taskId = taskCard.id.split('-')[2];
    const response = await fetch(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: ev.target.closest('.task-column').id })
    })

    if (dropElem && response.ok) {
      dropElem.appendChild(taskCard);
    } else {
      alert('Unable to move task. Please check the server logs for more information.');
    }
  }
}

async function dragendHandler(ev) {
  ev.preventDefault();
  trashbox.classList.remove('show');
}


// --- Edit event ---
async function dbclickHandler(ev) {
  const toChange = ev.target.closest('.task-card');
  if (toChange.getAttribute('contenteditable') === 'true') return;
  toChange.setAttribute('contenteditable', 'true');
  toChange.setAttribute('draggable', 'false');
  toChange.focus();
  toChange.addEventListener('blur', async () => {
    if (toChange.getAttribute('contenteditable') === 'true') {
      const name = toChange.children[0].textContent;
      const description = toChange.children[1].textContent;
      const response = await fetch(`/tasks/${toChange.id.split('-')[2]}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, description: description })
      });

      if (response.ok) {
        toChange.removeAttribute('contenteditable');
        toChange.setAttribute('draggable', 'true');
      } else {
        alert('Unable to save changes. Please check the server logs for more information.');
      }
    }
  });
}

// --- Create event ---
async function createTask() {
  const newTask = document.createElement('div');
  newTask.className = 'task-card';
  newTask.setAttribute('contenteditable', 'true');
  newTask.setAttribute('draggable', 'false');

  const newName = document.createElement('h3');
  newTask.appendChild(newName);
  const newDescription = document.createElement('p');
  newTask.appendChild(newDescription);

  document.getElementById('to-do-cards').appendChild(newTask);
  newTask.focus();
  newTask.addEventListener("dragstart", dragstartHandler);
  newTask.addEventListener("dragend", dragendHandler);
  newTask.addEventListener("dblclick", dbclickHandler);
  newTask.addEventListener('blur', async () => {
    if (newTask.getAttribute('contenteditable') === 'true') {
      const name = newTask.children[0].textContent;
      if (name === '') {
        newTask.remove();
        return
      }
      const description = newTask.children[1].textContent;
      const response = await fetch('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, description: description })
      });
      const responseData = await response.json();
      console.log(responseData);
      if (response.ok) {
        newTask.setAttribute('contenteditable', 'false');
        newTask.id = `task-card-${responseData.id}`;
        newTask.setAttribute('draggable', 'true');
      }
    }
  });
}