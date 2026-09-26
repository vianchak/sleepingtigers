import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import enMessages from '../../messages/en.json';
import ukMessages from '../../messages/uk.json';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  const messages = locale === 'uk' ? ukMessages : enMessages;

  return {
    locale,
    messages
  };
});
