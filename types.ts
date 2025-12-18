
export type Situation = 'PAGO' | 'PENDENTE' | 'AGENDADO' | 'CANCELADO';
export type PaymentType = 'Receita' | 'Despesa';
export type Currency = 'BRL' | 'EUR';
export type PlanId = 'ESSENTIAL' | 'PRO' | 'MASTER';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'Cliente' | 'Fornecedor';
  phone?: string;
}

export interface BaseTransaction {
  id: string;
  description: string;
  value: number;
  categoryId: string;
  clientSupplierId?: string;
  dueDate: string;
  monthRef: string;
  situation: Situation;
  type: PaymentType;
  paymentMethod: string;
  isRecurring?: boolean;
  attachmentUrl?: string;
}

export interface AssetMetadata {
  id: string;
  name: string;
  icon?: string;
  type: 'bank' | 'card';
}

export interface AccountItem extends AssetMetadata {
  balance: number;
}

export interface CreditCardItem extends AssetMetadata {
  balance: number;
  dueDate?: string;
  situation?: Situation;
}

export interface UserProfile {
  email: string;
  name: string;
  company: string;
  avatar?: string;
  defaultMeta?: number;
  globalAssets?: AssetMetadata[]; 
  
  // Gestão de Planos e SaaS
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string; // ISO String
  trialEnd: string;   // ISO String (createdAt + 7 days)
  subscriptionId?: string;
  nextPayment?: string;
  
  // Marketing & UTMs
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  s1?: string | null;
  s2?: string | null;
  s3?: string | null;
}

export interface FinancialData {
  month: string;
  year: number;
  transactions: BaseTransaction[];
  metaFaturamento: number;
  reserva: number;
  reservaCurrency: Currency;
  investimento: number;
  retorno: number;
  balances: Record<string, number>;
  cardDetails?: Record<string, { dueDate?: string; situation?: Situation }>;
}

export interface AppState {
  currentMonth: string;
  currentYear: number;
  data: FinancialData[];
  categories: Category[];
  partners: Partner[];
  view: 'dashboard' | 'calendar' | 'transactions' | 'partners' | 'settings' | 'analytics';
  searchTerm: string;
  statusFilter: Situation | 'ALL';
  aiMinimized: boolean;
  userProfile: UserProfile;
}
