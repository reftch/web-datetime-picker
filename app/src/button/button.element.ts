import { Component } from '../decorators';
import { BaseElement } from './base.element';

@Component({
  tag: `wcl-button`,
  template: `
    <style>
      .button {
        display: inline-block;
        position: relative;
        font-weight: 600;
        cursor: pointer;
        margin: 0 10px 0 0px;
        padding: 10px 18px 12px 18px;
        color: var(--button-primary);
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
      }
      .button-primary {
        border: 1px solid var(--button);
        background-color: var(--button-background);
      }
      .button-secondary {
        color: var(--button-primary);
        border: 1px solid var(--button-secondary);
        background-color: var(--button-secondary-background);
      }
    </style>    
    <div class="button button-primary">
      <div class="button-title"></div>
    </div>
  `,
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
        this.setClasses('.button', ['button-secondary']);
        break;

    }
  }

}

// const template = document.createElement('template');
// template.innerHTML = `
// <style>
// .button {
//   display: inline-block;
//   position: relative;
//   font-weight: 600;
//   cursor: pointer;
//   margin: 0 10px 0 0px;
//   padding: 10px 18px 12px 18px;
//   color: var(--button-primary);
//   box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
// }
// .button-primary {
//   border: 1px solid var(--button);
//   background-color: var(--button-background);
// }
// .button-secondary {
//   color: var(--button-primary);
//   border: 1px solid var(--button-primary);
//   background-color: var(--button-primary-background);
// }
// </style>

// <div class="button button-primary">
//   <div class="button-title">File</div>
// </div>

// `;


// export class ButtonElement extends HTMLElement {

//   static get observedAttributes() {
//     return ['title','secondary'];
//   }

//   private shadow: ShadowRoot;

//   title = '';
//   secondary = false;

//   constructor() {
//     super();

//     console.log(buttonTemplate);
//     this.title = this.getAttribute("title") ?? '';
//     this.secondary = Boolean(this.getAttribute("secondary"));

//     this.shadow = this.attachShadow({ mode: "open" });

//     const template = document.createElement('template');
//     template.innerHTML = buttonTemplate;
//     this.shadow.appendChild(template.content.cloneNode(true));
//     //this.render();
//   }

//   connectedCallback() {
//   }

//   disconnectedCallback() {

//   }

//   attributeChangedCallback(name: string, oldValue: string, newValue: string) {
//     switch(name) {
//       case 'title': {
//         const el = this.shadow.querySelector('.button-title');
//         if (el) {
//           this.title = newValue;
//           (el as HTMLElement).title = newValue;
//         }
//         break;
//       }

//       case 'secondary': {
//         this.secondary = Boolean(newValue);
//         const el = this.shadow.querySelector('.button');
//         if (el) {
//           (el as HTMLElement).classList.remove('button-primary');
//           (el as HTMLElement).classList.add('button-secondary');
//         }
//         break;
//       }

//     }
//   }

//   get css() {
//     return `
//       .button {
//         display: inline-block;                                                                                                                                                                                                          
//         position: relative;                                                                                                                                                                                                             
//         font-weight: 600;
//         cursor: pointer;                                                                                                                                                                                                                                                                                                                                                                                                                                
//         margin: 0 10px 0 0px;
//         padding: 10px 18px 12px 18px;                                                                                                                                                                                                   
//         color: var(--button-primary);                                                                                                                                                                                                   
//         box-shadow: 0 0 8px rgba(0,0,0,0.2);     
//       }
//       .button-primary {                                                                                                                                                                                                                 
//         border: 1px solid var(--button);                                                                                                                                                                                        
//         background-color: var(--button-background);                                                                                                                                                                             
//       }          
//       .button-secondary {                                                                                                                                                                                                                 
//         color: var(--button-primary);                                                                                                                                                                                                   
//         border: 1px solid var(--button-primary);                                                                                                                                                                                        
//         background-color: var(--button-primary-background);                                                                                                                                                                             
//       }          
//     `;
//   }

//   get body() {
//     return `
//       <style>${this.css}</style>
//       <div class="button button-primary">
//         <div class="button-title">${this.title}</div>
//       </div>
//     `;
//   }

//   render() {
//     this.shadow.innerHTML = this.body;
//   }


// }

customElements.define('wcl-button', ButtonElement);