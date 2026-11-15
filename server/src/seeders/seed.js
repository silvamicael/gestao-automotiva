
import 'dotenv/config';
import bcrypt from 'bcrypt';

import { sequelize } from '../config/database.js';

import {
  Usuario,
  Proprietario,
  Veiculo,
  OrdemServico,
} from '../models/index.js';

const seed = async () => {
  try {
    const adminNome = process.env.ADMIN_NOME?.trim();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminSenha = process.env.ADMIN_PASSWORD;
    const demoSenha = process.env.SEED_DEMO_PASSWORD;

    if (!adminNome || !adminEmail || !adminSenha || !demoSenha) {
      throw new Error(
        'Configure ADMIN_NOME, ADMIN_EMAIL, ADMIN_PASSWORD e SEED_DEMO_PASSWORD no .env.'
      );
    }

    if (adminSenha.length < 12 || demoSenha.length < 12) {
      throw new Error('As senhas do seed devem ter pelo menos 12 caracteres.');
    }

    await sequelize.authenticate();
    console.log('Banco de dados conectado!');

    await sequelize.transaction(async (transaction) => {
      // 1. USUÁRIOS
      const usuarios = [
        {
          nome: adminNome,
          email: adminEmail,
          perfil: 'admin',
          senha: adminSenha,
        },
        {
          nome: 'Atendente Teste',
          email: 'atendente@exemplo.test',
          perfil: 'atendente',
          senha: demoSenha,
        },
        {
          nome: 'Tecnico Teste',
          email: 'tecnico@exemplo.test',
          perfil: 'tecnico',
          senha: demoSenha,
        },
      ];

      for (const dados of usuarios) {
        const senhaCriptografada = await bcrypt.hash(dados.senha, 12);

        const [usuario] = await Usuario.findOrCreate({
          where: { email: dados.email },
          defaults: {
            nome: dados.nome,
            email: dados.email,
            perfil: dados.perfil,
            senha: senhaCriptografada,
          },
          transaction,
        });

        if (usuario.perfil !== dados.perfil) {
          throw new Error(
            `Perfil incompatível para o usuário ${dados.email}.`
          );
        }

        console.log(`Usuário verificado: ${usuario.email}`);
      }

      // 2. PROPRIETÁRIOS
      const proprietariosDados = [
        {
          nome: 'Carlos Silva',
          email: 'carlos@exemplo.test',
          telefone: '48999990000',
          cpf: '00000000001',
        },
        {
          nome: 'Maria Oliveira',
          email: 'maria@exemplo.test',
          telefone: '48988880000',
          cpf: '00000000002',
        },
        {
          nome: 'João Santos',
          email: 'joao@exemplo.test',
          telefone: '48977770000',
          cpf: '00000000003',
        },
      ];

      const proprietarios = [];

      for (const dados of proprietariosDados) {
        const [proprietario] = await Proprietario.findOrCreate({
          where: { email: dados.email },
          defaults: dados,
          transaction,
        });

        proprietarios.push(proprietario);
        console.log(`Proprietário verificado: ${proprietario.nome}`);
      }

      // 3. VEÍCULOS
      const veiculosDados = [
        {
          marca: 'Volkswagen',
          modelo: 'Gol',
          placa: 'ABC1D23',
          ano: 2020,
          cor: 'Branco',
          proprietarioId: proprietarios[0].id,
        },
        {
          marca: 'Fiat',
          modelo: 'Uno',
          placa: 'DEF4G56',
          ano: 2018,
          cor: 'Prata',
          proprietarioId: proprietarios[1].id,
        },
        {
          marca: 'Chevrolet',
          modelo: 'Onix',
          placa: 'GHI7J89',
          ano: 2022,
          cor: 'Preto',
          proprietarioId: proprietarios[2].id,
        },
      ];

      const veiculos = [];

      for (const dados of veiculosDados) {
        const [veiculo] = await Veiculo.findOrCreate({
          where: { placa: dados.placa },
          defaults: dados,
          transaction,
        });

        if (veiculo.proprietarioId !== dados.proprietarioId) {
          throw new Error(
            `O veículo ${dados.placa} possui outro proprietário.`
          );
        }

        veiculos.push(veiculo);
        console.log(`Veículo verificado: ${veiculo.placa}`);
      }

      // 4. ORDENS DE SERVIÇO
      const ordensDados = [
        {
          descricao: 'Troca de óleo e filtros',
          tipoServico: 'Manutenção',
          valor: 180.00,
          status: 'aberto',
          veiculoId: veiculos[0].id,
        },
        {
          descricao: 'Substituição das pastilhas de freio',
          tipoServico: 'Reparo',
          valor: 350.00,
          status: 'em_andamento',
          veiculoId: veiculos[1].id,
        },
        {
          descricao: 'Revisão preventiva do veículo',
          tipoServico: 'Inspeção',
          valor: 120.00,
          status: 'concluido',
          veiculoId: veiculos[2].id,
        },
      ];

      for (const dados of ordensDados) {
        const [ordem] = await OrdemServico.findOrCreate({
          where: {
            descricao: dados.descricao,
            veiculoId: dados.veiculoId,
          },
          defaults: dados,
          transaction,
        });

        console.log(`Ordem de serviço verificada: ${ordem.id}`);
      }
    });

    console.log('Seed executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seed();
