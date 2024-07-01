import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from 'core';
export const CURRENCY_TO_SYMBOL_MAP = {
  AED: 'د.إ',
  AFN: '؋',
  ALL: 'L',
  AMD: '֏',
  ANG: 'ƒ',
  AOA: 'Kz',
  ARS: '$',
  AUD: '$',
  AWG: 'ƒ',
  AZN: '₼',
  BAM: 'KM',
  BBD: '$',
  BDT: '৳',
  BGN: 'лв',
  BHD: '.د.ب',
  BIF: 'FBu',
  BMD: '$',
  BND: '$',
  BOB: '$b',
  BOV: 'BOV',
  BRL: 'R$',
  BSD: '$',
  BTC: '₿',
  BTN: 'Nu.',
  BWP: 'P',
  BYN: 'Br',
  BYR: 'Br',
  BZD: 'BZ$',
  CAD: '$',
  CDF: 'FC',
  CHE: 'CHE',
  CHF: 'CHF',
  CHW: 'CHW',
  CLF: 'CLF',
  CLP: '$',
  CNH: '¥',
  CNY: '¥',
  COP: '$',
  COU: 'COU',
  CRC: '₡',
  CUC: '$',
  CUP: '₱',
  CVE: '$',
  CZK: 'Kč',
  DJF: 'Fdj',
  DKK: 'kr',
  DOP: 'RD$',
  DZD: 'دج',
  EEK: 'kr',
  EGP: '£',
  ERN: 'Nfk',
  ETB: 'Br',
  ETH: 'Ξ',
  EUR: '€',
  FJD: '$',
  FKP: '£',
  GBP: '£',
  GEL: '₾',
  GGP: '£',
  GHC: '₵',
  GHS: 'GH₵',
  GIP: '£',
  GMD: 'D',
  GNF: 'FG',
  GTQ: 'Q',
  GYD: '$',
  HKD: '$',
  HNL: 'L',
  HRK: 'kn',
  HTG: 'G',
  HUF: 'Ft',
  IDR: 'Rp',
  ILS: '₪',
  IMP: '£',
  INR: '₹',
  IQD: 'ع.د',
  IRR: '﷼',
  ISK: 'kr',
  JEP: '£',
  JMD: 'J$',
  JOD: 'JD',
  JPY: '¥',
  KES: 'KSh',
  KGS: 'лв',
  KHR: '៛',
  KMF: 'CF',
  KPW: '₩',
  KRW: '₩',
  KWD: 'KD',
  KYD: '$',
  KZT: '₸',
  LAK: '₭',
  LBP: '£',
  LKR: '₨',
  LRD: '$',
  LSL: 'M',
  LTC: 'Ł',
  LTL: 'Lt',
  LVL: 'Ls',
  LYD: 'LD',
  MAD: 'MAD',
  MDL: 'lei',
  MGA: 'Ar',
  MKD: 'ден',
  MMK: 'K',
  MNT: '₮',
  MOP: 'MOP$',
  MRO: 'UM',
  MRU: 'UM',
  MUR: '₨',
  MVR: 'Rf',
  MWK: 'MK',
  MXN: '$',
  MXV: 'MXV',
  MYR: 'RM',
  MZN: 'MT',
  NAD: '$',
  NGN: '₦',
  NIO: 'C$',
  NOK: 'kr',
  NPR: '₨',
  NZD: '$',
  OMR: '﷼',
  PAB: 'B/.',
  PEN: 'S/.',
  PGK: 'K',
  PHP: '₱',
  PKR: '₨',
  PLN: 'zł',
  PYG: 'Gs',
  QAR: '﷼',
  RMB: '￥',
  RON: 'lei',
  RSD: 'Дин.',
  RUB: '₽',
  RWF: 'R₣',
  SAR: '﷼',
  SBD: '$',
  SCR: '₨',
  SDG: 'ج.س.',
  SEK: 'kr',
  SGD: 'S$',
  SHP: '£',
  SLL: 'Le',
  SOS: 'S',
  SRD: '$',
  SSP: '£',
  STD: 'Db',
  STN: 'Db',
  SVC: '$',
  SYP: '£',
  SZL: 'E',
  THB: '฿',
  TJS: 'SM',
  TMT: 'T',
  TND: 'د.ت',
  TOP: 'T$',
  TRL: '₤',
  TRY: '₺',
  TTD: 'TT$',
  TVD: '$',
  TWD: 'NT$',
  TZS: 'TSh',
  UAH: '₴',
  UGX: 'USh',
  USD: '$',
  UYI: 'UYI',
  UYU: '$U',
  UYW: 'UYW',
  UZS: 'лв',
  VEF: 'Bs',
  VES: 'Bs.S',
  VND: '₫',
  VUV: 'VT',
  WST: 'WS$',
  XAF: 'FCFA',
  XBT: 'Ƀ',
  XCD: '$',
  XOF: 'CFA',
  XPF: '₣',
  XSU: 'Sucre',
  XUA: 'XUA',
  YER: '﷼',
  ZAR: 'R',
  ZMW: 'ZK',
  ZWD: 'Z$',
  ZWL: '$',
} as Record<string, string>;
/**
 * This class will take in a string and determine whether or
 * not it is a number. See {@link interfaces/fieldProcessing/iFieldChecker!IFieldChecker}
 * additional details.
 */
