    // Lógica para vista previa dinámica
    const form = document.getElementById("task-form");

    form.addEventListener("input", function () {
      document.getElementById("preview-titulo").textContent = form.titulo.value || "Sin título";
      document.getElementById("preview-categoria").textContent = form.categoria.value || "Sin categoría";
      document.getElementById("preview-fecha").textContent = form.fecha_limite.value || "Sin fecha límite";

      const prioridad = form.querySelector('input[name="prioridad"]:checked');
      document.getElementById("preview-prioridad").textContent = prioridad ? prioridad.value : "Sin prioridad";

      document.getElementById("preview-descripcion").textContent = form.descripcion.value || "Sin descripción";
    });

    // Botón Cancelar
    document.querySelector(".cancel").addEventListener("click", () => {
      form.reset();
      document.getElementById("preview").querySelectorAll("span").forEach(span => span.textContent = "");
    });

    // Botón Guardar (puedes implementar lógica de envío aquí)

    // Botón Eliminar (puedes implementar lógica de borrado aquí)
    document.querySelector(".delete").addEventListener("click", () => {
      if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
        alert("Tarea eliminada.");
        form.reset();
      }
    });