/**
 * ReportViewer Component
 * Displays AI-generated reports in a premium modal (Dialog on desktop, Drawer on mobile)
 * Includes empty state and error handling
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calculator, MessageCircle, X, Sparkles, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logEvent } from '@/lib/analytics/logEvent';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ReportViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  markdown: string;
  reportId?: string;
  reportType?: string;
}

export function ReportViewer({
  open,
  onOpenChange,
  title,
  markdown,
  reportId,
  reportType,
}: ReportViewerProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { openChat, handleActionClick } = useSelenaChat();
  const { t } = useLanguage();
  const [_retryAction, _setRetryAction] = useState<(() => void) | null>(null);

  const isEmpty = reportType === 'empty' || (!markdown && !reportId);

  // Log report view when opened (only for actual reports, not empty state)
  useEffect(() => {
    if (open && reportId && !isEmpty) {
      logEvent('report_view', {
        report_id: reportId,
        report_type: reportType,
      });
    }
  }, [open, reportId, reportType, isEmpty]);

  const handleCTAClick = (ctaType: string, destination: string) => {
    logEvent('report_cta_click', {
      report_id: reportId,
      report_type: reportType,
      cta_type: ctaType,
      destination,
    });

    onOpenChange(false);

    if (ctaType === 'ask_selena' || ctaType === 'book_call') {
      // Route through Selena chat (Selena as Router policy)
      setTimeout(() => openChat({ source: 'hero', intent: 'sell' }), 300);
    } else if (ctaType === 'generate_report') {
      // Trigger report generation
      setTimeout(() => {
        handleActionClick({
          label: 'Generate Report',
          actionType: 'generate_report',
          reportType: 'net_sheet',
        });
      }, 300);
    } else {
      navigate(destination);
    }
  };

  const _handleRetry = () => {
    if (_retryAction) {
      _retryAction();
      _setRetryAction(null);
    }
  };

  const handleDownload = () => {
    logEvent('report_download', {
      report_id: reportId,
      report_type: reportType,
    });

    // Convert markdown to clean HTML for print
    const markdownToHtml = (md: string): string => {
      return md
        .split('\n')
        .map((line) => {
          const t = line.trim();
          if (!t) return '<br/>';
          if (t.startsWith('### ')) return `<h3>${t.slice(4)}</h3>`;
          if (t.startsWith('## '))  return `<h2>${t.slice(3)}</h2>`;
          if (t.startsWith('# '))   return `<h1>${t.slice(2)}</h1>`;
          if (t.startsWith('- ') || t.startsWith('* '))
            return `<li>${t.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`;
          return `<p>${t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')}</p>`;
        })
        .join('\n')
        // Wrap consecutive <li> items in <ul>
        .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
    };

    const date = new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      color: #1a1a2e;
      line-height: 1.6;
      padding: 0;
    }
    .page { padding: 0.75in 0.85in; }
    .header {
      border-bottom: 2px solid #c9a84c;
      padding-bottom: 14px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-brand { font-size: 11pt; color: #1a1a2e; }
    .header-brand strong { display: block; font-size: 13pt; letter-spacing: 0.02em; }
    .header-brand span { font-size: 9pt; color: #888; font-style: italic; font-family: Arial, sans-serif; }
    .header-date { font-size: 9pt; color: #888; font-family: Arial, sans-serif; text-align: right; }
    .report-title {
      font-size: 18pt;
      font-weight: bold;
      color: #1a1a2e;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e0d0;
    }
    h1 { font-size: 15pt; color: #1a1a2e; margin: 20px 0 8px; }
    h2 { font-size: 13pt; color: #1a1a2e; margin: 16px 0 6px; }
    h3 { font-size: 11pt; color: #444; margin: 12px 0 4px; }
    p  { margin: 6px 0; font-family: Arial, sans-serif; font-size: 11pt; color: #333; }
    ul { margin: 6px 0 6px 20px; }
    li { margin: 4px 0; font-family: Arial, sans-serif; font-size: 11pt; color: #333; }
    strong { color: #1a1a2e; }
    br { display: block; margin: 4px 0; }
    .footer {
      position: fixed;
      bottom: 0.4in;
      left: 0.85in;
      right: 0.85in;
      border-top: 1px solid #e8e0d0;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #aaa;
      font-family: Arial, sans-serif;
    }
    .disclaimer {
      margin-top: 32px;
      padding: 12px 16px;
      background: #f8f5ee;
      border-left: 3px solid #c9a84c;
      font-size: 9pt;
      color: #666;
      font-family: Arial, sans-serif;
      font-style: italic;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .footer { position: fixed; bottom: 0.4in; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-brand">
        <strong>Kasandra Prieto</strong>
        <span>Your Best Friend in Real Estate · Corner Connect</span>
      </div>
      <div class="header-date">Prepared ${date}</div>
    </div>
    <div class="report-title">${title}</div>
    ${markdownToHtml(markdown)}
    <div class="disclaimer">
      This report is an educational estimate based on Tucson market averages. 
      Actual results will vary based on your specific property, condition, location, and market conditions. 
      This is not a formal appraisal or legal/financial advice. 
      For a personalized analysis, connect with Kasandra directly.
    </div>
  </div>
  <div class="footer">
    <span>KasandraPrieto.com · Corner Connect brokered by Realty Executives Arizona Territory</span>
    <span>Tu Mejor Amiga en Bienes Raíces</span>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }

    doc.open();
    doc.write(html);
    doc.close();

    // Give the iframe a moment to render fonts/styles before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Clean up after the print dialog closes
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 400);
  };

  // Empty State Content - Premium, no dead ends
  const emptyContent = (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-cc-sand flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-cc-gold" />
      </div>
      
      <h2 className="text-xl font-serif font-semibold text-cc-navy mb-2">
        {t('No Saved Reports Yet', 'Aún No Tienes Reportes Guardados')}
      </h2>
      
      <p className="text-sm text-muted-foreground max-w-xs mb-8">
        {t(
          "Let's create your first personalized analysis. This takes just a moment and helps you see your options clearly.",
          'Creemos tu primer análisis personalizado. Esto solo toma un momento y te ayuda a ver tus opciones con claridad.'
        )}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={() => handleCTAClick('generate_report', '')}
          className="w-full bg-cc-navy hover:bg-cc-navy-dark text-white"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {t('Generate My Report', 'Generar Mi Reporte')}
        </Button>
        
        <Button
          onClick={() => handleCTAClick('run_net_sheet', '/ad/seller')}
          variant="outline"
          className="w-full border-cc-gold text-cc-gold hover:bg-cc-gold/10"
          size="lg"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {t('Run the Net Sheet', 'Calcular Tu Ganancia Neta')}
        </Button>
        
        <Button
          onClick={() => handleCTAClick('book_call', 'selena_chat')}
          variant="ghost"
          className="w-full text-cc-slate hover:text-cc-navy hover:bg-cc-sand"
          size="lg"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('Schedule a Call', 'Agendar una Llamada')}
        </Button>
        
        <Button
          onClick={() => handleCTAClick('ask_selena', '')}
          variant="ghost"
          className="w-full text-cc-slate/80 hover:text-cc-navy hover:bg-cc-sand/50"
          size="default"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('Ask Selena', 'Pregúntale a Selena')}
        </Button>
      </div>
    </div>
  );

  // Normal Content with Markdown
  const reportContent = (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Markdown Content */}
      <ScrollArea className="flex-1 px-4 sm:px-6">
        <div className="py-4 sm:py-6">
          <MarkdownRenderer markdown={markdown} />
        </div>
      </ScrollArea>

      {/* CTA Buttons - Calm, consistent tone */}
      <div className="border-t border-border bg-cc-sand/50 p-4 sm:p-6 shrink-0">
        <div className="flex flex-col gap-3">
        <Button
            onClick={() => handleCTAClick('book_call', 'selena_chat')}
            className="w-full bg-cc-navy hover:bg-cc-navy-dark text-white"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('Schedule a Call', 'Agendar una Llamada')}
          </Button>

          <Button
            onClick={handleDownload}
            variant="outline"
            className="w-full border-cc-gold text-cc-gold hover:bg-cc-gold/10"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('Download Report', 'Descargar Reporte')}
          </Button>
          
          <Button
            onClick={() => handleCTAClick('run_net_sheet', '/ad/seller')}
            variant="outline"
            className="w-full border-cc-sand-dark text-cc-charcoal hover:bg-cc-sand"
            size="lg"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {t('Run the Net Sheet', 'Calcular Tu Ganancia Neta')}
          </Button>
          
          <Button
            onClick={() => handleCTAClick('ask_selena', '')}
            variant="ghost"
            className="w-full text-cc-slate hover:text-cc-navy hover:bg-cc-sand"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('Keep Chatting With Selena', 'Seguir Chateando con Selena')}
          </Button>
        </div>
      </div>
    </div>
  );

  const content = isEmpty ? emptyContent : reportContent;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90vh] max-h-[90vh]">
          <DrawerHeader className="border-b border-border px-4 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2 text-lg font-serif text-cc-navy">
                <FileText className="w-5 h-5 text-cc-gold" />
                {title || t('My Report', 'Mi Reporte')}
              </DrawerTitle>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="border-b border-border px-6 py-4 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-serif text-cc-navy">
            <FileText className="w-5 h-5 text-cc-gold" />
            {title || t('My Report', 'Mi Reporte')}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simple Markdown Renderer with premium styling
 */
