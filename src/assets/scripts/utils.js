/**
 * A jQuery-like wrapper for document.querySelector[All]
 *
 * @param  {String} selector    A CSS selector to match
 * @return {Element|Array}      The matching HTML element or an array of
 *                              matching HTML elements
 */
export function $(selector) {
  const elements = document.querySelectorAll(selector);
  return elements.length > 1 ? Array.from(elements) : elements[0];
}
