/**
 * SISTEMA DE GESTÃO DE VENDAS E ESTOQUE - AÇAÍTERIA
 */

// --- ADICIONAIS FIXOS DO COPO ---
const listaAdicionais = [
  { nome: "Biscoito Canudo", preco: 1.0 }, { nome: "Bis (2 un)", preco: 1.0 },
  { nome: "Bombom", preco: 1.5 }, { nome: "Fini", preco: 1.5 },
  { nome: "Kit Kat", preco: 1.5 }, { nome: "Mini Trento", preco: 1.5 },
  { nome: "Mini Oreo (3 un)", preco: 1.5 }, { nome: "Tens", preco: 1.5 },
  { nome: "Batom", preco: 2.0 }, { nome: "Ovomaltine", preco: 3.0 },
  { nome: "Nutella", preco: 6.0 }
];

// --- CARDÁPIO PADRÃO ---
const cardapioPadrao = [
  { id: 1, nome: "Açaí", categoria: "Copos", tamanho: "150ml", preco: 7.0, precoCreme: 7.0 },
  { id: 2, nome: "Açaí", categoria: "Copos", tamanho: "300ml", preco: 14.0, precoCreme: 15.0 },
  { id: 3, nome: "Açaí", categoria: "Copos", tamanho: "400ml", preco: 17.0, precoCreme: 19.0 },
  { id: 4, nome: "Açaí", categoria: "Copos", tamanho: "500ml", preco: 20.0, precoCreme: 22.0 },
  { id: 5, nome: "Açaí", categoria: "Copos", tamanho: "700ml", preco: 22.0, precoCreme: 24.0 },
  { id: 6, nome: "Açaí Pote", categoria: "Potes", tamanho: "1 Litro", preco: 30.0, precoCreme: 35.0 },
  { id: 7, nome: "Açaí Pote", categoria: "Potes", tamanho: "1.5 Litros", preco: 37.0, precoCreme: 42.0 },
  { id: 8, nome: "Açaí Pote", categoria: "Potes", tamanho: "1.8 Litros", preco: 40.0, precoCreme: 45.0 },
  { id: 9, nome: "Suco", categoria: "Bebidas", tamanho: "300ml", preco: 5.0 },
  { id: 10, nome: "Guaravita", categoria: "Bebidas", tamanho: "Copo", preco: 2.0 },
  { id: 11, nome: "Coca-Cola", categoria: "Bebidas", tamanho: "2 Litros", preco: 15.0 },
  { id: 12, nome: "Coxinha", categoria: "Salgados", tamanho: "Unidade", preco: 6.0 },
  { id: 13, nome: "Cascão Recheado", categoria: "Cascão", tamanho: "Unidade", preco: 10.0 }
];

// --- ESTADO DA APLICAÇÃO ---
let produtos = JSON.parse(localStorage.getItem('produtos_acai')) || cardapioPadrao;
let carrinho = [];
let vendas = JSON.parse(localStorage.getItem('vendas_acai')) || [];

// --- ELEMENTOS DO DOM ---
const elCategoria = document.getElementById('categoria');
const elProduto = document.getElementById('produto');
const elQtd = document.getElementById('qtd');
const elBoxPerso = document.getElementById('box-personalizacao');
const elChkCreme = document.getElementById('chk-creme');
const elQtdExtra = document.getElementById('qtd-extra');
const elGridAdicionais = document.getElementById('grid-adicionais');
const elCarrinho = document.getElementById('carrinho');
const elPagamento = document.getElementById('pagamento');
const elEntrega = document.getElementById('entrega');
const elTotalVal = document.getElementById('total-val');
const elHistoricoCorpo = document.getElementById('historico-corpo');

// Elementos Troco e Cliente
const elBoxTroco = document.getElementById('box-troco');
const elValorEntregue = document.getElementById('valor-entregue');
const elTrocoCalculado = document.getElementById('troco-calculado');
const elBoxDadosEntrega = document.getElementById('box-dados-entrega');
const elClienteNome = document.getElementById('cliente-nome');

