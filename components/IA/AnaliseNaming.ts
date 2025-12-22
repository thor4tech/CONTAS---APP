
import { AnaliseCompleta } from '../../types';

export class AnaliseNaming {
  static gerarNomeAutomatico(analise: Partial<AnaliseCompleta>): string {
    const { indicadores, data } = analise;
    if (!indicadores || !data) return "Nova Análise";
    
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });

    // Determinar situação predominante conforme PDF
    if (indicadores.indiceFolego <= 3) {
      return `⚠️ Alerta Crítico - ${dataFormatada}`;
    }
    if (indicadores.margemLucro < 0) {
      return `📉 Margem Negativa - ${dataFormatada}`;
    }
    if (indicadores.taxaConversao < 70) {
      return `💸 Baixa Conversão - ${dataFormatada}`;
    }
    if (indicadores.endividamento > 100) {
      return `🛑 Endividamento Alto - ${dataFormatada}`;
    }
    if (indicadores.indiceFolego > 30 && indicadores.margemLucro > 15) {
      return `✅ Saúde Excelente - ${dataFormatada}`;
    }
    if (indicadores.indiceFolego > 15) {
      return `⚙️ Operação Estável - ${dataFormatada}`;
    }

    return `📊 Análise Geral - ${dataFormatada}`;
  }

  static gerarTagsAutomaticas(analise: Partial<AnaliseCompleta>): string[] {
    const tags: string[] = [];
    const { indicadores } = analise;
    if (!indicadores) return [];

    // Tags de situação
    if (indicadores.indiceFolego <= 7) tags.push('urgente');
    if (indicadores.margemLucro < 0) tags.push('prejuizo');
    if (indicadores.margemLucro > 20) tags.push('lucrativo');
    if (indicadores.taxaConversao > 90) tags.push('alta-conversao');
    if (indicadores.endividamento > 100) tags.push('endividado');

    // Tags de tendência
    if (indicadores.tendencia === 'FORTE_CRESCIMENTO') tags.push('crescimento');
    if (indicadores.tendencia.includes('DESCENDENTE')) tags.push('queda');

    return tags;
  }
}
