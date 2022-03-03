import { Day } from "./day";
import { Calendar } from "./calendar";

export class DateTimePicker extends HTMLElement {
  
  static get observedAttributes() {
    return ['placeholder','start-date','end-date'];
  }
  
  private format = 'DD/MM/YYYY';

  private shadow: ShadowRoot;
  private dateBtn: HTMLElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  
  private startDay: Day;
  private endDay: Day;
  private calendar: Calendar;
  private selectedStartDayElement: HTMLElement | null = null;
  private selectedEndDayElement: HTMLElement | null = null;

  private range: boolean;
  private width = 120;

  constructor() {
    super();

    const lang = window.navigator.language;
    const date = new Date((this.getAttribute("date") || Date.now()));
    this.startDay = new Day(date, lang);
    this.endDay = this.startDay;
    this.calendar = new Calendar(this.startDay.year, this.startDay.monthNumber, lang);

    const range = this.getAttribute("range"); 
    this.range = range === 'true';

    const width = this.getAttribute("width"); 
    if (width) {
      this.width = Number(width);
    }

    this.shadow = this.attachShadow({ mode: "open", delegatesFocus: true });
    this.render();
  }

  connectedCallback() {
    this.dateBtn = this.shadow.querySelector(".date-time-icon");
    if (this.dateBtn) {
      this.dateBtn.addEventListener('click', this.triggerPicker);
    }
    this.prevBtn = this.shadow.querySelector(".left");
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', this.prevMonth);
    }
    this.nextBtn = this.shadow.querySelector(".right");
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', this.nextMonth);
    }

    this.addEventListener('keydown', this.keydownHandler);
    this.addEventListener('blur', this.blurHandler);
  }

  disconnectedCallback() {
    if (this.dateBtn) {
      this.dateBtn.removeEventListener('click', this.triggerPicker);
    }
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.prevMonth);
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.nextMonth);
    }
    this.removeEventListener('keydown', this.keydownHandler);
    this.removeEventListener('blur', this.blurHandler);
  }  

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch(name) {
      case 'placeholder': {
        const startDate = this.shadow.querySelector('#startDate');
        if (startDate) {
          (startDate as HTMLInputElement).placeholder = newValue;
        }
        const endDate = this.shadow.querySelector('#endDate');
        if (endDate) {
          (endDate as HTMLInputElement).placeholder = newValue;
        }
        break;
      }

      case 'start-date': {
        const el = this.shadow.querySelector('#startDate');
        if (el && newValue) {
          (el as HTMLInputElement).value = newValue;
        }
        break;
      }

      case 'end-date': {
        const el = this.shadow.querySelector('#endDate');
        if (el && newValue) {
          (el as HTMLInputElement).value = newValue;
        }
      }
    }
  }

  get weekDays() {
    return this.calendar.weekDays
      .map((weekDay: string) => `<span>${weekDay.substring(0, 3)}</span>`).join('');
  }

  keydownHandler = (e: KeyboardEvent) => {
    if (e.code === 'Escape' || e.code === 'Enter') {
      const el = this.shadow.querySelector('.select-area');
      if (el && el.classList.contains('visible')) {
        el.classList.remove('visible');
      }
    }
  }

  blurHandler = () => {
    const el = this.shadow.querySelector('.select-area');
    if (el && el.classList.contains('visible')) {
      this.closeMonthDays();
      el.classList.remove('visible');
    }
  }

  selectDay(el: HTMLElement, day: any) {
    if (day.isEqualTo(this.startDay)) {
      this.setDateValue('startDate', this.startDay);
      return;
    }
    
    if (day.monthNumber !== this.calendar.month.number) {
      this.prevMonth();
    } else {
      if (!this.range) {
        this.startDay = day;
        el.classList.add('selected');
        if (this.selectedStartDayElement) {
          this.selectedStartDayElement.classList.remove('selected');
        }
        this.selectedStartDayElement = el;
        this.setDateValue('startDate', this.startDay);
      } else {

        const startDate = this.getDateValue('startDate');
        if (!startDate) {
          this.startDay = day;
          el.classList.add('selected');
          if (this.selectedStartDayElement) {
            this.selectedStartDayElement.classList.remove('selected');
          }
          this.selectedStartDayElement = el;
          this.setDateValue('startDate', this.startDay);
          return;
        }

        const endDate = this.getDateValue('endDate');
        if (!endDate) {
          this.endDay = day;
          el.classList.add('selected');
          this.selectedStartDayElement = el;
          this.setDateValue('endDate', this.endDay);
        }   
      }
    }    
  }

  setDateValue(id: string, date: Day) {
    const el = this.shadow.querySelector(`#${id}`);
    if (el) {
      (el as HTMLInputElement).value = date.format(this.format);
    }
  }

  getDateValue(id: string) {
    const el = this.shadow.querySelector(`#${id}`);
    return el ? (el as HTMLInputElement).value : '';
  } 

  prevMonth = () => {
    this.calendar.goToPreviousMonth();
    this.renderCalendarDays();
  }

  nextMonth = () => {
    this.calendar.goToNextMonth();
    this.renderCalendarDays();
  }

  updateHeaderText() {
    // this.calendarDateElement.textContent = 
      // `${this.calendar.month.name}, ${this.calendar.year}`;
    const monthYear = `${this.calendar.month.name}, ${this.calendar.year}`;
    const header = this.shadow.querySelector('.month-text');
    if (header) {
      (header as HTMLElement).innerText = monthYear;
    }
  }

  get monthDaysGrid() {
    const firstDayOfTheMonth = this.calendar.month.getDay(1);
    const prevMonth = this.calendar.getPreviousMonth();
    const totalLastMonthFinalDays = firstDayOfTheMonth.dayNumber - 1;
    const totalDays = this.calendar.month.numberOfDays + totalLastMonthFinalDays;
    const monthList = Array.from({ length: totalDays });
    
    for (let i = totalLastMonthFinalDays; i < totalDays; i++) {
      monthList[i] = this.calendar.month.getDay(i + 1 - totalLastMonthFinalDays)
    }
    
    for (let i = 0; i < totalLastMonthFinalDays; i++) {
      const inverted = totalLastMonthFinalDays - (i + 1);
      monthList[i] = prevMonth.getDay(prevMonth.numberOfDays - inverted);
    }
    
    return monthList;
  }

  isSelectedDate(day: Day) {
    return this.startDay && day.date === this.startDay.date &&
      day.monthNumber === this.startDay.monthNumber &&
      day.year === this.startDay.year;
  }

  updateMonthDays() {
    const elDays = this.shadow.querySelector(".month-days");
    if (elDays) {
      elDays.innerHTML = '';
    
      this.monthDaysGrid.forEach((day: any) => {
        const el = document.createElement('button');
        el.className = 'month-day';
        el.textContent = day.date;
        el.addEventListener('click', () => this.selectDay(el, day));
        el.setAttribute('aria-label', day.format(this.format));
          
        if (day.monthNumber === this.calendar.month.number) {
          el.classList.add('current');
        }

        if (this.isSelectedDate(day)) {
          el.classList.add('selected');
          this.selectedStartDayElement = el;
        }
        
        elDays.appendChild(el);
      })
    }
  }

  closeMonthDays() {
    this.monthDaysGrid.forEach((day: any) => {
      const el = document.createElement('button');
      el.removeEventListener('click', () => this.selectDay(el, day));
    })
  
  }

  renderCalendarDays() {
    this.updateHeaderText();
    this.updateMonthDays();
    //this.calendarDateElement.focus();
  }

  triggerPicker = () => {
    const el = this.shadow.querySelector('.select-area');
    if (el) {
      if (el.classList.contains('visible')) {
        this.closeMonthDays();
        el.classList.remove('visible');
      } else {
        this.updateMonthDays();
        el.classList.add('visible');
        this.renderCalendarDays();
      }
    }
  }

  get css() {
    return `
      :host {
        color: var(--db-color);
      }
      :focus {
        outline: none;
      }
      .element {
        height: 33px;
        display: grid;
        margin: 0;
        grid-template-columns: fit-content(100%) 35px;
        grid-gap: 5px;
        border-radius: 3px;
        margin-bottom: 5px;
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
      }
      .range-element {
        height: 33px;
        display: grid;
        margin: 0;
        grid-template-columns: fit-content(50%) fit-content(50%) 35px;
        grid-gap: 5px;
        border-radius: 3px;
        margin-bottom: 5px;
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
      }
      .date-toggle {
        width: 185px;
        height: 26px;
      }
      .date-time-icon {
        position: relative;
        margin: 5px;
        background: url('/assets/datetime.png');
        background-size: 26px;
        background-repeat: no-repeat;
        height: 26px; 
        width: 26px;
        cursor: pointer; 
      }
      .date-time-icon:hover {
        color: var(--dp-hover);
      }
      input[type="text"] {
        position: relative;
        top: 9px;
        width: 90%;
        height: 18px;
        padding-left: 5px;
        background-color: var(--dp-background);
        outline: none;
        border: none;
      }
      ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: var(--dp-placeholder);
        opacity: 1; /* Firefox */
      }
      .select-area {
        position: absolute;
        display: block;
        border-radius: 5px;
        width: 300px;
        height: 320px;
        background-color: var(--dp-background);
        padding: 10px;
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
        opacity: 0;
        z-index: 0;
        border: 1px solid transparent; 
      }
      .visible { 
        opacity: 1;
        z-index: 999;
      }
      .month {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: 10% 80% 10%;
        line-height: 50px;
        height: 50px;
        padding: 10px 0 10px 0;
      }
      .month-text {
        color: var(--dp-color);
        text-align: center;
        font-size: 20px;
        font-weight: 600;
      }
      .arrow {
        width: 0;
        height: 0;
        position: relative;
        top: 20px;
        border-bottom: 8px solid var(--dp-color);
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
      }
      .left {
        cursor: pointer;
        left: 16px;
        transform: rotate(-90deg);
        -webkit-transform: rotate(-90deg);
      }
      .right {
        cursor: pointer;
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg);
      }
      .left:hover, 
      .right:hover {
        border-bottom-color: var(--dp-hover);
      }
      .week-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 5px;
        margin-bottom: 10px;
      }
      .week-days span {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        text-transform: capitalize;
      }
      .month-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 5px;
      }
      .month-day {
        padding: 12px;
        background: var(--dp-month-day);
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 20px;
        cursor: pointer;
        border: none;
      }
      .month-day.current {
        background: var(--dp-color);
      }
      .month-day.selected {
        background: var(--dp-selected);
        color: var(--dp-background);
      }
      .month-day:hover {
        background: var(--dp-selected);
      } 
    `;
  }

  get elementWidth() {
    return `width: ${this.width}px`;
  }

  get selectAreaShift() {
    return `left: -${(320 - this.width)/2}px`;
  }

  get endDate() {
    return `
      <div>  
        <input id="endDate" type="text" class="date-toggle">
      </div>
    `;    
  }

  get nothing() {
    return `<!-- -->`;
  }

  get picker() {
    return `
      <style>${this.css}</style>
      <div class="${this.range ? 'range-element' : 'element'}" style="${this.elementWidth}">
        <div>
          <input id="startDate" type="text" class="date-toggle">
        </div>
        ${this.range ? this.endDate : this.nothing}
        <div class="date-time-icon"></div>
      </div>
      <div class="select-area" style="${this.selectAreaShift}">
        <div class="month">
          <div class="arrow left"></div>
          <div class="month-text"></div>
          <div class="arrow right"></div>
        </div>
        <div class="week-days">${this.weekDays}</div>
        <div class="month-days"></div>
      </div>  
    `;
  }

  render() {
    this.shadow.innerHTML = this.picker;
  }

}

customElements.define('wcl-datetime-picker', DateTimePicker);

/*
      <div class="select-area">
        <div class="month">
          <div class="arrow left"></div>
          <div class="month-text"></div>
          <div class="arrow right"></div>
        </div>
        <div class="week-days">${this.weekDays}</div>
        <div class="month-days"></div>
      </div>  

*/