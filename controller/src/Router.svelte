<script>
	
	import { onMount, tick } from "svelte";
	import { push, replace, location } from "svelte-spa-router";
	import Router from "svelte-spa-router";
	
	import SignIn from "./SignIn.svelte";
	import Main from "./Main.svelte";
  import Authorization from './Authorization.svelte'
	
	let routes = {
		"/": Main, 
		"/sign-in": SignIn,
    "/auth": Authorization
	};
	
	$: console.log("navigate to " + $location);
	
</script>

<Router { routes } />