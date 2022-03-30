import { Component } from '../decorators';
import { BaseElement } from './base.element';
import template from './button.template.html?raw';

@Component({
  tag: `wcl-button`,
  template: template
})
export class ButtonElement extends BaseElement {

  static get observedAttributes() {
    return ['title', 'secondary'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch(name) {
      case 'title':
        this.setText('.button-title', newValue);
        break;
      
      case 'secondary': 
        this.removeClasses('.button', ['button-primary']);
        this.addClasses('.button', ['button-secondary']);
        break;

    }
  }

}

customElements.define('wcl-button', ButtonElement);