export class NumberFieldChecker implements fieldProcessingInterfaces.IFieldChecker<number> {
  /**
   *  Will take an input and compare it to a currency symbol table
   *  {@link https://github.com/bengourley/currency-symbol-map#readme currency-symbol-map }
   *  to determine whether or not the string is a currency symbol
   */
  private isCurrencySymbol(input: string): boolean {
    let retval = false;
    for (const key in CURRENCY_TO_SYMBOL_MAP) {
      const sym = CURRENCY_TO_SYMBOL_MAP[key];
      if (sym === input) {
        retval = true;
        break;
      }
    }
    return retval;
  }

  //TODO: we probbaly want to convert accounting practice of wrapping a negative value in () and replacing it with a '-' sign.
  /**
   * will prepare our string for comparison by:
   * 1. triming leading and trailing spaces
   * 2. removing leading currency symbols.
   */
  private cleanStringForProcessing(input: string) {
    //make a copy because we may alter the string

    let tempString = input.trim();
    const asciiCode = tempString.charCodeAt(0);

    //do we have a currency symbol that needs to be removed.
    if (
      asciiCode !== 43 && //+
      asciiCode !== 45 && //-
      (asciiCode < 48 || asciiCode > 57) // 0 - 9
    ) {
      if (this.isCurrencySymbol(tempString[0])) {
        tempString = tempString.substring(1);
      }
    }

    // console.log({tempString});
    return tempString;
  }

  /**
   * See the interface IFieldChecker for more information. {@link interfaces/fieldProcessing/iFieldChecker!IFieldChecker.checkField | IFieldChecker.checkField}
   */
  public checkField(input: string, cleanString = true): boolean {
    const trimmed = cleanString ? this.cleanStringForProcessing(input) : input;
    //eslint-disable-next-line no-useless-escape
    const regex =
      //eslint-disable-next-line no-useless-escape
      /^[\-\+]?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.([0-9]*))?%?$/;

    const retval = regex.test(trimmed);
    return retval;
  }
  /**
   * See the interface IFieldChecker for more information. {@link interfaces/fieldProcessing/iFieldChecker!IFieldChecker.convertField | IFieldChecker.convertField}
   */
  public convertField(input: string): number {
    let tempString = this.cleanStringForProcessing(input);
    if (!this.checkField(tempString, false)) {
      throw new error.InvalidArgumentError(`The input value of : ${input} is not a number`, 'input', input);
    }

    const isPercent = tempString.endsWith('%');

    if (isPercent) {
      tempString = tempString.substring(0, tempString.length - 1);
    }
    tempString = tempString.replace(/,/g, '');
    let retval = Number(tempString);

    if (isPercent) {
      retval = retval / 100;
    }

    retval = Number(retval.toFixed(7));
    return retval;
  }
}
