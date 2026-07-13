document.addEventListener("DOMContentLoaded", function () {
    fetch("../menu.html")
        .then(respuesta => respuesta.text())
        .then(datos => {
            document.getElementById("menu").innerHTML = datos;
        });
});

function irMateria(nombre) {
  localStorage.setItem("materia", nombre);
  window.location.href = "materia.html";
};