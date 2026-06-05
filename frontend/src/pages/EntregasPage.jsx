import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faHandHolding, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { request } from '../api/client.js';
import { CIDADES, FORMAS_PAGAMENTO, STATUS_ENTREGA } from '../constants/domain.js';
import { DataTable } from '../components/DataTable.jsx';
import { deliveryColumns } from '../components/DeliveryColumns.jsx';
import { FormPanel, Input, Select } from '../components/FormControls.jsx';
import { Modal } from '../components/Modal.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { isTodayDelivery, sortDeliveriesByDayOrder } from '../utils/deliverySort.js';
import { formatCurrencyInput, formatPhone, parseCurrencyInput } from '../utils/format.js';

function entregaToForm(entrega) {
  return {
    cliente: entrega.cliente || '',
    telefone: entrega.telefone || '',
    logradouro: entrega.logradouro || '',
    numero: entrega.numero || '',
    bairro: entrega.bairro || '',
    cidade: entrega.cidade || 'Jaú',
    observacoes: entrega.observacoes || '',
    valor: formatCurrencyInput(String(Math.round(Number(entrega.valor || 0) * 100))),
    taxa_entrega: formatCurrencyInput(String(Math.round(Number(entrega.taxa_entrega || 0) * 100))),
    valor_corrida: formatCurrencyInput(String(Math.round(Number(entrega.valor_corrida || 0) * 100))),
    forma_pagamento: entrega.forma_pagamento || 'Dinheiro'
  };
}

export function EntregasPage({ data, refresh, setMessage, go }) {
  const [status, setStatus] = useState('');
  const [editingEntrega, setEditingEntrega] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const todayRows = data.entregas.filter(isTodayDelivery);
  const rows = sortDeliveriesByDayOrder(status ? todayRows.filter((item) => item.status === status) : todayRows);

  async function action(id, name) {
    try {
      await request(`/entregas/${id}/${name}`, { method: 'POST' });
      setMessage('Entrega atualizada com sucesso.');
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function openEdit(entrega) {
    setEditingEntrega(entrega);
    setEditForm(entregaToForm(entrega));
  }

  function closeEdit() {
    setEditingEntrega(null);
    setEditForm(null);
  }

  async function submitEdit(event) {
    event.preventDefault();

    try {
      await request(`/entregas/${editingEntrega._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editForm,
          valor: parseCurrencyInput(editForm.valor),
          taxa_entrega: parseCurrencyInput(editForm.taxa_entrega),
          valor_corrida: parseCurrencyInput(editForm.valor_corrida)
        })
      });
      setMessage('Entrega editada com sucesso.');
      closeEdit();
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function renderActions(row) {
    if (row.status === 'Cancelada') {
      return <span className="table-warning">Entrega cancelada</span>;
    }

    if (row.status === 'Confirmada') {
      return (
        <div className="table-actions">
          <button onClick={() => openEdit(row)}><FontAwesomeIcon icon={faPenToSquare} />Editar</button>
        </div>
      );
    }

    return (
      <div className="table-actions">
        <button onClick={() => openEdit(row)}><FontAwesomeIcon icon={faPenToSquare} />Editar</button>
        <button onClick={() => action(row._id, 'coletar')}><FontAwesomeIcon icon={faHandHolding} />Coletar</button>
        <button onClick={() => action(row._id, 'confirmar')}><FontAwesomeIcon icon={faCheck} />Confirmar</button>
        <button className="danger" onClick={() => action(row._id, 'cancelar')}><FontAwesomeIcon icon={faBan} />Cancelar</button>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <PageHeader title="Entregas" actionLabel="Nova entrega" onAction={() => go('nova-entrega')} />
      <select className="compact-filter" value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="">Todos os status</option>
        {STATUS_ENTREGA.map((item) => <option key={item}>{item}</option>)}
      </select>
      <DataTable
        rows={rows}
        columns={[
          ...deliveryColumns({ showDailyOrder: true }),
          { label: 'Ações', render: renderActions }
        ]}
        empty="Nenhuma entrega encontrada para hoje."
      />

      {editingEntrega && editForm && (
        <Modal title="Editar entrega" onClose={closeEdit}>
          <FormPanel title="Dados da entrega" onSubmit={submitEdit} submitLabel="Salvar alterações">
            <Input label="Cliente" value={editForm.cliente} set={(value) => setEditForm({ ...editForm, cliente: value })} />
            <Input label="Telefone" value={editForm.telefone} set={(value) => setEditForm({ ...editForm, telefone: formatPhone(value) })} pattern="\(\d{2}\) \d{4,5}-\d{4}" title="Use o formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx" />
            <Input label="Logradouro" value={editForm.logradouro} set={(value) => setEditForm({ ...editForm, logradouro: value })} />
            <Input label="Número" value={editForm.numero} set={(value) => setEditForm({ ...editForm, numero: value })} required={false} />
            <Input label="Bairro" value={editForm.bairro} set={(value) => setEditForm({ ...editForm, bairro: value })} />
            <Select label="Cidade" value={editForm.cidade} set={(value) => setEditForm({ ...editForm, cidade: value })} options={CIDADES} />
            <Input label="Valor" inputMode="numeric" value={editForm.valor} set={(value) => setEditForm({ ...editForm, valor: formatCurrencyInput(value) })} />
            <Input label="Taxa de entrega" inputMode="numeric" value={editForm.taxa_entrega} set={(value) => setEditForm({ ...editForm, taxa_entrega: formatCurrencyInput(value) })} required={false} />
            <Input label="Valor corrida" inputMode="numeric" value={editForm.valor_corrida} set={(value) => setEditForm({ ...editForm, valor_corrida: formatCurrencyInput(value) })} required={false} />
            <Select label="Forma de pagamento" value={editForm.forma_pagamento} set={(value) => setEditForm({ ...editForm, forma_pagamento: value })} options={FORMAS_PAGAMENTO} />
            <label className="full">
              Observações
              <textarea value={editForm.observacoes} onChange={(event) => setEditForm({ ...editForm, observacoes: event.target.value })} />
            </label>
          </FormPanel>
        </Modal>
      )}
    </section>
  );
}
