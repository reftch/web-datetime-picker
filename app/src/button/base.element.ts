
export class BaseElement extends HTMLElement {

  protected shadow: ShadowRoot;

  protected get tag(): string {
    return this['tag'];
  }

  protected get template(): string {
    return this['template'];
  }

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: "open" });
    const templateNode = document.createElement('template');     
    templateNode.innerHTML = this.template;
    this.shadow.appendChild(templateNode.content.cloneNode(true));
  }

  protected setText(selector: string, value: string) {
    const el = this.shadow.querySelector(selector);
    if (el) {
      el.innerHTML = value;
    }
  }

  protected addClasses(selector: string, classes: Array<string>) {
    const el = this.shadow.querySelector(selector);
    if (el && classes) {
      classes.forEach(c => el.classList.add(c));
    }
  }

  protected removeClasses(selector: string, classes: Array<string>) {
    const el = this.shadow.querySelector(selector);
    if (el && classes) {
      classes.forEach(c => el.classList.remove(c));
    }
  }

}