// Elementos de Cadastro
const elFormProduto = document.getElementById('form-produto');
const elTabelaProdCorpo = document.getElementById('tabela-produtos-corpo');

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  renderGridAdicionais();
  atualizarCategorias();
  renderTabelaProdutos();
  atualizarPainel();

  elCategoria.addEventListener('change', carregarProdutosPorCategoria);
  elChkCreme.addEventListener('change', atualizarPrecoCreme);
  elEntrega.addEventListener('change', () => {
    calcularTotal();
    verificarOpcaoEntrega();
  });
  elPagamento.addEventListener('change', verificarOpcaoPagamento);
  elValorEntregue.addEventListener('input', calcularTroco);

  document.getElementById('btn-add-item').addEventListener('click', adicionarItem);
  document.getElementById('btn-finalizar').addEventListener('click', finalizarVenda);
  document.getElementById('btn-exportar').addEventListener('click', exportarCSV);
  
  elFormProduto.addEventListener('submit', salvarProduto);
  document.getElementById('btn-cancelar-prod').addEventListener('click', limparFormProduto);

  // Atualizador do tempo das entregas a cada 1 minuto
  setInterval(renderPainelEntregas, 60000);
});

// --- CONTROLE DE ABAS ---
function alternarAba(aba) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (aba === 'vendas') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('aba-vendas').classList.add('active');
    atualizarPainel();
  } else if (aba === 'entregas') {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('aba-entregas').classList.add('active');
    renderPainelEntregas();
  } else if (aba === 'produtos') {
    document.querySelectorAll('.tab-btn')[2].classList.add('active');
    document.getElementById('aba-produtos').classList.add('active');
    renderTabelaProdutos();
  } else if (aba === 'estatisticas') {
    document.querySelectorAll('.tab-btn')[3].classList.add('active');
    document.getElementById('aba-estatisticas').classList.add('active');
    calcularEstatisticasGerais();
  }
}

// --- GESTÃO DE CATEGORIAS E PRODUTOS ---
function atualizarCategorias() {
  const categoriasUnicas = [...new Set(produtos.map(p => p.categoria))];
  elCategoria.innerHTML = '<option value="">Selecione...</option>';
  categoriasUnicas.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    elCategoria.appendChild(opt);
  });
  carregarProdutosPorCategoria();
}

