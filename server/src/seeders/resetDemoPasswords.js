
import "dotenv/config";
import bcrypt from "bcrypt";

import { sequelize } from "../config/database.js";
import { Usuario } from "../models/index.js";

const redefinirSenhas = async () => {
  try {
    const senha = process.env.SEED_DEMO_PASSWORD;

    if (!senha || senha.length < 12) {
      throw new Error(
        "Configure SEED_DEMO_PASSWORD com pelo menos 12 caracteres."
      );
    }

    await sequelize.authenticate();

    const emails = [
      "atendente@exemplo.test",
      "tecnico@exemplo.test",
    ];

    await sequelize.transaction(async (transaction) => {
      const usuarios = await Usuario.findAll({
        where: { email: emails },
        transaction,
      });

      for (const email of emails) {
        const usuario = usuarios.find((u) => u.email === email);

        if (!usuario) {
          throw new Error(`Usuário não encontrado: ${email}`);
        }

        const perfilEsperado = email.startsWith("tecnico")
          ? "tecnico"
          : "atendente";

        if (usuario.perfil !== perfilEsperado) {
          throw new Error(`Perfil incorreto: ${email}`);
        }
      }

      const hash = await bcrypt.hash(senha, 12);

      for (const usuario of usuarios) {
        await usuario.update(
          { senha: hash },
          { transaction }
        );

        console.log(`Senha redefinida: ${usuario.email}`);
      }
    });

    console.log("Senhas de demonstração atualizadas!");

  } catch (erro) {
    console.error("Erro ao redefinir senhas:", erro.message);
    process.exitCode = 1;

  } finally {
    await sequelize.close();
  }
};

redefinirSenhas();
