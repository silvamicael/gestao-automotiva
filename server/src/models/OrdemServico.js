import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OrdemServico = sequelize.define(
    "OrdemServico",
    {
        dataEntrada: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        descricao: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        tipoServico: {
            type: DataTypes.ENUM("Manutenção", "Reparo", "Inspeção"),
            allowNull: false
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        status: {
            type: DataTypes.ENUM(
                "aberto",
                "em_andamento",
                "concluido",
                "cancelado"
            ),
            allowNull: false,
            defaultValue: "aberto"
        }
    }
);