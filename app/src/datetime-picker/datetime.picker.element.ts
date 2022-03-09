import { Day } from "./day";
import { Calendar } from "./calendar";
import { ButtonElement } from "../button/button.element";

export class DateTimePickerElement extends HTMLElement {

  static get observedAttributes() {
    return ['placeholder', 'start-date', 'end-date', 'lang', 'start-time-title', 'end-time-title', 'width','btn-today','btn-reset','btn-done'];
  }

  private format = 'DD/MM/YYYY';
  private isoFormat = 'MM/DD/YYYY';

  private shadow: ShadowRoot;
  private dateInput: HTMLElement | null = null;
  private dateBtn: HTMLElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private todayBtn: HTMLElement | null = null;
  private doneBtn: HTMLElement | null = null;
  private resetBtn: HTMLElement | null = null;

  private startDay: Day | null;
  private endDay: Day | null;
  private calendar: Calendar;
  private selectedDayElement: HTMLElement | null = null;

  private width = 0;

  private startTimeTitle: string | null = '';
  private endTimeTitle: string | null = '';
  private btnTodayTitle = 'Today';
  private btnResetTitle = 'Reset';
  private btnDoneTitle = 'Done';

  private startHours = 0;
  private startMinutes = 0;
  private endHours = 23;
  private endMinutes = 59;

  private range = false;

  constructor() {
    super();

    this.lang = this.getAttribute("lang") || window.navigator.language;
    this.startTimeTitle = this.getAttribute("start-time-title");
    this.endTimeTitle = this.getAttribute("end-time-title");
    this.range = this.getAttribute("range") === 'true';

    const date = new Date((this.getAttribute("date") || Date.now()));
    this.startDay = new Day(date, this.lang);
    this.endDay = new Day(date, this.lang);
    this.calendar = new Calendar(this.startDay.year, this.startDay.monthNumber, this.lang);
    
    if (!this.range) {
      this.startHours = new Date(Date.now()).getHours();
      this.startMinutes = new Date(Date.now()).getMinutes();
    }

    const width = this.getAttribute("width");
    if (width) {
      this.width = Number(width);
    }

    this.shadow = this.attachShadow({ mode: "open", delegatesFocus: true });
    this.render();
  }

  connectedCallback() {
    this.dateInput = this.shadow.querySelector("#startDate");
    if (this.dateInput) {
      this.dateInput.addEventListener('click', this.triggerPicker);
    }
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
    this.todayBtn = this.shadow.querySelector("#today-btn");
    if (this.todayBtn) {
      this.todayBtn.addEventListener('click', this.today);
    }
    this.resetBtn = this.shadow.querySelector("#reset-btn");
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', this.reset);
    }
    this.doneBtn = this.shadow.querySelector("#done-btn");
    if (this.doneBtn) {
      this.doneBtn.addEventListener('click', this.done);
    }

    const el = this.shadow.querySelector('.element');
    if (el) {
      setTimeout(() => this.resizeObserver.observe(el), 10);
    }

