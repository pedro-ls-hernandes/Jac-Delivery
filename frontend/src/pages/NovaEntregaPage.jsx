import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { request } from '../api/client.js';
import { CIDADES, FORMAS_PAGAMENTO } from '../constants/domain.js';
import { FormPanel, Input, Select } from '../components/FormControls.jsx';
import { printDeliveryReceipt } from '../utils/receiptPrinter.js';
import { formatCurrencyInput, formatPhone, isValidPhone, money, onlyDigits, parseCurrencyInput } from '../utils/format.js';

const INITIAL_FORM = {
  cliente: '',
  telefone: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: 'Jaú',
  vendedor: '',
  tipo_entregador: 'Registrado',
  entregador: '',
  terceirizado_nome: '',
  terceirizado_telefone: '',
  valor: '',
  taxa_entrega: '',
  forma_pagamento: 'Dinheiro',
  valor_pago_dinheiro: '',
  observacoes: ''
};

const INITIAL_PAYMENT = { forma: 'Dinheiro', valor: '', valor_pago: '' };
const TIPOS_ENTREGADOR = ['Registrado', 'Terceirizado'];

function DeliveryTypeRadio({ value, set }) {
  return (
    <fieldset className="delivery-type-radio full">
      <legend>Tipo de entregador</legend>
      <div className="delivery-type-options">
        {TIPOS_ENTREGADOR.map((tipo) => (
          <label className={value === tipo ? 'delivery-type-option active' : 'delivery-type-option'} key={tipo}>
            <input
              type="radio"
              name="tipo_entregador"
              value={tipo}
              checked={value === tipo}
              onChange={(event) => set(event.target.value)}
            />
            <span>{tipo}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="form-section full">
      <h3>{title}</h3>
      <div className="form-section-grid">{children}</div>
    </section>
  );
}

export function NovaEntregaPage({ data, refresh, setMessage, navigate }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [pagamentosCombinados, setPagamentosCombinados] = useState([{ ...INITIAL_PAYMENT }]);
  const [clienteStatus, setClienteStatus] = useState('');

  const totalPedido = useMemo(() => parseCurrencyInput(form.valor), [form.valor]);

  const trocoDinheiro = Math.max(parseCurrencyInput(form.valor_pago_dinheiro) - totalPedido, 0);
  const isDinheiro = form.forma_pagamento === 'Dinheiro';
  const isCombinado = form.forma_pagamento === 'Pagamento Combinado';

  useEffect(() => {
    const telefone = onlyDigits(form.telefone);

    if (telefone.length < 10) {
      setClienteStatus('');
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setClienteStatus('Consultando cliente...');
        const cliente = await request(`/clientes/telefone/${telefone}`);

        if (!cliente) {
          setClienteStatus('Cliente ainda não encontrado.');
          return;
        }

        setForm((current) => ({
          ...current,
          cliente: cliente.name || current.cliente,
          telefone: current.telefone,
          logradouro: cliente.logradouro || current.logradouro,
          numero: cliente.numero || current.numero,
          bairro: cliente.bairro || current.bairro,
          cidade: cliente.cidade || current.cidade
        }));
        setClienteStatus('Cliente encontrado. Endereço preenchido automaticamente.');
      } catch (error) {
        setClienteStatus('');
      }
    }, 550);

    return () => window.clearTimeout(timeout);
  }, [form.telefone]);

  function updatePagamento(index, field, value) {
    setPagamentosCombinados((items) => items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  function addPagamento() {
    setPagamentosCombinados((items) => [...items, { ...INITIAL_PAYMENT }]);
  }

  function removePagamento(index) {
    setPagamentosCombinados((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function buildPagamentosCombinados() {
    if (!isCombinado) return [];

    return pagamentosCombinados
      .filter((item) => item.forma && parseCurrencyInput(item.valor) > 0)
      .map((item) => {
        const valor = parseCurrencyInput(item.valor);
        const valorPago = item.forma === 'Dinheiro' ? parseCurrencyInput(item.valor_pago) : 0;

        return {
          forma: item.forma,
          valor,
          valor_pago: valorPago,
          troco: item.forma === 'Dinheiro' ? Math.max(valorPago - valor, 0) : 0
        };
      });
  }

  async function submit(event) {
    event.preventDefault();
    const pagamentos = buildPagamentosCombinados();

    const payload = {
      ...form,
      valor: parseCurrencyInput(form.valor),
      taxa_entrega: parseCurrencyInput(form.taxa_entrega),
      valor_pago_dinheiro: isDinheiro ? parseCurrencyInput(form.valor_pago_dinheiro) : 0,
      troco: isDinheiro ? trocoDinheiro : 0,
      pagamentos_combinados: pagamentos,
      entregador_terceirizado: {
        nome: form.terceirizado_nome,
        telefone: form.terceirizado_telefone
      }
    };

    try {
      const entrega = await request('/entregas', { method: 'POST', body: JSON.stringify(payload) });
      printDeliveryReceipt(entrega);
      setMessage('Entrega criada com sucesso. Comprovante enviado para impressão.');
      setForm({ ...INITIAL_FORM, vendedor: form.vendedor, entregador: form.entregador });
      setPagamentosCombinados([{ ...INITIAL_PAYMENT }]);
      refresh();
      navigate('entregas');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <FormPanel title="Registrar nova entrega" onSubmit={submit} submitLabel="Criar entrega">
      <FormSection title="Informações do cliente">
        <Input label="Telefone" value={form.telefone} set={(value) => setForm({ ...form, telefone: formatPhone(value) })} pattern="\(\d{2}\) \d{4,5}-\d{4}" title="Use o formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx" />
        {form.telefone && !isValidPhone(form.telefone) && <p className="field-hint full">Digite um telefone válido no formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx.</p>}
        {clienteStatus && <p className="field-hint full">{clienteStatus}</p>}
        <Input label="Cliente" value={form.cliente} set={(value) => setForm({ ...form, cliente: value })} />
      </FormSection>

      <FormSection title="Informações de endereço">
        <Input label="Logradouro" value={form.logradouro} set={(value) => setForm({ ...form, logradouro: value })} />
        <Input label="Número" value={form.numero} set={(value) => setForm({ ...form, numero: value })} required={false} />
        <Input label="Bairro" value={form.bairro} set={(value) => setForm({ ...form, bairro: value })} />
        <Select label="Cidade" value={form.cidade} set={(value) => setForm({ ...form, cidade: value })} options={CIDADES} />
      </FormSection>

      <FormSection title="Informações da entrega">
        <Select label="Vendedor" value={form.vendedor} set={(value) => setForm({ ...form, vendedor: value })} options={data.vendedores.filter((item) => item.status === 'Ativo').map((item) => ({ value: item._id, label: `${item.name} - Nº ${item.numero_venda}` }))} />
        <DeliveryTypeRadio value={form.tipo_entregador} set={(value) => setForm({ ...form, tipo_entregador: value })} />
        {form.tipo_entregador === 'Registrado' ? (
          <Select label="Entregador" value={form.entregador} set={(value) => setForm({ ...form, entregador: value })} options={data.entregadores.filter((item) => item.status === 'Ativo').map((item) => ({ value: item._id, label: item.name }))} />
        ) : (
          <>
            <Input label="Nome terceirizado" value={form.terceirizado_nome} set={(value) => setForm({ ...form, terceirizado_nome: value })} />
            <Input label="Telefone terceirizado" value={form.terceirizado_telefone} set={(value) => setForm({ ...form, terceirizado_telefone: formatPhone(value) })} pattern="\(\d{2}\) \d{4,5}-\d{4}" title="Use o formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx" required={false} />
          </>
        )}
        <Input label="Valor" inputMode="numeric" value={form.valor} set={(value) => setForm({ ...form, valor: formatCurrencyInput(value) })} />
        <Input label="Taxa de entrega" inputMode="numeric" value={form.taxa_entrega} set={(value) => setForm({ ...form, taxa_entrega: formatCurrencyInput(value) })} required={false} />
        <Select label="Forma de pagamento" value={form.forma_pagamento} set={(value) => setForm({ ...form, forma_pagamento: value })} options={FORMAS_PAGAMENTO} />

        {isDinheiro && (
          <>
            <Input label="Valor que o cliente vai pagar" inputMode="numeric" value={form.valor_pago_dinheiro} set={(value) => setForm({ ...form, valor_pago_dinheiro: formatCurrencyInput(value) })} required={false} />
            <label>Troco<input value={money(trocoDinheiro)} readOnly /></label>
          </>
        )}

        {isCombinado && (
          <div className="combined-payments full">
            <div className="combined-header">
              <strong>Pagamentos combinados</strong>
              <button type="button" className="secondary" onClick={addPagamento}><FontAwesomeIcon icon={faPlus} />Adicionar forma</button>
            </div>
            {pagamentosCombinados.map((item, index) => {
              const troco = item.forma === 'Dinheiro'
                ? Math.max(parseCurrencyInput(item.valor_pago) - parseCurrencyInput(item.valor), 0)
                : 0;

              return (
                <div className="combined-row" key={`${item.forma}-${index}`}>
                  <Select label="Forma" value={item.forma} set={(value) => updatePagamento(index, 'forma', value)} options={FORMAS_PAGAMENTO.filter((forma) => forma !== 'Pagamento Combinado')} />
                  <Input label="Valor nesta forma" inputMode="numeric" value={item.valor} set={(value) => updatePagamento(index, 'valor', formatCurrencyInput(value))} />
                  {item.forma === 'Dinheiro' && <Input label="Valor pago" inputMode="numeric" value={item.valor_pago} set={(value) => updatePagamento(index, 'valor_pago', formatCurrencyInput(value))} required={false} />}
                  {item.forma === 'Dinheiro' && <label>Troco<input value={money(troco)} readOnly /></label>}
                  <button type="button" className="danger icon-only" onClick={() => removePagamento(index)} disabled={pagamentosCombinados.length === 1}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              );
            })}
          </div>
        )}

        <label className="full">
          Observações
          <textarea value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} />
        </label>
      </FormSection>
    </FormPanel>
  );
}
