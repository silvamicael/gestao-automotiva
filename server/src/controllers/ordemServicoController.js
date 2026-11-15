
import { Op } from "sequelize";
import { OrdemServico, Veiculo, Proprietario } from "../models/index.js";

// Status permitidos conforme a documentação SAEP
const STATUS_VALIDOS = [
  "aberto",
  "em_andamento",
  "concluido",
  "cancelado",
];

const idValido = (id) =>
  /^[1-9]\d*$/.test(String(id)) && Number(id) <= 2147483647;

const incluirRelacionamentos = () => [
  {
    model: Veiculo,
    as: "veiculo",
    include: [
      {
        model: Proprietario,
        as: "proprietario",
        attributes: ["id", "nome"],
      },
    ],
  },
];

// Regras de validação dos dados de uma ordem de serviço
const validarDados = (dados) => {
  const { descricao, tipoServico, valor, veiculoId } = dados;

  return (
    typeof descricao === "string" &&
    descricao.trim().length > 0 &&
    descricao.trim().length <= 255 &&
    typeof tipoServico === "string" &&
    tipoServico.trim().length > 0 &&
    tipoServico.trim().length <= 100 &&
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor >= 0 &&
    valor <= 99999999.99 &&
    Number.isInteger(veiculoId) &&
    veiculoId > 0 &&
    veiculoId <= 2147483647
  );
};

export const listarOrdensServico = async (req, res) => {
  try {
    const { status, placa } = req.query;

    if (
      (status !== undefined &&
        (typeof status !== "string" || !STATUS_VALIDOS.includes(status))) ||
      (placa !== undefined &&
        (typeof placa !== "string" || !placa.trim() || placa.length > 10))
    ) {
      return res.status(400).json({
        mensagem: "Filtros de consulta inválidos.",
      });
    }

    const include = incluirRelacionamentos();

    if (placa) {
      include[0].where = {
        placa: {
          [Op.iLike]: `%${placa.trim()}%`,
        },
      };

      include[0].required = true;
    }

    const ordens = await OrdemServico.findAll({
      where: status ? { status } : {},
      include,
      order: [
        ["dataEntrada", "DESC"],
        ["id", "DESC"],
      ],
    });

    return res.json(ordens);
  } catch (erro) {
    console.error("Erro ao listar ordens:", erro);

    return res.status(500).json({
      mensagem: "Erro ao listar ordens de serviço.",
    });
  }
};

export const buscarOrdemPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        mensagem: "ID da ordem de serviço inválido.",
      });
    }

    const ordem = await OrdemServico.findByPk(id, {
      include: incluirRelacionamentos(),
    });

    if (!ordem) {
      return res.status(404).json({
        mensagem: "Ordem de serviço não encontrada.",
      });
    }

    return res.json(ordem);
  } catch (erro) {
    console.error("Erro ao buscar ordem:", erro);

    return res.status(500).json({
      mensagem: "Erro ao buscar ordem de serviço.",
    });
  }
};

export const criarOrdemServico = async (req, res) => {
  try {
    const dados = req.body ?? {};

    if (!validarDados(dados)) {
      return res.status(400).json({
        mensagem: "Dados da ordem de serviço inválidos.",
      });
    }

    const veiculo = await Veiculo.findByPk(dados.veiculoId);

    if (!veiculo) {
      return res.status(404).json({
        mensagem: "Veículo não encontrado.",
      });
    }

    const ordem = await OrdemServico.create({
      descricao: dados.descricao.trim(),
      tipoServico: dados.tipoServico.trim(),
      valor: dados.valor,
      veiculoId: dados.veiculoId,
    });

    return res.status(201).json(ordem);
  } catch (erro) {
    if (erro.name === "SequelizeForeignKeyConstraintError") {
      return res.status(404).json({
        mensagem: "Veículo não encontrado.",
      });
    }

    if (
      erro.name === "SequelizeValidationError" ||
      (erro.name === "SequelizeDatabaseError" &&
        erro.parent?.code === "23514")
    ) {
      return res.status(400).json({
        mensagem: "Dados da ordem de serviço inválidos.",
      });
    }

    console.error("Erro ao criar ordem:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao criar ordem de serviço.",
    });
  }
};

export const atualizarOrdemServico = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body ?? {};

    if (!idValido(id)) {
      return res.status(400).json({
        mensagem: "ID da ordem de serviço inválido.",
      });
    }

    if (!validarDados(dados)) {
      return res.status(400).json({
        mensagem: "Dados da ordem de serviço inválidos.",
      });
    }

    const ordem = await OrdemServico.findByPk(id);

    if (!ordem) {
      return res.status(404).json({
        mensagem: "Ordem de serviço não encontrada.",
      });
    }

    const veiculo = await Veiculo.findByPk(dados.veiculoId);

    if (!veiculo) {
      return res.status(404).json({
        mensagem: "Veículo não encontrado.",
      });
    }

    await ordem.update({
      descricao: dados.descricao.trim(),
      tipoServico: dados.tipoServico.trim(),
      valor: dados.valor,
      veiculoId: dados.veiculoId,
    });

    return res.json({
      mensagem: "Ordem de serviço atualizada com sucesso.",
      ordem,
    });
  } catch (erro) {
    if (erro.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        mensagem: "Não foi possível atualizar o vínculo do veículo.",
      });
    }

    if (erro.name === "SequelizeValidationError") {
      return res.status(400).json({
        mensagem: "Dados da ordem de serviço inválidos.",
      });
    }

    console.error("Erro ao atualizar ordem:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao atualizar ordem de serviço.",
    });
  }
};

export const atualizarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!idValido(id)) {
      return res.status(400).json({
        mensagem: "ID da ordem de serviço inválido.",
      });
    }

    if (!STATUS_VALIDOS.includes(status)) {
      return res.status(400).json({
        mensagem: "Status da ordem de serviço inválido.",
      });
    }

    const ordem = await OrdemServico.findByPk(id);

    if (!ordem) {
      return res.status(404).json({
        mensagem: "Ordem de serviço não encontrada.",
      });
    }

    // O status é atualizado separadamente dos demais dados da ordem
    await ordem.update({ status });

    return res.json({
      mensagem: "Status atualizado com sucesso.",
      ordem,
    });
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao atualizar status.",
    });
  }
};

export const excluirOrdemServico = async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        mensagem: "ID da ordem de serviço inválido.",
      });
    }

    const ordem = await OrdemServico.findByPk(id);

    if (!ordem) {
      return res.status(404).json({
        mensagem: "Ordem de serviço não encontrada.",
      });
    }

    await ordem.destroy();

    return res.status(204).send();
  } catch (erro) {
    if (erro.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({
        mensagem: "A ordem possui registros vinculados.",
      });
    }

    console.error("Erro ao excluir ordem:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao excluir ordem de serviço.",
    });
  }
};
