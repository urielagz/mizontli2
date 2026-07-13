const mensaje = document.getElementById("mensaje");
const archivo = document.getElementById("archivo");
const botonEnviar = document.getElementById("btnEnviar");
const listaPublicaciones = document.getElementById("listaPublicaciones");

const usuario = {
    nombre: "Usuario",
    foto: "../img/perfil.jpg"
};

botonEnviar.addEventListener("click", publicar);

function publicar() {
    const texto = mensaje.value.trim();
    const archivoSeleccionado = archivo.files[0];
    if (texto === "" && !archivoSeleccionado) {
        alert("Escribe un mensaje o selecciona un archivo.");
        return;
    }
    crearPublicacion(texto, archivoSeleccionado);
    mensaje.value = "";
    archivo.value = "";
}

function crearPublicacion(texto, archivoSeleccionado) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "publicacion";
    const hora = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    tarjeta.innerHTML = `
        <div class="publicacion-header">
            <img
                src="${usuario.foto}"
                class="foto-perfil">

            <div>
                <h3>${usuario.nombre}</h3>
                <span>${hora}</span>
            </div>
        </div>
        <div class="publicacion-contenido">
            <p>${texto}</p>
        </div>
    `;

    if (archivoSeleccionado) {
        const url = URL.createObjectURL(archivoSeleccionado);
        if (archivoSeleccionado.type.startsWith("image/")) {
            const imagen = document.createElement("img");
            imagen.src = url;
            imagen.className = "publicacion-imagen";
            tarjeta.appendChild(imagen);
        }

        else if (archivoSeleccionado.type.startsWith("video/")) {
            const video = document.createElement("video");
            video.controls = true;
            video.src = url;
            video.className = "publicacion-video";
            tarjeta.appendChild(video);
        }

        else {
            const documento = document.createElement("a");
            documento.href = url;
            documento.target = "_blank";
            documento.className = "documento";
            documento.innerHTML = `
                ${archivoSeleccionado.name}
            `;
            tarjeta.appendChild(documento);
        }
    }

    const footer = document.createElement("div");
    footer.className = "publicacion-footer";
    footer.innerHTML = `
        <button class="like">
            Me gusta
        </button>
        <button>
            Comentar
        </button>
        <button>
            Compartir
        </button>
    `;
    tarjeta.appendChild(footer);
    listaPublicaciones.prepend(tarjeta);
}