function MarkdownRenderer({ markdown }: { markdown: string }) {
  // Convert markdown to HTML-like elements
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 my-4 text-cc-text">
            {listItems.map((item, i) => (
              <li key={i} className="text-base leading-relaxed">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Skip empty lines but flush lists
      if (!trimmed) {
        if (inList) flushList();
        return;
      }

      // Heading 1
      if (trimmed.startsWith('# ')) {
        if (inList) flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-serif font-bold text-cc-navy mt-6 mb-3 first:mt-0">
            {trimmed.replace('# ', '')}
          </h1>
        );
        return;
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        if (inList) flushList();
        elements.push(
          <h2 key={index} className="text-xl font-serif font-semibold text-cc-navy mt-5 mb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
        return;
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        if (inList) flushList();
        elements.push(
          <h3 key={index} className="text-lg font-serif font-semibold text-cc-navy-light mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }

      // List items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.replace(/^[-*]\s/, ''));
        return;
      }

      // Numbered list items
      if (/^\d+\.\s/.test(trimmed)) {
        if (inList) flushList();
        // For now treat as bullet
        inList = true;
        listItems.push(trimmed.replace(/^\d+\.\s/, ''));
        return;
      }

      // Safe inline style rendering without dangerouslySetInnerHTML
      const renderInlineStyles = (text: string, keyPrefix: string) => {
        // Split by bold markers first
        const boldParts = text.split(/\*\*([^*]+)\*\*/g);
        const elements: React.ReactNode[] = [];
        boldParts.forEach((part, i) => {
          if (i % 2 === 1) {
            // Bold segment
            elements.push(<strong key={`${keyPrefix}-b-${i}`}>{part}</strong>);
          } else if (part) {
            // Check for italic within non-bold segments
            const italicParts = part.split(/\*([^*]+)\*/g);
            italicParts.forEach((ip, j) => {
              if (j % 2 === 1) {
                elements.push(<em key={`${keyPrefix}-i-${i}-${j}`}>{ip}</em>);
              } else if (ip) {
                elements.push(<span key={`${keyPrefix}-t-${i}-${j}`}>{ip}</span>);
              }
            });
          }
        });
        return elements;
      };

      // Regular paragraph
      if (inList) flushList();
      elements.push(
        <p
          key={index}
          className="text-base leading-relaxed text-cc-text my-3"
        >
          {renderInlineStyles(trimmed, `p-${index}`)}
        </p>
      );
    });

    // Flush any remaining list
    if (inList) flushList();

    return elements;
  };

  return (
    <div className={cn(
      "prose prose-sm sm:prose max-w-none",
      "prose-headings:text-cc-navy prose-headings:font-serif",
      "prose-p:text-cc-text prose-p:leading-relaxed",
      "prose-strong:text-cc-navy prose-strong:font-semibold",
      "prose-ul:text-cc-text prose-li:text-cc-text",
      "prose-a:text-cc-gold prose-a:no-underline hover:prose-a:underline"
    )}>
      {renderMarkdown(markdown)}
    </div>
  );
}