function carregarProdutosPorCategoria() {
  const cat = elCategoria.value;
  elProduto.innerHTML = '';
  resetPersonalizacao();

  if (cat === "Copos" || cat === "Potes") {
    elBoxPerso.style.display = "block";
  } else {
    elBoxPerso.style.display = "none";
  }

  const prodsFiltrados = produtos.filter(p => p.categoria === cat);
  prodsFiltrados.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.nome} ${p.tamanho ? '(' + p.tamanho + ')' : ''} - R$ ${p.preco.toFixed(2)}`;
    elProduto.appendChild(opt);
  });
}

function atualizarPrecoCreme() {
  const cat = elCategoria.value;
  const comCreme = elChkCreme.checked;

  if (cat === "Copos" || cat === "Potes") {
    const prodIdAtual = elProduto.value;
    elProduto.innerHTML = '';

    const prodsFiltrados = produtos.filter(p => p.categoria === cat);
    prodsFiltrados.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      const precoFinal = (comCreme && p.precoCreme) ? p.precoCreme : p.preco;
      opt.textContent = `${p.nome} ${p.tamanho ? '(' + p.tamanho + ')' : ''} ${comCreme ? 'c/ Creme' : ''} - R$ ${precoFinal.toFixed(2)}`;
      elProduto.appendChild(opt);
    });

    elProduto.value = prodIdAtual;
  }
}

function renderGridAdicionais() {
  elGridAdicionais.innerHTML = '';
  listaAdicionais.forEach((item, idx) => {
    elGridAdicionais.innerHTML += `
      <label>
        <input type="checkbox" class="chk-adicional" value="${idx}" data-preco="${item.preco}" data-nome="${item.nome}">
        ${item.nome} (+R$${item.preco.toFixed(2)})
      </label>
    `;
  });
}

function resetPersonalizacao() {
  elChkCreme.checked = false;
  elQtdExtra.value = 0;
  document.querySelectorAll('.chk-adicional').forEach(c => c.checked = false);
}

// --- OPERAÇÃO DE CAIXA ---
function verificarOpcaoEntrega() {
  if (elEntrega.value === "1") {
    elBoxDadosEntrega.style.display = "block";
  } else {
    elBoxDadosEntrega.style.display = "none";
    elClienteNome.value = "";
  }
}

function verificarOpcaoPagamento() {
  if (elPagamento.value === "Dinheiro") {
    elBoxTroco.style.display = "block";
    calcularTroco();
  } else {
    elBoxTroco.style.display = "none";
    elValorEntregue.value = "";
  }
}

function calcularTroco() {
  const total = calcularTotal();
  const entregue = parseFloat(elValorEntregue.value) || 0;

  if (elPagamento.value === "Dinheiro" && entregue > 0) {
    const troco = entregue - total;
    if (troco < 0) {
      elTrocoCalculado.textContent = `Faltam R$ ${Math.abs(troco).toFixed(2).replace('.', ',')}`;
      elTrocoCalculado.style.color = "var(--danger)";
    } else {
      elTrocoCalculado.textContent = `R$ ${troco.toFixed(2).replace('.', ',')}`;
      elTrocoCalculado.style.color = "#2E7D32";
    }
  } else {
    elTrocoCalculado.textContent = "R$ 0,00";
    elTrocoCalculado.style.color = "var(--danger)";
  }
}

function adicionarItem() {
  const cat = elCategoria.value;
  const prodId = parseInt(elProduto.value);
  const qtd = parseInt(elQtd.value);

  if (!cat || !prodId) return alert("Selecione um produto válido.");

  const pObj = produtos.find(p => p.id === prodId);
  if (!pObj) return;

  let nomeExibicao = `${pObj.nome} ${pObj.tamanho || ''}`.trim();
  let precoUnitario = pObj.preco;

  if (cat === "Copos" || cat === "Potes") {
    const comCreme = elChkCreme.checked;
    const qtdExtras = parseInt(elQtdExtra.value) || 0;

    precoUnitario = (comCreme && pObj.precoCreme) ? pObj.precoCreme : pObj.preco;
    precoUnitario += (qtdExtras * 1.0);

    const adicionaisNomes = [];
    if (qtdExtras > 0) adicionaisNomes.push(`${qtdExtras}x Compl. Extra`);

    document.querySelectorAll('.chk-adicional:checked').forEach(c => {
      precoUnitario += parseFloat(c.getAttribute('data-preco'));
      adicionaisNomes.push(c.getAttribute('data-nome'));
    });

    const detalheAdicionais = adicionaisNomes.length > 0 ? ` [${adicionaisNomes.join(', ')}]` : '';
    nomeExibicao = `${nomeExibicao} ${comCreme ? '+ Creme' : '(Só Açaí)'}${detalheAdicionais}`;
  }

  carrinho.push({
    produtoBase: `${pObj.nome} ${pObj.tamanho || ''}`.trim(),
    nome: nomeExibicao,
    preco: precoUnitario,
    qtd: qtd,
    subtotal: precoUnitario * qtd
  });

  carregarProdutosPorCategoria();
  renderCarrinho();
}

function removerItemCarrinho(index) {
  carrinho.splice(index, 1);
  renderCarrinho();
}

function renderCarrinho() {
  elCarrinho.innerHTML = '';
  carrinho.forEach((item, idx) => {
    elCarrinho.innerHTML += `
      <div class="cart-item">
        <span>${item.qtd}x ${item.nome} (R$ ${item.subtotal.toFixed(2).replace('.', ',')})</span>
        <button class="btn-del" onclick="removerItemCarrinho(${idx})">X</button>
      </div>
    `;
  });
  calcularTotal();
  calcularTroco();
}

function calcularTotal() {
  const subtotalItems = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const taxaEntrega = parseFloat(elEntrega.value);
  const total = subtotalItems + taxaEntrega;
  elTotalVal.textContent = total.toFixed(2).replace('.', ',');
  return total;
}

function finalizarVenda() {
  const total = calcularTotal();
  if (total <= 0) return alert("Adicione itens ao pedido antes de finalizar.");

  let trocoCalculado = 0;
  let valorEntregue = 0;

  if (elPagamento.value === "Dinheiro") {
    valorEntregue = parseFloat(elValorEntregue.value) || 0;
    if (valorEntregue < total) {
      return alert(`O valor entregue é menor do que o total do pedido.`);
    }
    trocoCalculado = valorEntregue - total;
  }

  const agora = new Date();
  const isEntrega = elEntrega.value === "1";

  const novaVenda = {
    id: Date.now(),
    timestamp: agora.getTime(),
    data: agora.toLocaleString('pt-BR'),
    hora: agora.getHours(),
    itens: [...carrinho],
    pagamento: elPagamento.value,
    valorEntregue: valorEntregue,
    troco: trocoCalculado,
    isEntrega: isEntrega,
    statusEntrega: isEntrega ? 'Pendente' : 'Concluído', // Status: Pendente, Em Rota, Concluído
    cliente: elClienteNome.value.trim() || 'Cliente Padrão',
    taxaEntrega: parseFloat(elEntrega.value),
    valorTotal: total
  };

  vendas.push(novaVenda);
  localStorage.setItem('vendas_acai', JSON.stringify(vendas));

  carrinho = [];
  elValorEntregue.value = "";
  elClienteNome.value = "";
  verificarOpcaoPagamento();
  verificarOpcaoEntrega();
  renderCarrinho();
  atualizarPainel();
  
  if (novaVenda.pagamento === "Dinheiro" && trocoCalculado > 0) {
    alert(`Venda realizada!\nTROCO: R$ ${trocoCalculado.toFixed(2).replace('.', ',')}`);
  } else {
    alert("Venda realizada com sucesso!");
  }
}

function deletarVenda(id) {
  if (confirm("Tem certeza que deseja apagar este pedido?")) {
    vendas = vendas.filter(v => v.id !== id);
    localStorage.setItem('vendas_acai', JSON.stringify(vendas));
    atualizarPainel();
  }
}

// --- SISTEMA DE ENTREGAS & TEMPO DE ESPERA ---
function renderPainelEntregas() {
  const container = document.getElementById('container-entregas');
  container.innerHTML = '';

  const entregasPendentes = vendas.filter(v => v.isEntrega && v.statusEntrega !== 'Concluído');
  
  // Atualizar o número no badge da aba
  document.getElementById('badge-entregas').textContent = entregasPendentes.length;

  if (entregasPendentes.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1; padding: 20px;">Nenhuma entrega pendente no momento! 🎉</p>`;
    return;
  }

  const agora = Date.now();

  entregasPendentes.reverse().forEach(v => {
    const tempoDecorridoMin = Math.floor((agora - v.timestamp) / 60000);
    
    // Classes de Alerta Visual baseadas nos minutos de espera
    let statusClass = "status-ok";
    if (tempoDecorridoMin >= 20 && tempoDecorridoMin < 40) {
      statusClass = "status-alert";
    } else if (tempoDecorridoMin >= 40) {
      statusClass = "status-late";
    }

    const textoTempo = tempoDecorridoMin < 60 
      ? `⏱️ ${tempoDecorridoMin} min` 
      : `⏱️ ${Math.floor(tempoDecorridoMin / 60)}h ${tempoDecorridoMin % 60}m`;

    const itensResumo = v.itens.map(i => `${i.qtd}x ${i.nome}`).join('<br>');

    container.innerHTML += `
      <div class="delivery-card ${statusClass}">
        <div class="delivery-header">
          <strong>📍 ${v.cliente}</strong>
          <span class="delivery-time">${textoTempo}</span>
        </div>
        <div class="delivery-body">
          <p><strong>Pedido às:</strong> ${new Date(v.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
          <p><strong>Status:</strong> <span style="font-weight:700;">${v.statusEntrega}</span></p>
          <p><strong>Pagamento:</strong> ${v.pagamento} (R$ ${v.valorTotal.toFixed(2).replace('.', ',')})</p>
          <p style="margin-top: 6px; font-size: 0.8rem; color: var(--text-muted);">${itensResumo}</p>
        </div>
        <div class="delivery-actions">
          ${v.statusEntrega === 'Pendente' 
            ? `<button class="btn btn-secondary" onclick="alterarStatusEntrega(${v.id}, 'Em Rota')">🛵 Saiu p/ Entrega</button>` 
            : `<button class="btn btn-primary" onclick="alterarStatusEntrega(${v.id}, 'Concluído')">✅ Entregue</button>`
          }
        </div>
      </div>
    `;
  });
}

