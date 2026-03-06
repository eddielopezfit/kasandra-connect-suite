import React from 'react';

/**
 * parseInlineMarkdown
 * 
 * Converts a markdown string with inline formatting into React nodes.
 * Supports:
 *   **bold**  → <strong>
 *   *italic*  → <em>
 *   \n        → line break (respects whitespace-pre-line context)
 * 
 * No external dependencies. Zero bundle impact beyond this file.
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const nodes: React.ReactNode[] = [];
  // Matches **bold**, *italic*, or a newline
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|\n)/g;

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
