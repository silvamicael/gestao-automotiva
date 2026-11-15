import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { sequelize } from "./config/database.js";
import "./models/index.js";

import router from "./routes/index.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"
  })
);

app.use(express.json());

// Registro das rotas da API
app.use("/api", router);

const iniciar = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL conectado com sucesso!");

    // Sincronização em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
      console.log("Tabelas sincronizadas com sucesso!");
    }

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Servidor iniciado em http://localhost:${PORT}`);
    });

  } catch (erro) {
    console.error("Falha ao iniciar:", erro);
    process.exit(1);
  }
};

iniciar();
