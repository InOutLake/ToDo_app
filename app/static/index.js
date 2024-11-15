const taskColumns = document.querySelectorAll('.task-column');
const createTaskForm = document.getElementById('create-task-form');
const createTaskBtn = document.getElementById('create-task-btn');

// Create task card component
function createTaskCard(task) {
  const taskCard = document.createElement('div');
  taskCard.classList.add('task-card');
  taskCard.innerHTML = `
    <h3>${task.name}</h3>
    <p>${task.description}</p>
  `;
  taskCard.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('task-id', task.id);
  });
  return taskCard;
}

// Get tasks from server
fetch('/tasks')
  .then(response => response.json())
  .then(tasks => {
    tasks.forEach(task => {
      const taskCard = createTaskCard(task);
      const taskColumn = document.getElementById(`${task.status}-column`);
      taskColumn.querySelector('.task-cards').appendChild(taskCard);
    });
  });

// Create new task
createTaskBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const taskName = document.getElementById('task-name').value;
  const taskDescription = document.getElementById('task-description').value;

  fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: taskName, description: taskDescription }),
  })
    .then(response => response.json())
    .then(task => {
      const taskCard = createTaskCard(task);
      const taskColumn = document.getElementById('to-do-column');
      taskColumn.querySelector('.task-cards').appendChild(taskCard);
    });
});

// Make task cards draggable
taskColumns.forEach((taskColumn) => {
  taskColumn.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  taskColumn.addEventListener('drop', (e) => {
    const taskId = e.dataTransfer.getData('task-id');
    const taskCard = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
    const newTaskColumn = e.target.closest('.task-column');
    newTaskColumn.querySelector('.task-cards').appendChild(taskCard);
  });
});