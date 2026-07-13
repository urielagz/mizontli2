import express from "express";
import cors from "cors";
import anuncioRoutes from "./routes/anuncio.routes";
import asesoriaRoutes from "./routes/asesoria.routes";
import usuarioRoutes from "./routes/usuario.routes";
import loginRoutes from "./routes/login.routes";
import docenteRoutes from "./routes/docente.routes";

// Módulo académico: Materia -> Tema (índice) -> Recurso / Actividad / Examen final
import materiaRoutes from "./routes/materia.routes";
import temaRoutes from "./routes/tema.routes";
import recursoRoutes from "./routes/recurso.routes";
import actividadRoutes from "./routes/actividad.routes";
import calificacionRoutes from "./routes/calificacion.routes";
import progresoRoutes from "./routes/progreso.routes";
// ...

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/anuncios", anuncioRoutes);
app.use("/asesorias", asesoriaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/docentes", docenteRoutes);

// Módulo académico
app.use("/materias", materiaRoutes);
app.use("/temas", temaRoutes);
app.use("/recursos", recursoRoutes);
app.use("/actividades", actividadRoutes);
app.use("/calificaciones", calificacionRoutes);
app.use("/progreso", progresoRoutes);

export default app;