    this.addEventListener('keydown', this.keydownHandler);
    this.addEventListener('blur', this.blurHandler);
  }

  disconnectedCallback() {
    if (this.dateInput) {
      this.dateInput.removeEventListener('click', this.triggerPicker);
    }
    if (this.dateBtn) {
      this.dateBtn.removeEventListener('click', this.triggerPicker);
    }
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.prevMonth);
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.nextMonth);
    }
    if (this.todayBtn) {
      this.todayBtn.removeEventListener('click', this.today);
    }
    if (this.resetBtn) {
      this.resetBtn.removeEventListener('click', this.reset);
    }
    if (this.doneBtn) {
      this.doneBtn.removeEventListener('click', this.done);
    }

    this.removeEventListener('keydown', this.keydownHandler);
    this.removeEventListener('blur', this.blurHandler);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'placeholder': {
        const startDate = this.shadow.querySelector('#startDate');
        if (startDate) {
          (startDate as HTMLInputElement).placeholder = newValue;
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

      case 'lang': {
        if (this.startDay) {
          this.calendar = new Calendar(this.startDay.year, this.startDay.monthNumber, this.lang);
        }
        break;
      }
      case 'width': {
        this.width = Number(newValue);
        break;
      }

      case 'start-time-title': {
        this.startTimeTitle = newValue;
        const el = this.shadow.querySelector("#start-time-title");
        if (el) {
          el.innerHTML = `${this.startTimeTitle}:`;
        }
        break;
      }
      case 'end-time-title': {
        this.endTimeTitle = newValue;
        const el = this.shadow.querySelector("#end-time-title");
        if (el) {
          el.innerHTML = `${this.endTimeTitle}:`;
        }
        break;
      }
      case 'btn-today': {
        this.btnTodayTitle = newValue;
        const el = this.shadow.querySelector("#today-btn");
        if (el) {
          (el as ButtonElement).title = `${this.btnTodayTitle}`;
        }
        break;
      }
      case 'btn-reset': {
        this.btnResetTitle = newValue;
        const el = this.shadow.querySelector("#reset-btn");
        if (el) {
          (el as ButtonElement).title = `${this.btnResetTitle}`;
          (el as ButtonElement).secondary = true;
        }
        break;
      }
      case 'btn-done': {
        this.btnDoneTitle = newValue;
        const el = this.shadow.querySelector("#done-btn");
        if (el) {
          (el as ButtonElement).title = `${this.btnDoneTitle}`;
        }
        break;
      }
    }
  }

  _resizeCallback = (entries: ResizeObserverEntry[]) => {
    let el = this.shadow.querySelector('#startDate');
    if (el) {
      (el as any).style = `width: ${(this.width) - 15}px;`;
    }
  }

  resizeObserver = new ResizeObserver(this._resizeCallback);

  get weekDays() {
    return this.calendar.weekDays
      .map((weekDay: string) => `<span>${weekDay.substring(0, 3)}</span>`).join('');
  }

  keydownHandler = (e: KeyboardEvent) => {
    const el = this.shadow.activeElement;
    if (e.code === 'Escape' || e.code === 'Enter') {
      const el = this.shadow.querySelector('.select-area');
      if (el && el.classList.contains('visible')) {
        el.classList.remove('visible');
      }
    } else if (el &&e.code === 'ArrowUp' && this.startDay) {
      if (el.getAttribute('id') === 'start-hours' && this.startHours < 23) {
        this.startHours++;
      }
      if (el.getAttribute('id') === 'start-minutes' && this.startMinutes < 59) {
        this.startMinutes++;
      }
      if (el.getAttribute('id') === 'end-hours' && this.endHours < 23) {
        this.endHours++;
      }
      if (el.getAttribute('id') === 'end-minutes' && this.endMinutes < 59) {
        this.endMinutes++;
      }
    } else if (el && e.code === 'ArrowDown' && this.startDay) {
      if (el.getAttribute('id') === 'start-hours' && this.startHours > 0) {
        this.startHours--;
      }
      if (el.getAttribute('id') === 'start-minutes' && this.startMinutes > 0) {
        this.startMinutes--;
      }
      if (el.getAttribute('id') === 'end-hours' && this.endHours > 0) {
        this.endHours--;
      }
      if (el.getAttribute('id') === 'end-minutes' && this.endMinutes > 0) {
        this.endMinutes--;
      }
    }

    if (el && e.code === 'Backspace') {
      if (el.getAttribute('id') === 'start-hours') {
        this.startHours = 0;
      }    
      if (el.getAttribute('id') === 'start-minutes') {
        this.startMinutes = 0;
      }    
      if (el.getAttribute('id') === 'end-hours') {
        this.endHours = 0;
      }    
      if (el.getAttribute('id') === 'end-minutes') {
        this.endMinutes = 0;
      }    
    }

    if (el && ['0','1','2','3','4','5','6','7','8','9'].includes(e.key) && this.startDay) {
      const existedValue = (el as HTMLInputElement).value;
      const newValue = Number(`${existedValue[1]}${e.key}`);
      if (el.getAttribute('id') === 'start-hours' && newValue <= 23 && newValue >= 0) {
        this.startHours = newValue;
      }
      if (el.getAttribute('id') === 'start-minutes' && newValue <= 59 && newValue >= 0) {
        this.startMinutes = newValue;
      }
      if (el.getAttribute('id') === 'end-hours' && newValue <= 23 && newValue >= 0) {
        this.endHours = newValue;
      }
      if (el.getAttribute('id') === 'end-minutes' && newValue <= 59 && newValue >= 0) {
        this.endMinutes = newValue;
      }
    }

    this.updateTimeValues();
  }

  blurHandler = () => {
    const el = this.shadow.querySelector('.select-area');
    if (el && el.classList.contains('visible')) {
      this.closeMonthDays();
      // el.classList.remove('visible');
    }
  }

  today = () => {
    const date = new Date(Date.now());
    this.startDay = new Day(date, this.lang);
    this.endDay = new Day(date, this.lang);
    this.calendar = new Calendar(this.startDay.year, this.startDay.monthNumber, this.lang);
    this.closeMonthDays();
    this.renderCalendarDays();
  }

  reset = () => {
    this.startDay = null;
    this.endDay = null;
    this.startHours = 0;
    this.startMinutes = 0;
    this.endHours = 23;
    this.endMinutes = 59;
    this.setTimeDisabled(true);
    this.closeMonthDays();
    this.renderCalendarDays();
  }

  done = () => {
    this.setDateValue();
    this.triggerPicker();
  }

  updateTimeValues() {
    let el = this.shadow.querySelector('#start-hours');
    if (el) {
      (el as HTMLInputElement).value = this.getFormattedHours(this.startHours);
    }
    el = this.shadow.querySelector('#start-minutes');
    if (el) {
      (el as HTMLInputElement).value = this.getFormattedHours(this.startMinutes);
    }
    el = this.shadow.querySelector('#end-hours');
    if (el) {
      (el as HTMLInputElement).value = this.getFormattedHours(this.endHours);
    }
    el = this.shadow.querySelector('#end-minutes');
    if (el) {
      (el as HTMLInputElement).value = this.getFormattedHours(this.endMinutes);
    }
  }

  adjustedSelected() {
    const elDays = this.shadow.querySelector(".month-days");
    if (elDays) {
      const monthDays = elDays.querySelectorAll('button');
      let index = 1;
      monthDays.forEach((el: HTMLElement) => {
        const dateNumber = Number(el.innerHTML);
        if (dateNumber === index) {
  
          const d = new Date(this.calendar.year, this.calendar.month.number - 1, dateNumber);
          const date = new Day(d, this.lang);
          if (this.startDay && this.endDay && this.startDay.isLessTo(date) && date.isLessTo(this.endDay)) {
            el.classList.add('selected');
          } else {
            el.classList.remove('selected');
          }
          index++;
        }
      })
    }

  }

  selectDay(el: HTMLElement, day: any) {
    if (this.startDay && day.isEqualTo(this.startDay)) {
      return;
    }

    if (!this.startDay) {
      this.startDay = day;
      this.endDay = day;
      this.setTimeDisabled(false);
    } 

    if (day.monthNumber !== this.calendar.month.number) {
      this.prevMonth();
    } else {
      if (this.range) {
        // set start day
        if (day.isLessTo(this.startDay)) {
          this.startDay = day;
        } else {
          this.endDay = day;
        }
        this.adjustedSelected();
      } else {
        this.startDay = day;
        el.classList.add('selected');
        if (this.selectedDayElement) {
          this.selectedDayElement.classList.remove('selected');
        }
        this.selectedDayElement = el;
      }
    }
  }

  setDateValue() {
    let startDate = null;
    if (this.startDay) {
      startDate = new Date(this.startDay.format(this.isoFormat));
      // const offset = startDate.getTimezoneOffset()/60;
      startDate.setHours(this.startHours);
      startDate.setMinutes(this.startMinutes);
    } 
    let endDate = null;
    if (this.endDay) {
      endDate = new Date(this.endDay.format(this.isoFormat));
      // const offset = endDate.getTimezoneOffset()/60;
      endDate.setHours(this.endHours);
      endDate.setMinutes(this.endMinutes);
    } 

    // update input field
    let el = this.shadow.querySelector(`#startDate`);
    if (el) {
      if (this.range) {
        if (this.startDay && this.endDay) {
          (el as HTMLInputElement).value =  
            `${this.startDay.format(this.format)} - ${this.endDay.format(this.format)}`; 
          } else {
          (el as HTMLInputElement).value = '';
        }
      } else {
        if (this.startDay) {
          (el as HTMLInputElement).value = 
            `${this.startDay.format(this.format)} ${this.getFormattedHours(this.startHours)}:${this.getFormattedHours(this.startMinutes)}`; 
          } else {
          (el as HTMLInputElement).value = '';
        }
      }
    }  

    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        name: 'startDate',
        date: startDate
      }
    }))

    if (this.range) {
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          name: 'endDate',
          date: endDate
        }
      }))
    }
  }

  setTimeDisabled(value: boolean) {
    let el = this.shadow.querySelector('#start-hours');
    if (el) {
      (el as HTMLInputElement).disabled = value;
    }
    el = this.shadow.querySelector('#start-minutes');
    if (el) {
      (el as HTMLInputElement).disabled = value;
    }
    el = this.shadow.querySelector('#end-hours');
    if (el) {
      (el as HTMLInputElement).disabled = value;
    }
    el = this.shadow.querySelector('#end-minutes');
    if (el) {
      (el as HTMLInputElement).disabled = value;
    }
  }

  getDateValue(id: string) {
    const el = this.shadow.querySelector(`#${id}`);
    return el ? (el as HTMLInputElement).value : '';
  }

  prevMonth = () => {
    this.closeMonthDays();
    this.calendar.toPreviousMonth();
    this.renderCalendarDays();
  }

  nextMonth = () => {
    this.closeMonthDays();
    this.calendar.toNextMonth();
    this.renderCalendarDays();
  }

  updateHeaderText() {
    const monthYear = `${this.calendar.month.name}, ${this.calendar.year}`;
    const header = this.shadow.querySelector('.month-text');
    if (header) {
      (header as HTMLElement).innerText = monthYear;
    }
  }

  get monthDaysGrid() {
    const firstDayOfTheMonth = this.calendar.month.getDay(1);
    const prevMonth = this.calendar.previousMonth;
    const totalLastMonthFinalDays = firstDayOfTheMonth.dayNumber - 1;
    const totalDays = this.calendar.month.numberOfDays + totalLastMonthFinalDays;
    const monthList = Array.from({ length: totalDays });

    for (let i = totalLastMonthFinalDays; i < totalDays; i++) {
      monthList[i] = this.calendar.month.getDay(i + 1 - totalLastMonthFinalDays);
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
    const elWeekDays = this.shadow.querySelector(".week-days");
    if (elWeekDays) {
      elWeekDays.innerHTML = this.weekDays;
    }
    const elDays = this.shadow.querySelector(".month-days");
    if (elDays) {
      elDays.innerHTML = '';

      const el = this.shadow.querySelector('.select-area');
      if (el) {
        const height = Math.ceil(this.monthDaysGrid.length / 7) * 40;
        (el as any).style = `height: ${height + 252}px; left: -${(320 - this.width) / 2}px;`
      }

      this.monthDaysGrid.forEach((day: any) => {
        const el = document.createElement('button');
        el.className = 'month-day';
        el.textContent = day.date;
        el.addEventListener('click', () => this.selectDay(el, day));
        el.setAttribute('aria-label', day.format(this.format));

        if (day.monthNumber === this.calendar.month.number) {
          el.classList.add('current');
        }

        if (!this.range && this.isSelectedDate(day)) {
          el.classList.add('selected');
          this.selectedDayElement = el;
        }

        elDays.appendChild(el);
      })

      if (this.range) {
        this.adjustedSelected();
      }
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
        color: var(--primary);
      }
      :focus {
        outline: none;
      }
      .element {
        display: grid;
        margin: 0;
        width: 100%;
        grid-template-columns: fit-content(100%) 35px;
        grid-gap: 0;
        margin-bottom: 5px;
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
      }
      .date-toggle {
        height: 26px;
      }
      .icon-calendar {
        position: relative;
        left: -25px;
        margin: 5px;
        background: url('/assets/Smock_Calendar_18_N.svg');
        background-size: 22px;
        background-repeat: no-repeat;
        cursor: pointer; 
      }
      .icon-calendar:hover {
        opacity:.8;
        filter: invert(39%) sepia(17%) saturate(4362%) hue-rotate(150deg) brightness(104%) contrast(98%);
      }
      .arrow-up-icon::before {
        font-family: "Icons";
        display: inline-block;
        font-size: 20px;
        position: relative;
        top: 3px;
        left: -25px;
        font-family: "Icons";
        content: "\\E915";
        color: var(--hover-background);
        background-color: var(--input-background);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }    
      .arrow-down-icon::before {
        font-family: "Icons";
        display: inline-block;
        font-size: 20px;
        position: relative;
        top: 3px;
        left: -25px;
        font-family: "Icons";
        content: "\\E919";
        color: var(--hover-background);
        background-color: var(--input-background);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }    
      input[type="text"] {
        position: relative;
        top: 2px;
        width: 100%;
        padding-left: 5px;
        background-color: var(--dp-background);
        outline: none;
        height: 30px;
        cursor: pointer;
        border-radius: 3px;
        border: 1px solid var(--selected);
      }
      input[type="text"]:focus {
        outline: none;
      }
      ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
        opacity: 1; /* Firefox */
      }
      .select-area {
        position: absolute;
        display: block;
        padding: 10px;
        border-radius: 5px;
        top: 35px;
        width: 0;
        height: 0;
        background-color: var(--dp-background);
        box-shadow: 0 0 8px rgba(0,0,0,0.2);
        opacity: 0;
        border: 1px solid transparent; 
        z-index: 1;
      }
      .visible { 
        width: 300px;
        opacity: 1;
        animation: fadeIn 0.2s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0.1; 
        }
        to {
          opacity: 1.0;
        }
      }
      .month {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: 10% 80% 10%;
        line-height: 35px;
        height: 35px;
        padding: 0px 0 10px 0;
        border-bottom: 2px solid var(--hover-background); 
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
        top: 15px;
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
      .up {
        cursor: pointer;
        transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
      }
      .down {
        cursor: pointer;
        position: relative;
        top: 0px;
        transform: rotate(180deg);
        -webkit-transform: rotate(180deg);
      }
      .up:hover,
      .down:hover,
      .left:hover, 
      .right:hover {
        border-bottom-color: var(--dp-hover);
      }
      .arrow:hover {
        color: var(--selected);
      }
      .week-days {
        padding: 5px 0 5px 0;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 5px;
      }
      .week-days span {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .month-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 5px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--hover-background); 
      }
      .month-day {
        padding: 12px;
        line-height: 15px;
        background: var(--dp-month-day);
        color: #fff;
        background: #c7c9d3;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        cursor: pointer;
        border: none;
      }
      .month-day.current {
        background: var(--primary);
        background: #444857;
      }
      .month-day.selected {
        background: var(--dp-selected);
        color: white;
      }
      .month-day:hover {
        background: var(--dp-selected);
        color: var(--primary);
        color: white;
      } 
      .arrow-area {
        display: grid;
        grid-template-columns: 85px 40px 40px 40px;
        grid-gap: 5px;
        padding-top: 5px;
      }
      .time-area {
        padding-bottom: 10px;
        border-bottom: 2px solid var(--hover-background); 
      }
      .time-title {
        padding: 3px 5px;
        font-size: 20px;
        font-weight: 600;
      }
      input[type="number"] {
        color: var(--dropdown-selected:);
        position: relative;
        width: 100%;
        height: 24px;
        padding-left: 10px;
        font-size: 14px;
        background-color: var(--dp-background);
        outline: none;
        border-radius: 4px;
        border: none;
        border-bottom: 3px solid var(--hover-background);         
      }
      input[type=number]::-webkit-inner-spin-button, 
      input[type=number]::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
      }
      input[type=number] {
        -moz-appearance: textfield; 
      }  
      input[type=number]:focus {
        outline: 2px solid var(--dp-selected);         
      }  
      .separator {
        position: relative;
        left: 9px;
        top: 3px;
        font-weight: 600;
      }
      .input-integrated-wrapper-range {
        width: 180px;
        padding: 5px 50px;
        display: grid;
        grid-template-columns: 120px 120px;
        grid-gap: 5px;
      }
      .input-integrated-wrapper {
        width: 180px;
        padding: 5px 110px;
        display: grid;
        grid-template-columns: 120px;
        grid-gap: 5px;
      }
      div.input-integrated:focus-within {
        border: 1px solid #0399f7;
        color: #0399f7;
      }      
      .input-label {
        margin: 5px 2px;
        font-weight: 700;
        font-size: 0.9em;
      }
      .input-text-wrapper {
        padding-bottom: 3px;
        width: 80px;
      }
      .input-text {
        border: none !important;
        font-size: 0.95em;
        height: 30px !important;
      }
      .input-text:focus {
        outline: 1px solid var(--dp-selected);
      }
      input:focus {
        outline: none;
      }
      .text-wrapper {
        padding-top: 2px;
      }
      .text {
        position: relative;
        top: 2px;
        left: 20px; 
      }
      .button-area {
        padding: 10px 0px;
        display: grid;
        grid-template-columns: 162px 140px;
        grid-gap: 5px;
      }
      .reset-area {
        display: flex;
        justify-content: right;
        align-items: right;
      }
      .done-area {
        display: flex;
        justify-content: right;
        align-items: right;
      }
    `;
  }

  get elementWidth() {
    return `width: ${this.width}px`;
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

  getFormattedHours(value: number) {
    return value < 10 ? `0${value}` : `${value}`;
  }

  get buttonArea() {
    return `
      <div class="button-area">
        <wcl-button id="reset-btn" title="${this.btnResetTitle}" secondary></wcl-button>
        <div class="done-area">
          <wcl-button id="done-btn" title="${this.btnDoneTitle}"></wcl-button>
        </div>
      </div>    
    `;
  }

  get endTimeArea() {
    return `
      <div>
        <div id="end-time-title" class="input-label">${this.endTimeTitle}</div>
        <div class="input-text-wrapper">
          <input
            id="end-hours"
            class="input-text"
            type="number"
            min="0"
            max="23"
            readonly
            style="width: 22px"
            value=${this.getFormattedHours(this.endHours)}
          >
          :
          <input
            id="end-minutes"
            class="input-text"
            type="number"
            style="width: 22px"
            min="0"
            max="59"
            readonly
            value=${this.getFormattedHours(this.endMinutes)}
          >
        </div>
      </div>
    `;
  }

  get timeArea() {
    return `
      <div class="time-area">
        <div class=${this.range ? 'input-integrated-wrapper-range' : 'input-integrated-wrapper'}>
          
        <div>
          <div id="start-time-title" class="input-label">${this.startTimeTitle}</div>
          <div class="input-text-wrapper">
            <input
              id="start-hours"
              class="input-text"
              type="number"
              min="0"
              max="23"
              readonly
              style="width: 22px"
              value=${this.getFormattedHours(this.startHours)}
            >
            :
            <input
              id="start-minutes"
              class="input-text"
              type="number"
              min="0"
              max="59"
              readonly
              style="width: 22px"
              value=${this.getFormattedHours(this.startMinutes)}
            >
          </div>  
        </div>

        ${this.range ? this.endTimeArea : this.nothing}

        </div>
      </div>    
    `;
  }

  get selectArea() {
    return `
      <div class="select-area">
        <div class="month">
          <div class="arrow left"></div>
          <div class="month-text"></div>
          <div class="arrow right"></div>
        </div>
        <div class="week-days">${this.weekDays}</div>
        <div class="month-days"></div>
        ${this.timeArea}
        ${this.buttonArea}
      </div>  
    `;
  }

  get picker() {
    return `
      <style>${this.css}</style>
      <div class="element">
        <div>
          <input id="startDate" type="text" readonly class="date-toggle">
        </div>
        <span class="icon-calendar"></span>
        ${this.selectArea}
      </div>
    `;
  }

  render() {
    this.shadow.innerHTML = this.picker;
  }

}

customElements.define('wcl-datetime-picker', DateTimePickerElement);
