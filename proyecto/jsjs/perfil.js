const datos = document.querySelectorAll(".perfil-dato");

datos.forEach(dato => {
    const texto = dato.querySelector(".perfil-texto");
    const input = dato.querySelector(".perfil-input");
    const editar = dato.querySelector(".perfil-editar");
    const guardar = dato.querySelector(".perfil-guardar");
    const cancelar = dato.querySelector(".perfil-cancelar");
    let valorOriginal = "";

    editar.addEventListener("click", () => {
        valorOriginal = texto.textContent.trim();
        input.value = valorOriginal;
        texto.classList.add("perfil-oculto");
        input.classList.remove("perfil-oculto");
        editar.classList.add("perfil-oculto");
        guardar.classList.remove("perfil-oculto");
        cancelar.classList.remove("perfil-oculto");
        input.focus();
    });


    guardar.addEventListener("click", () => {
        texto.textContent = input.value;
        texto.classList.remove("perfil-oculto");
        input.classList.add("perfil-oculto");
        editar.classList.remove("perfil-oculto");
        guardar.classList.add("perfil-oculto");
        cancelar.classList.add("perfil-oculto");
    });


    cancelar.addEventListener("click", () => {
        input.value = valorOriginal;
        texto.classList.remove("perfil-oculto");
        input.classList.add("perfil-oculto");
        editar.classList.remove("perfil-oculto");
        guardar.classList.add("perfil-oculto");
        cancelar.classList.add("perfil-oculto");
    });

});