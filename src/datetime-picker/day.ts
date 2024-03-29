
import { getWeekNumber } from "../utils";

export class Day extends Date {

  Date: Date;
  date: number;
  day: string;
  dayNumber: number;
  dayShort: string;
  year: number;
  yearShort: string;
  month: string;
  monthShort: string;
  monthNumber: number;
  timestamp: number;
  week: number;

  constructor(date: Date | null, lang = 'default') {
    super();
    date = date ?? new Date();

    this.year = date.getFullYear();
    this.Date = date;
    this.date = date.getDate();
    this.day = date.toLocaleString(lang, { weekday: 'long' });
    this.dayNumber = date.getDay() + 1;
    this.dayShort = date.toLocaleString(lang, { weekday: 'short' });
    this.yearShort = date.toLocaleString(lang, { year: '2-digit' });
    this.month = date.toLocaleString(lang, { month: 'long' });
    this.monthShort = date.toLocaleString(lang, { month: 'short' });
    this.monthNumber = date.getMonth() + 1;
    this.timestamp = date.getTime();
    this.week = getWeekNumber(date);
  }

  get isToday() {
    return this.isEqualTo(new Date());
  }

  getFullYear(): number {
    return this.year;
  }

  isEqualTo(date: Date) {
    date = date instanceof Day ? date.Date : date;
    return date.getDate() === this.date &&
      date.getMonth() === this.monthNumber - 1 &&
      date.getFullYear() === this.year;
  }

  isLessTo(date: Day) {
    if (this.year !== date.getFullYear()) {
      return this.year < date.getFullYear();
    }

    if (this.monthNumber !== date.monthNumber) {
      return this.monthNumber < date.monthNumber;
    }

    return this.date <= date.date;
  }

  format(formatStr: string) {
    return formatStr
      .replace(/\bYYYY\b/, String(this.year))
      .replace(/\bYYY\b/, this.yearShort)
      .replace(/\bWW\b/, this.week.toString().padStart(2, '0'))
      .replace(/\bW\b/, String(this.week))
      .replace(/\bDDDD\b/, this.day)
      .replace(/\bDDD\b/, this.dayShort)
      .replace(/\bDD\b/, this.date.toString().padStart(2, '0'))
      .replace(/\bD\b/, String(this.date))
      .replace(/\bMMMM\b/, this.month)
      .replace(/\bMMM\b/, this.monthShort)
      .replace(/\bMM\b/, this.monthNumber.toString().padStart(2, '0'))
      .replace(/\bM\b/, String(this.monthNumber));
  }

  toString() {
    return `${this.date}/${this.monthNumber}/${this.getFullYear()}`
  }

}