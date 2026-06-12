import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faPlus, faUserCheck, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { request } from '../api/client.js';
import { DataTable } from '../components/DataTable.jsx';
import { FormPanel, Input } from '../components/FormControls.jsx';
import { Modal } from '../components/Modal.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatPhone } from '../utils/format.js';

const INITIAL_FORM = {
  name: '',
  cpf: '',
  telefone: '',
  email: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  numero_venda: '',
  user_login: '',
  password: '',
  status: 'Ativo'
};

const EDITABLE_FIELDS = [
  'name',
  'cpf',
  'telefone',
  'email',
  'logradouro',
  'numero',
  'bairro',
  'cidade',
  'numero_venda',
  'user_login',
  'password',
  'status'
];

export function PessoasPage({ tipo, items, refresh, setMessage }) {
  const isEntregador = tipo === 'entregador';
  const endpoint = isEntregador ? '/entregadores' : '/vendedores';
  const title = isEntregador ? 'Entregadores' : 'Vendedores';
  const singular = isEntregador ? 'entregador' : 'vendedor';
  const [form, setForm] = useState(INITIAL_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  function openCreateModal() {
    setEditingItem(null);
    setForm(INITIAL_FORM);
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setForm({
      ...INITIAL_FORM,
      ...item,
      password: ''
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(INITIAL_FORM);
  }

  async function submit(event) {
    event.preventDefault();
    const payload = EDITABLE_FIELDS.reduce((data, field) => {
      data[field] = form[field];
      return data;
    }, {});

    if (editingItem && !payload.password) {
      delete payload.password;
    }

    try {
      await request(editingItem ? `${endpoint}/${editingItem._id}` : endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setMessage(`${singular[0].toUpperCase()}${singular.slice(1)} ${editingItem ? 'atualizado' : 'cadastrado'} com sucesso.`);
      closeModal();
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function status(id, next) {
    try {
      await request(`${endpoint}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next })
      });
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const columns = isEntregador
    ? [
      { label: 'Nome', render: (row) => row.name },
      { label: 'Telefone', render: (row) => row.telefone },
      { label: 'Cidade', render: (row) => row.cidade },
      { label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
    ]
    : [
      { label: 'Nome', render: (row) => row.name },
      { label: 'Número venda', render: (row) => row.numero_venda },
      { label: 'Login', render: (row) => row.user_login || '-' },
      { label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
    ];

  return (
    <section className="page-stack">
      <PageHeader title={title} actionLabel={`Cadastrar ${singular}`} onAction={openCreateModal} actionIcon={faPlus} />
      <DataTable
        //title={title}
        rows={items}
        columns={[
          ...columns,
          {
            label: 'Ações',
            render: (row) => (
              <div className="table-actions">
                <button onClick={() => openEditModal(row)}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                  Editar
                </button>
                <button onClick={() => status(row._id, row.status === 'Ativo' ? 'Inativo' : 'Ativo')}>
                  <FontAwesomeIcon icon={row.status === 'Ativo' ? faUserSlash : faUserCheck} />
                  {row.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                </button>
              </div>
            )
          }
        ]}
        empty={`Nenhum ${title.toLowerCase()} cadastrado.`}
      />

      {isModalOpen && (
        <Modal title={`${editingItem ? 'Editar' : 'Cadastrar'} ${singular}`} onClose={closeModal}>
          <FormPanel title={`Dados do ${singular}`} onSubmit={submit} submitLabel={editingItem ? 'Salvar alterações' : 'Salvar cadastro'}>
            <Input label="Nome" value={form.name} set={(value) => setForm({ ...form, name: value })} />
            {isEntregador ? (
              <>
                <Input label="CPF" value={form.cpf} set={(value) => setForm({ ...form, cpf: value })} />
                <Input label="Telefone" value={form.telefone} set={(value) => setForm({ ...form, telefone: formatPhone(value) })} pattern="\(\d{2}\) \d{4,5}-\d{4}" title="Use o formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx" />
                <Input label="Email" type="email" value={form.email} set={(value) => setForm({ ...form, email: value })} />
                <Input label="Logradouro" value={form.logradouro} set={(value) => setForm({ ...form, logradouro: value })} />
                <Input label="Número" value={form.numero} set={(value) => setForm({ ...form, numero: value })} required={false} />
                <Input label="Bairro" value={form.bairro} set={(value) => setForm({ ...form, bairro: value })} />
                <Input label="Cidade" value={form.cidade} set={(value) => setForm({ ...form, cidade: value })} />
              </>
            ) : (
              <Input label="Número Vendedor" value={form.numero_venda} set={(value) => setForm({ ...form, numero_venda: value })} />
            )}
            <Input label="Login" value={form.user_login} set={(value) => setForm({ ...form, user_login: value })} required={false} />
            <Input label="Senha" type="password" value={form.password} set={(value) => setForm({ ...form, password: value })} required={false} />
          </FormPanel>
        </Modal>
      )}
    </section>
  );
}

