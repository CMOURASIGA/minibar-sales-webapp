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
    const lastCol = sheet.getLastColumn();
    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    
    if (data.length <= 1) return [];
    
    const customers = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1]) { // Verifica se nome e telefone não estão vazios
        customers.push({
          nome: data[i][0],
          telefone: data[i][1].toString()
        });
      }
    }
    
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
    const lastCol = sheet.getLastColumn();
    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    
    if (data.length <= 1) return [];
    
    const products = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][1] && data[i][2]) { // Verifica se todos os campos estão preenchidos
        products.push({
          id: data[i][0],
          nome: data[i][1],
          valor: parseFloat(data[i][2])
        });
      }
    }
    
    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// NOVA FUNÇÃO: Adicionar cliente na planilha
function addCustomer(customerData) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.CADASTRO);
    
    // Validar dados recebidos
    if (!customerData || !customerData.nome || !customerData.telefone) {
      throw new Error('Dados do cliente inválidos');
    }
    
    // Verificar se cliente já existe
    const existingCustomers = getCustomers();
    const existingCustomer = existingCustomers.find(c => c.telefone === customerData.telefone.toString());
    
    if (existingCustomer) {
      return {
        success: false,
        message: 'Este telefone já está cadastrado para: ' + existingCustomer.nome
      };
    }
    
    // Adicionar nova linha na planilha
    const newRow = [customerData.nome, customerData.telefone];
    sheet.appendRow(newRow);
    
    return {
      success: true,
      message: 'Cliente cadastrado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar cliente: ' + error.message
    };
  }
}

// Função para buscar histórico de compras por telefone
function getPurchaseHistory(telefone) {
  try {
    Logger.log('Iniciando busca de histórico para telefone: ' + telefone);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COMPRAS);
    const data = sheet.getDataRange().getValues();

    Logger.log('Total de linhas na aba Compras: ' + data.length);

    if (data.length <= 1) return [];

    const purchases = [];

    const telefoneBusca = telefone.toString().replace(/\D/g, ''); // remove tudo que não for número

    for (let i = 1; i < data.length; i++) {
      const dadoTelefone = (data[i][6] || '').toString().replace(/\D/g, '');
      Logger.log(`Linha ${i}: telefone na planilha = ${data[i][6]}, normalizado = ${dadoTelefone}`);

      if (dadoTelefone === telefoneBusca) {
        Logger.log(`Linha ${i}: telefone corresponde. Adicionando ao histórico.`);

        purchases.push({
          data: data[i][0],
          produto: data[i][1],
          quantidade: parseInt(data[i][2]),
          valorUnitario: parseFloat(data[i][3]),
          subtotal: parseFloat(data[i][4]),
          nome: data[i][5],
          telefone: data[i][6].toString()
        });
      }
    }

    Logger.log('Total de compras encontradas: ' + purchases.length);
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
    
    // Validar dados recebidos
    if (!purchaseData || !Array.isArray(purchaseData.items) || purchaseData.items.length === 0) {
      throw new Error('Dados da compra inválidos');
    }
    
    // Validar cliente
    const customer = getCustomerByPhone(purchaseData.telefone);
    if (!customer) {
      throw new Error('Cliente não encontrado no cadastro');
    }
    
    const today = new Date();
    const rows = [];
    
    // Preparar dados para inserção
    purchaseData.items.forEach(item => {
      rows.push([
        today,                    // Data
        item.productName,         // Nome do Produto
        item.quantity,            // Quantidade
        item.unitPrice,           // Valor Unitário
        item.subtotal,            // Subtotal
        customer.nome,            // Nome do Comprador
        customer.telefone         // Telefone
      ]);
    });
    
    // Inserir todas as linhas de uma vez
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
    }
    
    return {
      success: true,
      message: 'Compra registrada com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao registrar compra:', error);
    return {
      success: false,
      message: 'Erro ao registrar compra: ' + error.message
    };
  }
}

