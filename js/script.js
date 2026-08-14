/**
 * SISTEMA DE GESTÃO DE VENDAS - AÇAÍTERIA
 */

// --- BASE DE DADOS (CARDÁPIO) ---
const listaAdicionais = [
  { nome: "Biscoito Canudo", preco: 1.0 },
  { nome: "Bis (2 un)", preco: 1.0 },
  { nome: "Bombom", preco: 1.5 },
  { nome: "Fini", preco: 1.5 },
  { nome: "Kit Kat", preco: 1.5 },
  { nome: "Mini Trento", preco: 1.5 },
  { nome: "Mini Oreo (3 un)", preco: 1.5 },
  { nome: "Tens", preco: 1.5 },
  { nome: "Batom", preco: 2.0 },
  { nome: "Ovomaltine", preco: 3.0 },
  { nome: "Nutella", preco: 6.0 }
];

const cardapio = {
  "Copos": [
    { nome: "Copo 150ml", precoAcaí: 7.0, precoCreme: 7.0 },
    { nome: "Copo 300ml", precoAcaí: 14.0, precoCreme: 15.0 },
    { nome: "Copo 400ml", precoAcaí: 17.0, precoCreme: 19.0 },
    { nome: "Copo 500ml", precoAcaí: 20.0, precoCreme: 22.0 },
    { nome: "Copo 700ml", precoAcaí: 22.0, precoCreme: 24.0 }
  ],
  "Potes": [
    { nome: "Pote 1 Litro", precoAcaí: 30.0, precoCreme: 35.0 },
    { nome: "Pote 1.5 Litros", precoAcaí: 37.0, precoCreme: 42.0 },
    { nome: "Pote 1.8 Litros", precoAcaí: 40.0, precoCreme: 45.0 }
  ],
  "Bebidas": [
    { nome: "Suco 300ml", preco: 5.0 }, { nome: "Suco 400ml", preco: 7.0 }, { nome: "Suco 500ml", preco: 9.0 },
    { nome: "Guaravita (copo)", preco: 2.0 }, { nome: "Refrigerante 200ml", preco: 2.5 },
    { nome: "Refrigerante lata 350ml", preco: 6.0 }, { nome: "Fanta 2L", preco: 13.0 },
    { nome: "Coca-Cola 2L", preco: 15.0 }, { nome: "Água sem gás", preco: 2.5 }, { nome: "Água com gás", preco: 3.0 }
  ],
  "Salgados": [
    { nome: "Coxinha", preco: 6.0 }, { nome: "Coxinha Catupiry", preco: 6.0 }, { nome: "Quibe", preco: 6.0 },
    { nome: "Salsicha", preco: 6.0 }, { nome: "Cigarette", preco: 6.0 }, { nome: "Pastel Gaúcho", preco: 6.0 },
    { nome: "Bolinho de Mandioca", preco: 6.0 }, { nome: "Tortinha de Frango", preco: 6.0 },
    { nome: "Hambúrguer Assado", preco: 6.0 }, { nome: "Pastel Assado", preco: 6.0 },
    { nome: "Joelho Presunto", preco: 6.0 }, { nome: "Lanchinho (Frango/Pizza/Presunto)", preco: 6.0 },
    { nome: "Esfirra (Carne/Frango)", preco: 6.0 }
  ],
  "Cascão": [
    { nome: "Açaí", preco: 6.0 }, { nome: "Misto", preco: 6.0 },
    { nome: "Creme", preco: 6.0 }, { nome: "Recheada", preco: 10.0 },
    { nome: "Recheada c/ Nutella", preco: 12.0 }
  ],
  "Barca": [
    { nome: "Barca P (5 compl.)", preco: 40.0 }, { nome: "Barca M (5 compl.)", preco: 60.0 }, { nome: "Barca G (5 compl.)", preco: 75.0 }
  ],
  "Adicionais": listaAdicionais
};

// --- ESTADO DA APLICAÇÃO ---
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

// --- INICIALIZAÇÃO E EVENTOS ---
document.addEventListener('DOMContentLoaded', () => {
  renderGridAdicionais();
  atualizarPainel();

  elCategoria.addEventListener('change', carregarProdutos);
  elChkCreme.addEventListener('change', atualizarPrecoCreme);
  elEntrega.addEventListener('change', calcularTotal);
  document.getElementById('btn-add-item').addEventListener('click', adicionarItem);
  document.getElementById('btn-finalizar').addEventListener('click', finalizarVenda);
  document.getElementById('btn-exportar').addEventListener('click', exportarCSV);
});

// --- FUNÇÕES DE INTERFACE ---
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

function carregarProdutos() {
  const cat = elCategoria.value;
  elProduto.innerHTML = '';
  resetPersonalizacao();

  if (cat === "Copos" || cat === "Potes") {
    elBoxPerso.style.display = "block";
  } else {
    elBoxPerso.style.display = "none";
  }

  if (cat && cardapio[cat]) {
    cardapio[cat].forEach((item, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      const preco = (cat === "Copos" || cat === "Potes") ? item.precoAcaí : item.preco;
      opt.textContent = `${item.nome} - R$ ${preco.toFixed(2)}`;
      elProduto.appendChild(opt);
    });
  }
}

