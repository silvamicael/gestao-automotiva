
-- Gestão Automotiva - SAEP
-- Dados fictícios para demonstração
-- Executar somente em um banco de testes

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. USUÁRIOS
-- Senhas fictícias usadas somente nesta demonstração

INSERT INTO usuarios (nome, email, senha, perfil, "createdAt", "updatedAt")
VALUES
('Administrador Demo', 'admin-sql@exemplo.test',
 crypt('AdminDemo@12345', gen_salt('bf', 12)),
 'admin', NOW(), NOW()),

('Atendente Demo', 'atendente-sql@exemplo.test',
 crypt('AtendenteDemo@12345', gen_salt('bf', 12)),
 'atendente', NOW(), NOW()),

('Tecnico Demo', 'tecnico-sql@exemplo.test',
 crypt('TecnicoDemo@12345', gen_salt('bf', 12)),
 'tecnico', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. PROPRIETÁRIOS
INSERT INTO proprietarios
(nome, email, telefone, cpf, "createdAt", "updatedAt")
VALUES
('Carlos Silva Demo', 'carlos-sql@exemplo.test',
 '48999990000', '00000000191', NOW(), NOW()),

('Maria Oliveira Demo', 'maria-sql@exemplo.test',
 '48988880000', '00000000272', NOW(), NOW()),

('Joao Santos Demo', 'joao-sql@exemplo.test',
 '48977770000', '00000000353', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. VEÍCULOS
INSERT INTO veiculos
(marca, modelo, placa, ano, cor, "proprietarioId",
 "createdAt", "updatedAt")
SELECT dados.marca, dados.modelo, dados.placa,
       dados.ano, dados.cor, p.id, NOW(), NOW()
FROM (
  VALUES
    ('Volkswagen', 'Gol', 'JKL1A23', 2020,
     'Branco', 'carlos-sql@exemplo.test'),
    ('Fiat', 'Uno', 'MNO4B56', 2018,
     'Prata', 'maria-sql@exemplo.test'),
    ('Chevrolet', 'Onix', 'PQR7C89', 2022,
     'Preto', 'joao-sql@exemplo.test')
) AS dados(marca, modelo, placa, ano, cor, email)
JOIN proprietarios p ON p.email = dados.email
ON CONFLICT (placa) DO NOTHING;

-- 4. ORDENS DE SERVIÇO
INSERT INTO ordens_servico
(descricao, "tipoServico", valor, status,
 "veiculoId", "createdAt", "updatedAt")
SELECT dados.descricao, dados.tipo, dados.valor,
       dados.status, v.id, NOW(), NOW()
FROM (
  VALUES
    ('Troca de óleo e filtros - SQL',
     'Manutenção', 180.00, 'aberto', 'JKL1A23'),
    ('Pastilhas de freio - SQL',
     'Reparo', 350.00, 'em_andamento', 'MNO4B56'),
    ('Revisão preventiva - SQL',
     'Inspeção', 120.00, 'concluido', 'PQR7C89')
) AS dados(descricao, tipo, valor, status, placa)
JOIN veiculos v ON v.placa = dados.placa
WHERE NOT EXISTS (
  SELECT 1
  FROM ordens_servico os
  WHERE os."veiculoId" = v.id
    AND os.descricao = dados.descricao
);

COMMIT;
