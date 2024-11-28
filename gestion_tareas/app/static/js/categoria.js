// scripts.

  // Abrir y cerrar el modal


// Función para añadir una nueva categoría
$('#addCategoryBtn').click(function() {
    if (categoryName) {
      const newCategory = `<div class="category-item">
                            <span class="category-name">${categoryName}</span>
                            <div class="category-actions">
                              <button class="btn-edit"><i class="fas fa-edit"></i> Editar</button>
                              <button class="btn-delete"><i class="fas fa-trash"></i> Eliminar</button>
                            </div>
                          </div>`;
      $('.category-list').append(newCategory);
    }
  });
  
  // Función para eliminar una categoría
  $('.category-list').on('click', '.btn-delete', function() {
    $(this).closest('.category-item').remove();
  });
  
  // Función para editar una categoría
 // Abrir el modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
}

// Cerrar el modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
}

// Evento para cerrar el modal al hacer clic fuera del contenido
window.onclick = function(event) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
      if (event.target === modal) {
          modal.style.display = 'none';
      }
  });
};

// Función para manejar la edición de categorías
$('.category-list').on('click', '.btn-edit', function() {
  // Obtener los datos actuales de la categoría
  const categoryItem = $(this).closest('.category-item');
  const currentName = categoryItem.find('.category-name').text();
  const currentDescription = categoryItem.find('.category-description').text();

  // Cargar los datos en el formulario del modal
  $('#editName').val(currentName);
  $('#editDescription').val(currentDescription);

  // Mostrar el modal
  openModal('editCategoryModal');

  // Manejar el envío del formulario
  $('#editCategoryForm').off('submit').on('submit', function(e) {
      e.preventDefault(); // Evitar la recarga de la página

      // Obtener los valores actualizados
      const newName = $('#editName').val();
      const newDescription = $('#editDescription').val();

      // Actualizar los valores en el DOM
      categoryItem.find('.category-name').text(newName);
      categoryItem.find('.category-description').text(newDescription);

      // Opcional: Hacer una solicitud AJAX para guardar los cambios en el servidor
      /*
      $.ajax({
          url: '/ruta-para-guardar-cambios/',
          method: 'POST',
          data: {
              name: newName,
              description: newDescription,
              csrfmiddlewaretoken: '{{ csrf_token }}' // Agrega el CSRF token si usas Django
          },
          success: function(response) {
              alert('Categoría actualizada correctamente.');
          },
          error: function(error) {
              console.error('Error al actualizar la categoría:', error);
          }
      });
      */

      // Cerrar el modal
      closeModal('editCategoryModal');
  });
});




  
  const modal = document.getElementById('addCategoryModal');
  const openModalBtn = document.getElementById('addCategoryBtn');
  const closeModalBtn = document.querySelector('.close');

  openModalBtn.addEventListener('click', () => modal.style.display = 'block');
  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  