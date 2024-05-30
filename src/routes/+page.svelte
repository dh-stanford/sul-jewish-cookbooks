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
		  <a href="https://searchworks.stanford.edu/view/${id}">
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
		{ key: 'recipe', label: 'Recipe', accessor: 0, sortable: true, format: titleCase },
		{ key: 'book', label: 'Book', accessor: 4, sortable: true },
		{ key: 'organization', label: 'Organization', accessor: 3, sortable: true },
		{ key: 'year', label: 'Year', accessor: 5, sortable: true },
		{ key: 'state', label: 'State', accessor: 1, sortable: true },
		{ key: 'location', label: 'Location', accessor: 2, sortable: true },
		{ key: 'link', label: '', accessor: 6, sortable: false, format: formatLink, html: true }
	];
</script>

<Table data={recipes} {fields} class="recipes-table" />

<style>
	:global(.recipes-table) {
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
				min-height: 50vh;
			}

			tr:nth-child(even) td,
			tr:nth-child(even) th {
				background: #f8f6ff;
			}

			tbody tr:hover td,
			tbody tr:hover th {
				background: #d6daf0;
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
			}

			thead th::before,
			thead th::after {
				opacity: 0.3;
			}

			thead th[aria-sort]::before,
			thead th[aria-sort]::after {
				opacity: 1;
			}

			thead th[tabindex]:hover {
				background-color: #d6daf0;

				&::before,
				&::after {
					opacity: 1;
				}
			}
		}
	}
</style>
