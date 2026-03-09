import React from 'react';
import { Link } from 'react-router-dom';

/**
 * parseInlineMarkdown
 * 
 * Converts a markdown string with inline formatting into React nodes.
 * Supports:
 *   **bold**       → <strong>
 *   *italic*       → <em>
 *   [text](url)    → <Link> (internal) or <a> (external)
 *   \n             → line break (respects whitespace-pre-line context)
 * 
 * No external dependencies. Zero bundle impact beyond this file.
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const nodes: React.ReactNode[] = [];
  // Matches **bold**, *italic*, [text](url), or a newline
  // Order matters: **bold** before *italic* to avoid partial matches
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)|\n)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Push any plain text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[0] === '\n') {
      nodes.push(<br key={`br-${keyCounter++}`} />);
    } else if (match[2]) {
      // **bold**
      nodes.push(<strong key={`b-${keyCounter++}`} className="font-semibold text-cc-navy">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      nodes.push(<em key={`i-${keyCounter++}`}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      // [text](url) — link
      const linkText = match[4];
      const url = match[5];
      const isInternal = url.startsWith('/');
      
      if (isInternal) {
        nodes.push(
          <Link 
            key={`link-${keyCounter++}`} 
            to={url}
            className="text-cc-gold underline hover:text-cc-gold/80 transition-colors"
          >
            {linkText}
          </Link>
        );
      } else {
        nodes.push(
          <a 
            key={`link-${keyCounter++}`} 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cc-gold underline hover:text-cc-gold/80 transition-colors"
          >
            {linkText}
          </a>
        );
      }
    }

    lastIndex = pattern.lastIndex;
  }

  // Push any remaining plain text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/**
 * MarkdownText
 * 
 * Drop-in component wrapper. Renders a string with inline markdown support.
 * Preserves paragraph structure via whitespace-pre-line on parent.
 */
export function MarkdownText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {parseInlineMarkdown(text)}
    </span>
  );
}
