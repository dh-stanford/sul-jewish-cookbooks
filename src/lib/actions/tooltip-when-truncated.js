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
	let /** @type {HTMLElement} */ tooltipEl;
	let /** @type {() => void} */ cleanup;
	let /** @type {() => void} */ mouseenterListener;
	let /** @type {() => void} */ mouseleaveListener;

	const connectTooltip = () => {
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

		mouseenterListener = () => {
			tooltipEl = document.createElement('div');
			tooltipEl.classList.add('tooltip');
			tooltipEl.style.cssText = 'position: absolute; width: max-content; top: 0; left: 0;';
			tooltipEl.innerHTML = content;
			document.body.appendChild(tooltipEl);

			cleanup = autoUpdate(node, tooltipEl, () => {
				computePosition(node, tooltipEl, {
					placement: 'top-start',
					middleware: [offset(5), flip(), shift({ padding: 5 })]
				}).then(({ x, y }) => {
					Object.assign(tooltipEl.style, {
						left: `${x}px`,
						top: `${y}px`
					});
				});
			});
		};

		mouseleaveListener = () => {
			cleanup();
			tooltipEl.remove();
		};

		node.addEventListener('mouseenter', mouseenterListener);
		node.addEventListener('mouseleave', mouseleaveListener);
	};

	const disconnectTooltip = () => {
		mouseenterListener && node.removeEventListener('mouseenter', mouseenterListener);
		mouseleaveListener && node.removeEventListener('mouseleave', mouseleaveListener);
		cleanup && cleanup();
		tooltipEl && tooltipEl.remove();
		// @ts-ignore
		mouseenterListener = mouseleaveListener = cleanup = tooltipEl = undefined;
	};

	const resizeObserver = new ResizeObserver(([{ target }]) => {
		if (/** @type {HTMLElement} */ (target).offsetWidth < target.scrollWidth) {
			if (mouseenterListener === undefined) connectTooltip();
		} else {
			if (mouseenterListener !== undefined) disconnectTooltip();
		}
	});
	resizeObserver.observe(node);

	return {
		destroy: () => {
			disconnectTooltip();
			resizeObserver.disconnect();
		}
	};
}

export { tooltip };
