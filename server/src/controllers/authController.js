import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { Usuario } from "../models/index.js";

// Cadastro de usuários
export const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos obrigatórios.",
      });
    }

    const usuarioExiste = await Usuario.findOne({
      where: { email },
    });

    if (usuarioExiste) {
      return res.status(409).json({
        mensagem: "Este email já está cadastrado.",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
      perfil: "atendente",
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar usuário.",
    });
  }
};

// Login de usuários
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Informe email e senha.",
      });
    }

    const usuario = await Usuario.findOne({
      where: { email },
    });

    const senhaValida =
      usuario && (await bcrypt.compare(senha, usuario.senha));

    if (!senhaValida) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado.");
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      },
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    return res.status(500).json({
      mensagem: "Erro ao realizar login.",
    });
  }
};
