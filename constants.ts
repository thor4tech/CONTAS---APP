
import { FinancialData, Category } from './types';

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

// O sistema agora inicia totalmente limpo
export const INITIAL_DATA: FinancialData = {
  month: '',
  year: new Date().getFullYear(),
  metaFaturamento: 0,
  reserva: 0,
  reservaCurrency: 'BRL',
  investimento: 0,
  retorno: 0,
  balances: {},
  transactions: []
};
