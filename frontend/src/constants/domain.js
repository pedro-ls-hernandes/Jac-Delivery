import {
  faChartLine,
  faClipboardList,
  faFileInvoiceDollar,
  faMotorcycle,
  faPlusCircle,
  faStore
} from '@fortawesome/free-solid-svg-icons';

export const CIDADES = ['Jaú', 'Mineiros', 'Dois Córregos'];

export const FORMAS_PAGAMENTO = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Pix Bradesco',
  'Pix QR Code',
  'Crediário Loja',
  'Pagamento Combinado'
];

export const STATUS_ENTREGA = [
  'Não Coletada',
  'Coletada',
  'Em Rota',
  'Entregue',
  'Confirmada',
  'Cancelada'
];

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: faChartLine },
  { id: 'entregas', label: 'Entregas', icon: faClipboardList },
  { id: 'nova-entrega', label: 'Nova entrega', icon: faPlusCircle },
  { id: 'relatorios', label: 'Relatórios', icon: faFileInvoiceDollar },
  { id: 'vendedores', label: 'Vendedores', icon: faStore },
  { id: 'entregadores', label: 'Entregadores', icon: faMotorcycle }
];

