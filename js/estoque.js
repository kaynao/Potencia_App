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
let estoque = carregarDoStorage('estoque_acai', estoquePadrao);

// --- ELEMENTOS DO DOM ---
let elTabelaEstoqueCorpo, elFormEstoque;
let elModalAjuste, elModalAjusteTitulo, elModalAjusteQtd;
let ajusteAtual = null; // { id, tipo } do item sendo ajustado no modal

document.addEventListener('DOMContentLoaded', () => {
  elTabelaEstoqueCorpo = document.getElementById('tabela-estoque-corpo');
  elFormEstoque = document.getElementById('form-estoque');

  elModalAjuste = document.getElementById('modal-ajuste-estoque');
  elModalAjusteTitulo = document.getElementById('modal-ajuste-titulo');
  elModalAjusteQtd = document.getElementById('modal-ajuste-qtd');

  if (elFormEstoque) {
    elFormEstoque.addEventListener('submit', salvarItemEstoque);
    document.getElementById('btn-cancelar-estoque')?.addEventListener('click', limparFormEstoque);
  }

  document.getElementById('btn-exportar-estoque')?.addEventListener('click', exportarEstoqueExcel);

  document.getElementById('modal-ajuste-cancelar')?.addEventListener('click', fecharModalAjuste);
  document.getElementById('modal-ajuste-confirmar')?.addEventListener('click', confirmarAjusteModal);
  elModalAjuste?.addEventListener('click', (e) => {
    if (e.target === elModalAjuste) fecharModalAjuste(); // clique fora da caixa fecha o modal
  });
  elModalAjusteQtd?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmarAjusteModal();
  });

  renderEstoque();
});

// --- RENDERIZAÇÃO DA TABELA E METRICAS ---
function renderEstoque() {
  if (!elTabelaEstoqueCorpo) return;

  let totalItens = estoque.length;
  let itensCriticos = 0;
  let valorInvestidoTotal = 0;

  const linhasHtml = estoque.map(item => {
    const totalItem = item.quantidade * item.custoUnitario;
    valorInvestidoTotal += totalItem;

    const isBaixo = item.quantidade <= item.estoqueMinimo;
    if (isBaixo) itensCriticos++;

    const badgeStatus = isBaixo
      ? `<span class="badge-status status-late">🔴 Baixo</span>`
      : `<span class="badge-status status-ok">🟢 OK</span>`;

    return `
      <tr>
        <td>${badgeStatus}</td>
        <td><strong>${escapeHtml(item.nome)}</strong></td>
        <td>${escapeHtml(item.categoria)}</td>
        <td><strong>${item.quantidade}</strong> <small>${escapeHtml(item.unidade)}</small></td>
        <td>${item.estoqueMinimo} <small>${escapeHtml(item.unidade)}</small></td>
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

  elTabelaEstoqueCorpo.innerHTML = linhasHtml.join('');

  // Atualizar Dashboard do Topo do Estoque
  if (document.getElementById('st-est-total')) document.getElementById('st-est-total').textContent = totalItens;
  if (document.getElementById('st-est-criticos')) document.getElementById('st-est-criticos').textContent = itensCriticos;
  if (document.getElementById('st-est-valor')) document.getElementById('st-est-valor').textContent = `R$ ${valorInvestidoTotal.toFixed(2).replace('.', ',')}`;
}

// --- ENTRADA E SAÍDA RÁPIDA DE CARGA (via modal, substitui o antigo prompt()) ---
function ajustarQuantidade(id, tipo) {
  const item = estoque.find(i => i.id === id);
  if (!item || !elModalAjuste) return;

  ajusteAtual = { id, tipo };

  const acao = tipo === 'entrada' ? 'Adicionar ao' : 'Remover do';
  elModalAjusteTitulo.textContent = `${acao} estoque: ${item.nome}`;
  elModalAjusteQtd.value = '';
  elModalAjuste.style.display = 'flex';
  elModalAjusteQtd.focus();
}

function fecharModalAjuste() {
  if (elModalAjuste) elModalAjuste.style.display = 'none';
  ajusteAtual = null;
}

function confirmarAjusteModal() {
  if (!ajusteAtual) return;

  const { id, tipo } = ajusteAtual;
  const item = estoque.find(i => i.id === id);
  if (!item) return fecharModalAjuste();

  const qtd = parseFloat(elModalAjusteQtd.value);
  if (isNaN(qtd) || qtd <= 0) {
    return alert("Por favor, digite um número válido maior que zero.");
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
  fecharModalAjuste();
}

// --- CADASTRO E EDIÇÃO ---
function salvarItemEstoque(e) {
  e.preventDefault();

  const id = document.getElementById('est-id').value;
  const nome = document.getElementById('est-nome').value.trim();
  const categoria = document.getElementById('est-categoria').value.trim();
  const quantidade = parseFloat(document.getElementById('est-qtd').value);
  const unidade = document.getElementById('est-unidade').value;
  const estoqueMinimo = parseFloat(document.getElementById('est-minimo').value);
  const custoUnitario = parseFloat(document.getElementById('est-custo').value);

  if (!nome || isNaN(quantidade) || quantidade < 0 || isNaN(estoqueMinimo) || estoqueMinimo < 0 || isNaN(custoUnitario) || custoUnitario < 0) {
    return alert("Preencha o nome e valores numéricos válidos (quantidade, mínimo e custo).");
  }

  if (id) {
    const idx = estoque.findIndex(i => i.id === parseInt(id));
    if (idx !== -1) {
      estoque[idx] = { id: parseInt(id), nome, categoria, quantidade, unidade, estoqueMinimo, custoUnitario };
    }
  } else {
    estoque.push({ id: gerarId(), nome, categoria, quantidade, unidade, estoqueMinimo, custoUnitario });
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