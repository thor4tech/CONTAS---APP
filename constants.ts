
import { FinancialData, Category, BaseTransaction } from './types';

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_contabil', name: 'Contábil', color: 'bg-blue-100 text-blue-700', icon: '📊' },
  { id: 'cat_salarios', name: 'Salários', color: 'bg-rose-100 text-rose-700', icon: '💼' },
  { id: 'cat_impostos', name: 'Impostos', color: 'bg-amber-100 text-amber-700', icon: '💳' },
  { id: 'cat_ferramentas', name: 'Ferramentas', color: 'bg-sky-100 text-sky-700', icon: '🛠️' },
  { id: 'cat_marketing', name: 'Marketing', color: 'bg-pink-100 text-pink-700', icon: '🎯' },
  { id: 'cat_admin', name: 'Administrativo', color: 'bg-slate-100 text-slate-700', icon: '📁' },
  { id: 'cat_pessoal', name: 'Pessoal', color: 'bg-emerald-100 text-emerald-700', icon: '👤' },
];

const createTx = (desc: string, val: number, type: 'Receita' | 'Despesa', catId = 'cat_admin', date = '2025-12-01'): BaseTransaction => ({
  id: Math.random().toString(36).substr(2, 9),
  description: desc,
  value: val,
  categoryId: catId,
  dueDate: date,
  monthRef: 'Dez/2025',
  situation: 'PAGO',
  type,
  paymentMethod: 'Pix'
});

// Fix: Adjusted DEC_DATA to match FinancialData interface by using 'balances' instead of 'accounts' and 'creditCards'
export const DEC_DATA: FinancialData = {
  month: 'Dezembro', 
  year: 2025, 
  metaFaturamento: 30000, 
  reserva: 8500, 
  reservaCurrency: 'BRL', 
  investimento: 2000, 
  retorno: 4000,
  balances: {
    'asaas': 0,
    'nubank_b': 5089.32,
    'nubank_p': 6006.87,
    'wallet': 2778,
    'cc_nubank_b': 2300,
    'cc_nubank_p': 400,
    'cc_brasilcard': 1450,
    'cc_pan': 1500,
    'cc_pernambucanas': 3000
  },
  transactions: [
    createTx('Ale Crispim', 697, 'Receita', 'cat_pessoal', '2025-12-01'),
    createTx('ALUGUEL', 2596, 'Despesa', 'cat_admin', '2025-12-07'),
  ]
};

export const INITIAL_DATA: FinancialData = DEC_DATA;
