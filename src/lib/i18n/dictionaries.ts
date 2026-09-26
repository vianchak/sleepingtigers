import en from '../../../messages/en';
import uk from '../../../messages/uk';

export const dictionaries = { en, uk };
export type Locale = keyof typeof dictionaries;

export function getDictionary(locale: string) {
  return dictionaries[locale as Locale] || dictionaries.en;
}

export function getScopedTranslator(locale: string, namespace: string) {
  const dict = getDictionary(locale);
  const scoped = (dict as any)[namespace] || {};
  return (key: string) => scoped[key] || key;
}
