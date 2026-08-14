/**
 * SISTEMA DE GESTÃO DE ESTOQUE - AÇAÍTERIA
 */

// --- LISTA PADRÃO DE INSUMOS E MATÉRIAS-PRIMAS ---
const estoquePadrao = [
  { id: 101, nome: "Açaí (Caixa 10L)", categoria: "Insumo Base", quantidade: 6, unidade: "cx", estoqueMinimo: 2, custoUnitario: 110.00 },
  { id: 102, nome: "Creme de Ninho (Balde 3kg)", categoria: "Insumo Base", quantidade: 1, unidade: "balde", estoqueMinimo: 2, custoUnitario: 85.00 },
  { id: 103, nome: "Copos 300ml", categoria: "Embalagens", quantidade: 300, unidade: "un", estoqueMinimo: 100, custoUnitario: 0.20 },
  { id: 104, nome: "Copos 500ml", categoria: "Embalagens", quantidade: 250, unidade: "un", estoqueMinimo: 100, custoUnitario: 0.30 },
  { id: 105, nome: "Leite em Pó (Pacote 1kg)", categoria: "Complementos", quantidade: 4, unidade: "pct", estoqueMinimo: 2, custoUnitario: 28.00 },
  { id: 106, nome: "Nutella (Balde 3kg)", categoria: "Complementos", quantidade: 1, unidade: "balde", estoqueMinimo: 2, custoUnitario: 145.00 },
  { id: 107, nome: "Granola (Saco 5kg)", categoria: "Complementos", quantidade: 2, unidade: "saco", estoqueMinimo: 1, custoUnitario: 50.00 },
  { id: 108, nome: "Guaravita", categoria: "Bebidas", quantidade: 48, unidade: "un", estoqueMinimo: 24, custoUnitario: 1.10 }
];

// --- ESTADO DO ESTOQUE ---
let estoque = JSON.parse(localStorage.getItem('estoque_acai')) || estoquePadrao;

// --- ELEMENTOS DO DOM ---
let elTabelaEstoqueCorpo, elFormEstoque;

document.addEventListener('DOMContentLoaded', () => {
  elTabelaEstoqueCorpo = document.getElementById('tabela-estoque-corpo');
  elFormEstoque = document.getElementById('form-estoque');

  if (elFormEstoque) {
    elFormEstoque.addEventListener('submit', salvarItemEstoque);
    document.getElementById('btn-cancelar-estoque')?.addEventListener('click', limparFormEstoque);
  }

  renderEstoque();
});

// --- RENDERIZAÇÃO DA TABELA E METRICAS ---
function renderEstoque() {
  if (!elTabelaEstoqueCorpo) return;

  elTabelaEstoqueCorpo.innerHTML = '';

  let totalItens = estoque.length;
  let itensCriticos = 0;
  let valorInvestidoTotal = 0;

  estoque.forEach(item => {
    const totalItem = item.quantidade * item.custoUnitario;
    valorInvestidoTotal += totalItem;

    const isBaixo = item.quantidade <= item.estoqueMinimo;
    if (isBaixo) itensCriticos++;

    const badgeStatus = isBaixo 
      ? `<span class="badge-status status-late">🔴 Baixo</span>`
      : `<span class="badge-status status-ok">🟢 OK</span>`;

    elTabelaEstoqueCorpo.innerHTML += `
      <tr>
        <td>${badgeStatus}</td>
        <td><strong>${item.nome}</strong></td>
        <td>${item.categoria}</td>
        <td><strong>${item.quantidade}</strong> <small>${item.unidade}</small></td>
        <td>${item.estoqueMinimo} <small>${item.unidade}</small></td>
        <td>R$ ${item.custoUnitario.toFixed(2).replace('.', ',')}</td>
        <td>R$ ${totalItem.toFixed(2).replace('.', ',')}</td>
        <td class="text-center">
          <button class="btn btn-secondary" style="padding: 2px 6px;" title="Entrada de Carga" onclick="ajustarQuantidade(${item.id}, 'entrada')">➕</button>
          <button class="btn btn-danger" style="padding: 2px 6px;" title="Dar Baixa/Avaria" onclick="ajustarQuantidade(${item.id}, 'saida')">➖</button>
          <button class="btn-edit" title="Editar Insumo" onclick="editarItemEstoque(${item.id})">✏️</button>
          <button class="btn-del" title="Excluir" onclick="excluirItemEstoque(${item.id})">X</button>
        </td>
      </tr>
    `;
  });

  // Atualizar Dashboard do Topo do Estoque
  if (document.getElementById('st-est-total')) document.getElementById('st-est-total').textContent = totalItens;
  if (document.getElementById('st-est-criticos')) document.getElementById('st-est-criticos').textContent = itensCriticos;
  if (document.getElementById('st-est-valor')) document.getElementById('st-est-valor').textContent = `R$ ${valorInvestidoTotal.toFixed(2).replace('.', ',')}`;
}

