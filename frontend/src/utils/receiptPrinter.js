import { getName, money } from './format.js';
import logoUrl from '../assets/logo.png';

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
  const numeroPedido = entrega.ordem_cadastro_dia || entrega.ordem || entrega.cadastro_loja || entrega._id || '';
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
        <title>Entrega ${escapeHtml(numeroPedido)}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #000;
            background: #fff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15px;
            font-weight: 600;
            line-height: 1.42;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt { width: 72mm; margin: 0 auto; }
          .center { text-align: center; }
          .logo {
            display: block;
            width: 38mm;
            max-height: 22mm;
            object-fit: contain;
            margin: 0 auto 5px;
            filter: contrast(1.18) saturate(0);
          }
          h1 {
            margin: 0 0 5px;
            font-size: 21px;
            font-weight: 900;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          .muted {
            margin: 0 0 7px;
            font-size: 13px;
            font-weight: 700;
          }
          .divider {
            margin: 10px 0;
            border-top: 2px dashed #000;
          }
          .line {
            display: grid;
            grid-template-columns: 29mm 1fr;
            gap: 5px;
            margin: 5px 0;
            word-break: break-word;
          }
          .line strong {
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
          }
          .line span {
            font-size: 15px;
            font-weight: 800;
          }
          .total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .total strong,
          .total span {
            font-size: 19px;
            font-weight: 900;
          }
          .obs {
            margin-top: 10px;
            padding: 8px 0;
            border-top: 2px dashed #000;
            border-bottom: 2px dashed #000;
            font-size: 15px;
            font-weight: 800;
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
            <img class="logo" src="${logoUrl}" alt="Jac Delivery" />
            <h1>Jac Delivery</h1>
            <p class="muted">Comprovante de entrega</p>
            <p class="muted">${escapeHtml(new Date().toLocaleString('pt-BR'))}</p>
          </section>
          <div class="divider"></div>
          ${line('Pedido', numeroPedido)}
          ${line('Cliente', entrega.cliente)}
          ${line('Telefone', entrega.telefone)}
          ${line('Endereço', endereco)}
          ${line('Vendedor', getName(entrega.vendedor))}
          ${line('Entregador', getEntregadorName(entrega))}
          ${line('Pagamento', entrega.forma_pagamento)}
          <div class="divider"></div>
          ${line('Valor', money(entrega.valor))}
          ${line('Taxa de entrega', money(entrega.taxa_entrega))}
          <div class="line total"><strong>Total</strong><span>${escapeHtml(money(entrega.valor))}</span></div>
          ${paymentDetails(entrega)}
          ${entrega.observacoes ? `<div class="obs"><strong>Observações:</strong><br />${escapeHtml(entrega.observacoes)}</div>` : ''}
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

