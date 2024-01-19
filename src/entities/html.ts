export function setStyleVar(
  element: HTMLElement,
  name: `--${string}`,
  value: unknown
) {
  element.style.setProperty(name, String(value));
}

export function removeClass(element: HTMLElement, className: string) {
  element.classList.remove(className);
}
export function addClass(element: HTMLElement, className: string) {
  element.classList.add(className);
}

const hiddenClass = "hidden";
export function hide(...elements: Array<HTMLElement>) {
  for (const element of elements) {
    addClass(element, hiddenClass);
  }
}

export function show(...elements: Array<HTMLElement>) {
  for (const element of elements) {
    removeClass(element, hiddenClass);
  }
}

const shakeClass = "animate-shake";

export function shake(element: HTMLElement) {
  addClass(element, shakeClass);
  setTimeout(removeClass, 1000, element, shakeClass);
}
