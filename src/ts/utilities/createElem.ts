export function createElem(
  tagName: string | HTMLElement,
  clasName?: string | null,
  parent: string | HTMLElement | null = null,
  txtContent?: string
): HTMLElement {
  const createdElem: HTMLElement = typeof tagName === 'string' ? document.createElement(tagName) : tagName;

  if (clasName) {
    createdElem.className = clasName;
  }

  if (txtContent) {
    createdElem.textContent = txtContent;
  }

  if (parent) {
    if (typeof parent === 'string') {
      const parentEl: HTMLElement | null = document.querySelector(parent);
      if (parentEl) {
        parentEl.append(createdElem);
      }
    } else {
      parent.append(createdElem);
    }
  }

  return createdElem;
}
