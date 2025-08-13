// Google Apps Script - Code.gs
// WebApp para Controle de Vendas Minibar EAC

// ID da planilha (substitua pelo ID real da sua planilha)
const SPREADSHEET_ID = '11V2jDDbLQY3XEoygMKHYLgJGeoJFskwCWLtLx_h6cVU';

// Configuração das abas
const SHEETS = {
  CADASTRO: 'Cadastro',
  PRODUTOS: 'Produtos', 
  COMPRAS: 'Compras'
};

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Minibar EAC - Controle de Vendas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Função para buscar dados dos clientes cadastrados
function getCustomers() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.CADASTRO);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    
    const customers = data.map(row => {
      if (row[0] && row[1]) {
        return { nome: row[0], telefone: row[1].toString() };
      }
      return null;
    }).filter(c => c); // Filtra nulos
    
    return customers;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

// Função para buscar produtos disponíveis
function getProducts() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUTOS);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    
    const products = data.map(row => {
      if (row[0] && row[1] && row[2]) {
        return { id: row[0], nome: row[1], valor: parseFloat(row[2]) };
      }
      return null;
    }).filter(p => p);
    
    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Adicionar cliente na planilha
function addCustomer(customerData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.CADASTRO);
    
    if (!customerData || !customerData.nome || !customerData.telefone) {
      throw new Error('Dados do cliente inválidos');
    }
    
    const existingCustomers = getCustomers();
    const existingCustomer = existingCustomers.find(c => c.telefone === customerData.telefone.toString());
    
    if (existingCustomer) {
      return { success: false, message: 'Este telefone já está cadastrado.' };
    }
    
    sheet.appendRow([customerData.nome, customerData.telefone]);
    return { success: true, message: 'Cliente cadastrado com sucesso!' };
    
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    return { success: false, message: 'Erro ao cadastrar cliente: ' + error.message };
  }
}

// Função para buscar histórico de compras por telefone
function getPurchaseHistory(telefone) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COMPRAS);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const purchases = [];
    const telefoneBusca = telefone.toString().replace(/\D/g, '');

    for (let i = 1; i < data.length; i++) {
      const dadoTelefone = (data[i][6] || '').toString().replace(/\D/g, '');
      if (dadoTelefone === telefoneBusca) {
        purchases.push({
          data: new Date(data[i][0]).toISOString(),
          produto: data[i][1],
          quantidade: parseInt(data[i][2]),
          valorUnitario: parseFloat(data[i][3]),
          subtotal: parseFloat(data[i][4]),
          nome: data[i][5],
          telefone: data[i][6].toString(),
          status: (data[i][7] || 'Pendente').trim()
        });
      }
    }
    return purchases;
  } catch (error) {
    Logger.log('Erro ao buscar histórico: ' + error.message);
    return [];
  }
}


// Função para buscar cliente por telefone
function getCustomerByPhone(telefone) {
  try {
    const customers = getCustomers();
    return customers.find(customer => customer.telefone === telefone.toString()) || null;
  } catch (error) {
    console.error('Erro ao buscar cliente por telefone:', error);
    return null;
  }
}

// Função para registrar uma compra
function registerPurchase(purchaseData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COMPRAS);
    
    if (!purchaseData || !Array.isArray(purchaseData.items) || purchaseData.items.length === 0) {
      throw new Error('Dados da compra inválidos');
    }
    
    const customer = getCustomerByPhone(purchaseData.telefone);
    if (!customer) {
      throw new Error('Cliente não encontrado no cadastro');
    }
    
    const today = new Date();
    const rows = [];
    const status = purchaseData.pago ? 'Pago' : 'Pendente';
    
    purchaseData.items.forEach(item => {
      rows.push([
        today, item.productName, item.quantity, item.unitPrice, item.subtotal,
        customer.nome, customer.telefone, status
      ]);
    });
    
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
    }
    
    return { success: true, message: 'Compra registrada com sucesso!' };
    
  } catch (error) {
    console.error('Erro ao registrar compra:', error);
    return { success: false, message: 'Erro ao registrar compra: ' + error.message };
  }
}

