# 📋 Guia de Instalação - WebApp Minibar EAC

## 🚀 Passo a Passo para Implementação

### 1️⃣ Criar a Planilha Google

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Renomeie para "**Minibar EAC - Controle de Vendas**"
4. Crie as 3 abas conforme especificado:

#### 📋 **Aba "Cadastro"**
- **A1:** Nome
- **B1:** Telefone
- Adicione alguns clientes exemplo:
  - A2: João Silva | B2: 5521999887766
  - A3: Maria Santos | B3: 5521988776655
  - A4: Pedro Oliveira | B4: 5521977665544

#### 🛍️ **Aba "Produtos"**
- **A1:** ID Produto
- **B1:** Nome do Produto  
- **C1:** Valor Unitário
- Adicione alguns produtos exemplo:
  - A2: 1 | B2: Coca-Cola Lata | C2: 4.50
  - A3: 2 | B3: Água Mineral | C3: 2.00
  - A4: 3 | B4: Cerveja Heineken | C4: 8.00
  - A5: 4 | B5: Salgadinho | C5: 3.50
  - A6: 5 | B6: Chocolate | C6: 5.00

#### 🛒 **Aba "Compras"**
- **A1:** Data
- **B1:** Nome do Produto
- **C1:** Quantidade
- **D1:** Valor Unitário
- **E1:** Subtotal
- **F1:** Nome do Comprador
- **G1:** Telefone

5. **Copie o ID da planilha** (encontrado na URL entre `/d/` e `/edit`)

---

### 2️⃣ Criar o Projeto Google Apps Script

1. Acesse [Google Apps Script](https://script.google.com)
2. Clique em "**Novo projeto**"
3. Renomeie para "**WebApp Minibar EAC**"

#### Configurar arquivos:

**📁 Code.gs**
- Cole o código do arquivo `Code.gs` fornecido
- **IMPORTANTE:** Na linha 4, substitua `'SUA_PLANILHA_ID_AQUI'` pelo ID real da sua planilha

**📁 index.html**
- Clique em ➕ ao lado de "Arquivos"
- Selecione "HTML"
- Nomeie como `index`
- Cole o código HTML fornecido

---

### 3️⃣ Configurar Permissões e Deploy

#### Configurar Permissões:
1. No Apps Script, clique em "**Executar**" na função `doGet`
2. Autorize todas as permissões solicitadas
3. Teste a função `getCustomers` para verificar conexão com a planilha

#### Fazer Deploy:
1. Clique em "**Implantar**" → "**Nova implantação**"
2. Tipo: "**Aplicativo da Web**"
3. Configurações:
   - **Executar como:** Eu (seu email)
   - **Quem tem acesso:** Qualquer pessoa
4. Clique em "**Implantar**"
5. **Copie a URL do WebApp** gerada

---

### 4️⃣ Testar o WebApp

1. Abra a URL do WebApp em seu navegador
2. Teste as funcionalidades:
   - ✅ Carregar produtos
   - ✅ Buscar cliente por telefone
   - ✅ Adicionar itens ao carrinho
   - ✅ Finalizar compra
   - ✅ Consultar histórico

---

## 🔧 Configurações Adicionais

### 📱 **Para usar como PWA (Aplicativo)**
Adicione estas meta tags no `<head>` do HTML:

```html
<meta name="theme-color" content="#667eea">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Minibar EAC">
<link rel="apple-touch-icon" href="icon-192.png">
```

### 🖼️ **Substituir o Logo**
1. Faça upload da imagem para um serviço como Imgur
2. No HTML, substitua o emoji 🍻 por:
```html
<img src="https://imgur.com/a/HNfodIX" alt="Logo EAC">
```

### 🔒 **Restringir Acesso (Opcional)**
Para permitir apenas usuários específicos:
1. No Apps Script, vá em "Implantar" → "Gerenciar implantações"
2. Clique em ✏️ (editar)
3. Altere "Quem tem acesso" para "Apenas eu" ou usuários específicos

---

## 📊 Funcionalidades Implementadas

### ✅ **Registrar Compra**
- Validação de telefone cadastrado
- Seleção de produtos com preços
- Carrinho de compras
- Cálculo automático de subtotais
- Gravação na planilha com data atual

### ✅ **Consultar Histórico**
- Busca por telefone
- Listagem de todas as compras
- Total geral por cliente
- Formatação de datas em português

### ✅ **Interface Responsiva**
- Design moderno com gradientes
- Otimizado para mobile
- Animações suaves
- Feedback visual de carregamento

### ✅ **Validações**
- Telefone deve estar cadastrado
- Produtos obrigatórios
- Quantidades positivas
- Tratamento de erros

---

## 🐛 Solução de Problemas

### **Erro: "Cliente não encontrado"**
- Verifique se o telefone está exatamente como cadastrado na aba "Cadastro"
- Formato: 55DDDXXXXXXXXX (13 dígitos)

### **Erro: "Produtos não carregam"**
- Verifique o ID da planilha no Code.gs
- Confirme que a aba "Produtos" existe e tem dados

### **Erro: "Compra não finaliza"**
- Verifique permissões do Apps Script
- Confirme que a aba "Compras" existe
- Verifique logs em Apps Script > Execuções

### **WebApp não abre**
- Confirme que foi feito deploy corretamente
- Verifique se o tipo de implantação é "Aplicativo da Web"
- Teste em modo incógnito

---

## 🔄 Atualizações Futuras

Para atualizar o WebApp após mudanças:

1. Faça as alterações no código
2. Salve (Ctrl+S)
3. Vá em "Implantar" → "Gerenciar implantações"
4. Clique em ✏️ (editar) na implantação ativa
5. Altere a versão para "Nova versão"
6. Clique em "Implantar"

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o console do navegador** (F12) para erros JavaScript
2. **Consulte os logs** do Apps Script em Execuções
3. **Teste cada função** individualmente no Apps Script
4. **Valide a estrutura** da planilha conforme especificado

---

## 🎯 Próximos Passos Sugeridos

- [ ] Adicionar função de backup automático
- [ ] Implementar relatórios mensais
- [ ] Criar dashboard com gráficos
- [ ] Adicionar notificações por email
- [ ] Implementar controle de estoque
- [ ] Adicionar múltiplas formas de pagamento

---

**✅ WebApp Minibar EAC pronto para uso!**