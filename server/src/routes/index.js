import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/auth.js";
import { loginUsuario, cadastrarUsuario } from "../controllers/authController.js";
import { listarProprietarios, criarProprietario, buscarProprietarioPorId, atualizarProprietario, excluirProprietario } from "../controllers/proprietarioController.js";
import { listarVeiculos, criarVeiculo, buscarVeiculoPorId, atualizarVeiculo, excluirVeiculo } from "../controllers/veiculoController.js";
import { listarOrdensServico, buscarOrdemPorId, criarOrdemServico, atualizarStatus, atualizarOrdemServico, excluirOrdemServico } from "../controllers/ordemServicoController.js";


const router = Router();

// Autenticação
router.post("/auth/login", loginUsuario);
router.post("/auth/cadastrar", autenticar, autorizar('admin'), cadastrarUsuario);

// Proprietários
router.get("/proprietarios", autenticar, autorizar('admin', 'atendente', 'tecnico'), listarProprietarios);
router.get("/proprietarios/:id", autenticar, autorizar('admin', 'atendente', 'tecnico'), buscarProprietarioPorId);
router.post("/proprietarios", autenticar, autorizar('admin', 'atendente'), criarProprietario);
router.put("/proprietarios/:id", autenticar, autorizar('admin', 'atendente'), atualizarProprietario);
router.delete("/proprietarios/:id", autenticar, autorizar('admin'), excluirProprietario);

// Veículos
router.get("/veiculos", autenticar, autorizar('admin', 'atendente', 'tecnico'), listarVeiculos);
router.get("/veiculos/:id", autenticar, autorizar('admin', 'atendente'), buscarVeiculoPorId);
router.post("/veiculos", autenticar, autorizar('admin', 'atendente'), criarVeiculo);
router.put("/veiculos/:id", autenticar, autorizar('admin', 'atendente'), atualizarVeiculo);
router.delete("/veiculos/:id", autenticar, autorizar('admin'), excluirVeiculo);

// Ordens de serviço
router.get("/ordens-servico", autenticar, autorizar('admin', 'atendente', 'tecnico'), listarOrdensServico);
router.get("/ordens-servico/:id", autenticar, autorizar('admin', 'atendente', 'tecnico'), buscarOrdemPorId);
router.post("/ordens-servico", autenticar, autorizar('admin', 'atendente'), criarOrdemServico);
router.put("/ordens-servico/:id", autenticar, autorizar('admin', 'atendente'), atualizarOrdemServico);
router.delete("/ordens-servico/:id", autenticar, autorizar('admin'), excluirOrdemServico);

router.patch("/ordens-servico/:id/status", autenticar, autorizar('admin', 'atendente', 'tecnico'), atualizarStatus);


export default router;