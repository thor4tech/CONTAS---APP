
export type Situation = 'PAGO' | 'PENDENTE' | 'AGENDADO' | 'CANCELADO';
export type PaymentType = 'Receita' | 'Despesa';
export type Currency = 'BRL' | 'EUR';
export type PlanId = 'ESSENTIAL' | 'PRO' | 'MASTER';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING';

// === PDF v3.0 ENUMS ===
export enum SegmentoEmpresa {
  SERVICOS = 'servicos',
  COMERCIO = 'comercio',
  INDUSTRIA = 'industria',
  TECNOLOGIA = 'tecnologia',
  SAUDE = 'saude',
  EDUCACAO = 'educacao',
  AGENCIA_MARKETING = 'agencia_marketing',
  CONSULTORIA = 'consultoria',
  OUTRO = 'outro'
}

export enum FaixaFaturamento {
  ATE_10K = 'ate_10k',
  DE_10K_30K = '10k_30k',
  DE_30K_50K = '30k_50k',
  DE_50K_100K = '50k_100k',
  DE_100K_500K = '100k_500k',
  ACIMA_500K = 'acima_500k'
}

export enum DesafioFinanceiro {
  FLUXO_CAIXA = 'fluxo_caixa',
  INADIMPLENCIA = 'inadimplencia',
  CUSTOS_ALTOS = 'custos_altos',
  BAIXA_MARGEM = 'baixa_margem',
  DESORGANIZACAO = 'desorganizacao',
  FALTA_PREVISIBILIDADE = 'falta_previsibilidade',
  DIVIDAS = 'dividas',
  CRESCIMENTO_DESORDENADO = 'crescimento_desordenado'
}

export enum TomComunicacao {
  DIRETO_OBJETIVO = 'direto',
  CONSULTIVO = 'consultivo',
  MOTIVACIONAL = 'motivacional',
  TECNICO = 'tecnico'
}

export enum FrequenciaAnalise {
  DIARIA = 'diaria',
  SEMANAL = 'semanal',
  QUINZENAL = 'quinzenal',
  MENSAL = 'mensal'
}

export interface OnboardingData {
  empresa: {
    nomeFantasia: string;
    razaoSocial?: string;
    cnpj?: string;
    segmento: SegmentoEmpresa;
    tempoAtuacao: string;
    quantidadeFuncionarios: string;
  };
  perfilFinanceiro: {
    faturamentoMedioMensal: FaixaFaturamento;
    margemLucroEstimada: string;
    principaisDespesas: string[];
    temReservaEmergencia: boolean;
    valorReserva?: number;
    metaReserva?: number;
  };
  objetivos: {
    principaisDesafios: DesafioFinanceiro[];
    objetivoPrincipal: string;
    prazoObjetivo: string;
    experienciaGestao: string;
  };
  preferenciasIA: {
    frequenciaAnalise: FrequenciaAnalise;
    nivelDetalhe: 'resumido' | 'detalhado';
    alertasAutomaticos: boolean;
    tiposAlerta: string[];
    tomComunicacao: TomComunicacao;
  };
}

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
  type: 'bank' | 'card' | 'fixed';
}

export interface UserProfile {
  email: string;
  name: string;
  company: string;
  referralCode?: string;
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  trialEnd: string;
  defaultMeta?: number;
  globalAssets?: AssetMetadata[];
  onboardingCompleto?: boolean;
  onboarding?: OnboardingData;
}

export interface AnaliseCompleta {
  id: string;
  nome: string;
  nomeEditavel: boolean;
  tags: string[];
  data: string;
  indicadores: {
    indiceFolego: number;
    endividamento: number;
    taxaConversao: number;
    margemLucro: number;
    tendencia: string;
    saudeGeral: number;
  };
  relatorio: string;
  acoes: {
    id: string;
    titulo: string;
    descricao: string;
    prioridade: number;
    prazo: string;
    impacto: string;
    status: 'pendente' | 'feito';
  }[];
  metadados: {
    versaoIA: string;
    tempoProcessamento: number;
    perfilUsuario: string;
  };
}

export interface FinancialData {
  month: string;
  year: number;
  transactions: BaseTransaction[];
  metaFaturamento: number;
  reserva: number;
  reservaEmergencia?: number;
  reservaCurrency?: Currency;
  investimento?: number;
  retorno?: number;
  balances: Record<string, number>;
  cardDetails?: Record<string, { dueDate?: string; situation?: Situation }>;
}

export interface AppState {
  currentMonth: string;
  currentYear: number;
  data: FinancialData[];
  categories: Category[];
  partners: Partner[];
  view: 'dashboard' | 'calendar' | 'transactions' | 'partners' | 'settings' | 'analytics' | 'referral' | 'onboarding';
  searchTerm: string;
  statusFilter: Situation | 'ALL';
  aiMinimized: boolean;
  userProfile: UserProfile;
}
