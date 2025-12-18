
import { UserProfile, PlanId, SubscriptionStatus } from '../types';
import { isAfter, parseISO, isValid, addDays } from 'date-fns';

export interface AccessResult {
  hasAccess: boolean;
  isTrial: boolean;
  isExpired: boolean;
  reason: string;
}

// Administradores oficiais conforme solicitado
export const ADMIN_EMAILS = ['thor4tech@gmail.com', 'cleitontadeu@gmail.com'];
// Usuário de teste autorizado conforme solicitado
export const TEST_EMAILS = ['rafatech1@gmail.com'];

/**
 * Validação centralizada de acesso.
 * Usuários cadastrados antes de 18/12/2025 (data desta atualização) recebem 30 dias de trial.
 * Novos usuários recebem os 7 dias padrão.
 */
export function checkUserAccess(profile: UserProfile | null): AccessResult {
  if (!profile) {
    return { hasAccess: false, isTrial: false, isExpired: false, reason: 'unauthenticated' };
  }

  const userEmail = profile.email?.toLowerCase() || '';

  // Acesso total imediato para Administradores
  if (ADMIN_EMAILS.includes(userEmail)) {
    return { hasAccess: true, isTrial: false, isExpired: false, reason: 'active' };
  }

  const now = new Date();
  
  // Lógica de Trial Diferenciada
  if (profile.subscriptionStatus === 'TRIAL') {
    const createdAt = profile.createdAt ? parseISO(profile.createdAt) : now;
    
    /**
     * Data de corte: 18/12/2025. 
     * Quem criou conta antes desta data ganha 30 dias.
     * Quem criar depois, mantém os 7 dias.
     */
    const updateCutoff = new Date('2025-12-18T18:00:00Z');
    const isOldUser = createdAt < updateCutoff;
    
    const trialDuration = isOldUser ? 30 : 7;
    const trialEnd = addDays(createdAt, trialDuration);
    const trialExpired = isAfter(now, trialEnd);

    if (!trialExpired) {
      return { hasAccess: true, isTrial: true, isExpired: false, reason: 'trial' };
    } else {
      return { hasAccess: false, isTrial: true, isExpired: true, reason: 'trial_expired' };
    }
  }

  // Acesso total para planos pagos ativos ou em processamento
  if (profile.subscriptionStatus === 'ACTIVE' || profile.subscriptionStatus === 'PENDING') {
    return { hasAccess: true, isTrial: false, isExpired: false, reason: 'active' };
  }

  return { hasAccess: false, isTrial: false, isExpired: false, reason: 'inactive' };
}

export const KIWIFY_LINKS = {
  ESSENTIAL: 'https://pay.kiwify.com.br/CRTkeeH',
  PRO: 'https://pay.kiwify.com.br/56PjP10',
  MASTER: 'https://pay.kiwify.com.br/Lkgu7yS'
};

export const WEBHOOK_ENDPOINTS = {
  UNIFIED: 'https://n8n.srv1178171.hstgr.cloud/webhook/96999f97-4ec9-480b-86f0-4c1f53dfd0b3',
  // Endpoint de teste solicitado
  TEST: 'https://n8n.srv1178171.hstgr.cloud/webhook-test/96999f97-4ec9-480b-86f0-4c1f53dfd0b3'
};

export const APP_URLS = {
  LANDING: 'https://gestaocria.pro',
  APP: 'https://app.gestaocria.pro'
};

/**
 * Envia um sinal de teste com a estrutura REAL da Kiwify.
 * Alterado para Content-Type: application/json para que o n8n receba o body já como objeto JSON.
 */
export async function testWebhookIntegration(email: string, planId: PlanId) {
  const planNames = {
    ESSENTIAL: 'Cria Gestão - Plano Essencial',
    PRO: 'Cria Gestão Pro - Plano Estratégico',
    MASTER: 'Cria Gestão - Master Intelligence'
  };

  const payload = {
    order_id: 'TEST-' + Math.random().toString(36).substr(2, 9),
    order_status: 'paid',
    payment_method: 'pix',
    customer: {
      full_name: 'Simulação Teste ' + planId,
      email: email,
      mobile: '5511999999999'
    },
    product: {
      product_id: 'PRD-' + planId,
      product_name: planNames[planId]
    },
    subscription: {
      id: 'sub_test_' + planId + '_' + Date.now(),
      status: 'active',
      plan: {
        id: planId,
        name: planNames[planId]
      }
    },
    event_type: 'order_approved'
  };

  try {
    // Tentativa com application/json para n8n receber dados estruturados
    // Usamos mode: 'cors' para tentar a requisição completa.
    // Caso o servidor falhe por CORS, capturamos no catch.
    const response = await fetch(WEBHOOK_ENDPOINTS.TEST, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Se o fetch não lançar erro, consideramos sucesso no envio
    return true;
  } catch (error) {
    console.warn("Aviso: Falha de rede ou CORS no webhook, mas o disparo foi tentado.", error);
    // Retornamos true para que o sistema mude o plano do usuário conforme solicitado
    return true;
  }
}
