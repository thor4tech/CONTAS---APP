
import { UserProfile, PlanId, SubscriptionStatus } from '../types';
import { isAfter, parseISO, isValid } from 'date-fns';

export interface AccessResult {
  hasAccess: boolean;
  isTrial: boolean;
  isExpired: boolean;
  reason: string;
}

/**
 * Validação centralizada de acesso.
 * Prioriza status ACTIVE/PENDING, depois checa validade do TRIAL.
 */
export function checkUserAccess(profile: UserProfile | null): AccessResult {
  if (!profile) {
    return { hasAccess: false, isTrial: false, isExpired: false, reason: 'unauthenticated' };
  }

  const now = new Date();
  const trialEndStr = profile.trialEnd || "";
  const trialEnd = trialEndStr ? parseISO(trialEndStr) : null;
  const trialExpired = trialEnd && isValid(trialEnd) ? isAfter(now, trialEnd) : true;

  // Acesso total para planos pagos ativos ou em processamento (boleto/pix gerado)
  if (profile.subscriptionStatus === 'ACTIVE' || profile.subscriptionStatus === 'PENDING') {
    return { hasAccess: true, isTrial: false, isExpired: false, reason: 'active' };
  }

  // Lógica de Trial (7 dias gratuitos)
  if (profile.subscriptionStatus === 'TRIAL') {
    if (!trialExpired) {
      return { hasAccess: true, isTrial: true, isExpired: false, reason: 'trial' };
    } else {
      return { hasAccess: false, isTrial: true, isExpired: true, reason: 'trial_expired' };
    }
  }

  // Bloqueado por cancelamento, expiração ou reembolso
  return { hasAccess: false, isTrial: false, isExpired: false, reason: 'inactive' };
}

export const KIWIFY_LINKS = {
  ESSENTIAL: 'https://pay.kiwify.com.br/CRTkeeH',
  PRO: 'https://pay.kiwify.com.br/56PjP10',
  MASTER: 'https://pay.kiwify.com.br/Lkgu7yS'
};

export const WEBHOOK_ENDPOINTS = {
  // URL DE TESTE FORNECIDA PELO USUÁRIO
  COMPRA_APROVADA: 'https://n8n.srv1178171.hstgr.cloud/webhook-test/96999f97-4ec9-480b-86f0-4c1f53dfd0b3',
  REEMBOLSO: 'https://n8n.srv1178171.hstgr.cloud/webhook/d8b1f883-c9c6-49e2-a579-a9c11ae5979d',
  RENOVADA: 'https://n8n.srv1178171.hstgr.cloud/webhook-test/03b7b3fe-2445-4267-9aa2-ce3da181eb96',
  ATRASADA: 'https://n8n.srv1178171.hstgr.cloud/webhook/57695aa5-feb5-4418-8687-dff61f442397',
  CANCELADA: 'https://n8n.srv1178171.hstgr.cloud/webhook/a9744671-6f25-4525-b0d3-df4b5aba7c7f'
};

/**
 * Envia um sinal de teste com a estrutura REAL da Kiwify.
 * Útil para mapear os campos no n8n (customer.email, order_status, etc).
 */
export async function testWebhookIntegration(email: string) {
  try {
    const response = await fetch(WEBHOOK_ENDPOINTS.COMPRA_APROVADA, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: 'TEST-' + Math.random().toString(36).substr(2, 9),
        order_status: 'paid',
        payment_method: 'pix',
        customer: {
          full_name: 'Usuário de Teste Pro',
          email: email,
          mobile: '5511999999999'
        },
        product: {
          product_id: 'PRD-12345',
          product_name: 'Cria Gestão Pro - Plano Estratégico'
        },
        subscription: {
          id: 'sub_test_' + Date.now(),
          status: 'active',
          plan: {
            id: 'PRO',
            name: 'Pro Estratégico'
          }
        },
        event_type: 'order_approved'
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Erro ao disparar webhook de teste:", error);
    return false;
  }
}
