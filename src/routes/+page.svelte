<script>
	import Table from '$components/Table.svelte';

	import recipes from '../data/recipes.json';

	/** @param {string} text */
	const titleCase = (text) => {
		return text
			.toLowerCase()
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.substring(1))
			.join(' ');
	};

	/** @param {string} id */
	const formatLink = (id) => {
		if (!id) return '';
		return `
		  <a href="https://searchworks.stanford.edu/view/${id}" aria-label="View on SearchWorks">
				${externalLinkSvg}
			</a>`;
	};

	const externalLinkSvg = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
			<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
			<path d="M11 13l9 -9" />
			<path d="M15 4h5v5" />
		</svg>	
	`;

	const fields = [
		{
			key: 'recipe',
			label: 'Recipe',
			accessor: 0,
			sortable: true,
			format: titleCase,
			searchable: true
		},
		{ key: 'book', label: 'Book', accessor: 4, sortable: true, searchable: true },
		{ key: 'organization', label: 'Organization', accessor: 3, sortable: true, searchable: true },
		{ key: 'year', label: 'Year', accessor: 5, sortable: true },
		{ key: 'state', label: 'State', accessor: 1, sortable: true, searchable: true },
		{ key: 'location', label: 'Location', accessor: 2, sortable: true, searchable: true },
		{ key: 'link', label: '', accessor: 6, format: formatLink, html: true }
	];

	recipes.forEach((recipe, i) => (recipe[7] = i.toString()));
</script>

<Table data={recipes} {fields} keyAccessor={7} id="recipes-table" />

<style>
	:global(#recipes-table) {
		:global {
			thead,
			tbody {
				grid-template-columns:
					minmax(250px, 1.25fr) /* Recipe */
					minmax(150px, 1fr) /* Book */
					minmax(150px, 1.5fr) /* Organization */
					80px /* Year */
					minmax(100px, 0.5fr) /* State */
					minmax(115px, 0.5fr) /* Location */
					minmax(50px, 0.2fr); /* SearchWorks */
			}

			thead {
				border-bottom: 2px solid currentColor;

				th {
					font-size: 1.2rem;
					font-weight: bold;
					height: 55px;
					line-height: 55px;
				}
			}

			tbody {
				min-height: calc(var(--row-height) * 2);

				tr:nth-child(even) td,
				tr:nth-child(even) th {
					background: #f8f6ff;
				}

				tr:hover td,
				tr:hover th {
					background: #d6daf0;
				}
			}

			td:nth-child(4) {
				text-align: center;
			}

			td:nth-child(7) a {
				align-items: center;
				display: flex;
				height: var(--row-height);
				justify-content: center;

				svg {
					height: 1.2rem;
					width: 1.2rem;
				}

				&:hover {
					color: white;
					background-color: var(--primary-color);
				}
			}

			thead th button::before,
			thead th button::after {
				opacity: 0.3;
			}

			thead th[aria-sort] button::before,
			thead th[aria-sort] button::after {
				opacity: 1;
			}

			thead th button:hover {
				background-color: #d6daf0;

				&::before,
				&::after {
					opacity: 1;
				}
			}

			/* 960px is where the table starts to overflow horizontally */
			@media screen and (max-width: 959px) {
				td.search {
					justify-content: flex-start;
					margin-top: 1rem;
				}
			}
		}
	}

	:global(.pagination) {
		:global {
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

				&:not([disabled]):hover,
				&:focus-visible {
					background-color: #f7f7f7;
					color: #3c4257;
				}

				&:focus-visible {
					outline: 2px solid var(--primary-color);
					outline-offset: 2px;
				}
			}
		}
	}
</style>
