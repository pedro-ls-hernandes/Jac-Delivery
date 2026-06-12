import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faMotorcycle, faPlusCircle, faPrint, faStore } from '@fortawesome/free-solid-svg-icons';
import { DataTable } from '../components/DataTable.jsx';
import { DeliveryDetailsModal } from '../components/DeliveryDetailsModal.jsx';
import { deliveryColumns } from '../components/DeliveryColumns.jsx';
import { isTodayDelivery, sortDeliveriesByDayOrder } from '../utils/deliverySort.js';
import { money } from '../utils/format.js';
import { printDeliveryReceipt } from '../utils/receiptPrinter.js';

function Metric({ title, value, detail, tone = 'info' }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

export function DashboardPage({ data, go }) {
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const terceirizadas = data.entregas.filter((item) => item.tipo_entregador === 'Terceirizado');
  const ativos = data.entregadores.filter((item) => item.status === 'Ativo');
  const entregasHoje = data.entregas.filter(isTodayDelivery);
  const pendentes = sortDeliveriesByDayOrder(entregasHoje.filter((item) => !['Confirmada', 'Cancelada'].includes(item.status)));
  const confirmadasHoje = entregasHoje.filter((item) => item.status === 'Confirmada');
  const canceladasHoje = entregasHoje.filter((item) => item.status === 'Cancelada');
  const valorConfirmadoHoje = confirmadasHoje.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const valorPendenteHoje = pendentes.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const valorCanceladoHoje = canceladasHoje.reduce((sum, item) => sum + Number(item.valor || 0), 0);

  return (
    <section className="page-stack">
      <div className="dashboard-grid">
        <Metric title="Confirmadas hoje" value={money(valorConfirmadoHoje)} detail={`${confirmadasHoje.length} entregas`} tone="success" />
        <Metric title="Pendentes hoje" value={money(valorPendenteHoje)} detail={`${pendentes.length} entregas em andamento`} tone="warning" />
        <Metric title="Canceladas hoje" value={money(valorCanceladoHoje)} detail={`${canceladasHoje.length} entregas`} tone="danger" />
        <Metric title="Entregadores ativos" value={ativos.length} detail={`${data.entregadores.length} cadastrados · ${terceirizadas.length} terceirizadas`} tone="info" />
      </div>
      <div className="shortcut-row">
        <button className="primary" onClick={() => go('nova-entrega')}><FontAwesomeIcon icon={faPlusCircle} />Registrar nova entrega</button>
        <button className="secondary" onClick={() => go('vendedores')}><FontAwesomeIcon icon={faStore} />Cadastrar vendedor</button>
        <button className="secondary" onClick={() => go('entregadores')}><FontAwesomeIcon icon={faMotorcycle} />Cadastrar entregador</button>
      </div>
      <DataTable
        title="Entregas do dia em andamento"
        rows={pendentes.slice(0, 8)}
        columns={[
          ...deliveryColumns({ showDailyOrder: true }),
          {
            label: 'Ações',
            render: (row) => (
              <div className="table-actions">
                <button onClick={() => setSelectedEntrega(row)}><FontAwesomeIcon icon={faEye} />Detalhes</button>
                <button onClick={() => printDeliveryReceipt(row)}><FontAwesomeIcon icon={faPrint} />Reimprimir</button>
              </div>
            )
          }
        ]}
        empty="Nenhuma entrega em andamento hoje."
      />
      {selectedEntrega && <DeliveryDetailsModal entrega={selectedEntrega} onClose={() => setSelectedEntrega(null)} />}
    </section>
  );
}

