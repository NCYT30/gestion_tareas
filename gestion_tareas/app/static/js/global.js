
  document.addEventListener("DOMContentLoaded", () => {
    const taskItems = document.querySelectorAll(".task-list li");
    taskItems.forEach((item) => {
      item.addEventListener("click", () => {
        alert(`Has seleccionado la tarea: ${item.querySelector(".task-title").textContent}`);
      });
    });
  });

