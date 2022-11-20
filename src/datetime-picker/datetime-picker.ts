import { Day } from "./day";
import { Calendar } from "./calendar";
import styles from './datetime-picker.css?raw';

export class DateTimePickerElement extends HTMLElement {

  static get observedAttributes() {
    return [
      'placeholder',
      'start-date',
      'end-date',
      'lang',
      'start-time-title',
      'end-time-title',
      'width',
      'btn-today',
      'btn-reset',
      'btn-done',
      'disabled',
      'required',
      'up'
    ];
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
  private todayDay: Day | null;
  private endDay: Day | null;
  private calendar: Calendar;
  private selectedDayElement: HTMLElement | null = null;

  private width = 0;

  private startTimeTitle = '';
  private endTimeTitle = '';
  private btnTodayTitle = '';
  private btnResetTitle = '';
  private btnDoneTitle = '';

  private startHours = 0;
  private startMinutes = 0;
  private endHours = 23;
  private endMinutes = 59;

  private disabled = false;

  private isDarkTheme = false;
  private background = '';
  private selColor = '';

  private range = false;

  private tzOffset = 0;

  constructor() {
    super();

    this.lang = this.getAttribute("lang") || window.navigator.language;
    this.startTimeTitle = this.getAttribute("start-time-title") ?? '';
    this.endTimeTitle = this.getAttribute("end-time-title") ?? '';
    this.range = this.getAttribute("range") === 'true';

    this.todayDay = new Day(new Date(Date.now()), this.lang);

    const date = new Date((this.getAttribute("start-date") || Date.now()));
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

    this.background = this.style.getPropertyValue("--input-background");
    this.selColor = this.style.getPropertyValue("--selected");

    this.isDarkTheme = document.documentElement.className === 'dark';

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

    this.removeEventListener('keyup', this.keydownHandler);
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
        if (newValue) {
          const el = this.shadow.querySelector('#startDate');
          if (el && newValue) {
            (el as HTMLInputElement).value = newValue;
          }
  
          const date = new Date(newValue);

          this.startDay = new Day(date, this.lang);
          this.endDay = new Day(date, this.lang);
          this.calendar = new Calendar(this.startDay.year, this.startDay.monthNumber, this.lang);
          this.closeMonthDays();
          this.renderCalendarDays();
          
          const tzOffset = date.getTimezoneOffset() / 60; 
          this.tzOffset = tzOffset;
          this.startHours = date.getHours() + tzOffset;
          this.startMinutes = date.getMinutes();

          this.setDateValue();
          this.updateTimeValues();
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
      case 'disabled': {
        this.disabled = newValue === 'true';
        if (this.disabled) {
          this.style.setProperty("--input-background", this.isDarkTheme ? '#aaa' : '#eeeeee');
          this.style.setProperty("--selected", '#666');
          this.style.setProperty("--input-color", '#666');
        } else {
          this.style.setProperty("--input-background", this.background);
          this.style.setProperty("--selected", this.selColor);
          this.style.setProperty("--input-color", this.isDarkTheme ? '#222' : '#083360');
        }
        break;
      }

      case 'start-time-title': {
        this.startTimeTitle = newValue;
        const el = this.shadow.querySelector("#start-time-title");
        (el as HTMLElement).innerHTML = this.startTimeTitle;
        break;
      }
      case 'end-time-title': {
        this.endTimeTitle = newValue;
        const el = this.shadow.querySelector("#end-time-title");
        (el as HTMLElement).innerHTML = this.endTimeTitle;
        break;
      }
      case 'btn-today': {
        this.btnTodayTitle = newValue;
        const el = this.shadow.querySelector("#today-btn");
        el?.setAttribute('label', this.btnTodayTitle);
        break;
      }
      case 'btn-reset': {
        this.btnResetTitle = newValue;
        const el = this.shadow.querySelector("#reset-btn");
        el?.setAttribute('label', this.btnResetTitle);
        el?.setAttribute('secondary', 'true');
        break;
      }
      case 'btn-done': {
        this.btnDoneTitle = newValue;
        const el = this.shadow.querySelector("#done-btn");
        el?.setAttribute('label', this.btnDoneTitle);
        break;
      }
      case 'required': {
        const el = this.shadow.querySelector("#startDate");
        if (el) {
          if (newValue === 'true' || newValue === '') {
            el.classList.add("required");
          } else {
            el.classList.remove("required");
          }
        }
        break;
      }
      case 'up': {
        if (newValue === 'true' || newValue === '') {
          const el = this.shadow.querySelector('.select-area');
          el?.classList.add('select-area-up');
        }
        break;
      }
    }
  }

  _resizeCallback = () => {
    const el = this.shadow.querySelector('#startDate');
    if (el) {
      // eslint-disable-next-line
      (el as any).style = `width: ${(this.width) - 15}px;`;
    }
  }

  resizeObserver = new ResizeObserver(this._resizeCallback);

  get weekDays() {
    return this.calendar.weekDays
      .map((weekDay: string) => `<span>${weekDay.substring(0, 3)}</span>`).join('');
  }

  keydownHandler = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (this.disabled) {
      return;
    }
    const el = this.shadow.activeElement;
    if (e.code === 'Escape' || e.code === 'Enter') {
      const el = this.shadow.querySelector('.select-area');
      if (el && el.classList.contains('visible')) {
        el.classList.remove('visible');
      }
      return false;
    } else if (el && e.code === 'ArrowUp' && this.startDay) {
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
    } else if (el && e.code === 'PageUp' && this.startDay) {
      if (el.getAttribute('id') === 'start-hours') {
        this.startHours = 23;
      }
      if (el.getAttribute('id') === 'start-minutes') {
        this.startMinutes = 59;
      }
      if (el.getAttribute('id') === 'end-hours') {
        this.endHours = 23;
      }
      if (el.getAttribute('id') === 'end-minutes') {
        this.endMinutes = 59;
      }
    } else if (el && e.code === 'PageDown' && this.startDay) {
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

    if (el && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key) && this.startDay) {
      const existedValue = (el as HTMLInputElement).value;
      const newValue = Number(`${existedValue[1]}${e.key}`);
      if (el.getAttribute('id') === 'start-hours' && newValue <= 23 && newValue >= 0) {
        this.startHours = newValue;
      } else if (el.getAttribute('id') === 'start-hours') {
        this.startHours = Number(e.key);
      }
      if (el.getAttribute('id') === 'start-minutes' && newValue <= 59 && newValue >= 0) {
        this.startMinutes = newValue;
      } else if (el.getAttribute('id') === 'start-minutes') {
        this.startMinutes = Number(e.key);
      }
      if (el.getAttribute('id') === 'end-hours' && newValue <= 23 && newValue >= 0) {
        this.endHours = newValue;
      } else if (el.getAttribute('id') === 'end-hours') {
        this.endHours = Number(e.key);
      }
      if (el.getAttribute('id') === 'end-minutes' && newValue <= 59 && newValue >= 0) {
        this.endMinutes = newValue;
      } else if (el.getAttribute('id') === 'end-minutes') {
        this.endMinutes = Number(e.key);
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
    const date = new Date((this.getAttribute("date") || Date.now()));
    this.startDay = new Day(date, this.lang);
    this.endDay = null;
    const today = new Date(Date.now());
    this.startHours = today.getHours();
    this.startMinutes = today.getMinutes();
    this.endHours = 23;
    this.endMinutes = 59;

    this.closeMonthDays();
    this.updateTimeValues();
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
          if (this.startDay && this.endDate && this.endDay && date.isLessTo(this.endDay) && this.startDay.isLessTo(date)) {
            el.classList.add('selected');
          } else {
            el.classList.remove('selected');
          }
          index++;
        }
      })
    }
  }

  selectDay(el: HTMLElement, day: Day) {
    if (!this.range && this.todayDay && (day.isLessTo(this.todayDay) && !day.isEqualTo(this.todayDay))) {
      return;
    }

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
        this.updateMonthDays();
      }
    }
  }

  setDateValue() {
    let startDate = null;
    // console.log(this.tzOffset);
    if (this.startDay) {
      startDate = new Date(this.startDay.format(this.isoFormat));
      startDate.setHours(this.startHours - this.tzOffset);
      startDate.setMinutes(this.startMinutes);
    }
    
    let endDate = null;
    if (this.endDay) {
      endDate = new Date(this.endDay.format(this.isoFormat));
      endDate.setHours(this.endHours - this.tzOffset);
      endDate.setMinutes(this.endMinutes);
    }

    // update input field
    const el = this.shadow.querySelector(`#startDate`);
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
        // eslint-disable-next-line
        (el as any).style = `height: ${height + 252}px; left: -${(320 - this.width) / 2}px;`
      }

      // eslint-disable-next-line
      this.monthDaysGrid.forEach((day: any) => {
        const el = document.createElement('button');
        el.className = 'month-day';
        el.textContent = day.date;
        el.addEventListener('click', () => this.selectDay(el, day));
        el.setAttribute('aria-label', day.format(this.format));

        if (day.monthNumber === this.calendar.month.number) {
          if (!this.range) {
            if (day.isLessTo(this.startDay)) {
              if (this.todayDay?.isLessTo(day)) {
                el.classList.add('available');
              }
              //
            } else {
              el.classList.add('current');
            }
          } else {
            el.classList.add('current');
          }
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
    // eslint-disable-next-line
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
    if (this.disabled) {
      return;
    }

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
    return styles;
  }

  get elementWidth() {
    return `width: ${this.width}px`;
  }

  get endDate() {
    return /*html*/`
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
    return /*html*/`
      <div class="button-area">
        <wcl-button-primary id="reset-btn" title="${this.btnResetTitle}" secondary></wcl-button-primary>
        <div class="done-area">
          <wcl-button-primary id="done-btn" title="${this.btnDoneTitle}"></wcl-button-primary>
        </div>
      </div>
    `;
  }

  get endTimeArea() {
    return /*html*/`
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
    return /*html*/`
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
    return /*html*/`
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
    return /*html*/`
      <style>${this.css}</style>
      <div class="element">
        <div>
          <input id="startDate" type="text" readonly class="date-toggle">
        </div>
        <span class="date-time-icon"></span>
        ${this.selectArea}
      </div>
    `;
  }

  render() {
    this.shadow.innerHTML = this.picker;
  }
}

customElements.define('datetime-picker', DateTimePickerElement);
