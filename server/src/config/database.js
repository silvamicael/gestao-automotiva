import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  dialect: 'postgres',
  logging: false,
};

export const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, config)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        ...config,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
      }
    );
