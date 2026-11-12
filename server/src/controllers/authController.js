import { where } from "sequelize";
import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";

export const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body;

        // Verificar campos obrigatórios
        if (!nome || !email || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos obrigatórios."
            });
        }

        // Verificar se o email já existe
        const usuarioExiste = await Usuario.findOne({
            where: { email }
        });

        if (usuarioExiste){
            return res.status(409).json({
                mensagem: "Este email já está castradado."
            });
        }

        // Criptografar senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Criar usuário
        const usuario = await Usuario.create({
            nome,
            email,
            senha: senhaCriptografada,
            perfil
        });

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });
    } catch (error) {
        
        console.log(error);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário"
        });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verificar campos obrigatórios
        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe email e senha."
            });
        }

        // Buscar usuário pelo email
        const usuario = await Usuario.findOne({
            where: { email }
        });

        // Verificar se o usuário existe
        if (!usuario) {
            return res.status(401).json({
                mensagem: "Email ou sneha inválidos."
            })
        }

        // Comparar senha informada com hash do banco
        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        // Verificar senha
        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "Email ou senha inválidos."
            });
        }

        // Login realizado
        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            usuario:{
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            mensagem: "Erro ao realizar login."
        });
    }
};