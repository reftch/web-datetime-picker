import { Day } from "./day";
import { isLeapYear } from "../utils";

export class Month {
  lang: string;
  name: string;
  number: number;
  year: number;
  numberOfDays: number;

  constructor(date: Date, lang = 'default') {
    const day = new Day(date, lang);
    const monthsSize = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    this.lang = lang;
    
    this.name = day.month;
    this.number = day.monthNumber;
    this.year = day.year;
    this.numberOfDays = monthsSize[this.number - 1];
    
    if (this.number === 2) {
      this.numberOfDays += isLeapYear(day.year) ? 1 : 0;
    }
  }
  
  getDay(date: number | undefined) {
    return new Day(new Date(this.year, this.number - 1, date), this.lang);
  }
}