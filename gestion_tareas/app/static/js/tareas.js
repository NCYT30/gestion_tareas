// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Hacer que cada columna sea "draggable" usando Sortable
  new Sortable(document.getElementById("pending-column"), {
    group: "tasks",
    animation: 150,
    onEnd: updateTaskStatus,
  });

  new Sortable(document.getElementById("in-progress-column"), {
    group: "tasks",
    animation: 150,
    onEnd: updateTaskStatus,
  });

  new Sortable(document.getElementById("completed-column"), {
    group: "tasks",
    animation: 150,
    onEnd: updateTaskStatus,
  });

  // Manejo de botones completar
  document.querySelectorAll('.btn-completar').forEach(button => {
    button.addEventListener('click', () => {
      const taskId = button.getAttribute('data-id');
      const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  
      fetch(`/tareas/completar/${taskId}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrftoken
        }
      })
      .then(response => {
        if (response.ok) {
          alert('Tarea marcada como completada.');
          location.reload();
        } else {
          alert('Error al marcar la tarea.');
        }
      });
    });
  });
  

  // Manejo de botones eliminar
  document.querySelectorAll('.btn-eliminar').forEach(button => {
    button.addEventListener('click', () => {
      const taskId = button.getAttribute('data-id');
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
      fetch(`/eliminar/tarea/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': csrfToken
        }
      })
        .then(response => {
          if (response.ok) {
            alert('Tarea eliminada.');
            location.reload();
          } else {
            alert('Error al eliminar la tarea.');
          }
        });
    });
  });
  

  // Filtrado de tareas cuando los filtros cambian
  $('#filter-categoria, #filter-estado, #filter-fecha').on('change', function() {
    filtrarTareas();
  });
});

// Función para actualizar el estado de una tarea al moverla entre columnas
function updateTaskStatus(event) {
  const taskId = event.item.dataset.id; // Obtener el ID de la tarea
  const newState = event.to.id.replace("-column", "").replace("-", "_").toUpperCase();

  // Hacer la solicitud AJAX para actualizar el estado de la tarea
  $.ajax({
    url: "/update-task-status/", // Ruta de tu vista en Django
    method: "POST",
    data: {
      csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
      id: taskId,
      estado: newState,
    },
    success: function (response) {
      if (response.success) {
        console.log("Estado actualizado exitosamente:", response.message);
      } else {
        console.error("Error al actualizar el estado:", response.message);
      }
    },
    error: function (xhr) {
      console.error("Error en la solicitud AJAX:", xhr.responseText);
    },
  });
}

// Función para filtrar las tareas
function filtrarTareas() {
  const categoria = $('#filter-categoria').val();
  const estado = $('#filter-estado').val();
  const fecha = $('#filter-fecha').val();

  // Realizar la solicitud AJAX para obtener las tareas filtradas
  $.ajax({
    url: '/filtrar-tareas/',  // Asegúrate de usar la URL correcta
    data: {
      categoria: categoria,
      estado: estado,
      fecha: fecha
    },
    success: function (response) {
      // Aquí procesas la respuesta y actualizas el tablero
      actualizarTableroKanban(response);
    },
    error: function (xhr) {
      console.error('Error al filtrar las tareas:', xhr.responseText);
    }
  });
}

// Función para actualizar el tablero Kanban con los fragmentos de HTML de tareas
function actualizarTableroKanban(response) {
  // Limpiar las columnas
  $('#pending-column').empty();
  $('#in-progress-column').empty();
  $('#completed-column').empty();

  // Insertar el HTML correspondiente en cada columna
  $('#pending-column').html(response.pending_html);  // Columna pendiente
  $('#in-progress-column').html(response.in_progress_html);  // Columna en progreso
  $('#completed-column').html(response.completed_html);  // Columna completada
}


