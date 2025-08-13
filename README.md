Minibar - Controle de Vendas
Este projeto é um aplicativo web responsivo para controle de vendas do Minibar EAC, integrado ao Google Sheets via Google Apps Script.
Ele permite gerenciar clientes, produtos, registrar compras, visualizar histórico, marcar pagamentos e gerar relatórios detalhados.

📂 Estrutura dos Arquivos
index.html
Interface principal do sistema, contendo:

Layout responsivo e estilizado com CSS embutido

Telas para:

Registro de compras

Consulta de histórico

Gerenciamento de clientes e produtos

Geração de relatórios por período

Interações via JavaScript usando google.script.run para comunicação com o backend do Google Apps Script

Máscaras de telefone e data para entrada de dados

code.gs
Script backend em Google Apps Script responsável por:

Integração com o Google Sheets para leitura e escrita de dados

CRUD de clientes e produtos

Registro de compras e atualização de status de pagamento

Geração de relatórios de vendas filtrados por período

Envio de recibos por e-mail

⚙️ Funcionalidades Principais
Gerenciar Clientes
Adicionar, editar e excluir clientes, vinculados por número de telefone.

Gerenciar Produtos
Adicionar, editar e excluir produtos com nome e valor unitário.

Registrar Compras
Selecionar cliente e produtos, adicionar ao carrinho, marcar como pago ou pendente.

Histórico de Compras
Exibir todas as compras de um cliente, com subtotal, status e opções de excluir ou marcar como pago.

Relatórios de Vendas
Filtrar vendas por período (DD/MM/AAAA) e exibir totais pagos, pendentes e faturamento total.

Envio de Recibo por E-mail
Enviar histórico de compras diretamente ao cliente.

🛠️ Tecnologias Utilizadas
Frontend: HTML5, CSS3 e JavaScript

Backend: Google Apps Script (NodeJS-like)

Banco de Dados: Google Sheets

Integração: google.script.run para comunicação entre frontend e backend

🚀 Como Usar
Crie uma nova planilha no Google Sheets com as abas necessárias (clientes, produtos, compras).

Abra o Editor de Scripts do Google (Extensões → Apps Script) e cole o conteúdo de code.gs.

No Apps Script, crie um arquivo HTML e cole o conteúdo de index.html.

Publique como Aplicativo da Web (Deploy → New Deployment → Web App).

Dê permissões de leitura e escrita ao script para acessar a planilha.

Acesse o link gerado para usar o sistema.

🔐 Permissões Necessárias
Acesso ao Google Sheets (para leitura e escrita)

Envio de e-mails pelo Google Apps Script (para envio de recibos)

📌 Observações
Os telefones devem ser inseridos no formato DD + Número com código 55 no início.

As datas no relatório devem estar no formato DD/MM/AAAA.

O sistema é otimizado para uso em dispositivos móveis, mas também funciona em desktops.


