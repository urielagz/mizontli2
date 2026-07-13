const materias = {

matematicas:{
    nombre:"Matemáticas",
    temario:[
        {
id:"enteros",
nombre:"Números enteros",
actividades:[

{
    id:"ejercicios",
    nombre:"Ejercicios",
    preguntas:[
        {
            enunciado:"¿Cuánto es 8 + (-3)?",
            respuesta:5
        },
        {
            enunciado:"¿Cuánto es -10 + 6?",
            respuesta:-4
        },
        {
            enunciado:"¿Cuánto es -7 - 5?",
            respuesta:-12
        },
        {
            enunciado:"¿Cuánto es 15 - 20?",
            respuesta:-5
        },
        {
            enunciado:"¿Cuánto es -9 + 14?",
            respuesta:5
        }
    ]
},
{
    id:"quiz",
    nombre:"Quiz",
    preguntas:[
        {
            pregunta:"¿Cuál es un número entero negativo?",
            opciones:["8","-5","3/4","2.5"],
            correcta:1
        },
        {
            pregunta:"¿Cuál es el opuesto de 9?",
            opciones:["-9","9","18","0"],
            correcta:0
        },
        {
            pregunta:"¿Cuál es mayor?",
            opciones:["-8","-3","-15","-20"],
            correcta:1
        }

    ]
},
],

apoyo:[
{
    id:"video",
    nombre:"Video",
    url:"https://www.youtube.com/embed/2B9uVQ4eX4E"
},

{
    id:"pdf",
    nombre:"PDF",
    archivo:"../pdfs/numeros_enteros.pdf"
},
]
},

{
id:"fracciones",
nombre:"Fracciones",
actividades:[

{
id:"crucigrama",
nombre:"Crucigrama"
},

{
id:"quiz",
nombre:"Quiz"
},
{
id:"ejercicios",
nombre:"Ejercicios"
},
],

apoyo:[
                {
                    id:"video",
                    nombre:"Video"
                },

                {
                    id:"pdf",
                    nombre:"PDF"
                },

                {
                    id:"infografia",
                    nombre:"Infografía"
                }

            ]
        },

        {
            id:"algebra",
            nombre:"Álgebra",

            actividades:[

                {
                    id:"ecuaciones",
                    nombre:"Resolver ecuaciones"
                },

                {
                    id:"quiz",
                    nombre:"Quiz"
                },

                {
                    id:"juego",
                    nombre:"Juego de variables"
                },

                {
                    id:"problemas",
                    nombre:"Problemas de aplicación"
                },

                {
                    id:"emparejar",
                    nombre:"Emparejar expresiones"
                }

            ],

            apoyo:[

                {
                    id:"presentacion",
                    nombre:"Presentación"
                },

                {
                    id:"pdf",
                    nombre:"PDF"
                },

                {
                    id:"video",
                    nombre:"Video"
                }

            ]
        },

        {
            id:"geometria",
            nombre:"Geometría",

            actividades:[

                {
                    id:"figuras",
                    nombre:"Identificar figuras"
                },

                {
                    id:"areas",
                    nombre:"Calcular áreas"
                },

                {
                    id:"perimetros",
                    nombre:"Calcular perímetros"
                },

                {
                    id:"quiz",
                    nombre:"Quiz"
                },

                {
                    id:"rompecabezas",
                    nombre:"Rompecabezas geométrico"
                }

            ],

            apoyo:[

                {
                    id:"video",
                    nombre:"Video"
                },

                {
                    id:"pdf",
                    nombre:"PDF"
                },

                {
                    id:"infografia",
                    nombre:"Infografía"
                }

            ]
        },

        {
            id:"estadistica",
            nombre:"Estadística",

            actividades:[

                {
                    id:"graficas",
                    nombre:"Interpretar gráficas"
                },

                {
                    id:"tablas",
                    nombre:"Completar tablas"
                },

                {
                    id:"quiz",
                    nombre:"Quiz"
                },

                {
                    id:"promedios",
                    nombre:"Calcular promedios"
                },

                {
                    id:"reto",
                    nombre:"Reto de datos"
                }

            ],

            apoyo:[

                {
                    id:"video",
                    nombre:"Video"
                },

                {
                    id:"pdf",
                    nombre:"PDF"
                },

                {
                    id:"infografia",
                    nombre:"Infografía"
                }

            ]
        }

    ]
},

ciencias:{
nombre:"Ciencias",
temario:[
    
    ]},

historia:{
nombre:"historia",
temario:[

    ]},

ingles:{
nombre:"Inglés",
temario:[
    
    ]}

};






const parametros = new URLSearchParams(window.location.search);
const materia = parametros.get("materia");
const tema = parametros.get("tema");
const botonVolver = document.getElementById("volver");
const actividad = parametros.get("actividad");
const apoyo = parametros.get("apoyo");

if (botonVolver) {
    botonVolver.onclick = function () {
        window.location.href = `temario.html?materia=${materia}`;
    };
}

const contenido = document.getElementById("contenido");


