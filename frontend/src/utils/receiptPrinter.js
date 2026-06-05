import { getName, money } from './format.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function line(label, value) {
  if (value === undefined || value === null || value === '') return '';
  return `<div class="line"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`;
}

function getEntregadorName(entrega) {
  if (entrega.tipo_entregador === 'Terceirizado') {
    return entrega.entregador_terceirizado?.nome || 'Terceirizado';
  }

  return getName(entrega.entregador);
}

function paymentDetails(entrega) {
  if (entrega.forma_pagamento === 'Dinheiro') {
    return `
      ${line('Valor pago', money(entrega.valor_pago_dinheiro))}
      ${line('Troco', money(entrega.troco))}
    `;
  }

  if (entrega.forma_pagamento !== 'Pagamento Combinado' || !entrega.pagamentos_combinados?.length) {
    return '';
  }

  return `
    <div class="divider"></div>
    <strong>Pagamentos</strong>
    ${entrega.pagamentos_combinados.map((item) => `
      ${line(item.forma, money(item.valor))}
      ${item.forma === 'Dinheiro' ? line('Pago dinheiro', money(item.valor_pago)) : ''}
      ${item.forma === 'Dinheiro' ? line('Troco', money(item.troco)) : ''}
    `).join('')}
  `;
}

function buildReceiptHtml(entrega) {
  const endereco = [
    entrega.logradouro,
    entrega.numero ? `Nº ${entrega.numero}` : '',
    entrega.bairro,
    entrega.cidade
  ].filter(Boolean).join(', ');

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Entrega ${escapeHtml(entrega.cadastro_loja || entrega._id || '')}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #000;
            background: #fff;
            font-family: "Courier New", monospace;
            font-size: 12px;
            line-height: 1.35;
          }
          .receipt { width: 72mm; margin: 0 auto; }
          .center { text-align: center; }
          h1 {
            margin: 0 0 6px;
            font-size: 17px;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          .muted { margin: 0 0 8px; font-size: 11px; }
          .divider {
            margin: 8px 0;
            border-top: 1px dashed #000;
          }
          .line {
            display: grid;
            grid-template-columns: 26mm 1fr;
            gap: 4px;
            margin: 3px 0;
            word-break: break-word;
          }
          .line strong { text-transform: uppercase; }
          .total {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #000;
            font-size: 14px;
            font-weight: 700;
          }
          .obs {
            margin-top: 8px;
            padding: 6px 0;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            white-space: pre-wrap;
          }
          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <main class="receipt">
          <section class="center">
            <h1>Jac Delivery</h1>
            <p class="muted">Comprovante de entrega</p>
            <p class="muted">${escapeHtml(new Date().toLocaleString('pt-BR'))}</p>
          </section>
          <div class="divider"></div>
          ${line('Pedido', entrega.cadastro_loja || entrega._id)}
          ${line('Cliente', entrega.cliente)}
          ${line('Telefone', entrega.telefone)}
          ${line('Endereço', endereco)}
          ${line('Vendedor', getName(entrega.vendedor))}
          ${line('Entregador', getEntregadorName(entrega))}
          ${line('Tipo', entrega.tipo_entregador)}
          ${line('Pagamento', entrega.forma_pagamento)}
          ${line('Status', entrega.status)}
          <div class="divider"></div>
          ${line('Valor', money(entrega.valor))}
          ${line('Taxa', money(entrega.taxa_entrega))}
          ${line('Corrida', money(entrega.valor_corrida))}
          <div class="line total"><strong>Total</strong><span>${escapeHtml(money(Number(entrega.valor || 0) + Number(entrega.taxa_entrega || 0)))}</span></div>
          ${paymentDetails(entrega)}
          ${entrega.observacoes ? `<div class="obs"><strong>Observações</strong><br />${escapeHtml(entrega.observacoes)}</div>` : ''}
          <div class="divider"></div>
          <p class="center muted">Via do entregador</p>
        </main>
      </body>
    </html>
  `;
}

export function printDeliveryReceipt(entrega) {
  const frame = document.createElement('iframe');
  frame.setAttribute('title', 'Impressão de entrega');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';

  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  const frameDocument = frame.contentDocument || frameWindow.document;
  frameDocument.open();
  frameDocument.write(buildReceiptHtml(entrega));
  frameDocument.close();

  window.setTimeout(() => {
    frameWindow.focus();
    frameWindow.print();
    window.setTimeout(() => frame.remove(), 1000);
  }, 150);
}