document.addEventListener('DOMContentLoaded', () => {
  const editModal = document.getElementById('editModal');
  const closeModal = editModal.querySelector('.close');
  const editForm = document.getElementById('editForm');

  // Abrir Modal
  document.querySelectorAll('.btn-editar').forEach(button => {
      button.addEventListener('click', () => {
          const taskId = button.dataset.id;
          const taskItem = button.closest('.task-item');

          // Llenar el formulario con los datos de la tarea
          document.getElementById('task-id').value = taskId;
          document.getElementById('title').value = taskItem.querySelector('h3').textContent;
          document.getElementById('description').value = taskItem.querySelector('p:nth-of-type(1)').textContent;
          document.getElementById('due_date').value = taskItem.querySelector('p:nth-of-type(2)').textContent;
          const priorityText = taskItem.querySelector('p:nth-of-type(3)').textContent.trim();
          document.getElementById('priority').value = priorityText === 'Alta' ? 3 : priorityText === 'Media' ? 2 : 1;

          editModal.style.display = 'block';
      });
  });

  // Cerrar Modal
  closeModal.addEventListener('click', () => {
      editModal.style.display = 'none';
  });

  // Enviar Datos Editados
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate = document.getElementById('due_date').value || null;
    const priority = document.getElementById('priority').value;

    if (!title) {
        alert("El título es obligatorio.");
        return;
    }

    fetch(`/editar/tarea/completa/${taskId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            title: title,
            description: description,
            due_date: dueDate,
            priority: priority,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Actualizar el elemento en el DOM
            const taskItem = document.querySelector(`.btn-editar[data-id="${taskId}"]`).closest('.task-item');

            if (taskItem) {
                taskItem.querySelector('h3').textContent = data.tarea.title;
                taskItem.querySelector('p:nth-of-type(1)').textContent = data.tarea.description || "Sin descripción";
                taskItem.querySelector('p:nth-of-type(2)').textContent = `Fecha límite: ${data.tarea.due_date || 'Sin fecha'}`;
                taskItem.querySelector('p:nth-of-type(3)').textContent = `Prioridad: ${data.tarea.priority == 3 ? 'Alta' : data.tarea.priority == 2 ? 'Media' : 'Baja'}`;
            } else {
                console.error("Elemento DOM no encontrado para la tarea actualizada.");
            }

            // Cerrar el modal
            editModal.style.display = 'none';
        } else {
            alert(`Error al guardar los cambios: ${data.error}`);
        }
    })
    .catch(error => {
        console.error("Error inesperado:", error);
        alert("Error al guardar los cambios.");
    });
});

document.querySelectorAll('.btn-eliminar').forEach(button => {
  button.addEventListener('click', () => {
      const taskId = button.dataset.id;

      if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;

      fetch(`/eliminar/${taskId}/`, {
          method: 'POST',
          headers: { 'X-CSRFToken': getCookie('csrftoken') },
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Eliminar el elemento del DOM
              button.closest('.task-item').remove();
          } else {
              alert("Error al eliminar la tarea.");
          }
      })
      .catch(error => {
          console.error("Error:", error);
          alert("Ocurrió un error al intentar eliminar la tarea.");
      });
  });
});


  // Obtener CSRF Token
  function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.startsWith(name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const editTaskModal = document.getElementById('editTaskModal');
  const closeBtn = editTaskModal.querySelector('.close');
  const editTaskForm = document.getElementById('editTaskForm');

  // Mostrar modal al hacer clic en "Editar"
  document.querySelectorAll('.btn-editar').forEach(button => {
    button.addEventListener('click', () => {
      const taskId = button.getAttribute('data-id');
      // Obtener datos de la tarea actual
      const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
      const title = taskElement.querySelector('strong').textContent;
      const description = taskElement.querySelector('p:nth-of-type(2)').textContent;
      const dueDate = taskElement.querySelector('small').textContent.split(': ')[1];

      // Rellenar el formulario del modal
      document.getElementById('task-id').value = taskId;
      document.getElementById('task-title').value = title;
      document.getElementById('task-description').value = description;
      document.getElementById('task-due-date').value = dueDate.split('-').reverse().join('-');

      // Mostrar el modal
      editTaskModal.style.display = 'block';
    });
  });

  // Cerrar modal
  closeBtn.addEventListener('click', () => {
    editTaskModal.style.display = 'none';
  });

  // Cerrar modal al hacer clic fuera del contenido
  window.addEventListener('click', (event) => {
    if (event.target === editTaskModal) {
      editTaskModal.style.display = 'none';
    }
  });

  // Enviar el formulario y actualizar tarea sin recargar
  editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;

    // Realizar una petición AJAX para actualizar la tarea
    fetch(`/update-task/${taskId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
      },
      body: JSON.stringify({ title, description, due_date: dueDate }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Actualizar los datos de la tarea en la página
          const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
          taskElement.querySelector('strong').textContent = title;
          taskElement.querySelector('p:nth-of-type(2)').textContent = description || 'Sin descripción';
          taskElement.querySelector('small').textContent = `Fecha límite: ${dueDate.split('-').reverse().join('-')}`;

          // Cerrar el modal
          editTaskModal.style.display = 'none';
        } else {
          alert('Error al actualizar la tarea');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});
