import { getElement, getTemplate } from '../utils';
import css from './button.element.css';

const html = /*html*/`
  <button class="button button-primary button-shadow">
    <div class="button-text-wrapper">
      <span class="icon"></span>
      <span class="label"></span>
    </div>
  </button>
`

export class ButtonElement extends HTMLElement {

  protected shadow: ShadowRoot | undefined;

  static get observedAttributes() { return ['label', 'disabled', 'icon', 'primary']; }

  disabled = false;

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(getTemplate(html));
    const style = document.createElement('style');
    style.innerHTML = css;
    this.shadow.appendChild(style);
  }

  connectedCallback() {
    addEventListener('click', this.submit);
  }

  disconnectedCallback() {
    removeEventListener('click', this.submit);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'label': {
        (getElement(this, ".label") as HTMLElement).innerHTML = newValue;
        break;
      }
      case 'icon': {
        const el = getElement(this, ".icon");
        el?.classList.add(newValue);
        break;
      }
      case 'primary': {
        const el = getElement(this, ".button");
        if (newValue === 'true' || newValue === '') {
          el?.classList.remove('button-secondary');
        } else {
          el?.classList.add('button-secondary');
        }
        break;
      }
      case 'disabled': {
        this.disabled = newValue === 'true' || newValue === '';
        const el = getElement(this, ".button");
        if (this.disabled) {
          el?.classList.add('button-disabled');
        } else {
           el?.classList.remove('button-disabled');
        }
        break;
      }
      default:
        break;
    }
  }

  submit = (e: Event) => {
    e.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.dispatchEvent(new CustomEvent("action", {
      detail: {
        id: this.id,
        event: 'click'
      }
    }));
    return false;
  }

}

customElements.define('button-element', ButtonElement);