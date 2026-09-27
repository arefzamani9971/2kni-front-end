export type Logger = {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
};

/** Console adapter; replace with Sentry/other in the composition root. Never log personal data. */
export const createConsoleLogger = (level: 'debug' | 'info' | 'warn' | 'error' = 'info'): Logger => {
  const order = ['debug', 'info', 'warn', 'error'] as const;
  const enabled = (l: (typeof order)[number]) => order.indexOf(l) >= order.indexOf(level);
  return {
    debug: (m, d) => enabled('debug') && console.debug(`[dukani] ${m}`, d ?? ''),
    info: (m, d) => enabled('info') && console.info(`[dukani] ${m}`, d ?? ''),
    warn: (m, d) => enabled('warn') && console.warn(`[dukani] ${m}`, d ?? ''),
    error: (m, d) => enabled('error') && console.error(`[dukani] ${m}`, d ?? ''),
  };
};
