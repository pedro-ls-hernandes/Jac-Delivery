import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUserCheck, faUserSlash } from '@fortawesome/free-solid-svg-icons';
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

export function PessoasPage({ tipo, items, refresh, setMessage }) {
  const isEntregador = tipo === 'entregador';
  const endpoint = isEntregador ? '/entregadores' : '/vendedores';
  const title = isEntregador ? 'Entregadores' : 'Vendedores';
  const singular = isEntregador ? 'entregador' : 'vendedor';
  const [form, setForm] = useState(INITIAL_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
    setForm(INITIAL_FORM);
  }

  async function submit(event) {
    event.preventDefault();

    try {
      await request(endpoint, { method: 'POST', body: JSON.stringify(form) });
      setMessage(`${singular[0].toUpperCase()}${singular.slice(1)} cadastrado com sucesso.`);
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
      <PageHeader title={title} actionLabel={`Cadastrar ${singular}`} onAction={() => setIsModalOpen(true)} actionIcon={faPlus} />
      <DataTable
        //title={title}
        rows={items}
        columns={[
          ...columns,
          {
            label: 'Ações',
            render: (row) => (
              <button onClick={() => status(row._id, row.status === 'Ativo' ? 'Inativo' : 'Ativo')}>
                <FontAwesomeIcon icon={row.status === 'Ativo' ? faUserSlash : faUserCheck} />
                {row.status === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            )
          }
        ]}
        empty={`Nenhum ${title.toLowerCase()} cadastrado.`}
      />

      {isModalOpen && (
        <Modal title={`Cadastrar ${singular}`} onClose={closeModal}>
          <FormPanel title={`Dados do ${singular}`} onSubmit={submit} submitLabel="Salvar cadastro">
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