function alterarStatusEntrega(id, novoStatus) {
  const v = vendas.find(item => item.id === id);
  if (v) {
    v.statusEntrega = novoStatus;
    localStorage.setItem('vendas_acai', JSON.stringify(vendas));
    renderPainelEntregas();
  }
}

// --- DASHBOARD DE HOJE & HISTÓRICO ---
function atualizarPainel() {
  elHistoricoCorpo.innerHTML = '';
  
  const hojeDataStr = new Date().toLocaleDateString('pt-BR');
  let vendasHojeVal = 0;
  let pedidosHojeQtd = 0;
  const contadorProdsHoje = {};

  // Contagem de entregas ativas para o Badge
  const entregasAtivas = vendas.filter(v => v.isEntrega && v.statusEntrega !== 'Concluído').length;
  document.getElementById('badge-entregas').textContent = entregasAtivas;

  vendas.slice().reverse().forEach(venda => {
    const isHoje = venda.data.startsWith(hojeDataStr);
    
    if (isHoje) {
      vendasHojeVal += venda.valorTotal;
      pedidosHojeQtd++;

      venda.itens.forEach(it => {
        const nomeChave = it.produtoBase || it.nome;
        contadorProdsHoje[nomeChave] = (contadorProdsHoje[nomeChave] || 0) + it.qtd;
      });
    }

    let descPagamento = venda.pagamento;
    if (venda.pagamento === "Dinheiro" && venda.troco > 0) {
      descPagamento += ` (Troco: R$${venda.troco.toFixed(2)})`;
    }

    elHistoricoCorpo.innerHTML += `
      <tr>
        <td>${venda.data}</td>
        <td>${descPagamento}</td>
        <td>${venda.isEntrega ? '🛵 Entrega' : '🏪 Retirada'}</td>
        <td>R$ ${venda.valorTotal.toFixed(2).replace('.', ',')}</td>
        <td class="text-center">
          <button class="btn-del" onclick="deletarVenda(${venda.id})">X</button>
        </td>
      </tr>
    `;
  });

  document.getElementById('dash-vendas-hoje').textContent = `R$ ${vendasHojeVal.toFixed(2).replace('.', ',')}`;
  document.getElementById('dash-pedidos-hoje').textContent = pedidosHojeQtd;
  
  const ticketHoje = pedidosHojeQtd > 0 ? (vendasHojeVal / pedidosHojeQtd) : 0;
  document.getElementById('dash-ticket-hoje').textContent = `R$ ${ticketHoje.toFixed(2).replace('.', ',')}`;

  let topProdHoje = "-";
  let maxQtdHoje = 0;
  for (const [prod, qtd] of Object.entries(contadorProdsHoje)) {
    if (qtd > maxQtdHoje) {
      maxQtdHoje = qtd;
      topProdHoje = `${prod} (${qtd}x)`;
    }
  }
  document.getElementById('dash-top-hoje').textContent = topProdHoje;
}

