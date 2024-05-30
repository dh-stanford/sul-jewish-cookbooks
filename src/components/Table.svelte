<script>
	/**Field
	 * @typedef {Object} Field
	 * @prop {string} key
	 * @prop {string} label
	 * @prop {number|string} accessor
	 * @prop {boolean} sortable
	 */

	/**
	 * @typedef {Object} TableProps
	 * @prop {Array<Object|Array<any>>} data
	 * @prop {Field[]} fields
	 * @prop {string} class
	 */

	/** @type {TableProps} */
	let { data, fields, ...props } = $props();

	let tbody = $state();
	let filteredListItems = $state(/** @type {{[key: string]: number | string}[]} */ (data));
	let pageSize = $state();
	let sortOrder = $state();

	/** @param {Field} field */
	const sortItems = (field) => {
		const { key, accessor } = field;
		sortOrder = sortOrder === `${key}-asc` ? `${key}-desc` : `${key}-asc`;
		const asc = sortOrder.endsWith('asc');
		filteredListItems = filteredListItems.sort((a, b) => {
			if (a[accessor] < b[accessor]) return asc ? -1 : 1;
			if (a[accessor] > b[accessor]) return asc ? 1 : -1;
			return 0;
		});
		// currentPage = 1;
		// paginate();
	};

	let scrollbarOffset = $state(0);

	$effect(() => {
		const resizeObserver = new ResizeObserver(
			([{ target }]) =>
				(scrollbarOffset =
					/** @type {HTMLTableSectionElement} */ (target).offsetWidth - target.scrollWidth)
		);
		resizeObserver.observe(tbody);
	});
</script>

<table
	aria-label="Jewish Cookbook Recipes"
	aria-rowcount={pageSize}
	style={`--n-columns: ${fields.length};--scrollbar-offset: {scrollbarOffset}px;`}
	{...props}
>
	<thead>
		<tr>
			{#each fields as field}
				{#if field.sortable}
					<th
						tabindex="0"
						scope="col"
						onclick={() => sortItems(field)}
						onkeypress={({ key }) => key === 'Enter' && sortItems(field)}
						aria-sort={(sortOrder === `${field.key}-asc` && 'ascending') ||
							(sortOrder === `${field.key}-desc` && 'descending') ||
							null}>{field.label}</th
					>
				{:else}
					<th scope="col">{field.label}</th>
				{/if}
			{/each}
		</tr>
	</thead>
	<tbody bind:this={tbody}>
		{#each filteredListItems.slice(0, 20) as item}
			<tr>
				{#each fields as field, i}
					{@const value = item[field.accessor]}
					{#if i === 0}
						<th scope="row">{value}</th>
					{:else}
						<td>{value}</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		--n-columns: 7;
		--row-height: 35px;
		--scrollbar-offset: 0px;

		display: contents;
		border-collapse: collapse;
	}

	thead,
	tbody {
		display: grid;
		min-width: 100%;
		grid-template-columns: repeat(var(--n-columns), 1fr);
		flex: 0 1 auto;
	}

	thead {
		padding-right: var(--scrollbar-offset);
	}

	tbody {
		overflow-y: auto;
	}

	tr {
		display: contents;
	}

	th,
	td {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	thead th {
		position: relative;
		text-align: left;
		font-weight: normal;

		&[tabindex] {
			cursor: pointer;
		}
	}

	tbody th {
		text-align: left;
	}

	thead th[tabindex]:before,
	thead th[tabindex]:after {
		border: 6px solid transparent;
		position: absolute;
		display: block;
		content: '';
		height: 0;
		right: 0.5rem;
		top: 50%;
		width: 0;
	}

	thead th[tabindex]:not([aria-sort]):before,
	thead th[aria-sort='ascending']:before {
		border-bottom-color: currentColor;
		margin-top: -14px;
	}

	thead th[tabindex]:not([aria-sort]):after,
	thead th[aria-sort='descending']:after {
		border-top-color: currentColor;
		margin-top: 3px;
	}

	td,
	th {
		padding: 0 0.5rem;
		height: var(--row-height);
		line-height: var(--row-height);
	}
</style>
