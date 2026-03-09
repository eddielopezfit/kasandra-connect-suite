import { ChatAction, ChatMessage, ReportState } from './types';
import { generateMessageId } from './identityManager';
import { logEvent } from '@/lib/analytics/logEvent';

export interface ReportActionResult {
  reportState?: Partial<ReportState>;
  messagesToAdd?: ChatMessage[];
  loading?: boolean;
}

export function getReportTitle(reportType: string, t: (en: string, es: string) => string): string {
  switch (reportType) {
    case 'net_sheet':
      return t('Your Net Sheet Analysis', 'Análisis de tu Ganancia Neta');
    case 'buyer_readiness':
      return t('Buyer Readiness Report', 'Reporte de Preparación del Comprador');
    case 'cash_comparison':
      return t('Cash vs. Listing Comparison', 'Comparación: Efectivo vs. Listado');
    case 'home_value_preview':
      return t('Your Home Value Preview', 'Vista Previa del Valor de Su Casa');
    default:
      return t('Your Personalized Report', 'Tu Reporte Personalizado');
  }
}

export async function generateReport(
  action: ChatAction,
  leadId: string | null,
  t: (en: string, es: string) => string,
  language: 'en' | 'es'
): Promise<ReportActionResult> {
  const reportType = action.reportType || 'net_sheet';
  const reportTitle = getReportTitle(reportType, t);

  if (!leadId) {
    return {
      reportState: { isOpen: false, isGenerating: false },
    };
  }

  logEvent('report_generate_start', {
    report_type: reportType,
    lead_id: leadId,
  });

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          lead_id: leadId,
          report_type: reportType,
          context: action.context || {},
          language,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok || !data.report) {
      logEvent('report_error', { stage: 'generation', message: data.error || 'Unknown error' });
      return {
        reportState: { isGenerating: false },
        messagesToAdd: [{
          id: generateMessageId(),
          role: 'assistant',
          content: t(
            "I ran into an issue generating your report. Please try again in a moment.",
            "Hubo un problema generando tu reporte. Por favor intenta de nuevo en un momento."
          ),
          timestamp: new Date().toISOString(),
        }]
      };
    }

    logEvent('report_generation_completed', {
      report_id: data.report.id,
      report_type: data.report.report_type,
    });

    const completionMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: t(
        "I've generated your report. You can review the details now.",
        "He generado tu reporte. Puedes revisar los detalles ahora."
      ),
      timestamp: new Date().toISOString(),
      metadata: {
        report_id: data.report.id,
        report_type: data.report.report_type,
      },
      actions: [
        {
          label: t('View Report', 'Ver Reporte'),
          actionType: 'open_report',
          reportId: data.report.id,
        },
      ],
      suggestedReplies: [
        { label: t("What does this mean?", "¿Qué significa esto?") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ],
    };

    return {
      reportState: {
        isOpen: true,
        isGenerating: false,
        title: reportTitle,
        markdown: data.report.report_markdown,
        reportId: data.report.id,
        reportType: data.report.report_type,
      },
      messagesToAdd: [completionMessage],
    };
  } catch (error) {
    console.error('[Selena] Report generation error:', error);
    return {
      reportState: { isGenerating: false },
      messagesToAdd: [{
        id: generateMessageId(),
        role: 'assistant',
        content: t(
          "I ran into an issue connecting to the report system. Please check your connection and try again.",
          "Hubo un problema de conexión con el sistema de reportes. Por favor verifica tu conexión e intenta de nuevo."
        ),
        timestamp: new Date().toISOString(),
      }],
    };
  }
}

export async function openReportById(
  reportId: string,
  leadId: string,
  t: (en: string, es: string) => string
): Promise<ReportActionResult> {
  if (!leadId) {
    return {
      reportState: { isGenerating: false },
    };
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-report`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          lead_id: leadId,
          report_id: reportId,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok || !data.report) {
      console.error('[Selena] Report not found:', data.error);
      return {
        reportState: { isGenerating: false },
        messagesToAdd: [{
          id: generateMessageId(),
          role: 'assistant',
          content: t(
            "I couldn't find that report. It may have been created under a different email, or it may no longer exist.",
            "No pude encontrar ese reporte. Puede que haya sido creado con otro correo, o que ya no exista."
          ),
          timestamp: new Date().toISOString(),
        }]
      };
    }

    logEvent('report_view', {
      report_id: reportId,
      report_type: data.report.report_type,
      source: 'chat_reopen',
    });

    return {
      reportState: {
        isOpen: true,
        isGenerating: false,
        title: getReportTitle(data.report.report_type, t),
        markdown: data.report.report_markdown,
        reportId: data.report.id,
        reportType: data.report.report_type,
      }
    };
  } catch (error) {
    console.error('[Selena] Error fetching report:', error);
    return {
      reportState: { isGenerating: false }
    };
  }
}

export async function openLastReport(
  leadId: string,
  t: (en: string, es: string) => string
): Promise<ReportActionResult> {
  if (!leadId) {
    return { reportState: { isGenerating: false } };
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-last-report-id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ lead_id: leadId }),
      }
    );

    const data = await response.json();

    if (!data.ok || !data.report_id) {
      logEvent('report_empty_state_shown', { lead_id: leadId });
      return {
        reportState: {
          isOpen: true,
          isGenerating: false,
          title: t('My Report', 'Mi Reporte'),
          markdown: '',
          reportId: undefined,
          reportType: 'empty',
        }
      };
    }

    return await openReportById(data.report_id, leadId, t);
  } catch (error) {
    console.error('[Selena] Error fetching last report:', error);
    logEvent('report_error', { stage: 'fetch', message: 'Failed to fetch last report' });
    return { reportState: { isGenerating: false } };
  }
}
