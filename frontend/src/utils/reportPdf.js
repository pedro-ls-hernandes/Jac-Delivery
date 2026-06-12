import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getName, money } from './format.js';

function getEntregaDate(entrega) {
  return new Date(entrega.data_criacao || entrega.createdAt || entrega.updatedAt || Date.now());
}

function getEntregadorName(entrega) {
  if (entrega.tipo_entregador === 'Terceirizado') {
    return entrega.entregador_terceirizado?.nome || 'Terceirizado';
  }

  return getName(entrega.entregador);
}

function formatPeriod(filters) {
  const inicio = filters.inicio || 'início';
  const fim = filters.fim || 'fim';
  return `${inicio} até ${fim}`;
}

function groupByDay(entregas) {
  return entregas.reduce((groups, entrega) => {
    const date = getEntregaDate(entrega);
    const key = date.toISOString().slice(0, 10);

    if (!groups[key]) {
      groups[key] = { date, entregas: [] };
    }

    groups[key].entregas.push(entrega);
    return groups;
  }, {});
}

function drawReportHeader(doc, filters, generatedAt, activeFilters) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Jac Delivery - Relatório de Entregas', 40, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Período: ${formatPeriod(filters)}`, 40, 62);
  doc.text(`Gerado em: ${generatedAt}`, 40, 78);

  if (activeFilters.length) {
    doc.text(`Filtros: ${activeFilters.join(' | ')}`, 40, 94);
  }
}

export function generateDeliveriesPdf(entregas, filters = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const generatedAt = new Date().toLocaleString('pt-BR');
  const activeFilters = [
    filters.status ? `Status: ${filters.status}` : null,
    filters.vendedorNome ? `Vendedor: ${filters.vendedorNome}` : null,
    filters.entregadorNome ? `Entregador: ${filters.entregadorNome}` : null,
    filters.cidade ? `Cidade: ${filters.cidade}` : null
  ].filter(Boolean);

  drawReportHeader(doc, filters, generatedAt, activeFilters);

  const totals = entregas.reduce((acc, entrega) => {
    acc.valor += Number(entrega.valor || 0);
    acc.taxa += Number(entrega.taxa_entrega || 0);
    return acc;
  }, { valor: 0, taxa: 0 });

  const dayGroups = Object.values(groupByDay(entregas)).sort((first, second) => first.date - second.date);
  let startY = activeFilters.length ? 112 : 98;

  if (!dayGroups.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Nenhuma entrega encontrada para os filtros aplicados.', 40, startY);
  }

  dayGroups.forEach((group) => {
    const dayTotal = group.entregas.reduce((sum, entrega) => sum + Number(entrega.valor || 0), 0);
    const dayTaxTotal = group.entregas.reduce((sum, entrega) => sum + Number(entrega.taxa_entrega || 0), 0);

    if (startY > 500) {
      doc.addPage();
      startY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${group.date.toLocaleDateString('pt-BR')} - ${group.entregas.length} entregas - ${money(dayTotal)}`, 40, startY);

    autoTable(doc, {
      startY: startY + 10,
      head: [[
        '#',
        'Pedido',
        'Cliente',
        'Telefone',
        'Endereço',
        'Vendedor',
        'Entregador',
        'Cidade',
        'Status',
        'Pagamento',
        'Valor'
      ]],
      body: group.entregas.map((entrega, index) => [
        index + 1,
        entrega.ordem_cadastro_dia || entrega.ordem || '-',
        entrega.cliente || '-',
        entrega.telefone || '-',
        [entrega.logradouro, entrega.numero, entrega.bairro].filter(Boolean).join(', '),
        getName(entrega.vendedor),
        getEntregadorName(entrega),
        entrega.cidade || '-',
        entrega.status || '-',
        entrega.forma_pagamento || '-',
        money(entrega.valor)
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [63, 69, 145],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 44 },
        2: { cellWidth: 88 },
        4: { cellWidth: 130 },
        10: { halign: 'right' }
      },
      margin: { left: 40, right: 40 }
    });

    startY = doc.lastAutoTable.finalY + 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Subtotal do dia: ${money(dayTotal)} | Taxas: ${money(dayTaxTotal)}`, 40, startY);
    startY += 24;
  });

  const finalY = (doc.lastAutoTable?.finalY || startY) + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`\nTotal de entregas: ${entregas.length}`, 40, finalY);
  doc.text(`\nValor total: ${money(totals.valor)}`, 190, finalY);
  doc.text(`\nTaxas: ${money(totals.taxa)}`, 340, finalY);

  doc.save(`relatorio-entregas-${new Date().toISOString().slice(0, 10)}.pdf`);
}

