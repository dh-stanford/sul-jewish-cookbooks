import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
/**
 * @typedef {Object.<string,*>} TooltipParams
 * @property {string} [content] - Custom content to display in the tooltip.
 */

/**
 * Generates a tooltip for the given node with optional parameters.
 *
 * @param {HTMLElement|SVGElement} node - The DOM node to attach the tooltip to.
 * @param {TooltipParams} [params] - Optional parameters for customizing the tooltip behavior.
 * @return {Object} An object with update and destroy methods for managing the tooltip instance.
 */
function tooltip(node, params) {
	// Prefer custom content, then the HTML title attribute then the aria-label in that order.
	let content = params?.content || (node instanceof HTMLElement ? node.title : null);
	const label = node.getAttribute('aria-label');
	content = content ?? label;

	if (!content) return {};

	// Set the"aria-label" attribute if required
	// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-label_attribute
	if (!label) node.setAttribute('aria-label', content);

	// Clear out the HTML title attribute
	if (node instanceof HTMLElement) node.title = '';

	let /** @type {HTMLElement} */ tooltip;
	let /** @type {() => void} */ cleanup;

	node.addEventListener('mouseenter', () => {
		tooltip = document.createElement('div');
		tooltip.classList.add('tooltip');
		tooltip.style.cssText = 'position: absolute; width: max-content; top: 0; left: 0;';
		tooltip.innerHTML = content;
		document.body.appendChild(tooltip);

		cleanup = autoUpdate(node, tooltip, () => {
			computePosition(node, tooltip, {
				placement: 'top-start',
				middleware: [offset(5), flip(), shift({ padding: 5 })]
			}).then(({ x, y }) => {
				Object.assign(tooltip.style, {
					left: `${x}px`,
					top: `${y}px`
				});
			});
		});
	});

	node.addEventListener('mouseleave', () => {
		cleanup();
		tooltip.remove();
	});

	return {
		// update: (/** @type Object */ newParams) => {},

		destroy: () => {
			cleanup && cleanup();
			tooltip && tooltip.remove();
		}
	};
}

export { tooltip };
