import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/auth.js";
import { loginUsuario, cadastrarUsuario } from "../controllers/authController.js";
import { listarProprietarios, criarProprietario, buscarProprietarioPorId, atualizarProprietario } from "../controllers/proprietarioController.js";
import { listarVeiculos, criarVeiculo } from "../controllers/veiculoController.js";
import { listarOrdensServico, criarOrdemServico, atualizarStatus } from "../controllers/ordemServicoController.js";


const router = Router();

// Autenticação
router.post("/auth/login", loginUsuario);
router.post("/auth/cadastrar", autenticar, autorizar('admin'), cadastrarUsuario);

// Proprietários
router.get("/proprietarios", autenticar, autorizar('admin', 'atendente', 'tecnico'), listarProprietarios);
router.get("/proprietarios/:id", autenticar, autorizar('admin', 'atendente', 'tecnico'), buscarProprietarioPorId);
router.post("/proprietarios", autenticar, autorizar('admin', 'atendente'), criarProprietario);
router.put("/proprietarios/:id", autenticar, autorizar('admin', 'atendente'), atualizarProprietario);

// Veículos
router.get("/veiculos", autenticar, autorizar('admin', 'atendente', 'tecnico'), listarVeiculos);
router.post("/veiculos", autenticar, autorizar('admin', 'atendente'), criarVeiculo);

// Ordens de serviço
router.get("/ordens-servico", autenticar, autorizar('admin', 'atendente', 'tecnico'), listarOrdensServico);
router.post("/ordens-servico", autenticar, autorizar('admin', 'atendente', 'tecnico'), criarOrdemServico);

router.patch("/ordens-servico/:id/status", autenticar, autorizar('admin', 'atendente', 'tecnico'), atualizarStatus);

export default router;