// --- FUNÇÕES DE GERENCIAMENTO DE CLIENTES ---

function updateCustomer(customerData) {
  try {
    if (!customerData || !customerData.telefone || !customerData.nome) {
      throw new Error('Dados do cliente inválidos para atualização.');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.CADASTRO);
    const data = sheet.getDataRange().getValues();
    let updated = false;

    for (let i = 1; i < data.length; i++) {
      if (data[i][1].toString() === customerData.telefone) {
        sheet.getRange(i + 1, 1).setValue(customerData.nome); // Atualiza só o nome
        updated = true;
        break;
      }
    }

    if (updated) {
      return { success: true, message: 'Cliente atualizado com sucesso!' };
    } else {
      return { success: false, message: 'Cliente não encontrado.' };
    }
  } catch (error) {
    Logger.log('Erro ao atualizar cliente: ' + error.message);
    return { success: false, message: 'Erro no servidor: ' + error.message };
  }
}

function deleteCustomer(customerPhone) {
  try {
    if (!customerPhone) {
      throw new Error('Telefone do cliente não fornecido.');
    }

    // Trava de segurança: verificar se o cliente tem compras
    const purchaseHistory = getPurchaseHistory(customerPhone);
    if (purchaseHistory.length > 0) {
      return { success: false, message: 'Não é possível excluir. Este cliente possui compras registradas.' };
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.CADASTRO);
    const data = sheet.getDataRange().getValues();
    let deleted = false;

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1].toString() === customerPhone) {
        sheet.deleteRow(i + 1);
        deleted = true;
        break;
      }
    }

    if (deleted) {
      return { success: true, message: 'Cliente excluído com sucesso!' };
    } else {
      return { success: false, message: 'Cliente não encontrado para excluir.' };
    }
  } catch (error) {
    Logger.log('Erro ao excluir cliente: ' + error.message);
    return { success: false, message: 'Erro no servidor: ' + error.message };
  }
}


// --- FUNÇÕES DE GERENCIAMENTO DE PRODUTOS ---

function addProduct(productData) {
  try {
    if (!productData || !productData.nome || !productData.valor) {
      throw new Error('Dados do produto inválidos.');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUTOS);
    const lastRow = sheet.getLastRow();
    
    let newId = 1;
    if (lastRow > 1) {
      const lastId = sheet.getRange(lastRow, 1).getValue();
      newId = parseInt(lastId) + 1;
    }

    sheet.appendRow([newId, productData.nome, parseFloat(productData.valor)]);
    return { success: true, message: 'Produto adicionado com sucesso!' };
  } catch (error) {
    Logger.log('Erro ao adicionar produto: ' + error.message);
    return { success: false, message: 'Erro no servidor: ' + error.message };
  }
}

function updateProduct(productData) {
  try {
    if (!productData || !productData.id || !productData.nome || !productData.valor) {
      throw new Error('Dados do produto inválidos para atualização.');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUTOS);
    const data = sheet.getDataRange().getValues();
    let updated = false;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == productData.id) {
        sheet.getRange(i + 1, 2).setValue(productData.nome);
        sheet.getRange(i + 1, 3).setValue(parseFloat(productData.valor));
        updated = true;
        break;
      }
    }

    if (updated) {
      return { success: true, message: 'Produto atualizado com sucesso!' };
    } else {
      return { success: false, message: 'Produto não encontrado para atualizar.' };
    }
  } catch (error) {
    Logger.log('Erro ao atualizar produto: ' + error.message);
    return { success: false, message: 'Erro no servidor: ' + error.message };
  }
}

function deleteProduct(productId) {
  try {
    if (!productId) {
      throw new Error('ID do produto não fornecido.');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUTOS);
    const data = sheet.getDataRange().getValues();
    let deleted = false;

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] == productId) {
        sheet.deleteRow(i + 1);
        deleted = true;
        break;
      }
    }

    if (deleted) {
      return { success: true, message: 'Produto deletado com sucesso!' };
    } else {
      return { success: false, message: 'Produto não encontrado para deletar.' };
    }
  } catch (error) {
    Logger.log('Erro ao deletar produto: ' + error.message);
    return { success: false, message: 'Erro no servidor: ' + error.message };
  }
}