if(window.location.pathname.includes("temario.html")){
    document.getElementById("titulo").innerHTML = materias[materia].nombre;
    materias[materia].temario.forEach(t=>{
        contenido.innerHTML += `
        <div class="tarjeta">
            <h2>${t.nombre}</h2>
            <button onclick="window.location.href='materia.html?materia=${materia}&tema=${t.id}'">Comenzar</button>
        </div>
        `;
    });

}

else if(window.location.pathname.includes("materia.html")){
    const datos = materias[materia].temario.find(t=>t.id==tema);
    document.getElementById("titulo").innerHTML = materias[materia].nombre;
    document.getElementById("tema").innerHTML = datos.nombre;
    datos.actividades.forEach(act=>{
        contenido.innerHTML += `
        <div class="tarjeta">
            <h3>${act.nombre}</h3>
            <button onclick="abrirActividad('${act.id}')">Abrir</button>
        </div>
        `;
    });
    datos.apoyo.forEach(ap=>{
        contenido.innerHTML += `
        <div class="tarjeta">
            <h3>${ap.nombre}</h3>
            <button onclick="abrirApoyo('${ap.id}')">Abrir</button>
        </div>
        `;
    });
}
else if(window.location.pathname.includes("actividad.html")){
    const datosTema = materias[materia].temario.find(t=>t.id==tema);
    const datosActividad = datosTema.actividades.find(a=>a.id==actividad);
    document.getElementById("titulo").innerHTML = materias[materia].nombre;
    document.getElementById("tema").innerHTML = datosActividad.nombre;

    if(datosActividad.preguntas){
        datosActividad.preguntas.forEach((pregunta,i)=>{
            if(pregunta.enunciado){
                contenido.innerHTML += `
                <div class="tarjeta">
                    <h3>Ejercicio ${i+1}</h3>
                    <p>${pregunta.enunciado}</p>
                    <input type="text" placeholder="Respuesta">
                </div>
                `;
            }

            else{
                contenido.innerHTML += `
                <div class="tarjeta">
                    <h3>${pregunta.pregunta}</h3>
                    ${
                        pregunta.opciones.map(op=>`
                        <label>
                        <input type="radio" name="p${i}">
                        ${op}
                        </label><br>
                        `).join("")
                    }
                </div>
                `;
            }
        });
    }
}

else if(window.location.pathname.includes("apoyo.html")){
    const datosTema = materias[materia].temario.find(t=>t.id==tema);
    const datosApoyo = datosTema.apoyo.find(a=>a.id==apoyo);
    document.getElementById("titulo").innerHTML = materias[materia].nombre;
    document.getElementById("tema").innerHTML = datosApoyo.nombre;
if(datosApoyo.id=="video"){
    contenido.innerHTML=`
        <h3>Video de apoyo</h3>
        <iframe
            width="800"
            height="450"
            src="${datosApoyo.url}"
            title="Video de apoyo"
            frameborder="0"
            allowfullscreen>
        </iframe>
    `;
}
if(datosApoyo.id=="pdf"){
    contenido.innerHTML=`
        <h3>PDF de apoyo</h3>
        <iframe
            src="${datosApoyo.archivo}"
            width="100%"
            height="700">
        </iframe>
    `;
}
}

else{
    const datos = materias[materia].temario.find(t => t.id == tema);
    document.getElementById("titulo").innerHTML =materias[materia].nombre;
    document.getElementById("tema").innerHTML =datos.nombre;
    const contenido =document.getElementById("contenido");

datos.actividades.forEach(act => {
    const nombre = typeof act === "string" ? act : act.nombre;
    const id = typeof act === "string"
        ? act.toLowerCase().replace(/\s+/g, "")
        : act.id;
    contenido.innerHTML += `
    <div class="tarjeta">
        <h3>${nombre}</h3>
        <button onclick="abrirActividad('${id}')">Abrir</button>
    </div>
    `;
});

if (datos.apoyo) {

    datos.apoyo.forEach(ap => {
        const nombre = typeof ap === "string" ? ap : ap.nombre;
        const id = typeof ap === "string"
            ? ap.toLowerCase().replace(/\s+/g, "")
            : ap.id;
        contenido.innerHTML += `
        <div class="tarjeta">
            <h3>${nombre}</h3>
            <button onclick="abrirApoyo('${id}')">Abrir</button>
        </div>
        `;
    });
}
}

function abrirActividad(id){
    window.location.href =
    `actividad.html?materia=${materia}&tema=${tema}&actividad=${id}`;
}

function abrirApoyo(id){
    window.location.href =
    `apoyo.html?materia=${materia}&tema=${tema}&apoyo=${id}`;

}

function abrirActividad(id){
    window.location.href =`actividad.html?materia=${materia}&tema=${tema}&actividad=${id}`;
}

function abrirApoyo(id){
    window.location.href = `apoyo.html?materia=${materia}&tema=${tema}&apoyo=${id}`;
}

const volverTema = document.getElementById("volverTema");
const volverTemario = document.getElementById("volverTemario");
if(volverTema){
    volverTema.onclick = function(){
        window.location.href = `materia.html?materia=${materia}&tema=${tema}`;
    };
}
if(volverTemario){
    volverTemario.onclick = function(){
        window.location.href = `temario.html?materia=${materia}`;

    };

}