// --- ENTRADA E SAÍDA RÁPIDA DE CARGA ---
function ajustarQuantidade(id, tipo) {
  const item = estoque.find(i => i.id === id);
  if (!item) return;

  const acao = tipo === 'entrada' ? 'adicionar ao' : 'remover do';
  const qtdInput = prompt(`Informe a quantidade que deseja ${acao} estoque de "${item.nome}":`, "1");

  if (qtdInput === null) return;
  const qtd = parseFloat(qtdInput);

  if (isNaN(qtd) || qtd <= 0) {
    return alert("Por favor, digite um número válido.");
  }

  if (tipo === 'entrada') {
    item.quantidade += qtd;
  } else {
    if (qtd > item.quantidade) {
      return alert("A quantidade de baixa não pode ser maior do que o estoque atual.");
    }
    item.quantidade -= qtd;
  }

  salvarStorageEstoque();
  renderEstoque();
}

// --- CADASTRO E EDIÇÃO ---
function salvarItemEstoque(e) {
  e.preventDefault();

  const id = document.getElementById('est-id').value;
  const nome = document.getElementById('est-nome').value.trim();
  const categoria = document.getElementById('est-categoria').value.trim();
  const quantidade = parseFloat(document.getElementById('est-qtd').value) || 0;
  const unidade = document.getElementById('est-unidade').value;
  const estoqueMinimo = parseFloat(document.getElementById('est-minimo').value) || 0;
  const custoUnitario = parseFloat(document.getElementById('est-custo').value) || 0;

  if (id) {
    const idx = estoque.findIndex(i => i.id === parseInt(id));
    if (idx !== -1) {
      estoque[idx] = { id: parseInt(id), nome, categoria, quantidade, unidade, estoqueMinimo, custoUnitario };
    }
  } else {
    estoque.push({ id: Date.now(), nome, categoria, quantidade, unidade, estoqueMinimo, custoUnitario });
  }

  salvarStorageEstoque();
  limparFormEstoque();
  renderEstoque();
  alert("Insumo salvo no estoque!");
}

function editarItemEstoque(id) {
  const item = estoque.find(i => i.id === id);
  if (!item) return;

  document.getElementById('est-id').value = item.id;
  document.getElementById('est-nome').value = item.nome;
  document.getElementById('est-categoria').value = item.categoria;
  document.getElementById('est-qtd').value = item.quantidade;
  document.getElementById('est-unidade').value = item.unidade;
  document.getElementById('est-minimo').value = item.estoqueMinimo;
  document.getElementById('est-custo').value = item.custoUnitario;

  document.getElementById('est-form-title').textContent = "Editar Insumo";
  document.getElementById('btn-cancelar-estoque').style.display = "block";
}

function excluirItemEstoque(id) {
  if (confirm("Tem certeza que deseja remover este item do estoque?")) {
    estoque = estoque.filter(i => i.id !== id);
    salvarStorageEstoque();
    renderEstoque();
  }
}

function limparFormEstoque() {
  if (elFormEstoque) elFormEstoque.reset();
  document.getElementById('est-id').value = '';
  document.getElementById('est-form-title').textContent = "Cadastrar Novo Insumo";
  document.getElementById('btn-cancelar-estoque').style.display = "none";
}

function salvarStorageEstoque() {
  localStorage.setItem('estoque_acai', JSON.stringify(estoque));
}