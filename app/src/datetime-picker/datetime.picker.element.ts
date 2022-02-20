import { Day } from "./day";
import { Calendar } from "./calendar";

export class DateTimePicker extends HTMLElement {
  
  static get observedAttributes() {
    return ['placeholder','start-date','end-date'];
  }
  
  format = 'DD/MM/YYYY';
  private shadow: ShadowRoot;
  private dateBtn: HTMLElement | null = null;
  
  calendar: Calendar;
  date: Day | null = null;

  constructor() {
    super();

    const lang = window.navigator.language;
    const date = new Date(this.date ?? (this.getAttribute("date") || Date.now()));
    this.date = new Day(date, lang);
    this.calendar = new Calendar(this.date.year, this.date.monthNumber, lang);

    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }

  connectedCallback() {
    this.dateBtn = this.shadow.querySelector(".datetime-icon");
    if (this.dateBtn) {
      this.dateBtn.addEventListener('click', this.triggerPicker);
    }
  }

  disconnectedCallback() {
    if (this.dateBtn) {
      this.dateBtn.removeEventListener('click', this.triggerPicker);
    }
  }  

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch(name) {
      case 'placeholder': {
        const startDate = this.shadow.querySelector('#startDate');
        const endDate = this.shadow.querySelector('#endDate');
        if (startDate && endDate) {
          (startDate as HTMLInputElement).placeholder = newValue;
          (endDate as HTMLInputElement).placeholder = newValue;
        }
      }

      case 'start-date': {
        const el = this.shadow.querySelector('#startDate');
        if (el && newValue) {
          (el as HTMLInputElement).value = newValue;
        }
      }

      case 'end_date': {
        const el = this.shadow.querySelector('#endDate');
        if (el && newValue) {
          (el as HTMLInputElement).value = newValue;
        }
      }
    }
  }

  get weekDays() {
    return this.calendar.weekDays
      .map((weekDay: string) => `<span>${weekDay.substring(0, 3)}</span>`)
      .join('');
  }

  selectDay(el: HTMLElement, day: any) {
    if(day.isEqualTo(this.date)) return;
    
    this.date = day;
    
    if(day.monthNumber !== this.calendar.month.number) {
      //this.prevMonth();
    } else {
      el.classList.add('selected');
      // this.selectedDayElement.classList.remove('selected');
      // this.selectedDayElement = el;
    }
    
    // this.toggleCalendar();
    // this.updateToggleText();
  }

  getMonthDaysGrid() {
    const firstDayOfTheMonth = this.calendar.month.getDay(1);
    const prevMonth = this.calendar.getPreviousMonth();
    const totalLastMonthFinalDays = firstDayOfTheMonth.dayNumber - 1;
    const totalDays = this.calendar.month.numberOfDays + totalLastMonthFinalDays;
    const monthList = Array.from({length: totalDays});
    
    for(let i = totalLastMonthFinalDays; i < totalDays; i++) {
      monthList[i] = this.calendar.month.getDay(i + 1 - totalLastMonthFinalDays)
    }
    
    for(let i = 0; i < totalLastMonthFinalDays; i++) {
      const inverted = totalLastMonthFinalDays - (i + 1);
      monthList[i] = prevMonth.getDay(prevMonth.numberOfDays - inverted);
    }
    
    return monthList;
  }

  updateMonthDays() {
    const elDays = this.shadow.querySelector(".month-days");
    if (elDays) {
      elDays.innerHTML = '';
    
      this.getMonthDaysGrid().forEach((day: any) => {
        const el = document.createElement('button');
        el.className = 'month-day';
        el.textContent = day.date;
        el.addEventListener('click', (e) => this.selectDay(el, day));
        el.setAttribute('aria-label', day.format(this.format));
          
        if(day.monthNumber === this.calendar.month.number) {
          el.classList.add('current');
        }

        // if(this.isSelectedDate(day)) {
        //   el.classList.add('selected');
        //   this.selectedDayElement = el;
        // }

        
        elDays.appendChild(el);
      })
    }
  }

  triggerPicker = () => {
    const el = this.shadow.querySelector('.select-area');
    if (el) {
      if (el.classList.contains('visible')) {
        el.classList.remove('visible');
      } else {
        el.classList.add('visible');
        this.updateMonthDays();
      }
    }
  }

  get css() {
    return `
      :host {
      }
      .element {
        width: 100%;
        height: 33px;
        display: grid;
        margin: 0;
        grid-template-columns: fit-content(50%) fit-content(50%) 35px;
        grid-gap: 5px;
        //border: 1px solid black;
        border-radius: 3px;
        margin-bottom: 3px;
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
      }
      .date-toggle {
        width: 185px;
        height: 26px;
      }
      .datetime-icon {
        position: relative;
        margin: 5px;
        background: url('/assets/datetime.png');
        background-size: 26px;
        background-repeat: no-repeat;
        height: 30px; 
        width: 30px;
        cursor: pointer; 
      }
      input[type="text"] {
        position: relative;
        top: 10px;
        width: 90%;
        height: 18px;
        color: #888;
        padding-left: 5px;
        outline: none;
        border: none;
      }
      .select-area {
        position: absolute;
        left: -50px;
        display: block;
        border-radius: 5px;
        width: 300px;
        height: 270px;
        cursor: pointer;
        background-color: #fff;
        padding: 10px;
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
        z-index: 99;
        opacity: 0;
      }
      .visible { 
        opacity: 1;
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
        color: #444;
        text-align: center;
        font-size: 20px;
        font-weight: 600;
      }
      .arrow {
        width: 0;
        height: 0;
        position: relative;
        top: 20px;
        border-bottom: 8px solid #444;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
      }
      .left {
        left: 16px;
        transform: rotate(-90deg);
        -webkit-transform: rotate(-90deg);
      }
      .right {
        transform: rotate(90deg);
        -webkit-transform: rotate(90deg);
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
        padding: 8px 5px;
        background: #c7c9d3;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        cursor: pointer;
        border: none;
      }
      .month-day.current {
        background: #444857;
      }
      .month-day.selected {
        background: #28a5a7;
        color: #ffffff;
      }
      .month-day:hover {
        background: #34bd61;
      }
    `;
  }

  render() {
    this.shadow.innerHTML = `
      <style>${this.css}</style>
      <div class="element">
        <div>
          <input id="startDate" type="text" class="date-toggle">
        </div>
        <div>  
          <input id="endDate" type="text" class="date-toggle">
        </div>
        <div class="datetime-icon"></div>
      </div>
      <div class="select-area">
        <div class="month">
          <div class="arrow left"></div>
          <div class="month-text">February, 2022</div>
          <div class="arrow right"></div>
        </div>
        <div class="week-days">${this.weekDays}</div>
        <div class="month-days"></div>
      </div>  
    `;
  }

}

customElements.define('wcl-datetime-picker', DateTimePicker);
