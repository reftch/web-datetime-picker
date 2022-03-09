import { Day } from "./day";
import { Month } from "./month";

export class Calendar {

  weekDays = Array.from<string>({ length: 7 });
  today: Day;
  year: number;
  month: Month;
  lang: string;
  
  constructor(year: number, monthNumber: number, lang = 'default') {
    this.today = new Day(null, lang);
    this.year = year ?? this.today.year;
    this.month = new Month(new Date(this.year, (monthNumber || this.today.monthNumber) - 1), lang);
    this.lang = lang;
    
    this.weekDays.forEach((_, i: number) => {
      const day = this.month.getDay(i + 1);
      if (!this.weekDays.includes(day.day)) {
        this.weekDays[day.dayNumber - 1] = day.day;
      }
    })
  }
    
  getMonth() {
    return this.month;
  }
  
  get previousMonth() {
    if(this.month.number === 1) {
      return new Month(new Date(this.year - 1, 11), this.lang);
    }
    
    return new Month(new Date(this.year, this.month.number - 2), this.lang);
  }
  
  get nextMonth() {
    if (this.month.number === 12) {
      return new Month(new Date(this.year + 1, 0), this.lang);
    }
    
    return new Month(new Date(this.year, this.month.number + 2), this.lang);
  }
  
  toDate(monthNumber: number, year: number) {
    this.month = new Month(new Date(year, monthNumber - 1), this.lang);
    this.year = year;
  }
  
  toNextYear() {
    this.year += 1;
    this.month = new Month(new Date(this.year, 0), this.lang);
  }
  
  toPreviousYear() {
    this.year -= 1;
    this.month = new Month(new Date(this.year, 11), this.lang);
  }
  
  toNextMonth() {
    if(this.month.number === 12) {
      return this.toNextYear();
    }
    
    this.month = new Month(new Date(this.year, (this.month.number + 1) - 1), this.lang);
  }
  
  toPreviousMonth() {
    if(this.month.number === 1) {
      return this.toPreviousYear();
    }
    
    this.month = new Month(new Date(this.year, (this.month.number - 1) - 1), this.lang);
  }
}