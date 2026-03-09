export const logger = {
  log: (...args: unknown[]) => {
    if (import.meta.env.PROD) return;
    console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (import.meta.env.PROD) return;
    console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.PROD) return;
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // We always want to log errors, even in prod
    console.error(...args);
  },
};
