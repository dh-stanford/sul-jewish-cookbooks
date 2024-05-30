<script>
	import { tick } from 'svelte';

	import SearchInput from '$components/SearchInput.svelte';

	/**
	 * @typedef {Object} Field
	 * @prop {string} key
	 * @prop {string} label
	 * @prop {number|string} accessor
	 * @prop {boolean} [html]
	 * @prop {boolean} [sortable]
	 * @prop {boolean} [searchable]
	 * @prop {(value: any) => string} [format]
	 */

	/**
	 * @typedef {Object} TableProps
	 * @prop {Array<Object|Array<any>>} data
	 * @prop {Field[]} fields
	 * @prop {string} class
	 */

	/** @type {TableProps} */
	let { data, fields, ...props } = $props();

	let loading = $state(true);
	let tbody = $state();
	let scrollbarOffset = $state(0);

	let filteredListItems = $state(/** @type {{[key: string]: number | string}[]} */ (data));
	let filteredAndPagedItems = $state(/** @type {{[key: string]: number | string}[]} */ ([]));
	let currentPage = $state(1);
	let pageSize = $state(20);
	let searchParts = $state(/** @type {string[]} */ ([]));
	let sortOrder = $state();

	const paginate = () => {
		filteredAndPagedItems = filteredListItems.slice(
			0 + (currentPage - 1) * pageSize,
			0 + (currentPage - 1) * pageSize + pageSize
		);
		loading = false;
	};

	/**
	 * @param {string|number} text
	 * @param {boolean} [stripAccents]
	 * @returns {string}
	 */
	const normalizeText = (text, stripAccents = false) => {
		if (typeof text !== 'string') text = String(text);
		text = text.toLowerCase().replace(/\s+/g, ' ').trim();
		if (stripAccents) text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		return text;
	};

	/** @param {string} text */
	const prepSearchParts = (text) => {
		searchParts = text
			? normalizeText(text.replace(/<br>|[&/\\#,+()$~%.'":*?<>{}]|nbsp;/g, ' '))
					.split(' ')
					.slice(0, 8)
			: [];
	};

	const itemFilter = async () => {
		filteredListItems = /** @type {{[key: string]: number | string}[]} */ (data);

		if (searchParts.length) {
			const searchFields = fields.filter((field) => field.searchable);
			filteredListItems = filteredListItems.filter((item) =>
				searchParts.some((searchPart) =>
					searchFields.some(({ accessor }) => normalizeText(item[accessor]).includes(searchPart))
				)
			);
		}
		currentPage = 1;
		paginate();
	};

	/** @param {Field} field */
	const sortItems = async (field) => {
		loading = true;
		await tick();
		await tick();
		const { key, accessor } = field;
		sortOrder = sortOrder === `${key}-asc` ? `${key}-desc` : `${key}-asc`;
		const asc = sortOrder.endsWith('asc');
		filteredListItems = filteredListItems.sort((a, b) => {
			if (a[accessor] < b[accessor]) return asc ? -1 : 1;
			if (a[accessor] > b[accessor]) return asc ? 1 : -1;
			return 0;
		});
		currentPage = 1;
		paginate();
	};

	$effect(() => {
		const resizeObserver = new ResizeObserver(
			([{ target }]) =>
				(scrollbarOffset =
					/** @type {HTMLTableSectionElement} */ (target).offsetWidth - target.scrollWidth)
		);
		resizeObserver.observe(tbody);
	});

	$effect(() => paginate());
</script>

<table
	aria-label="Jewish Cookbook Recipes"
	aria-rowcount={pageSize}
	style={`--n-columns: ${fields.length};--scrollbar-offset: ${scrollbarOffset}px;`}
	{...props}
>
	<thead>
		{#if fields.some(({ searchable }) => searchable)}
			<tr>
				<td class="search">
					<SearchInput
						oninput={(/** @type {InputEvent} */ event) => {
							prepSearchParts(/** @type {HTMLInputElement} */ (event.target).value);
							itemFilter();
						}}
					/>
				</td>
			</tr>
		{/if}
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
				{:else if field.label}
					<th scope="col">{field.label}</th>
				{:else}
					<td></td>
				{/if}
			{/each}
		</tr>
	</thead>

	<tbody bind:this={tbody} class:loading>
		{#each filteredAndPagedItems as item}
			<tr>
				{#each fields as field, i}
					{@const value = field.format ? field.format(item[field.accessor]) : item[field.accessor]}
					{#if i === 0}
						{#if field.html}
							<th scope="row">{@html value}</th>
						{:else}
							<th scope="row">{value}</th>
						{/if}
					{:else if field.html}
						<td>{@html value}</td>
					{:else}
						<td>{value}</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>

	<tfoot>
		<tr>
			<td>
				<div>
					{#if filteredListItems.length === 0}
						No results
					{:else}
						{@const pageStart = pageSize * (currentPage - 1) + 1}
						<span>
							Showing <strong>{pageStart}</strong> to
							<strong>
								{Math.min(pageStart + pageSize - 1, filteredListItems.length)}
							</strong>
							of <strong>{filteredListItems.length.toLocaleString()}</strong>
						</span>

						<button
							disabled={currentPage === 1}
							onclick={() => (currentPage -= 1)}
							onkeypress={({ code }) => {
								if (code === 'Enter') currentPage -= 1;
							}}
						>
							&laquo; Previous
						</button>
						<button
							disabled={currentPage * pageSize >= filteredListItems.length}
							onclick={() => (currentPage += 1)}
							onkeypress={({ code }) => {
								if (code === 'Enter') currentPage += 1;
							}}
						>
							Next &raquo;
						</button>
					{/if}
				</div>
			</td>
		</tr>
	</tfoot>
</table>

<style>
	table {
		--n-columns: 2;
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

		td.search {
			display: flex;
			grid-column: 1 / -1;
			justify-content: flex-end;
			margin-bottom: 1rem;
		}
	}

	tbody {
		overflow-y: auto;
		position: relative;

		&.loading::after {
			background-color: rgba(255, 255, 255, 0.8);
			content: 'Loading...';
			display: grid;
			height: 100%;
			place-items: center;
			position: absolute;
			width: 100%;
		}
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

	tfoot td {
		display: contents;

		div {
			margin-top: 2rem;
			display: flex;
			gap: 1rem;
			align-items: center;

			span {
				flex-grow: 1;
			}
		}

		button {
			background-color: var(--primary-color);
			border: 1px solid #d2d6dc;
			border-radius: 5px;
			color: #ffffff;
			cursor: pointer;
			line-height: 1;
			padding: 5px 14px;
			user-select: none;

			&[disabled] {
				cursor: not-allowed;
				opacity: 0.5;
			}

			&:not([disabled]):hover {
				background-color: #f7f7f7;
				color: #3c4257;
			}
		}
	}
</style>