// Função para validar estrutura da planilha
function validateSpreadsheetStructure() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Verificar se todas as abas existem
    const requiredSheets = [SHEETS.CADASTRO, SHEETS.PRODUTOS, SHEETS.COMPRAS];
    const existingSheets = spreadsheet.getSheets().map(sheet => sheet.getName());
    
    const missingSheets = requiredSheets.filter(sheetName => !existingSheets.includes(sheetName));
    
    if (missingSheets.length > 0) {
      return {
        valid: false,
        message: `Abas faltando: ${missingSheets.join(', ')}`
      };
    }
    
    // Verificar cabeçalhos da aba Cadastro
    const cadastroSheet = spreadsheet.getSheetByName(SHEETS.CADASTRO);
    const cadastroHeaders = cadastroSheet.getRange(1, 1, 1, 2).getValues()[0];
    const expectedCadastroHeaders = ['Nome', 'Telefone'];
    
    if (cadastroHeaders[0] !== expectedCadastroHeaders[0] || cadastroHeaders[1] !== expectedCadastroHeaders[1]) {
      return {
        valid: false,
        message: 'Cabeçalhos da aba Cadastro incorretos. Esperado: Nome, Telefone'
      };
    }
    
    // Verificar cabeçalhos da aba Produtos
    const produtosSheet = spreadsheet.getSheetByName(SHEETS.PRODUTOS);
    const produtosHeaders = produtosSheet.getRange(1, 1, 1, 3).getValues()[0];
    const expectedProdutosHeaders = ['ID Produto', 'Nome do Produto', 'Valor Unitário'];
    
    if (produtosHeaders[0] !== expectedProdutosHeaders[0] || 
        produtosHeaders[1] !== expectedProdutosHeaders[1] || 
        produtosHeaders[2] !== expectedProdutosHeaders[2]) {
      return {
        valid: false,
        message: 'Cabeçalhos da aba Produtos incorretos. Esperado: ID Produto, Nome do Produto, Valor Unitário'
      };
    }
    
    // Verificar cabeçalhos da aba Compras
    const comprasSheet = spreadsheet.getSheetByName(SHEETS.COMPRAS);
    const comprasHeaders = comprasSheet.getRange(1, 1, 1, 7).getValues()[0];
    const expectedComprasHeaders = ['Data', 'Nome do Produto', 'Quantidade', 'Valor Unitário', 'Subtotal', 'Nome do Comprador', 'Telefone'];
    
    for (let i = 0; i < expectedComprasHeaders.length; i++) {
      if (comprasHeaders[i] !== expectedComprasHeaders[i]) {
        return {
          valid: false,
          message: 'Cabeçalhos da aba Compras incorretos. Esperado: ' + expectedComprasHeaders.join(', ')
        };
      }
    }
    
    return {
      valid: true,
      message: 'Estrutura da planilha válida'
    };
    
  } catch (error) {
    return {
      valid: false,
      message: 'Erro ao validar planilha: ' + error.message
    };
  }
}

// Função para criar estrutura inicial da planilha (caso não exista)
function setupInitialSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Criar aba Cadastro
    let cadastroSheet = spreadsheet.getSheetByName(SHEETS.CADASTRO);
    if (!cadastroSheet) {
      cadastroSheet = spreadsheet.insertSheet(SHEETS.CADASTRO);
    }
    
    // Configurar cabeçalhos Cadastro
    cadastroSheet.getRange(1, 1, 1, 2).setValues([['Nome', 'Telefone']]);
    cadastroSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    
    // Criar aba Produtos
    let produtosSheet = spreadsheet.getSheetByName(SHEETS.PRODUTOS);
    if (!produtosSheet) {
      produtosSheet = spreadsheet.insertSheet(SHEETS.PRODUTOS);
    }
    
    // Configurar cabeçalhos Produtos
    produtosSheet.getRange(1, 1, 1, 3).setValues([['ID Produto', 'Nome do Produto', 'Valor Unitário']]);
    produtosSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    
    // Criar aba Compras
    let comprasSheet = spreadsheet.getSheetByName(SHEETS.COMPRAS);
    if (!comprasSheet) {
      comprasSheet = spreadsheet.insertSheet(SHEETS.COMPRAS);
    }
    
    // Configurar cabeçalhos Compras
    comprasSheet.getRange(1, 1, 1, 7).setValues([['Data', 'Nome do Produto', 'Quantidade', 'Valor Unitário', 'Subtotal', 'Nome do Comprador', 'Telefone']]);
    comprasSheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    
    // Adicionar alguns dados de exemplo
    
    // Clientes exemplo
    cadastroSheet.getRange(2, 1, 3, 2).setValues([
      ['João Silva', '5521999887766'],
      ['Maria Santos', '5521988776655'],
      ['Pedro Oliveira', '5521977665544']
    ]);
    
    // Produtos exemplo
    produtosSheet.getRange(2, 1, 5, 3).setValues([
      [1, 'Coca-Cola Lata', 4.50],
      [2, 'Água Mineral', 2.00],
      [3, 'Cerveja Heineken', 8.00],
      [4, 'Salgadinho', 3.50],
      [5, 'Chocolate', 5.00]
    ]);
    
    return {
      success: true,
      message: 'Planilha configurada com sucesso!'
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao configurar planilha: ' + error.message
    };
  }
}

