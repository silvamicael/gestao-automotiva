import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { sequelize } from "./config/database.js";
import "./models/index.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN
}));

app.use(express.json());

const iniciar = async () => {
    try {
        await sequelize.authenticate();
        console.log("Postgres conextado com sucesso! ");
        
        await sequelize.sync();
        console.log("Tabelas sincronizads com sucesso! ");

        app.listen(process.env.PORT || 3000, () => {
            console.log("Servidor iniciado.");
        });

    }catch (erro) {
        console.error("Falha ao iniciar: ", erro);
        process.exit(1);
    }
};

iniciar();