// --- CADASTRO E EDIÇÃO DE PRODUTOS ---
function renderTabelaProdutos() {
  elTabelaProdCorpo.innerHTML = '';
  produtos.forEach(p => {
    const precoText = p.precoCreme ? `R$ ${p.preco.toFixed(2)} (Creme: R$ ${p.precoCreme.toFixed(2)})` : `R$ ${p.preco.toFixed(2)}`;
    elTabelaProdCorpo.innerHTML += `
      <tr>
        <td><strong>${p.nome}</strong> ${p.tamanho ? '<br><small>' + p.tamanho + '</small>' : ''}</td>
        <td>${p.categoria}</td>
        <td>${precoText}</td>
        <td class="text-center">
          <button class="btn-edit" onclick="editarProduto(${p.id})">Editar</button>
          <button class="btn-del" onclick="excluirProduto(${p.id})">X</button>
        </td>
      </tr>
    `;
  });
}

function salvarProduto(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const nome = document.getElementById('prod-nome').value.trim();
  const categoria = document.getElementById('prod-categoria').value.trim();
  const tamanho = document.getElementById('prod-tamanho').value.trim();
  const preco = parseFloat(document.getElementById('prod-preco').value);
  const precoCremeVal = document.getElementById('prod-preco-creme').value;
  const precoCreme = precoCremeVal ? parseFloat(precoCremeVal) : null;

  if (id) {
    const idx = produtos.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      produtos[idx] = { id: parseInt(id), nome, categoria, tamanho, preco, precoCreme };
    }
  } else {
    produtos.push({ id: Date.now(), nome, categoria, tamanho, preco, precoCreme });
  }

  localStorage.setItem('produtos_acai', JSON.stringify(produtos));
  limparFormProduto();
  renderTabelaProdutos();
  atualizarCategorias();
  alert("Produto salvo com sucesso!");
}

