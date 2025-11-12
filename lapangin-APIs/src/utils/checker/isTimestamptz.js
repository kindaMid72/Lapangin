import { Temporal } from '@js-temporal/polyfill';

export default function isValidTimestamptz(str) {
    if (typeof str !== 'string') return false;
    try {
      const zdt = Temporal.ZonedDateTime.from(str);
      return zdt instanceof Temporal.ZonedDateTime;
    } catch {
      return false;
    }
}
