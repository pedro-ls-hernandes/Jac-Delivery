import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEye, faFileExport, faFilter, faPrint } from '@fortawesome/free-solid-svg-icons';
import { DataTable } from '../components/DataTable.jsx';
import { DeliveryDetailsModal } from '../components/DeliveryDetailsModal.jsx';
import { deliveryColumns } from '../components/DeliveryColumns.jsx';
import { Input, Select } from '../components/FormControls.jsx';
import { Modal } from '../components/Modal.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { isTodayDelivery } from '../utils/deliverySort.js';
import { getName, money } from '../utils/format.js';
import { generateDeliveriesPdf } from '../utils/reportPdf.js';
import { printDeliveryReceipt } from '../utils/receiptPrinter.js';

const STATUS_GROUPS = {
  confirmadas: {
    label: 'Confirmadas',
    color: '#48BA59',
    tone: 'success',
    match: (entrega) => entrega.status === 'Confirmada'
  },
  canceladas: {
    label: 'Canceladas',
    color: '#FF6262',
    tone: 'danger',
    match: (entrega) => entrega.status === 'Cancelada'
  },
  pendentes: {
    label: 'Pendentes',
    color: '#FFD037',
    tone: 'warning',
    match: (entrega) => !['Confirmada', 'Cancelada'].includes(entrega.status)
  }
};

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function toDateInput(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function getEntregaDate(entrega) {
  return new Date(entrega.data_criacao || entrega.createdAt || entrega.updatedAt || Date.now());
}

function getWeekRange(baseDate = new Date()) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function inRange(entrega, inicio, fim) {
  const date = getEntregaDate(entrega);
  const start = inicio ? new Date(`${inicio}T00:00:00`) : null;
  const end = fim ? new Date(`${fim}T23:59:59`) : null;

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

function getId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || '';
}

function findNameById(items, id, formatter = getName) {
  if (!id) return '';
  const item = items.find((current) => current._id === id || current.id === id);
  return item ? formatter(item) : '';
}

function buildTotals(entregas) {
  return Object.entries(STATUS_GROUPS).reduce((acc, [key, group]) => {
    const items = entregas.filter(group.match);
    acc[key] = {
      ...group,
      count: items.length,
      total: items.reduce((sum, entrega) => sum + Number(entrega.valor || 0), 0)
    };
    return acc;
  }, {});
}

function buildWeekData(entregas) {
  const { start, end } = getWeekRange();
  const weekRows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      label: WEEK_DAYS[index],
      date,
      confirmadas: 0,
      canceladas: 0,
      pendentes: 0
    };
  });

  entregas.filter((entrega) => {
    const date = getEntregaDate(entrega);
    return date >= start && date <= end;
  }).forEach((entrega) => {
    const dayIndex = (getEntregaDate(entrega).getDay() + 6) % 7;
    const group = Object.entries(STATUS_GROUPS).find(([, config]) => config.match(entrega))?.[0];
    if (group) weekRows[dayIndex][group] += 1;
  });

  return weekRows;
}

function applyFilters(entregas, filters) {
  return entregas.filter((entrega) => {
    if (!inRange(entrega, filters.inicio, filters.fim)) return false;
    if (filters.status && entrega.status !== filters.status) return false;
    if (filters.cidade && entrega.cidade !== filters.cidade) return false;
    if (filters.vendedor && getId(entrega.vendedor) !== filters.vendedor) return false;
    if (filters.entregador && getId(entrega.entregador) !== filters.entregador) return false;
    return true;
  });
}

function WeeklyBarChart({ rows }) {
  const max = Math.max(1, ...rows.map((row) => row.confirmadas + row.canceladas + row.pendentes));

  return (
    <div className="chart-card chart-card-wide">
      <div className="chart-title">
        <h3>Resumo da semana</h3>
        <span>Entregas por dia</span>
      </div>
      <div className="weekly-chart">
        {rows.map((row) => {
          const total = row.confirmadas + row.canceladas + row.pendentes;
          const height = Math.max((total / max) * 180, total ? 18 : 4);

          return (
            <div className="bar-day" key={row.label}>
              <div className="bar-stack" style={{ height }}>
                <span style={{ height: `${total ? (row.confirmadas / total) * 100 : 0}%`, background: STATUS_GROUPS.confirmadas.color }} />
                <span style={{ height: `${total ? (row.canceladas / total) * 100 : 0}%`, background: STATUS_GROUPS.canceladas.color }} />
                <span style={{ height: `${total ? (row.pendentes / total) * 100 : 0}%`, background: STATUS_GROUPS.pendentes.color }} />
              </div>
              <strong>{total}</strong>
              <small>{row.label}</small>
            </div>
          );
        })}
      </div>
      <ChartLegend />
    </div>
  );
}