// Função para formatar telefone
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Garante que tenha 13 dígitos (55 + DDD + número)
  if (cleaned.length === 11) {
    return '55' + cleaned; // Adiciona código do país
  }
  
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return cleaned;
  }
  
  return phone.toString(); // Retorna como está se não conseguir formatar
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

    // Constantes de coluna
    const COL = {
      DATA: 0,
      PRODUTO: 1,
      QUANTIDADE: 2,
      VALOR_UNITARIO: 3,
      SUBTOTAL: 4,
      NOME_COMPRADOR: 5,
      TELEFONE: 6
    };

    for (let i = 1; i < data.length; i++) {
      const rawDate = data[i][COL.DATA];
      let rowDate = null;

      if (rawDate instanceof Date) {
        rowDate = new Date(rawDate);
        rowDate.setHours(0, 0, 0, 0);
        Logger.log(`Linha ${i}: Data como objeto Date: ${rowDate}`);
      } else if (typeof rawDate === 'string') {
        Logger.log(`Linha ${i}: Data como string: ${rawDate}`);
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          rowDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          rowDate.setHours(0, 0, 0, 0);
          Logger.log(`Linha ${i}: Data convertida: ${rowDate}`);
        }
      } else {
        Logger.log(`Linha ${i}: Tipo de dado inesperado: ${typeof rawDate}`);
      }

      if (!rowDate) continue;

      if (rowDate >= start && rowDate <= end) {
        Logger.log(`Linha ${i}: Data dentro do período. Processando venda...`);

        const produto = data[i][COL.PRODUTO];
        const quantidade = parseFloat((data[i][COL.QUANTIDADE] + '').replace(',', '.')) || 0;
        const valorUnitario = parseFloat((data[i][COL.VALOR_UNITARIO] + '').replace(',', '.')) || 0;
        const subtotal = parseFloat((data[i][COL.SUBTOTAL] + '').replace(',', '.')) || 0;
        const nome = data[i][COL.NOME_COMPRADOR] || '';
        const telefone = data[i][COL.TELEFONE] || '';

        report.push({
          data: rowDate,
          produto,
          quantidade,
          valorUnitario,
          subtotal,
          nome,
          telefone
        });

        totalGeral += subtotal;
      }
    }

    Logger.log('Total de vendas encontradas: ' + report.length);
    Logger.log('Total geral somado: ' + totalGeral);

    return {
      vendas: report,
      totalGeral,
      periodo: { inicio: startDate, fim: endDate }
    };

  } catch (e) {
    Logger.log('Erro ao gerar relatório: ' + e.message);
    return {
      erro: e.message,
      vendas: [],
      totalGeral: 0,
      periodo: { inicio: startDate, fim: endDate }
    };
  }
}


// Função para obter estatísticas básicas
function getBasicStats() {
  try {
    const comprasSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.COMPRAS);
    const comprasData = comprasSheet.getDataRange().getValues();
    
    const cadastroSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.CADASTRO);
    const cadastroData = cadastroSheet.getDataRange().getValues();
    
    const produtosSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEETS.PRODUTOS);
    const produtosData = produtosSheet.getDataRange().getValues();
    
    let totalVendas = 0;
    let totalCompras = comprasData.length - 1; // Subtrai cabeçalho
    
    // Calcular total de vendas
    for (let i = 1; i < comprasData.length; i++) {
      totalVendas += parseFloat(comprasData[i][4] || 0);
    }
    
    // Produto mais vendido
    const produtoVendas = {};
    for (let i = 1; i < comprasData.length; i++) {
      const produto = comprasData[i][1];
      const quantidade = parseInt(comprasData[i][2] || 0);
      
      if (produtoVendas[produto]) {
        produtoVendas[produto] += quantidade;
      } else {
        produtoVendas[produto] = quantidade;
      }
    }
    
    let produtoMaisVendido = '';
    let maiorQuantidade = 0;
    
    for (const produto in produtoVendas) {
      if (produtoVendas[produto] > maiorQuantidade) {
        maiorQuantidade = produtoVendas[produto];
        produtoMaisVendido = produto;
      }
    }
    
    return {
      totalClientes: cadastroData.length - 1,
      totalProdutos: produtosData.length - 1,
      totalCompras: totalCompras,
      totalVendas: totalVendas,
      produtoMaisVendido: produtoMaisVendido,
      quantidadeMaisVendida: maiorQuantidade
    };
    
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      erro: error.message
    };
  }
}




