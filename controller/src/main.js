import Router from './Router.svelte';
import SignIn from './SignIn.svelte'
import Authorization from './Authorization.svelte'
const app = new Authorization({
	target: document.body
});

export default app;