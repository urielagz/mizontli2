import "./config/database";
import "dotenv/config";

import app from "./app";
const PORT = process.env.PORT ? Number(process.env.PORT) : 7000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});