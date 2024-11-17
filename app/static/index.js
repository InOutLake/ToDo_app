const taskCardsContainers = document.querySelectorAll('.task-cards');
let taskCards = document.querySelectorAll('.task-card');

function dragstartHandler(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
}

window.addEventListener("DOMContentLoaded", () => {
  for (const taskCard of taskCards) {
    taskCard.addEventListener("dragstart", dragstartHandler);
  }
});

function dragoverHandler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function dropHandler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text/plain");
  const taskCard = document.getElementById(data);
  
  if (taskCardsContainers.includes(ev.target)) {
    ev.target.appendChild(taskCard);
  }
}
