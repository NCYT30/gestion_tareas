// login.js

// Evento para manejar el envío del formulario
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe de forma tradicional
    
    // Obtener los valores de los campos
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Validación simple
    if (username === "" || password === "") {
      alert("Por favor, completa todos los campos.");
      return;
    }
  
    // Simulación de un login exitoso
    if (username === "usuario@ejemplo.com" && password === "12345") {
      alert("Inicio de sesión exitoso!");
      window.location.href = "dashboard.html"; // Redirigir a la página principal (ejemplo)
    } else {
      alert("Usuario o contraseña incorrectos.");
    }
  });
  