// --- FUNÇÕES DE PAGAMENTO, E-MAIL E EXCLUSÃO DE COMPRA ---

function markPurchaseAsPaid(details) {
  try {
    if (!details || !details.telefone || !details.dataISO) {
      throw new Error('Detalhes da compra inválidos para atualização.');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COMPRAS);
    const data = sheet.getDataRange().getValues();
    let updated = false;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowDate = new Date(row[0]).toISOString();
      const rowPhone = row[6].toString().replace(/\D/g, '');
      const detailsPhone = details.telefone.toString().replace(/\D/g, '');

      if (rowDate === details.dataISO && rowPhone === detailsPhone) {
        sheet.getRange(i + 1, 8).setValue('Pago');
        updated = true;
      }
    }

    if (updated) {
      return { success: true, message: 'Compra marcada como paga!' };
    } else {
      return { success: false, message: 'Nenhuma compra correspondente encontrada.' };
    }

  } catch (error) {
    Logger.log('Erro ao marcar como pago: ' + error.message);
    return { success: false, message: 'Erro no servidor: ' + error.message };
  }
}

function deletePurchase(details) {
  try {
    if (!details || !details.telefone || !details.dataISO) {
      throw new Error('Detalhes da compra inválidos para exclusão.');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COMPRAS);
    const data = sheet.getDataRange().getValues();
    let deleted = false;

    const detailsPhone = details.telefone.toString().replace(/\D/g, '');

    // Itera de baixo para cima para evitar problemas com a reindexação das linhas após a exclusão
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const rowDate = new Date(row[0]).toISOString();
      const rowPhone = row[6].toString().replace(/\D/g, '');

      if (rowDate === details.dataISO && rowPhone === detailsPhone) {
        sheet.deleteRow(i + 1);
        deleted = true;
      }
    }

    if (deleted) {
      return { success: true, message: 'Registro de compra excluído com sucesso!' };
    } else {
      return { success: false, message: 'Nenhuma compra correspondente encontrada para excluir.' };
    }
  } catch (error) {
    Logger.log('Erro ao excluir compra: ' + error.message);
    return { success: false, message: 'Erro no servidor: ' + error.message };
  }
}

