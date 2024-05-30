<script>
	let { ...props } = $props();

	const searchSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <path d="M21 21l-6 -6" />
    </svg>  
  `;
</script>

<input
	aria-label="Search"
	aria-multiline="false"
	placeholder="Search..."
	spellcheck="false"
	style="--svg:url(data:image/svg+xml;utf8,{encodeURIComponent(searchSvg)})"
	tabindex="0"
	{...props}
/>

<style>
	input {
		background-image: var(--svg);
		background-position: left 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.1rem;
		border-radius: var(--border-radius, 5px);
		border: 1px solid var(--primary-color);
		color: var(--primary-color);
		line-height: 1.1;
		outline-color: var(--primary-color);
		padding: 0.5rem 0.5rem 0.5rem 2rem;
	}
</style>