function editarProduto(id) {
  const p = produtos.find(item => item.id === id);
  if (!p) return;

  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-nome').value = p.nome;
  document.getElementById('prod-categoria').value = p.categoria;
  document.getElementById('prod-tamanho').value = p.tamanho || '';
  document.getElementById('prod-preco').value = p.preco;
  document.getElementById('prod-preco-creme').value = p.precoCreme || '';

  document.getElementById('prod-form-title').textContent = "Editar Produto";
  document.getElementById('btn-cancelar-prod').style.display = "block";
}

function excluirProduto(id) {
  if (confirm("Deseja mesmo remover este produto do cardápio?")) {
    produtos = produtos.filter(p => p.id !== id);
    localStorage.setItem('produtos_acai', JSON.stringify(produtos));
    renderTabelaProdutos();
    atualizarCategorias();
  }
}

function limparFormProduto() {
  elFormProduto.reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('prod-form-title').textContent = "Cadastrar / Editar Produto";
  document.getElementById('btn-cancelar-prod').style.display = "none";
}

// --- ESTATÍSTICAS GERAIS ---
function calcularEstatisticasGerais() {
  const totalVendasNum = vendas.length;
  document.getElementById('st-num-vendas').textContent = totalVendasNum;

  if (totalVendasNum === 0) {
    document.getElementById('st-ticket-medio').textContent = "R$ 0,00";
    document.getElementById('st-top-produto').textContent = "-";
    document.getElementById('st-horario-pico').textContent = "-";
    document.getElementById('st-pagamento-top').textContent = "-";
    return;
  }

  const faturamentoTotal = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
  const ticketMedio = faturamentoTotal / totalVendasNum;
  document.getElementById('st-ticket-medio').textContent = `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`;

  const prodsContador = {};
  const horariosContador = {};
  const pagamentosContador = {};

  vendas.forEach(v => {
    v.itens.forEach(it => {
      const pNome = it.produtoBase || it.nome;
      prodsContador[pNome] = (prodsContador[pNome] || 0) + it.qtd;
    });

    const h = v.hora !== undefined ? v.hora : new Date(v.id).getHours();
    const faixa = `${h}h as ${h + 1}h`;
    horariosContador[faixa] = (horariosContador[faixa] || 0) + 1;

    pagamentosContador[v.pagamento] = (pagamentosContador[v.pagamento] || 0) + 1;
  });

  let topProd = "-", maxP = 0;
  for (const [p, qtd] of Object.entries(prodsContador)) {
    if (qtd > maxP) { maxP = qtd; topProd = `${p} (${qtd}x)`; }
  }
  document.getElementById('st-top-produto').textContent = topProd;

  let topHorario = "-", maxH = 0;
  for (const [h, qtd] of Object.entries(horariosContador)) {
    if (qtd > maxH) { maxH = qtd; topHorario = `${h} (${qtd} pedidos)`; }
  }
  document.getElementById('st-horario-pico').textContent = topHorario;

  let topPag = "-", maxPag = 0;
  for (const [pag, qtd] of Object.entries(pagamentosContador)) {
    if (qtd > maxPag) { maxPag = qtd; topPag = `${pag} (${qtd}x)`; }
  }
  document.getElementById('st-pagamento-top').textContent = topPag;
}

// --- EXPORTAR CSV ---
function exportarCSV() {
  if (vendas.length === 0) return alert("Nenhuma venda para exportar.");

  let csvContent = "data:text/csv;charset=utf-8,ID,Data,Cliente,Pagamento,ValorEntregue,Troco,Entrega,TaxaEntrega,Total,Itens\n";

  vendas.forEach(v => {
    const itensDesc = v.itens.map(i => `${i.qtd}x ${i.nome}`).join(' | ');
    csvContent += `${v.id},"${v.data}","${v.cliente || 'N/A'}",${v.pagamento},${v.valorEntregue || 0},${v.troco || 0},${v.isEntrega ? 'Sim' : 'Nao'},${v.taxaEntrega},${v.valorTotal},"${itensDesc}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `vendas_acai_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}