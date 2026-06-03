import { ko } from './ko';

export const i18n = { ko };
export type Locale = keyof typeof i18n;

export function t(locale: Locale = 'ko') {
  return i18n[locale];
}

export { ko };
