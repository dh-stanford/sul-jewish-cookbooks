<script>
	import { sleep } from '$lib';

	import SearchInput from '$components/SearchInput.svelte';
	import { tooltip } from '$lib/actions/tooltip-when-truncated';

	import loaderWebP from '../img/loading.webp';

	/**
	 * @typedef {Object} Field
	 * @prop {string} key
	 * @prop {string} label
	 * @prop {number|string} accessor - Accessor (object key or array index) for the field.
	 * @prop {boolean} [html]
	 * @prop {boolean} [sortable]
	 * @prop {boolean} [searchable]
	 * @prop {(value: any) => string} [format]
	 */

	/**
	 * @typedef {Object} TableProps
	 * @prop {Array<Object|Array<any>>} data
	 * @prop {Field[]} fields
	 * @prop {string|number} keyAccessor - Accessor (object key or array index) for the primary key.
	 * @prop {string} [id]
	 * @prop {string} [class]
	 */

	/** @type {TableProps} */
	let { data, fields, keyAccessor, ...props } = $props();

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

	/**
	 * @param {string} text
	 * @returns {void}
	 */
	const prepSearchParts = (text) => {
		searchParts = text
			? normalizeText(text.replace(/<br>|[&/\\#,+()$~%.'":*?<>{}]|nbsp;/g, ' '))
					.split(' ')
					.slice(0, 8)
			: [];
	};

	/**
	 * @param {string|number} text
	 * @returns {string}
	 */
	const markupMatches = (text) => {
		if (typeof text !== 'string') text = String(text);
		const matchExtents = /** @type {Array<[number, number]>} */ ([]);
		const mergedExtents = /** @type {Array<[number, number]>} */ ([]);
		let markedUp = text;
		const searchContent = normalizeText(text);

		searchParts.forEach((searchPart) => {
			let idx = -1;
			while ((idx = searchContent.indexOf(searchPart, idx + 1)) > -1)
				matchExtents.push([idx, idx + searchPart.length]);
		});

		matchExtents
			.sort((a, b) => a[0] - b[0])
			.forEach(([start, end]) => {
				const previousExtent = mergedExtents[mergedExtents.length - 1];
				if (previousExtent && previousExtent[1] >= start) {
					previousExtent[1] = Math.max(previousExtent[1], end);
				} else {
					mergedExtents.push([start, end]);
				}
			});

		mergedExtents
			.sort((a, b) => b[0] - a[0])
			.forEach(([start, end]) => {
				markedUp = `${markedUp.substring(0, start)}<mark>${markedUp.substring(
					start,
					end
				)}</mark>${markedUp.substring(end)}`;
			});
		return markedUp;
	};

	const itemFilter = async () => {
		filteredListItems = /** @type {{[key: string]: number | string}[]} */ (data);

		if (searchParts.length) {
			const searchFields = fields.filter((field) => field.searchable);
			filteredListItems = filteredListItems.filter((item) =>
				searchParts.every((searchPart) =>
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
		await sleep(0);

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

	/** @param {string} searchValue */
	const search = async (searchValue) => {
		loading = true;
		await sleep(0);
		prepSearchParts(searchValue);
		itemFilter();
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
	style={`
	  --n-columns: ${fields.length};
		--scrollbar-offset: ${scrollbarOffset}px;
		--loader: url(${loaderWebP});
	`}
	{...props}
>
	<thead>
		{#if fields.some(({ searchable }) => searchable)}
			<tr>
				<td class="search">
					<SearchInput
						oninput={(/** @type {InputEvent} */ event) =>
							search(/** @type {HTMLInputElement} */ (event.target).value)}
					/>
				</td>
			</tr>
		{/if}
		<tr>
			{#each fields as field}
				{#if field.sortable}
					<th
						scope="col"
						aria-sort={(sortOrder === `${field.key}-asc` && 'ascending') ||
							(sortOrder === `${field.key}-desc` && 'descending') ||
							null}
					>
						<button onclick={() => sortItems(field)}>
							{field.label}
						</button>
					</th>
				{:else if field.label}
					<th scope="col">{field.label}</th>
				{:else}
					<td></td>
				{/if}
			{/each}
		</tr>
	</thead>

	<tbody bind:this={tbody} class:loading>
		{#each filteredAndPagedItems as item (item[keyAccessor])}
			<tr>
				{#each fields as field, i}
					{@const formattedValue = field.format
						? field.format(item[field.accessor])
						: item[field.accessor]}
					{@const value =
						searchParts && field.searchable ? markupMatches(formattedValue) : formattedValue}
					{#if i === 0}
						<th scope="row">{@html value}</th>
					{:else}
						<td use:tooltip={{ content: value }}>{@html value}</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
<div class="pagination">
	{#if filteredListItems.length === 0}
		No results
	{:else}
		{@const pageStart = pageSize * (currentPage - 1) + 1}
		<span aria-live="assertive">
			Showing <strong>{pageStart}</strong> to
			<strong>
				{Math.min(pageStart + pageSize - 1, filteredListItems.length)}
			</strong>
			of <strong>{filteredListItems.length.toLocaleString()}</strong>
		</span>

		<button disabled={currentPage === 1} onclick={() => (currentPage -= 1)}>
			&laquo; Previous
		</button>
		<button
			disabled={currentPage * pageSize >= filteredListItems.length}
			onclick={() => (currentPage += 1)}
		>
			Next &raquo;
		</button>
	{/if}
</div>

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
			height: auto;
			justify-content: flex-end;
			padding: 4px;
		}
	}

	tbody {
		overflow-y: auto;
		position: relative;

		&.loading::after {
			background: rgba(255, 255, 255, 0.8) var(--loader) no-repeat center;
			content: '';
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

		button {
			appearance: none;
			background-color: transparent;
			border: none;
			color: inherit;
			cursor: pointer;
			font: inherit;
			height: 100%;
			left: 0;
			padding: inherit;
			position: absolute;
			text-align: inherit;
			top: 0;
			width: 100%;

			&:before,
			&:after {
				border: 6px solid transparent;
				position: absolute;
				display: block;
				content: '';
				height: 0;
				right: 0.5rem;
				top: 50%;
				width: 0;
			}
		}

		&:not([aria-sort]) button:before,
		&[aria-sort='ascending'] button:before {
			border-bottom-color: currentColor;
			margin-top: -14px;
		}

		&:not([aria-sort]) button:after,
		&[aria-sort='descending'] button:after {
			border-top-color: currentColor;
			margin-top: 3px;
		}
	}

	tbody th {
		text-align: left;
	}

	td,
	th {
		padding: 0 0.5rem;
		height: var(--row-height);
		line-height: var(--row-height);
	}

	.pagination {
		align-items: center;
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding: 0 0.5rem;

		span {
			flex-grow: 1;
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