function atualizarPrecoCreme() {
  const cat = elCategoria.value;
  const comCreme = elChkCreme.checked;

  if (cat === "Copos" || cat === "Potes") {
    const idxSelecionado = elProduto.value;
    elProduto.innerHTML = '';

    cardapio[cat].forEach((item, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      const precoCalculado = comCreme ? item.precoCreme : item.precoAcaí;
      opt.textContent = `${item.nome} ${comCreme ? '(c/ Creme)' : ''} - R$ ${precoCalculado.toFixed(2)}`;
      elProduto.appendChild(opt);
    });

    elProduto.value = idxSelecionado;
  }
}

function resetPersonalizacao() {
  elChkCreme.checked = false;
  elQtdExtra.value = 0;
  document.querySelectorAll('.chk-adicional').forEach(c => c.checked = false);
}

// --- LOGICA DE NEGÓCIO ---
function adicionarItem() {
  const cat = elCategoria.value;
  const prodIdx = elProduto.value;
  const qtd = parseInt(elQtd.value);

  if (!cat || prodIdx === "") return alert("Selecione um produto válido.");

  let nomeProduto = "";
  let precoUnitario = 0;

  if (cat === "Copos" || cat === "Potes") {
    const comCreme = elChkCreme.checked;
    const qtdExtras = parseInt(elQtdExtra.value) || 0;
    const itemObj = cardapio[cat][prodIdx];

    precoUnitario = comCreme ? itemObj.precoCreme : itemObj.precoAcaí;
    precoUnitario += (qtdExtras * 1.0);

    const adicionaisNomes = [];
    if (qtdExtras > 0) adicionaisNomes.push(`${qtdExtras}x Compl. Extra`);

    document.querySelectorAll('.chk-adicional:checked').forEach(c => {
      precoUnitario += parseFloat(c.getAttribute('data-preco'));
      adicionaisNomes.push(c.getAttribute('data-nome'));
    });

    const detalheAdicionais = adicionaisNomes.length > 0 ? ` [${adicionaisNomes.join(', ')}]` : '';
    nomeProduto = `${itemObj.nome} ${comCreme ? '+ Creme' : '(Só Açaí)'}${detalheAdicionais}`;
  } else {
    const itemObj = cardapio[cat][prodIdx];
    nomeProduto = itemObj.nome;
    precoUnitario = itemObj.preco;
  }

  carrinho.push({
    categoria: cat,
    nome: nomeProduto,
    preco: precoUnitario,
    qtd: qtd,
    subtotal: precoUnitario * qtd
  });

  carregarProdutos();
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
        <span>${item.qtd}x ${item.nome} (R$ ${item.subtotal.toFixed(2)})</span>
        <button class="btn-del" onclick="removerItemCarrinho(${idx})">X</button>
      </div>
    `;
  });
  calcularTotal();
}

function calcularTotal() {
  const subtotalItems = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const taxaEntrega = parseFloat(elEntrega.value);
  const total = subtotalItems + taxaEntrega;
  elTotalVal.textContent = total.toFixed(2);
  return total;
}

function finalizarVenda() {
  const total = calcularTotal();
  if (total <= 0) return alert("Adicione itens ao pedido antes de finalizar.");

  const novaVenda = {
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    itens: [...carrinho],
    pagamento: elPagamento.value,
    isEntrega: elEntrega.value === "1",
    taxaEntrega: parseFloat(elEntrega.value),
    valorTotal: total
  };

  vendas.push(novaVenda);
  localStorage.setItem('vendas_acai', JSON.stringify(vendas));

  carrinho = [];
  renderCarrinho();
  atualizarPainel();
  alert("Venda registrada com sucesso!");
}

function deletarVenda(id) {
  if (confirm("Tem certeza que deseja cancelar este pedido do histórico?")) {
    vendas = vendas.filter(venda => venda.id !== id);
    localStorage.setItem('vendas_acai', JSON.stringify(vendas));
    atualizarPainel();
  }
}

function atualizarPainel() {
  elHistoricoCorpo.innerHTML = '';
  let totalVendido = 0;
  let qtdEntregas = 0;

  vendas.slice().reverse().forEach(venda => {
    totalVendido += venda.valorTotal;
    if (venda.isEntrega) qtdEntregas++;

    elHistoricoCorpo.innerHTML += `
      <tr>
        <td>${venda.data}</td>
        <td>${venda.pagamento}</td>
        <td>${venda.isEntrega ? 'Sim' : 'Não'}</td>
        <td>R$ ${venda.valorTotal.toFixed(2)}</td>
        <td class="text-center">
          <button class="btn-del" title="Excluir Venda" onclick="deletarVenda(${venda.id})">X</button>
        </td>
      </tr>
    `;
  });

  document.getElementById('metric-total').textContent = `R$ ${totalVendido.toFixed(2)}`;
  document.getElementById('metric-qtd').textContent = vendas.length;
  document.getElementById('metric-entregas').textContent = qtdEntregas;
}

function exportarCSV() {
  if (vendas.length === 0) return alert("Nenhuma venda para exportar.");

  let csvContent = "data:text/csv;charset=utf-8,ID,Data,Pagamento,Entrega,TaxaEntrega,Total,Itens\n";

  vendas.forEach(v => {
    const itensDesc = v.itens.map(i => `${i.qtd}x ${i.nome}`).join(' | ');
    csvContent += `${v.id},"${v.data}",${v.pagamento},${v.isEntrega ? 'Sim' : 'Nao'},${v.taxaEntrega},${v.valorTotal},"${itensDesc}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `vendas_acai_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}