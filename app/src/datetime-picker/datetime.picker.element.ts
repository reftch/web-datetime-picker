
export class DateTimePicker extends HTMLElement {

  static get observedAttributes() {
    return ['placeholder','start-date','end-date'];
  }

  private shadow: ShadowRoot;
  private dateBtn: HTMLElement | null = null;

  constructor() {
    super();
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

  triggerPicker = () => {
    const el = this.shadow.querySelector('.select-area');
    if (el) {
      if (el.classList.contains('visible')) {
        el.classList.remove('visible');
      } else {
        el.classList.add('visible');
      }
    }
  }

  get css() {
    return `
      :host {
      }
      .element {
        width: 100%;
        height: 30px;
        display: grid;
        margin: 0;
        grid-template-columns: fit-content(50%) fit-content(50%) 35px;
        grid-gap: 5px;
        border: 1px solid black;
        border-radius: 3px;
        margin-bottom: 3px;
      }
      .date-toggle {
        width: 185px;
        height: 26px;
      }
      .datetime-icon {
        position: relative;
        margin: 4px;
        background: url('/assets/datetime.png');
        background-size: 26px;
        background-repeat: no-repeat;
        height: 30px; 
        width: 30px;
        cursor: pointer; 
      }
      input[type="text"] {
        position: relative;
        top: 8px;
        width: 90%;
        height: 18px;
        padding-left: 5px;
        outline: none;
        border: none;
      }
      .select-area {
        position: absolute;
        display: block;
        border-radius: 3px;
        border: 1px solid #333;
        width: 100%;
        height: 200px;
        cursor: pointer;
        background-color: #eee;
        z-index: 99;
        opacity: 0;
      }
      .hidden {
        opacity: 0;
      }
      .visible {
        opacity: 1;
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
        content
      </div>  
    `;
  }

}

customElements.define('wcl-datetime-picker', DateTimePicker);
