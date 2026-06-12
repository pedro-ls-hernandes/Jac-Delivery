import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { Modal } from './Modal.jsx';
import { getName, money } from '../utils/format.js';
import { printDeliveryReceipt } from '../utils/receiptPrinter.js';

function deliveryDate(entrega) {
  const date = entrega.data_criacao || entrega.createdAt || entrega.updatedAt;
  return date ? new Date(date).toLocaleString('pt-BR') : '-';
}

function getEntregadorName(entrega) {
  if (entrega.tipo_entregador === 'Terceirizado') {
    return entrega.entregador_terceirizado?.nome || 'Terceirizado';
  }

  return getName(entrega.entregador);
}

function getOrderLabel(entrega) {
  const dailyOrder = entrega.ordem_cadastro_dia || entrega.ordem;
  const databaseOrder = entrega.cadastro_loja || entrega._id;

  if (dailyOrder && databaseOrder) {
    return `${dailyOrder} - Banco: ${databaseOrder}`;
  }

  return dailyOrder || databaseOrder;
}

function getCancellationReason(entrega) {
  return entrega.motivo_cancelamento || entrega.justificativa_cancelamento || entrega.motivo || entrega.justificativa || '';
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function PaymentDetails({ entrega }) {
  if (entrega.forma_pagamento === 'Dinheiro') {
    return (
      <>
        <DetailItem label="Valor pago" value={money(entrega.valor_pago_dinheiro)} />
        <DetailItem label="Troco" value={money(entrega.troco)} />
      </>
    );
  }

  if (entrega.forma_pagamento !== 'Pagamento Combinado' || !entrega.pagamentos_combinados?.length) {
    return null;
  }

  return (
    <div className="detail-list full">
      <h3>Pagamentos combinados</h3>
      {entrega.pagamentos_combinados.map((item, index) => (
        <div className="detail-payment" key={`${item.forma}-${index}`}>
          <DetailItem label="Forma" value={item.forma} />
          <DetailItem label="Valor" value={money(item.valor)} />
          {item.forma === 'Dinheiro' && <DetailItem label="Valor pago" value={money(item.valor_pago)} />}
          {item.forma === 'Dinheiro' && <DetailItem label="Troco" value={money(item.troco)} />}
        </div>
      ))}
    </div>
  );
}

export function DeliveryDetailsModal({ entrega, onClose }) {
  if (!entrega) return null;

  const canReprint = entrega.status !== 'Cancelada';
  const cancellationReason = getCancellationReason(entrega);
  const endereco = [
    entrega.logradouro,
    entrega.numero ? `Nº ${entrega.numero}` : '',
    entrega.bairro,
    entrega.cidade
  ].filter(Boolean).join(', ');

  return (
    <Modal title="Detalhes da entrega" onClose={onClose}>
      <div className="details-panel">
        {canReprint && (
          <div className="details-actions">
            <button className="secondary" type="button" onClick={() => printDeliveryReceipt(entrega)}>
              <FontAwesomeIcon icon={faPrint} />
              Reimprimir
            </button>
          </div>
        )}

        <div className="details-grid">
          <DetailItem label="Pedido" value={getOrderLabel(entrega)} />
          <DetailItem label="Data" value={deliveryDate(entrega)} />
          <DetailItem label="Status" value={entrega.status} />
          <DetailItem label="Cliente" value={entrega.cliente} />
          <DetailItem label="Telefone" value={entrega.telefone} />
          <DetailItem label="Endereço" value={endereco} />
          <DetailItem label="Vendedor" value={getName(entrega.vendedor)} />
          <DetailItem label="Entregador" value={getEntregadorName(entrega)} />
          <DetailItem label="Tipo de entregador" value={entrega.tipo_entregador} />
          <DetailItem label="Pagamento" value={entrega.forma_pagamento} />
          <DetailItem label="Valor" value={money(entrega.valor)} />
          <DetailItem label="Taxa" value={money(entrega.taxa_entrega)} />
          <DetailItem label="Corrida" value={money(entrega.valor_corrida)} />
          <DetailItem label="Total" value={money(entrega.valor)} />
          <PaymentDetails entrega={entrega} />
          {entrega.entregador_terceirizado?.telefone && <DetailItem label="Telefone terceirizado" value={entrega.entregador_terceirizado.telefone} />}
          {entrega.entregador_terceirizado?.documento && <DetailItem label="Documento terceirizado" value={entrega.entregador_terceirizado.documento} />}
          {entrega.status === 'Cancelada' && (
            <div className="detail-item full">
              <span>Motivo do cancelamento</span>
              <strong>{cancellationReason || 'Não informado'}</strong>
            </div>
          )}
          {entrega.observacoes && (
            <div className="detail-item full">
              <span>Observações</span>
              <strong>{entrega.observacoes}</strong>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

