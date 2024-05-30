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
		return `<a href="https://searchworks.stanford.edu/view/${id}">${id}</a>`;
	};

	const fields = [
		{ key: 'recipe', label: 'Recipe', accessor: 0, sortable: true, format: titleCase },
		{ key: 'book', label: 'Book', accessor: 4, sortable: true },
		{ key: 'organization', label: 'Organization', accessor: 3, sortable: true },
		{ key: 'year', label: 'Year', accessor: 5, sortable: true },
		{ key: 'state', label: 'State', accessor: 1, sortable: true },
		{ key: 'location', label: 'Location', accessor: 2, sortable: true },
		{ key: 'link', label: 'Link', accessor: 6, sortable: false, format: formatLink, html: true }
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
					minmax(150px, 1.25fr) /* Organization */
					80px /* Year */
					minmax(100px, 0.75fr) /* State */
					minmax(100px, 0.75fr) /* Location */
					80px; /* SearchWorks */
			}

			thead {
				border-bottom: 2px solid currentColor;

				th {
					font-size: 1.2rem;
					font-weight: bold;
				}
			}

			tr:nth-child(even) td,
			tr:nth-child(even) th {
				background: #f8f6ff;
			}

			tbody tr:hover td,
			tbody tr:hover th {
				background: #d6daf0;
			}

			td:nth-child(4),
			td:nth-child(7),
			th:nth-child(7) {
				text-align: center;
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
