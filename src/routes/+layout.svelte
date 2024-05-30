<script>
	import '../styles/reset.css';
	import '../styles/base.css';
</script>

<svelte:head>
	<title>Jewish Cookbooks</title>
	<meta name="description" content="Recipes from Stanford LIbraries' Jewish Cookbooks Collection" />
</svelte:head>

<header>
	<h1>Jewish Cookbooks</h1>
</header>

<main>
	<slot />
</main>

<footer>GitHub</footer>

<style>
	header {
	}

	main {
		overflow: hidden;
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
	}

	footer {
		align-self: flex-end;
	}
</style>
