import { ChatMessage } from './types';

export const CHAT_HISTORY_KEY = 'selena_chat_history';
export const LEAD_ID_KEY = 'selena_lead_id';
export const LAST_ENTRY_SIG_KEY = 'selena_last_entry_sig';
const MAX_HISTORY = 50;

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function hasStoredChatHistory(): boolean {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function getStoredHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Selena] Failed to load chat history:', e);
  }
  return [];
}

export function saveHistory(messages: ChatMessage[]): void {
  try {
    const trimmed = messages.slice(-MAX_HISTORY);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[Selena] Failed to save chat history:', e);
  }
}

export function getStoredLeadId(): string | null {
  try {
    return localStorage.getItem(LEAD_ID_KEY);
  } catch {
    return null;
  }
}

export function saveLeadId(leadId: string): void {
  try {
    localStorage.setItem(LEAD_ID_KEY, leadId);
  } catch (e) {
    console.warn('[Selena] Failed to save lead ID:', e);
  }
}
