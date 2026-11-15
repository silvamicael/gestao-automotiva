import { Proprietario } from "../models/index.js";
import { Op } from 'sequelize';

export const listarProprietarios = async (req, res) => {
    try {
        const { busca } = req.query;

        if (busca !== undefined && typeof busca !== 'string') {
            return res.status(400).json({
                mensagem: 'Parâmetro de busca inválido.'
            });
        }

        const filtro = busca?.trim();

        const proprietarios = await Proprietario.findAll({
            where: filtro
                ? {
                    nome: {
                        [Op.iLike]: `%${filtro}%`
                    }
                }
                : {},
            attributes: {
                exclude: ['cpf']
            },
            order: [['nome', 'ASC']]
        });

        return res.json(proprietarios);

    } catch (erro) {
        console.error('Erro ao listar proprietários:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar proprietários.'
        });
    }
};


export const criarProprietario = async (req, res) => {
    try {
        const {
            nome,
            email,
            telefone,
            cpf,
        } = req.body;

        const proprietario = await Proprietario.create({
            nome,
            email,
            telefone,
            cpf
        });

        return res.status(201).json({
            id: proprietario.id,
            nome: proprietario.nome,
            email:proprietario.email,
            telefone: proprietario.telefone
        });
    } catch (erro) {
        return res.status(400).json({
            mensagem: "Não foi possível cadastrar proprietário."
        });
    }
};


export const buscarProprietarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                mensagem: 'ID do proprietário inválido.'
            });
        }

        const proprietario = await Proprietario.findByPk(id, {
            attributes: {
                exclude: ['cpf']
            }
        });

        if (!proprietario) {
            return res.status(404).json({
                mensagem: 'Proprietário não encontrado.'
            });
        }

        return res.json(proprietario);

    } catch (erro) {
        console.error('Erro ao buscar proprietário:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao buscar proprietário.'
        });
    }
};
