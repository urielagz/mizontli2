const materias = {

matematicas:{
nombre:"Matemáticas",
temario:[
{
        id:"enteros",
        nombre:"Números enteros",
        actividades:[
    {
        id:"crucigrama",
        nombre:"Crucigrama"
    },
    {
        id:"ejercicios",
        nombre:"Ejercicios"
    },
    {
        id:"quiz",
        nombre:"Quiz"
    }
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
        id:"algebra",
        nombre:"Álgebra",

        actividades:[
            "Juego",
            "Problemas"
        ],

        apoyo:[
            "Presentación",
            "PDF"
        ]
    }
]},

espanol:{
nombre:"Español",
temario:[
    {
    id:"enteros",
        nombre:"Números enteros",

        actividades:["Quiz","Memorama"],
        apoyo:["Video","PDF"]},
            {id:"fracciones", nombre:"Fracciones",
        
        actividades:["Crucigrama","Ejercicios"],
        apoyo:["Video de fracciones","Infografía"]},
            {id:"algebra",nombre:"Álgebra",
                
        actividades:["Juego","Problemas"],
        apoyo:["Presentación","PDF"]}
    
    ]},

ciencias:{
nombre:"Ciencias",
temario:[
    {
    id:"enteros",
        nombre:"Números enteros",

        actividades:["Quiz","Memorama"],
        apoyo:["Video","PDF"]},
            {id:"fracciones", nombre:"Fracciones",
        
        actividades:["Crucigrama","Ejercicios"],
        apoyo:["Video de fracciones","Infografía"]},
            {id:"algebra",nombre:"Álgebra",
                
        actividades:["Juego","Problemas"],
        apoyo:["Presentación","PDF"]}
    
    ]},

historia:{
nombre:"historia",
temario:[
    {
    id:"enteros",
        nombre:"Números enteros",

        actividades:["Quiz","Memorama"],
        apoyo:["Video","PDF"]},
            {id:"fracciones", nombre:"Fracciones",
        
        actividades:["Crucigrama","Ejercicios"],
        apoyo:["Video de fracciones","Infografía"]},
            {id:"algebra",nombre:"Álgebra",
                
        actividades:["Juego","Problemas"],
        apoyo:["Presentación","PDF"]}
    
    ]},

ingles:{
nombre:"Igles",
temario:[
    {
    id:"enteros",
        nombre:"Números enteros",

        actividades:["Quiz","Memorama"],
        apoyo:["Video","PDF"]},
            {id:"fracciones", nombre:"Fracciones",
        
        actividades:["Crucigrama","Ejercicios"],
        apoyo:["Video de fracciones","Infografía"]},
            {id:"algebra",nombre:"Álgebra",
                
        actividades:["Juego","Problemas"],
        apoyo:["Presentación","PDF"]}
    
    ]}

};






const parametros = new URLSearchParams(window.location.search);
const materia = parametros.get("materia");
const tema = parametros.get("tema");
const botonVolver = document.getElementById("volver");

if (botonVolver) {
    botonVolver.onclick = function () {
        window.location.href = `temario.html?materia=${materia}`;
    };
}

if(document.getElementById("tema")==null){
    document.getElementById("titulo").innerHTML =materias[materia].nombre;
    const contenido =document.getElementById("contenido");
    materias[materia].temario.forEach(t=>{
        contenido.innerHTML +=`
        <div class="tarjeta">
            <h2>${t.nombre}</h2>
            <button onclick="window.location.href='materia.html?materia=${materia}&tema=${t.id}'">Comenzar</button>
        </div>
        `;
    });

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

