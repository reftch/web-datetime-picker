
export const getWeekNumber = (date: Date) => {
  const firstDayOfTheYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getMilliseconds() - firstDayOfTheYear.getMilliseconds()) / 86400000;
  
  return Math.ceil((pastDaysOfYear + firstDayOfTheYear.getDay() + 1) / 7)
}

export const isLeapYear = (year: number) => {
  return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
}

export const getTemplate = (html: string) => {
  const templateNode = document.createElement('template')
  templateNode.innerHTML = html
  return templateNode.content.cloneNode(true)
}

export const getElement = (element: HTMLElement, selector: string): HTMLElement | undefined => {
  const el = element.shadowRoot?.querySelector(selector)
  return el as HTMLElement ?? undefined
}

export const getAllElements = (element: HTMLElement, selector: string):  NodeListOf<Element> | undefined => {
  const el = element.shadowRoot?.querySelectorAll(selector)
  return el ?? undefined
}