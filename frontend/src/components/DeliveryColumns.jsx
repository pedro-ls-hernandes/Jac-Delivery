import { StatusBadge } from './StatusBadge.jsx';
import { getName, money } from '../utils/format.js';

export function deliveryColumns({ showDailyOrder = false } = {}) {
  const columns = [
    { label: 'Cliente', render: (row) => row.cliente },
    { label: 'Bairro', render: (row) => row.bairro },
    { label: 'Vendedor', render: (row) => getName(row.vendedor) },
    {
      label: 'Entregador',
      render: (row) => row.tipo_entregador === 'Terceirizado'
        ? row.entregador_terceirizado?.nome
        : getName(row.entregador)
    },
    { label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { label: 'Valor', render: (row) => money(row.valor) }
  ];

  if (showDailyOrder) {
    return [
      { label: 'Ordem', render: (_row, index) => <strong className="daily-order">{index + 1}</strong> },
      ...columns
    ];
  }

  return columns;
}