function sendPurchaseHistoryEmail(phone, recipientEmail) {
  try {
    const purchases = getPurchaseHistory(phone);
    const customer = getCustomerByPhone(phone);

    if (!customer) throw new Error('Cliente não encontrado.');

    const paidPurchases = purchases.filter(p => p.status === 'Pago');
    if (paidPurchases.length === 0) {
      return { success: false, message: 'Nenhuma compra paga encontrada para enviar.' };
    }

    const totalPaid = paidPurchases.reduce((sum, p) => sum + p.subtotal, 0);

    let itemsHtml = paidPurchases.map(p => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(p.data).toLocaleDateString('pt-BR')}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.produto}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${p.quantidade}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${p.subtotal.toFixed(2)}</td>
        </tr>
      `).join('');

    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://i.imgur.com/c5XQ7TW.png" alt="Minibar EAC Logo" style="width: 100px; height: 100px;">
          <h2 style="color: #1e4d72;">Recibo de Compras Pagas</h2>
        </div>
        <p>Olá, <strong>${customer.nome}</strong>,</p>
        <p>Obrigado por sua preferência! Segue abaixo o resumo de suas compras que foram quitadas:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="padding: 8px; background-color: #f2f2f2; text-align: left;">Data</th>
              <th style="padding: 8px; background-color: #f2f2f2; text-align: left;">Produto</th>
              <th style="padding: 8px; background-color: #f2f2f2; text-align: center;">Qtd</th>
              <th style="padding: 8px; background-color: #f2f2f2; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; color: #28a745;">
          Total Pago: R$ ${totalPaid.toFixed(2)}
        </div>
        <hr style="margin-top: 30px;">
        <p style="font-size: 0.8em; color: #777; text-align: center;">
          EAC Porciúncula de Sant'ana<br>
          Este é um e-mail automático, por favor, não responda.
        </p>
      </div>`;

    GmailApp.sendEmail(recipientEmail, `Seu Recibo de Compras - Minibar EAC`, "", {
      htmlBody: emailBody,
      name: "EAC Porciúncula de Sant'ana",
      from: "eacporciunculadesantana@gmail.com"
    });

    return { success: true, message: `Recibo enviado com sucesso para ${recipientEmail}!` };

  } catch (error) {
    Logger.log('Erro ao enviar e-mail: ' + error.message);
    return { success: false, message: 'Erro no servidor ao enviar e-mail: ' + error.message };
  }
}
// Função para gerar relatório de vendas por período
function getSalesReport(startDate, endDate) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COMPRAS);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    Logger.log('Dados recebidos para início: ' + startDate + ' | fim: ' + endDate);
    Logger.log('Total de linhas lidas na planilha: ' + data.length);

    if (data.length <= 1) return {
      vendas: [],
      totalGeral: 0,
      totalPago: 0,
      totalPendente: 0,
      periodo: { inicio: startDate, fim: endDate }
    };

    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    Logger.log('Data inicial convertida: ' + start);
    Logger.log('Data final convertida: ' + end);

    const report = [];
    let totalGeral = 0;
    let totalPago = 0;
    let totalPendente = 0;

    // Constantes de coluna
    const COL = {
      DATA: 0,
      PRODUTO: 1,
      QUANTIDADE: 2,
      VALOR_UNITARIO: 3,
      SUBTOTAL: 4,
      NOME_COMPRADOR: 5,
      TELEFONE: 6,
      STATUS: 7 // Nova coluna
    };

    for (let i = 1; i < data.length; i++) {
      const rawDate = data[i][COL.DATA];
      let rowDate = null;

      if (rawDate instanceof Date) {
        rowDate = new Date(rawDate);
        rowDate.setHours(0, 0, 0, 0);
      } else if (typeof rawDate === 'string') {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          rowDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          rowDate.setHours(0, 0, 0, 0);
        }
      }

      if (!rowDate) continue;

      if (rowDate >= start && rowDate <= end) {
        const subtotal = parseFloat((data[i][COL.SUBTOTAL] + '').replace(',', '.')) || 0;
        const status = (data[i][COL.STATUS] || 'Pendente').trim();

        report.push({
          data: rowDate.toISOString(),
          produto: data[i][COL.PRODUTO],
          quantidade: parseFloat((data[i][COL.QUANTIDADE] + '').replace(',', '.')) || 0,
          valorUnitario: parseFloat((data[i][COL.VALOR_UNITARIO] + '').replace(',', '.')) || 0,
          subtotal: subtotal,
          nome: data[i][COL.NOME_COMPRADOR] || '',
          telefone: data[i][COL.TELEFONE] || '',
          status: status
        });

        totalGeral += subtotal;
        if (status === 'Pago') {
          totalPago += subtotal;
        } else {
          totalPendente += subtotal;
        }
      }
    }

    Logger.log('Total de vendas encontradas: ' + report.length);
    Logger.log('Total geral: ' + totalGeral);
    Logger.log('Total pago: ' + totalPago);
    Logger.log('Total pendente: ' + totalPendente);

    return {
      vendas: report,
      totalGeral,
      totalPago,
      totalPendente,
      periodo: { inicio: startDate, fim: endDate }
    };

  } catch (e) {
    Logger.log('Erro ao gerar relatório: ' + e.message);
    return {
      erro: e.message,
      vendas: [],
      totalGeral: 0,
      totalPago: 0,
      totalPendente: 0,
      periodo: { inicio: startDate, fim: endDate }
    };
  }
}