function DonutChart({ totals }) {
  const totalCount = Object.values(totals).reduce((sum, item) => sum + item.count, 0);
  let offset = 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="chart-card">
      <div className="chart-title">
        <h3>Total de entregas</h3>
        <span>Distribuição por status</span>
      </div>
      <div className="donut-layout">
        <svg className="donut-chart" viewBox="0 0 120 120" aria-label="Gráfico de rosca">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#ececf2" strokeWidth="18" />
          {Object.entries(totals).map(([key, item]) => {
            const portion = totalCount ? item.count / totalCount : 0;
            const dash = portion * circumference;
            const segment = (
              <circle
                key={key}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 60 60)"
              />
            );
            offset += dash;
            return segment;
          })}
          <text x="60" y="56" textAnchor="middle" className="donut-number">{totalCount}</text>
          <text x="60" y="72" textAnchor="middle" className="donut-label">entregas</text>
        </svg>
        <div className="donut-totals">
          {Object.entries(totals).map(([key, item]) => (
            <div className="donut-total" key={key}>
              <span style={{ background: item.color }} />
              <div>
                <strong>{item.label}</strong>
                <small>{item.count} entregas · {money(item.total)}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="chart-legend">
      {Object.entries(STATUS_GROUPS).map(([key, item]) => (
        <span key={key}><i style={{ background: item.color }} />{item.label}</span>
      ))}
    </div>
  );
}

export function RelatoriosPage({ data }) {
  const weekRange = getWeekRange();
  const [tableRange, setTableRange] = useState({
    inicio: toDateInput(weekRange.start),
    fim: toDateInput(weekRange.end)
  });
  const [filters, setFilters] = useState({
    status: '',
    vendedor: '',
    entregador: '',
    cidade: ''
  });
  const [draftFilters, setDraftFilters] = useState({ ...filters, ...tableRange });
  const [reportDraftFilters, setReportDraftFilters] = useState({ ...filters, ...tableRange });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);

  const tableFilters = useMemo(() => ({ ...filters, ...tableRange }), [filters, tableRange]);
  const tableRows = useMemo(() => (
    applyFilters(data.entregas, tableFilters).sort((first, second) => getEntregaDate(second) - getEntregaDate(first))
  ), [data.entregas, tableFilters]);
  const weekData = useMemo(() => buildWeekData(data.entregas), [data.entregas]);
  const totals = useMemo(() => buildTotals(tableRows), [tableRows]);
  const cityOptions = useMemo(() => (
    Array.from(new Set(data.entregas.map((item) => item.cidade).filter(Boolean)))
  ), [data.entregas]);

  function openFilterModal() {
    setDraftFilters({ ...filters, ...tableRange });
    setIsFilterModalOpen(true);
  }

  function openReportModal() {
    setIsReportModalOpen(true);
  }

  function applyAdvancedFilters(event) {
    event.preventDefault();
    setFilters({
      status: draftFilters.status,
      vendedor: draftFilters.vendedor,
      entregador: draftFilters.entregador,
      cidade: draftFilters.cidade
    });
    setTableRange({ inicio: draftFilters.inicio, fim: draftFilters.fim });
    setIsFilterModalOpen(false);
  }

  function generateReport(event) {
    event.preventDefault();
    const rows = applyFilters(data.entregas, reportDraftFilters);

    generateDeliveriesPdf(rows, {
      ...reportDraftFilters,
      vendedorNome: findNameById(data.vendedores, reportDraftFilters.vendedor, (item) => `${item.name} - Nº ${item.numero_venda}`),
      entregadorNome: findNameById(data.entregadores, reportDraftFilters.entregador)
    });
    setIsReportModalOpen(false);
  }

  return (
    <section className="page-stack">
      <PageHeader title="Relatórios" actionLabel="Gerar relatório" onAction={openReportModal} actionIcon={faFileExport} />

      <div className="reports-grid">
        <WeeklyBarChart rows={weekData} />
        <DonutChart totals={totals} />
      </div>

      <div className="report-summary-grid">
        {Object.entries(totals).map(([key, item]) => (
          <article className={`metric-card metric-${item.tone}`} key={key}>
            <p>{item.label}</p>
            <strong>{money(item.total)}</strong>
            <span>{item.count} entregas no relatório</span>
          </article>
        ))}
      </div>

      <div className="table-report-controls">
        <Input label="De" type="date" value={tableRange.inicio} set={(value) => setTableRange({ ...tableRange, inicio: value })} />
        <Input label="Até" type="date" value={tableRange.fim} set={(value) => setTableRange({ ...tableRange, fim: value })} />
        <button className="secondary" type="button" onClick={openFilterModal}><FontAwesomeIcon icon={faFilter} />Filtros avançados</button>
      </div>

      <DataTable
        title="Base de entregas"
        rows={tableRows}
        columns={[
          { label: 'Data', render: (row) => getEntregaDate(row).toLocaleDateString('pt-BR') },
          ...deliveryColumns(),
          {
            label: 'Ações',
            render: (row) => (
              <div className="table-actions">
                <button onClick={() => setSelectedEntrega(row)}><FontAwesomeIcon icon={faEye} />Detalhes</button>
                {isTodayDelivery(row) && row.status !== 'Cancelada' && (
                  <button onClick={() => printDeliveryReceipt(row)}><FontAwesomeIcon icon={faPrint} />Reimprimir</button>
                )}
              </div>
            )
          }
        ]}
        empty="Sem entregas para listar."
      />

      {selectedEntrega && <DeliveryDetailsModal entrega={selectedEntrega} onClose={() => setSelectedEntrega(null)} />}

      {isFilterModalOpen && (
        <Modal title="Filtros avançados" onClose={() => setIsFilterModalOpen(false)}>
          <form className="form-panel" onSubmit={applyAdvancedFilters}>
            <h2>Filtros avançados</h2>
            <div className="form-grid">
              <Input label="Data inicial" type="date" value={draftFilters.inicio} set={(value) => setDraftFilters({ ...draftFilters, inicio: value })} />
              <Input label="Data final" type="date" value={draftFilters.fim} set={(value) => setDraftFilters({ ...draftFilters, fim: value })} />
              <Select label="Status" value={draftFilters.status} set={(value) => setDraftFilters({ ...draftFilters, status: value })} options={[{ value: '', label: 'Todos' }, 'Confirmada', 'Cancelada', 'Não Coletada', 'Coletada', 'Em Rota', 'Entregue']} required={false} />
              <Select label="Vendedor" value={draftFilters.vendedor} set={(value) => setDraftFilters({ ...draftFilters, vendedor: value })} options={[{ value: '', label: 'Todos' }, ...data.vendedores.map((item) => ({ value: item._id, label: `${item.name} - Nº ${item.numero_venda}` }))]} required={false} />
              <Select label="Entregador" value={draftFilters.entregador} set={(value) => setDraftFilters({ ...draftFilters, entregador: value })} options={[{ value: '', label: 'Todos' }, ...data.entregadores.map((item) => ({ value: item._id, label: item.name }))]} required={false} />
              <label>
                Cidade
                <select className="scrollable-select" size={Math.min(6, cityOptions.length + 1)} value={draftFilters.cidade} onChange={(event) => setDraftFilters({ ...draftFilters, cidade: event.target.value })}>
                  <option value="">Todas</option>
                  {cityOptions.map((cidade) => <option key={cidade} value={cidade}>{cidade}</option>)}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel" onClick={() => setIsFilterModalOpen(false)}>Cancelar</button>
              <button type="submit" className="primary"><FontAwesomeIcon icon={faCheck} />Aplicar filtros</button>
            </div>
          </form>
        </Modal>
      )}

      {isReportModalOpen && (
        <Modal title="Gerar relatório" onClose={() => setIsReportModalOpen(false)}>
          <form className="form-panel" onSubmit={generateReport}>
            <h2>Configurar relatório</h2>
            <div className="form-grid">
              <Input label="Data inicial" type="date" value={reportDraftFilters.inicio} set={(value) => setReportDraftFilters({ ...reportDraftFilters, inicio: value })} />
              <Input label="Data final" type="date" value={reportDraftFilters.fim} set={(value) => setReportDraftFilters({ ...reportDraftFilters, fim: value })} />
              <Select label="Status" value={reportDraftFilters.status} set={(value) => setReportDraftFilters({ ...reportDraftFilters, status: value })} options={[{ value: '', label: 'Todos' }, 'Confirmada', 'Cancelada', 'Não Coletada', 'Coletada', 'Em Rota', 'Entregue']} required={false} />
              <Select label="Vendedor" value={reportDraftFilters.vendedor} set={(value) => setReportDraftFilters({ ...reportDraftFilters, vendedor: value })} options={[{ value: '', label: 'Todos' }, ...data.vendedores.map((item) => ({ value: item._id, label: `${item.name} - Nº ${item.numero_venda}` }))]} required={false} />
              <Select label="Entregador" value={reportDraftFilters.entregador} set={(value) => setReportDraftFilters({ ...reportDraftFilters, entregador: value })} options={[{ value: '', label: 'Todos' }, ...data.entregadores.map((item) => ({ value: item._id, label: item.name }))]} required={false} />
              <label>
                Cidade
                <select className="scrollable-select" size={Math.min(6, cityOptions.length + 1)} value={reportDraftFilters.cidade} onChange={(event) => setReportDraftFilters({ ...reportDraftFilters, cidade: event.target.value })}>
                  <option value="">Todas</option>
                  {cityOptions.map((cidade) => <option key={cidade} value={cidade}>{cidade}</option>)}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel" onClick={() => setIsReportModalOpen(false)}>Cancelar</button>
              <button type="submit" className="primary"><FontAwesomeIcon icon={faFileExport} />Gerar relatório</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}



