
import { Op } from "sequelize";
import { Veiculo, Proprietario, OrdemServico } from "../models/index.js";

// Validação de ID inteiro positivo (PostgreSQL INTEGER)
const idValido = (id) =>
    typeof id === "string" &&
    /^[1-9]\d*$/.test(id) &&
    Number(id) <= 2147483647;

// Validação de placa brasileira (antiga ou Mercosul)
const placaValida = (placa) =>
    /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa);

// Normalização da placa
const normalizarPlaca = (placa) =>
    placa.trim().toUpperCase().replace(/-/g, "");

// Validação dos dados
const validarDados = (dados) => {
    const { marca, modelo, placa, ano, cor, proprietarioId } = dados;

    if (
        typeof marca !== "string" || !marca.trim() ||
        typeof modelo !== "string" || !modelo.trim() ||
        typeof placa !== "string" ||
        !placaValida(normalizarPlaca(placa)) ||
        !Number.isInteger(ano) ||
        ano < 1900 ||
        ano > new Date().getFullYear() + 1 ||
        typeof cor !== "string" || !cor.trim() ||
        !Number.isInteger(proprietarioId) ||
        proprietarioId < 1 ||
        proprietarioId > 2147483647
    ) {
        return false;
    }

    return true;
};

// GET /api/veiculos
// GET /api/veiculos?placa=ABC
export const listarVeiculos = async (req, res) => {
    try {
        const { placa } = req.query;

        if (placa !== undefined && typeof placa !== "string") {
            return res.status(400).json({
                mensagem: "Parâmetro de placa inválido."
            });
        }

        const filtro = placa?.trim().toUpperCase();

        const veiculos = await Veiculo.findAll({
            where: filtro
                ? { placa: { [Op.iLike]: `%${filtro}%` } }
                : {},
            include: [{
                model: Proprietario,
                as: "proprietario",
                attributes: ["id", "nome"]
            }],
            order: [["modelo", "ASC"]]
        });

        return res.json(veiculos);

    } catch (erro) {
        console.error("Erro ao listar veículos:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar veículos."
        });
    }
};

// GET /api/veiculos/:id
export const buscarVeiculoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                mensagem: "ID do veículo inválido."
            });
        }

        const veiculo = await Veiculo.findByPk(id, {
            include: [{
                model: Proprietario,
                as: "proprietario",
                attributes: ["id", "nome"]
            }]
        });

        if (!veiculo) {
            return res.status(404).json({
                mensagem: "Veículo não encontrado."
            });
        }

        return res.json(veiculo);

    } catch (erro) {
        console.error("Erro ao buscar veículo:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar veículo."
        });
    }
};

// POST /api/veiculos
export const criarVeiculo = async (req, res) => {
    try {
        const dados = req.body ?? {};

        if (!validarDados(dados)) {
            return res.status(400).json({
                mensagem: "Dados do veículo inválidos."
            });
        }

        const proprietario = await Proprietario.findByPk(
            dados.proprietarioId
        );

        if (!proprietario) {
            return res.status(404).json({
                mensagem: "Proprietário não encontrado."
            });
        }

        const placa = normalizarPlaca(dados.placa);

        const existente = await Veiculo.findOne({
            where: { placa }
        });

        if (existente) {
            return res.status(409).json({
                mensagem: "Já existe um veículo com esta placa."
            });
        }

        const veiculo = await Veiculo.create({
            marca: dados.marca.trim(),
            modelo: dados.modelo.trim(),
            placa,
            ano: dados.ano,
            cor: dados.cor.trim(),
            proprietarioId: dados.proprietarioId
        });

        return res.status(201).json(veiculo);

    } catch (erro) {
        if (erro.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                mensagem: "Já existe um veículo com esta placa."
            });
        }

        if (erro.name === "SequelizeForeignKeyConstraintError") {
            return res.status(404).json({
                mensagem: "Proprietário não encontrado."
            });
        }

        if (erro.name === "SequelizeValidationError") {
            return res.status(400).json({
                mensagem: "Dados do veículo inválidos."
            });
        }

        console.error("Erro ao cadastrar veículo:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao cadastrar veículo."
        });
    }
};

// PUT /api/veiculos/:id
export const atualizarVeiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body ?? {};

        if (!idValido(id)) {
            return res.status(400).json({
                mensagem: "ID do veículo inválido."
            });
        }

        if (!validarDados(dados)) {
            return res.status(400).json({
                mensagem: "Dados do veículo inválidos."
            });
        }

        const veiculo = await Veiculo.findByPk(id);

        if (!veiculo) {
            return res.status(404).json({
                mensagem: "Veículo não encontrado."
            });
        }

        const proprietario = await Proprietario.findByPk(
            dados.proprietarioId
        );

        if (!proprietario) {
            return res.status(404).json({
                mensagem: "Proprietário não encontrado."
            });
        }

        const placa = normalizarPlaca(dados.placa);

        const duplicado = await Veiculo.findOne({
            where: {
                placa,
                id: { [Op.ne]: veiculo.id }
            }
        });

        if (duplicado) {
            return res.status(409).json({
                mensagem: "Já existe um veículo com esta placa."
            });
        }

        await veiculo.update({
            marca: dados.marca.trim(),
            modelo: dados.modelo.trim(),
            placa,
            ano: dados.ano,
            cor: dados.cor.trim(),
            proprietarioId: dados.proprietarioId
        });

        return res.json({
            mensagem: "Veículo atualizado com sucesso.",
            veiculo
        });

    } catch (erro) {
        if (erro.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                mensagem: "Já existe um veículo com esta placa."
            });
        }

        if (erro.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                mensagem: "Não foi possível atualizar os vínculos do veículo."
            });
        }

        if (erro.name === "SequelizeValidationError") {
            return res.status(400).json({
                mensagem: "Dados do veículo inválidos."
            });
        }

        console.error("Erro ao atualizar veículo:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao atualizar veículo."
        });
    }
};

// DELETE /api/veiculos/:id
export const excluirVeiculo = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                mensagem: "ID do veículo inválido."
            });
        }

        const veiculo = await Veiculo.findByPk(id);

        if (!veiculo) {
            return res.status(404).json({
                mensagem: "Veículo não encontrado."
            });
        }

        const quantidadeOrdens = await OrdemServico.count({
            where: { veiculoId: id }
        });

        if (quantidadeOrdens > 0) {
            return res.status(409).json({
                mensagem: "Não é possível excluir veículo com ordens de serviço vinculadas."
            });
        }

        await veiculo.destroy();

        return res.status(204).send();

    } catch (erro) {
        if (erro.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                mensagem: "Não é possível excluir veículo com registros vinculados."
            });
        }

        console.error("Erro ao excluir veículo:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao excluir veículo."
        });
    }
};
