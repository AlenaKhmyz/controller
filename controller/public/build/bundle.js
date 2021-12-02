
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    const missing_component = {
        $$render: () => ''
    };
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.44.0 */

    const { Error: Error_1, Object: Object_1, console: console_1$2 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SignIn.svelte generated by Svelte v3.44.0 */
    const file$2 = "src\\SignIn.svelte";

    function create_fragment$3(ctx) {
    	let div3;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let input0;
    	let input0_onchange_value;
    	let t1;
    	let div1;
    	let input1;
    	let input1_onchange_value;
    	let t2;
    	let div2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t1 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t2 = space();
    			div2 = element("div");
    			button = element("button");
    			button.textContent = "Войти";
    			attr_dev(img, "class", "logo svelte-1b59ylw");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Логотип");
    			add_location(img, file$2, 31, 2, 831);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-phone svelte-1b59ylw");
    			attr_dev(input0, "placeholder", "Логин");
    			attr_dev(input0, "onchange", input0_onchange_value = /*func*/ ctx[4]);
    			add_location(input0, file$2, 33, 4, 899);
    			attr_dev(div0, "class", "phone svelte-1b59ylw");
    			add_location(div0, file$2, 32, 2, 874);
    			attr_dev(input1, "class", "form-password svelte-1b59ylw");
    			attr_dev(input1, "placeholder", "Пароль");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "onchange", input1_onchange_value = /*func_1*/ ctx[6]);
    			add_location(input1, file$2, 41, 4, 1095);
    			attr_dev(div1, "class", "password svelte-1b59ylw");
    			add_location(div1, file$2, 40, 2, 1067);
    			attr_dev(button, "class", "form-button svelte-1b59ylw");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$2, 49, 4, 1303);
    			attr_dev(div2, "class", "button svelte-1b59ylw");
    			add_location(div2, file$2, 48, 2, 1277);
    			attr_dev(div3, "class", "form svelte-1b59ylw");
    			add_location(div3, file$2, 30, 0, 809);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*login*/ ctx[1]);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, input1);
    			set_input_value(input1, /*password*/ ctx[0]);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(button, "click", prevent_default(/*submit*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*login*/ 2 && input0_onchange_value !== (input0_onchange_value = /*func*/ ctx[4])) {
    				attr_dev(input0, "onchange", input0_onchange_value);
    			}

    			if (dirty & /*login*/ 2 && input0.value !== /*login*/ ctx[1]) {
    				set_input_value(input0, /*login*/ ctx[1]);
    			}

    			if (dirty & /*password*/ 1 && input1_onchange_value !== (input1_onchange_value = /*func_1*/ ctx[6])) {
    				attr_dev(input1, "onchange", input1_onchange_value);
    			}

    			if (dirty & /*password*/ 1 && input1.value !== /*password*/ ctx[0]) {
    				set_input_value(input1, /*password*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SignIn', slots, []);
    	let password = 'test';
    	let login = 'test';
    	let src = "images/logo.png";

    	const submit = async () => {
    		const response = await fetch('http://46.216.9.22:81/auth', {
    			method: 'POST',
    			headers: {
    				'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    			},
    			//credentials: 'include',
    			body: new URLSearchParams({ login, password })
    		});

    		const data = await response.json();

    		if (data.authorized == true) {
    			// sessionStorage.setItem("authtoken", data.token)
    			document.cookie = "authtoken=" + data.token;

    			replace("/");
    		} else {
    			alert("Wrong authorisation data.");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SignIn> was created with unknown prop '${key}'`);
    	});

    	const func = event => {
    		login(event.target.value);
    	};

    	function input0_input_handler() {
    		login = this.value;
    		$$invalidate(1, login);
    	}

    	const func_1 = event => {
    		password(event.target.value);
    	};

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(0, password);
    	}

    	$$self.$capture_state = () => ({
    		push,
    		replace,
    		location,
    		password,
    		login,
    		src,
    		submit
    	});

    	$$self.$inject_state = $$props => {
    		if ('password' in $$props) $$invalidate(0, password = $$props.password);
    		if ('login' in $$props) $$invalidate(1, login = $$props.login);
    		if ('src' in $$props) $$invalidate(2, src = $$props.src);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		password,
    		login,
    		src,
    		submit,
    		func,
    		input0_input_handler,
    		func_1,
    		input1_input_handler
    	];
    }

    class SignIn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SignIn",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Main.svelte generated by Svelte v3.44.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\Main.svelte";

    function create_fragment$2(ctx) {
    	let div62;
    	let div8;
    	let div0;
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let t0;
    	let p0;
    	let t2;
    	let div7;
    	let div2;
    	let div1;
    	let t4;
    	let div6;
    	let div3;
    	let p1;
    	let t6;
    	let p2;
    	let t8;
    	let div4;
    	let p3;
    	let t10;
    	let p4;
    	let t12;
    	let div5;
    	let p5;
    	let t14;
    	let p6;
    	let t16;
    	let div61;
    	let div53;
    	let div16;
    	let div9;
    	let p7;
    	let t18;
    	let div15;
    	let div10;
    	let p8;
    	let t20;
    	let p9;
    	let t22;
    	let p10;
    	let t23;
    	let div11;
    	let p11;
    	let t25;
    	let p12;
    	let t27;
    	let div12;
    	let p13;
    	let t29;
    	let p14;
    	let t31;
    	let div13;
    	let p15;
    	let t33;
    	let p16;
    	let t35;
    	let div14;
    	let p17;
    	let t37;
    	let p18;
    	let t39;
    	let div22;
    	let div17;
    	let p19;
    	let t41;
    	let div21;
    	let div18;
    	let p20;
    	let t43;
    	let p21;
    	let t45;
    	let div19;
    	let p22;
    	let t47;
    	let p23;
    	let t49;
    	let div20;
    	let p24;
    	let t51;
    	let p25;
    	let t53;
    	let div28;
    	let div23;
    	let p26;
    	let t55;
    	let div27;
    	let div24;
    	let p27;
    	let t57;
    	let p28;
    	let t59;
    	let div25;
    	let p29;
    	let t61;
    	let p30;
    	let t63;
    	let div26;
    	let p31;
    	let t65;
    	let p32;
    	let t67;
    	let div34;
    	let div29;
    	let p33;
    	let t69;
    	let div33;
    	let div30;
    	let p34;
    	let t71;
    	let p35;
    	let t73;
    	let div31;
    	let p36;
    	let t75;
    	let p37;
    	let t77;
    	let div32;
    	let p38;
    	let t79;
    	let p39;
    	let t81;
    	let div40;
    	let div35;
    	let p40;
    	let t83;
    	let div39;
    	let div36;
    	let p41;
    	let t85;
    	let p42;
    	let t87;
    	let div37;
    	let p43;
    	let t89;
    	let p44;
    	let t91;
    	let div38;
    	let p45;
    	let t93;
    	let p46;
    	let t95;
    	let div46;
    	let div41;
    	let p47;
    	let t97;
    	let div45;
    	let div42;
    	let p48;
    	let t99;
    	let p49;
    	let t101;
    	let div43;
    	let p50;
    	let t103;
    	let p51;
    	let t105;
    	let div44;
    	let p52;
    	let t107;
    	let p53;
    	let t109;
    	let div52;
    	let div47;
    	let p54;
    	let t111;
    	let div51;
    	let div48;
    	let p55;
    	let t113;
    	let p56;
    	let t115;
    	let div49;
    	let p57;
    	let t117;
    	let p58;
    	let t119;
    	let div50;
    	let p59;
    	let t121;
    	let p60;
    	let t123;
    	let div60;
    	let div55;
    	let p61;
    	let t125;
    	let div54;
    	let t126;
    	let div57;
    	let p62;
    	let t128;
    	let div56;
    	let t129;
    	let div59;
    	let p63;
    	let t131;
    	let div58;

    	const block = {
    		c: function create() {
    			div62 = element("div");
    			div8 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Настройки";
    			t2 = space();
    			div7 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "17.24";
    			t4 = space();
    			div6 = element("div");
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Текущий режим работы:";
    			t6 = space();
    			p2 = element("p");
    			p2.textContent = "IDLE";
    			t8 = space();
    			div4 = element("div");
    			p3 = element("p");
    			p3.textContent = "Закончится в";
    			t10 = space();
    			p4 = element("p");
    			p4.textContent = "120 min";
    			t12 = space();
    			div5 = element("div");
    			p5 = element("p");
    			p5.textContent = "Следующий режим работы:";
    			t14 = space();
    			p6 = element("p");
    			p6.textContent = "MODE2";
    			t16 = space();
    			div61 = element("div");
    			div53 = element("div");
    			div16 = element("div");
    			div9 = element("div");
    			p7 = element("p");
    			p7.textContent = "понедельник";
    			t18 = space();
    			div15 = element("div");
    			div10 = element("div");
    			p8 = element("p");
    			p8.textContent = "IDLE";
    			t20 = space();
    			p9 = element("p");
    			p9.textContent = "17:20";
    			t22 = space();
    			p10 = element("p");
    			t23 = space();
    			div11 = element("div");
    			p11 = element("p");
    			p11.textContent = "IDLE";
    			t25 = space();
    			p12 = element("p");
    			p12.textContent = "17:20";
    			t27 = space();
    			div12 = element("div");
    			p13 = element("p");
    			p13.textContent = "IDLE";
    			t29 = space();
    			p14 = element("p");
    			p14.textContent = "17:20";
    			t31 = space();
    			div13 = element("div");
    			p15 = element("p");
    			p15.textContent = "MODE1";
    			t33 = space();
    			p16 = element("p");
    			p16.textContent = "17:20-20:40";
    			t35 = space();
    			div14 = element("div");
    			p17 = element("p");
    			p17.textContent = "MODE2";
    			t37 = space();
    			p18 = element("p");
    			p18.textContent = "20:40-23:50";
    			t39 = space();
    			div22 = element("div");
    			div17 = element("div");
    			p19 = element("p");
    			p19.textContent = "вторник";
    			t41 = space();
    			div21 = element("div");
    			div18 = element("div");
    			p20 = element("p");
    			p20.textContent = "IDLE";
    			t43 = space();
    			p21 = element("p");
    			p21.textContent = "17:20";
    			t45 = space();
    			div19 = element("div");
    			p22 = element("p");
    			p22.textContent = "MODE1";
    			t47 = space();
    			p23 = element("p");
    			p23.textContent = "17:20-20:40";
    			t49 = space();
    			div20 = element("div");
    			p24 = element("p");
    			p24.textContent = "MODE2";
    			t51 = space();
    			p25 = element("p");
    			p25.textContent = "20:40-23:50";
    			t53 = space();
    			div28 = element("div");
    			div23 = element("div");
    			p26 = element("p");
    			p26.textContent = "среда";
    			t55 = space();
    			div27 = element("div");
    			div24 = element("div");
    			p27 = element("p");
    			p27.textContent = "IDLE";
    			t57 = space();
    			p28 = element("p");
    			p28.textContent = "17:20";
    			t59 = space();
    			div25 = element("div");
    			p29 = element("p");
    			p29.textContent = "MODE1";
    			t61 = space();
    			p30 = element("p");
    			p30.textContent = "17:20-20:40";
    			t63 = space();
    			div26 = element("div");
    			p31 = element("p");
    			p31.textContent = "MODE2";
    			t65 = space();
    			p32 = element("p");
    			p32.textContent = "20:40-23:50";
    			t67 = space();
    			div34 = element("div");
    			div29 = element("div");
    			p33 = element("p");
    			p33.textContent = "четверг";
    			t69 = space();
    			div33 = element("div");
    			div30 = element("div");
    			p34 = element("p");
    			p34.textContent = "IDLE";
    			t71 = space();
    			p35 = element("p");
    			p35.textContent = "17:20";
    			t73 = space();
    			div31 = element("div");
    			p36 = element("p");
    			p36.textContent = "MODE1";
    			t75 = space();
    			p37 = element("p");
    			p37.textContent = "17:20-20:40";
    			t77 = space();
    			div32 = element("div");
    			p38 = element("p");
    			p38.textContent = "MODE2";
    			t79 = space();
    			p39 = element("p");
    			p39.textContent = "20:40-23:50";
    			t81 = space();
    			div40 = element("div");
    			div35 = element("div");
    			p40 = element("p");
    			p40.textContent = "пятница";
    			t83 = space();
    			div39 = element("div");
    			div36 = element("div");
    			p41 = element("p");
    			p41.textContent = "IDLE";
    			t85 = space();
    			p42 = element("p");
    			p42.textContent = "17:20";
    			t87 = space();
    			div37 = element("div");
    			p43 = element("p");
    			p43.textContent = "MODE1";
    			t89 = space();
    			p44 = element("p");
    			p44.textContent = "17:20-20:40";
    			t91 = space();
    			div38 = element("div");
    			p45 = element("p");
    			p45.textContent = "MODE2";
    			t93 = space();
    			p46 = element("p");
    			p46.textContent = "20:40-23:50";
    			t95 = space();
    			div46 = element("div");
    			div41 = element("div");
    			p47 = element("p");
    			p47.textContent = "суббота";
    			t97 = space();
    			div45 = element("div");
    			div42 = element("div");
    			p48 = element("p");
    			p48.textContent = "IDLE";
    			t99 = space();
    			p49 = element("p");
    			p49.textContent = "17:20";
    			t101 = space();
    			div43 = element("div");
    			p50 = element("p");
    			p50.textContent = "MODE1";
    			t103 = space();
    			p51 = element("p");
    			p51.textContent = "17:20-20:40";
    			t105 = space();
    			div44 = element("div");
    			p52 = element("p");
    			p52.textContent = "MODE2";
    			t107 = space();
    			p53 = element("p");
    			p53.textContent = "20:40-23:50";
    			t109 = space();
    			div52 = element("div");
    			div47 = element("div");
    			p54 = element("p");
    			p54.textContent = "воскресенье";
    			t111 = space();
    			div51 = element("div");
    			div48 = element("div");
    			p55 = element("p");
    			p55.textContent = "IDLE";
    			t113 = space();
    			p56 = element("p");
    			p56.textContent = "17:20";
    			t115 = space();
    			div49 = element("div");
    			p57 = element("p");
    			p57.textContent = "MODE1";
    			t117 = space();
    			p58 = element("p");
    			p58.textContent = "17:20-20:40";
    			t119 = space();
    			div50 = element("div");
    			p59 = element("p");
    			p59.textContent = "MODE2";
    			t121 = space();
    			p60 = element("p");
    			p60.textContent = "20:40-23:50";
    			t123 = space();
    			div60 = element("div");
    			div55 = element("div");
    			p61 = element("p");
    			p61.textContent = "1347mPm";
    			t125 = space();
    			div54 = element("div");
    			t126 = space();
    			div57 = element("div");
    			p62 = element("p");
    			p62.textContent = "3400mPm";
    			t128 = space();
    			div56 = element("div");
    			t129 = space();
    			div59 = element("div");
    			p63 = element("p");
    			p63.textContent = "120C";
    			t131 = space();
    			div58 = element("div");
    			attr_dev(path0, "fill", "#4c5867");
    			attr_dev(path0, "d", "M30.391,12.68l-3.064-0.614c-0.154-0.443-0.336-0.873-0.537-1.289l1.736-2.604\r\n            c0.529-0.793,0.424-1.85-0.25-2.523l-1.924-1.924c-0.387-0.387-0.898-0.586-1.416-0.586c-0.383,0-0.77,0.11-1.107,0.336\r\n            l-2.604,1.735c-0.418-0.202-0.848-0.382-1.291-0.536L19.32,1.61c-0.186-0.936-1.008-1.608-1.961-1.608h-2.72\r\n            c-0.953,0-1.774,0.673-1.961,1.608l-0.614,3.065c-0.443,0.154-0.873,0.335-1.289,0.536L8.172,3.476\r\n            C7.833,3.25,7.447,3.14,7.063,3.14c-0.517,0-1.028,0.199-1.415,0.586L3.725,5.65c-0.674,0.674-0.779,1.73-0.25,2.523l1.735,2.604\r\n            c-0.202,0.417-0.382,0.847-0.536,1.29L1.608,12.68C0.673,12.867,0,13.688,0,14.641v2.72c0,0.953,0.673,1.775,1.608,1.961\r\n            l3.065,0.615c0.154,0.443,0.335,0.873,0.536,1.289L3.475,23.83c-0.529,0.793-0.424,1.85,0.25,2.523l1.924,1.924\r\n            c0.387,0.387,0.898,0.586,1.415,0.586c0.384,0,0.771-0.111,1.108-0.336l2.604-1.736c0.417,0.203,0.847,0.383,1.29,0.537\r\n            l0.613,3.064c0.187,0.936,1.008,1.609,1.961,1.609h2.72c0.953,0,1.775-0.674,1.961-1.609l0.615-3.064\r\n            c0.443-0.154,0.873-0.336,1.289-0.537l2.604,1.736c0.338,0.225,0.725,0.336,1.107,0.336c0.518,0,1.029-0.199,1.416-0.586\r\n            l1.924-1.924c0.674-0.674,0.779-1.73,0.25-2.523l-1.736-2.604c0.203-0.418,0.383-0.848,0.537-1.291l3.064-0.613\r\n            C31.326,19.137,32,18.314,32,17.361v-2.72C32,13.688,31.326,12.867,30.391,12.68z M26.934,17.975\r\n            c-0.695,0.139-1.264,0.635-1.496,1.305c-0.129,0.369-0.279,0.727-0.447,1.074c-0.311,0.639-0.258,1.393,0.135,1.982l1.736,2.604\r\n            l-1.924,1.924l-2.604-1.736c-0.334-0.223-0.721-0.336-1.109-0.336c-0.297,0-0.596,0.066-0.871,0.199\r\n            c-0.348,0.168-0.705,0.32-1.076,0.449c-0.668,0.232-1.164,0.801-1.303,1.496l-0.615,3.066h-2.72l-0.613-3.066\r\n            c-0.139-0.695-0.635-1.264-1.304-1.496c-0.369-0.129-0.728-0.279-1.075-0.447c-0.276-0.135-0.574-0.201-0.872-0.201\r\n            c-0.389,0-0.775,0.113-1.109,0.336l-2.604,1.736l-1.924-1.924l1.735-2.604c0.393-0.59,0.444-1.344,0.137-1.98\r\n            c-0.168-0.348-0.319-0.705-0.448-1.076c-0.232-0.668-0.802-1.164-1.496-1.303l-3.065-0.615L2,14.641l3.066-0.613\r\n            c0.694-0.139,1.264-0.635,1.496-1.304c0.129-0.369,0.278-0.728,0.447-1.075c0.31-0.638,0.258-1.392-0.136-1.981L5.139,7.064\r\n            L7.062,5.14l2.604,1.735C10,7.098,10.387,7.211,10.775,7.211c0.297,0,0.595-0.066,0.871-0.199c0.347-0.168,0.705-0.319,1.075-0.448\r\n            c0.669-0.232,1.165-0.802,1.304-1.496l0.614-3.065l2.72-0.001l0.613,3.066c0.139,0.694,0.635,1.264,1.305,1.496\r\n            c0.369,0.129,0.727,0.278,1.074,0.447c0.277,0.134,0.574,0.2,0.873,0.2c0.389,0,0.775-0.113,1.109-0.336l2.604-1.735l1.924,1.924\r\n            l-1.736,2.604c-0.393,0.59-0.443,1.343-0.137,1.98c0.168,0.347,0.32,0.705,0.449,1.075c0.232,0.669,0.801,1.165,1.496,1.304\r\n            l3.064,0.614L30,17.361L26.934,17.975z");
    			add_location(path0, file$1, 313, 10, 6220);
    			attr_dev(path1, "fill", "#4c5867");
    			attr_dev(path1, "d", "M16,9.001c-3.865,0-7,3.135-7,7c0,3.866,3.135,7,7,7s7-3.135,7-7C23,12.136,19.865,9.001,16,9.001z\r\n            M16,22.127c-3.382,0-6.125-2.744-6.125-6.125c0-3.382,2.743-6.125,6.125-6.125c3.381,0,6.125,2.743,6.125,6.125\r\n            C22.125,19.383,19.381,22.127,16,22.127z");
    			add_location(path1, file$1, 337, 10, 9126);
    			attr_dev(path2, "fill", "#4c5867");
    			attr_dev(path2, "d", "M16,12.001c-2.21,0-4,1.79-4,4c0,2.209,1.79,4,4,4c2.209,0,4-1.791,4-4C20,13.792,18.209,12.001,16,12.001z\r\n            M16,19.002c-1.656,0-3-1.344-3-3c0-1.656,1.344-3,3-3s3,1.344,3,3C19,17.658,17.656,19.002,16,19.002z");
    			add_location(path2, file$1, 340, 10, 9434);
    			attr_dev(g, "id", "settings");
    			add_location(g, file$1, 312, 8, 6191);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "width", "64px");
    			attr_dev(svg, "height", "64px");
    			attr_dev(svg, "viewBox", "0 0 32 32");
    			attr_dev(svg, "enable-background", "new 0 0 32 32");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$1, 310, 36, 5946);
    			attr_dev(p0, "class", "settings-word svelte-jnty5r");
    			add_location(p0, file$1, 344, 6, 9712);
    			attr_dev(div0, "class", "operation-settings svelte-jnty5r");
    			add_location(div0, file$1, 310, 4, 5914);
    			attr_dev(div1, "class", "time svelte-jnty5r");
    			add_location(div1, file$1, 349, 8, 9895);
    			attr_dev(div2, "class", "indicator svelte-jnty5r");
    			add_location(div2, file$1, 347, 6, 9800);
    			attr_dev(p1, "class", "operation-name svelte-jnty5r");
    			add_location(p1, file$1, 353, 10, 10028);
    			attr_dev(p2, "class", "operation-value svelte-jnty5r");
    			add_location(p2, file$1, 354, 10, 10091);
    			attr_dev(div3, "class", "operation-mean svelte-jnty5r");
    			add_location(div3, file$1, 352, 8, 9988);
    			attr_dev(p3, "class", "operation-name svelte-jnty5r");
    			add_location(p3, file$1, 357, 10, 10192);
    			attr_dev(p4, "class", "operation-value svelte-jnty5r");
    			add_location(p4, file$1, 358, 10, 10246);
    			attr_dev(div4, "class", "operation-mean svelte-jnty5r");
    			add_location(div4, file$1, 356, 8, 10152);
    			attr_dev(p5, "class", "operation-name svelte-jnty5r");
    			add_location(p5, file$1, 361, 10, 10350);
    			attr_dev(p6, "class", "operation-value svelte-jnty5r");
    			add_location(p6, file$1, 362, 10, 10416);
    			attr_dev(div5, "class", "operation-mean svelte-jnty5r");
    			add_location(div5, file$1, 360, 8, 10310);
    			attr_dev(div6, "class", "action-operations svelte-jnty5r");
    			add_location(div6, file$1, 351, 6, 9947);
    			attr_dev(div7, "class", "operations svelte-jnty5r");
    			add_location(div7, file$1, 346, 4, 9768);
    			attr_dev(div8, "class", "head svelte-jnty5r");
    			add_location(div8, file$1, 309, 2, 5890);
    			attr_dev(p7, "class", "day svelte-jnty5r");
    			add_location(p7, file$1, 372, 10, 10649);
    			attr_dev(div9, "class", "days");
    			add_location(div9, file$1, 371, 8, 10619);
    			attr_dev(p8, "class", "action svelte-jnty5r");
    			add_location(p8, file$1, 376, 12, 10783);
    			attr_dev(p9, "class", "action-time svelte-jnty5r");
    			add_location(p9, file$1, 377, 12, 10823);
    			attr_dev(p10, "class", "action-time svelte-jnty5r");
    			add_location(p10, file$1, 378, 12, 10869);
    			attr_dev(div10, "class", "operation svelte-jnty5r");
    			add_location(div10, file$1, 375, 10, 10746);
    			attr_dev(p11, "class", "action svelte-jnty5r");
    			add_location(p11, file$1, 381, 12, 10963);
    			attr_dev(p12, "class", "action-time svelte-jnty5r");
    			add_location(p12, file$1, 382, 12, 11003);
    			attr_dev(div11, "class", "operation svelte-jnty5r");
    			add_location(div11, file$1, 380, 10, 10926);
    			attr_dev(p13, "class", "action svelte-jnty5r");
    			add_location(p13, file$1, 386, 12, 11114);
    			attr_dev(p14, "class", "action-time svelte-jnty5r");
    			add_location(p14, file$1, 387, 12, 11154);
    			attr_dev(div12, "class", "operation svelte-jnty5r");
    			add_location(div12, file$1, 385, 10, 11077);
    			attr_dev(p15, "class", "action svelte-jnty5r");
    			add_location(p15, file$1, 391, 12, 11265);
    			attr_dev(p16, "class", "action-time svelte-jnty5r");
    			add_location(p16, file$1, 392, 12, 11306);
    			attr_dev(div13, "class", "operation svelte-jnty5r");
    			add_location(div13, file$1, 390, 10, 11228);
    			attr_dev(p17, "class", "action svelte-jnty5r");
    			add_location(p17, file$1, 396, 12, 11423);
    			attr_dev(p18, "class", "action-time svelte-jnty5r");
    			add_location(p18, file$1, 397, 12, 11464);
    			attr_dev(div14, "class", "operation svelte-jnty5r");
    			add_location(div14, file$1, 395, 10, 11386);
    			attr_dev(div15, "class", "day-operations svelte-jnty5r");
    			add_location(div15, file$1, 374, 8, 10706);
    			attr_dev(div16, "class", "timetable svelte-jnty5r");
    			add_location(div16, file$1, 369, 8, 10576);
    			attr_dev(p19, "class", "day svelte-jnty5r");
    			add_location(p19, file$1, 404, 10, 11632);
    			attr_dev(div17, "class", "days");
    			add_location(div17, file$1, 403, 8, 11602);
    			attr_dev(p20, "class", "action svelte-jnty5r");
    			add_location(p20, file$1, 408, 12, 11762);
    			attr_dev(p21, "class", "action-time svelte-jnty5r");
    			add_location(p21, file$1, 409, 12, 11802);
    			attr_dev(div18, "class", "operation svelte-jnty5r");
    			add_location(div18, file$1, 407, 10, 11725);
    			attr_dev(p22, "class", "action svelte-jnty5r");
    			add_location(p22, file$1, 413, 12, 11913);
    			attr_dev(p23, "class", "action-time svelte-jnty5r");
    			add_location(p23, file$1, 414, 12, 11954);
    			attr_dev(div19, "class", "operation svelte-jnty5r");
    			add_location(div19, file$1, 412, 10, 11876);
    			attr_dev(p24, "class", "action svelte-jnty5r");
    			add_location(p24, file$1, 418, 12, 12071);
    			attr_dev(p25, "class", "action-time svelte-jnty5r");
    			add_location(p25, file$1, 419, 12, 12112);
    			attr_dev(div20, "class", "operation svelte-jnty5r");
    			add_location(div20, file$1, 417, 10, 12034);
    			attr_dev(div21, "class", "day-operations svelte-jnty5r");
    			add_location(div21, file$1, 406, 8, 11685);
    			attr_dev(div22, "class", "timetable svelte-jnty5r");
    			add_location(div22, file$1, 402, 6, 11569);
    			attr_dev(p26, "class", "day svelte-jnty5r");
    			add_location(p26, file$1, 427, 10, 12291);
    			attr_dev(div23, "class", "days");
    			add_location(div23, file$1, 426, 8, 12261);
    			attr_dev(p27, "class", "action svelte-jnty5r");
    			add_location(p27, file$1, 431, 12, 12419);
    			attr_dev(p28, "class", "action-time svelte-jnty5r");
    			add_location(p28, file$1, 432, 12, 12459);
    			attr_dev(div24, "class", "operation svelte-jnty5r");
    			add_location(div24, file$1, 430, 10, 12382);
    			attr_dev(p29, "class", "action svelte-jnty5r");
    			add_location(p29, file$1, 436, 12, 12570);
    			attr_dev(p30, "class", "action-time svelte-jnty5r");
    			add_location(p30, file$1, 437, 12, 12611);
    			attr_dev(div25, "class", "operation svelte-jnty5r");
    			add_location(div25, file$1, 435, 10, 12533);
    			attr_dev(p31, "class", "action svelte-jnty5r");
    			add_location(p31, file$1, 441, 12, 12728);
    			attr_dev(p32, "class", "action-time svelte-jnty5r");
    			add_location(p32, file$1, 442, 12, 12769);
    			attr_dev(div26, "class", "operation svelte-jnty5r");
    			add_location(div26, file$1, 440, 10, 12691);
    			attr_dev(div27, "class", "day-operations svelte-jnty5r");
    			add_location(div27, file$1, 429, 8, 12342);
    			attr_dev(div28, "class", "timetable svelte-jnty5r");
    			add_location(div28, file$1, 425, 6, 12228);
    			attr_dev(p33, "class", "day svelte-jnty5r");
    			add_location(p33, file$1, 450, 10, 12948);
    			attr_dev(div29, "class", "days");
    			add_location(div29, file$1, 449, 8, 12918);
    			attr_dev(p34, "class", "action svelte-jnty5r");
    			add_location(p34, file$1, 454, 12, 13078);
    			attr_dev(p35, "class", "action-time svelte-jnty5r");
    			add_location(p35, file$1, 455, 12, 13118);
    			attr_dev(div30, "class", "operation svelte-jnty5r");
    			add_location(div30, file$1, 453, 10, 13041);
    			attr_dev(p36, "class", "action svelte-jnty5r");
    			add_location(p36, file$1, 459, 12, 13229);
    			attr_dev(p37, "class", "action-time svelte-jnty5r");
    			add_location(p37, file$1, 460, 12, 13270);
    			attr_dev(div31, "class", "operation svelte-jnty5r");
    			add_location(div31, file$1, 458, 10, 13192);
    			attr_dev(p38, "class", "action svelte-jnty5r");
    			add_location(p38, file$1, 464, 12, 13387);
    			attr_dev(p39, "class", "action-time svelte-jnty5r");
    			add_location(p39, file$1, 465, 12, 13428);
    			attr_dev(div32, "class", "operation svelte-jnty5r");
    			add_location(div32, file$1, 463, 10, 13350);
    			attr_dev(div33, "class", "day-operations svelte-jnty5r");
    			add_location(div33, file$1, 452, 8, 13001);
    			attr_dev(div34, "class", "timetable svelte-jnty5r");
    			add_location(div34, file$1, 448, 6, 12885);
    			attr_dev(p40, "class", "day svelte-jnty5r");
    			add_location(p40, file$1, 472, 10, 13597);
    			attr_dev(div35, "class", "days");
    			add_location(div35, file$1, 471, 8, 13567);
    			attr_dev(p41, "class", "action svelte-jnty5r");
    			add_location(p41, file$1, 476, 12, 13727);
    			attr_dev(p42, "class", "action-time svelte-jnty5r");
    			add_location(p42, file$1, 477, 12, 13767);
    			attr_dev(div36, "class", "operation svelte-jnty5r");
    			add_location(div36, file$1, 475, 10, 13690);
    			attr_dev(p43, "class", "action svelte-jnty5r");
    			add_location(p43, file$1, 481, 12, 13878);
    			attr_dev(p44, "class", "action-time svelte-jnty5r");
    			add_location(p44, file$1, 482, 12, 13919);
    			attr_dev(div37, "class", "operation svelte-jnty5r");
    			add_location(div37, file$1, 480, 10, 13841);
    			attr_dev(p45, "class", "action svelte-jnty5r");
    			add_location(p45, file$1, 486, 12, 14036);
    			attr_dev(p46, "class", "action-time svelte-jnty5r");
    			add_location(p46, file$1, 487, 12, 14077);
    			attr_dev(div38, "class", "operation svelte-jnty5r");
    			add_location(div38, file$1, 485, 10, 13999);
    			attr_dev(div39, "class", "day-operations svelte-jnty5r");
    			add_location(div39, file$1, 474, 8, 13650);
    			attr_dev(div40, "class", "timetable svelte-jnty5r");
    			add_location(div40, file$1, 470, 6, 13534);
    			attr_dev(p47, "class", "day svelte-jnty5r");
    			add_location(p47, file$1, 494, 10, 14248);
    			attr_dev(div41, "class", "days");
    			add_location(div41, file$1, 493, 8, 14218);
    			attr_dev(p48, "class", "action svelte-jnty5r");
    			add_location(p48, file$1, 498, 12, 14378);
    			attr_dev(p49, "class", "action-time svelte-jnty5r");
    			add_location(p49, file$1, 499, 12, 14418);
    			attr_dev(div42, "class", "operation svelte-jnty5r");
    			add_location(div42, file$1, 497, 10, 14341);
    			attr_dev(p50, "class", "action svelte-jnty5r");
    			add_location(p50, file$1, 503, 12, 14529);
    			attr_dev(p51, "class", "action-time svelte-jnty5r");
    			add_location(p51, file$1, 504, 12, 14570);
    			attr_dev(div43, "class", "operation svelte-jnty5r");
    			add_location(div43, file$1, 502, 10, 14492);
    			attr_dev(p52, "class", "action svelte-jnty5r");
    			add_location(p52, file$1, 508, 12, 14687);
    			attr_dev(p53, "class", "action-time svelte-jnty5r");
    			add_location(p53, file$1, 509, 12, 14728);
    			attr_dev(div44, "class", "operation svelte-jnty5r");
    			add_location(div44, file$1, 507, 10, 14650);
    			attr_dev(div45, "class", "day-operations svelte-jnty5r");
    			add_location(div45, file$1, 496, 8, 14301);
    			attr_dev(div46, "class", "timetable svelte-jnty5r");
    			add_location(div46, file$1, 492, 6, 14185);
    			attr_dev(p54, "class", "day svelte-jnty5r");
    			add_location(p54, file$1, 517, 10, 14906);
    			attr_dev(div47, "class", "days");
    			add_location(div47, file$1, 516, 8, 14876);
    			attr_dev(p55, "class", "action svelte-jnty5r");
    			add_location(p55, file$1, 521, 12, 15040);
    			attr_dev(p56, "class", "action-time svelte-jnty5r");
    			add_location(p56, file$1, 522, 12, 15080);
    			attr_dev(div48, "class", "operation svelte-jnty5r");
    			add_location(div48, file$1, 520, 10, 15003);
    			attr_dev(p57, "class", "action svelte-jnty5r");
    			add_location(p57, file$1, 526, 12, 15191);
    			attr_dev(p58, "class", "action-time svelte-jnty5r");
    			add_location(p58, file$1, 527, 12, 15232);
    			attr_dev(div49, "class", "operation svelte-jnty5r");
    			add_location(div49, file$1, 525, 10, 15154);
    			attr_dev(p59, "class", "action svelte-jnty5r");
    			add_location(p59, file$1, 531, 12, 15349);
    			attr_dev(p60, "class", "action-time svelte-jnty5r");
    			add_location(p60, file$1, 532, 12, 15390);
    			attr_dev(div50, "class", "operation svelte-jnty5r");
    			add_location(div50, file$1, 530, 10, 15312);
    			attr_dev(div51, "class", "day-operations svelte-jnty5r");
    			add_location(div51, file$1, 519, 8, 14963);
    			attr_dev(div52, "class", "timetable svelte-jnty5r");
    			add_location(div52, file$1, 515, 6, 14843);
    			attr_dev(div53, "class", "timetable-operation svelte-jnty5r");
    			add_location(div53, file$1, 368, 4, 10533);
    			attr_dev(p61, "class", "value svelte-jnty5r");
    			add_location(p61, file$1, 540, 8, 15579);
    			attr_dev(div54, "class", "symbol svelte-jnty5r");
    			add_location(div54, file$1, 541, 8, 15617);
    			attr_dev(div55, "class", "mean svelte-jnty5r");
    			add_location(div55, file$1, 539, 6, 15551);
    			attr_dev(p62, "class", "value svelte-jnty5r");
    			add_location(p62, file$1, 544, 8, 15693);
    			attr_dev(div56, "class", "symbol svelte-jnty5r");
    			add_location(div56, file$1, 545, 8, 15731);
    			attr_dev(div57, "class", "mean svelte-jnty5r");
    			add_location(div57, file$1, 543, 6, 15665);
    			attr_dev(p63, "class", "value svelte-jnty5r");
    			add_location(p63, file$1, 548, 8, 15807);
    			attr_dev(div58, "class", "symbol svelte-jnty5r");
    			add_location(div58, file$1, 549, 8, 15842);
    			attr_dev(div59, "class", "mean svelte-jnty5r");
    			add_location(div59, file$1, 547, 6, 15779);
    			attr_dev(div60, "class", "elements-operations svelte-jnty5r");
    			add_location(div60, file$1, 538, 4, 15510);
    			attr_dev(div61, "class", "main svelte-jnty5r");
    			add_location(div61, file$1, 367, 2, 10509);
    			attr_dev(div62, "class", "container svelte-jnty5r");
    			add_location(div62, file$1, 308, 0, 5863);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div62, anchor);
    			append_dev(div62, div8);
    			append_dev(div8, div0);
    			append_dev(div0, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, div2);
    			append_dev(div2, div1);
    			append_dev(div7, t4);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, p1);
    			append_dev(div3, t6);
    			append_dev(div3, p2);
    			append_dev(div6, t8);
    			append_dev(div6, div4);
    			append_dev(div4, p3);
    			append_dev(div4, t10);
    			append_dev(div4, p4);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, p5);
    			append_dev(div5, t14);
    			append_dev(div5, p6);
    			append_dev(div62, t16);
    			append_dev(div62, div61);
    			append_dev(div61, div53);
    			append_dev(div53, div16);
    			append_dev(div16, div9);
    			append_dev(div9, p7);
    			append_dev(div16, t18);
    			append_dev(div16, div15);
    			append_dev(div15, div10);
    			append_dev(div10, p8);
    			append_dev(div10, t20);
    			append_dev(div10, p9);
    			append_dev(div10, t22);
    			append_dev(div10, p10);
    			append_dev(div15, t23);
    			append_dev(div15, div11);
    			append_dev(div11, p11);
    			append_dev(div11, t25);
    			append_dev(div11, p12);
    			append_dev(div15, t27);
    			append_dev(div15, div12);
    			append_dev(div12, p13);
    			append_dev(div12, t29);
    			append_dev(div12, p14);
    			append_dev(div15, t31);
    			append_dev(div15, div13);
    			append_dev(div13, p15);
    			append_dev(div13, t33);
    			append_dev(div13, p16);
    			append_dev(div15, t35);
    			append_dev(div15, div14);
    			append_dev(div14, p17);
    			append_dev(div14, t37);
    			append_dev(div14, p18);
    			append_dev(div53, t39);
    			append_dev(div53, div22);
    			append_dev(div22, div17);
    			append_dev(div17, p19);
    			append_dev(div22, t41);
    			append_dev(div22, div21);
    			append_dev(div21, div18);
    			append_dev(div18, p20);
    			append_dev(div18, t43);
    			append_dev(div18, p21);
    			append_dev(div21, t45);
    			append_dev(div21, div19);
    			append_dev(div19, p22);
    			append_dev(div19, t47);
    			append_dev(div19, p23);
    			append_dev(div21, t49);
    			append_dev(div21, div20);
    			append_dev(div20, p24);
    			append_dev(div20, t51);
    			append_dev(div20, p25);
    			append_dev(div53, t53);
    			append_dev(div53, div28);
    			append_dev(div28, div23);
    			append_dev(div23, p26);
    			append_dev(div28, t55);
    			append_dev(div28, div27);
    			append_dev(div27, div24);
    			append_dev(div24, p27);
    			append_dev(div24, t57);
    			append_dev(div24, p28);
    			append_dev(div27, t59);
    			append_dev(div27, div25);
    			append_dev(div25, p29);
    			append_dev(div25, t61);
    			append_dev(div25, p30);
    			append_dev(div27, t63);
    			append_dev(div27, div26);
    			append_dev(div26, p31);
    			append_dev(div26, t65);
    			append_dev(div26, p32);
    			append_dev(div53, t67);
    			append_dev(div53, div34);
    			append_dev(div34, div29);
    			append_dev(div29, p33);
    			append_dev(div34, t69);
    			append_dev(div34, div33);
    			append_dev(div33, div30);
    			append_dev(div30, p34);
    			append_dev(div30, t71);
    			append_dev(div30, p35);
    			append_dev(div33, t73);
    			append_dev(div33, div31);
    			append_dev(div31, p36);
    			append_dev(div31, t75);
    			append_dev(div31, p37);
    			append_dev(div33, t77);
    			append_dev(div33, div32);
    			append_dev(div32, p38);
    			append_dev(div32, t79);
    			append_dev(div32, p39);
    			append_dev(div53, t81);
    			append_dev(div53, div40);
    			append_dev(div40, div35);
    			append_dev(div35, p40);
    			append_dev(div40, t83);
    			append_dev(div40, div39);
    			append_dev(div39, div36);
    			append_dev(div36, p41);
    			append_dev(div36, t85);
    			append_dev(div36, p42);
    			append_dev(div39, t87);
    			append_dev(div39, div37);
    			append_dev(div37, p43);
    			append_dev(div37, t89);
    			append_dev(div37, p44);
    			append_dev(div39, t91);
    			append_dev(div39, div38);
    			append_dev(div38, p45);
    			append_dev(div38, t93);
    			append_dev(div38, p46);
    			append_dev(div53, t95);
    			append_dev(div53, div46);
    			append_dev(div46, div41);
    			append_dev(div41, p47);
    			append_dev(div46, t97);
    			append_dev(div46, div45);
    			append_dev(div45, div42);
    			append_dev(div42, p48);
    			append_dev(div42, t99);
    			append_dev(div42, p49);
    			append_dev(div45, t101);
    			append_dev(div45, div43);
    			append_dev(div43, p50);
    			append_dev(div43, t103);
    			append_dev(div43, p51);
    			append_dev(div45, t105);
    			append_dev(div45, div44);
    			append_dev(div44, p52);
    			append_dev(div44, t107);
    			append_dev(div44, p53);
    			append_dev(div53, t109);
    			append_dev(div53, div52);
    			append_dev(div52, div47);
    			append_dev(div47, p54);
    			append_dev(div52, t111);
    			append_dev(div52, div51);
    			append_dev(div51, div48);
    			append_dev(div48, p55);
    			append_dev(div48, t113);
    			append_dev(div48, p56);
    			append_dev(div51, t115);
    			append_dev(div51, div49);
    			append_dev(div49, p57);
    			append_dev(div49, t117);
    			append_dev(div49, p58);
    			append_dev(div51, t119);
    			append_dev(div51, div50);
    			append_dev(div50, p59);
    			append_dev(div50, t121);
    			append_dev(div50, p60);
    			append_dev(div61, t123);
    			append_dev(div61, div60);
    			append_dev(div60, div55);
    			append_dev(div55, p61);
    			append_dev(div55, t125);
    			append_dev(div55, div54);
    			append_dev(div60, t126);
    			append_dev(div60, div57);
    			append_dev(div57, p62);
    			append_dev(div57, t128);
    			append_dev(div57, div56);
    			append_dev(div60, t129);
    			append_dev(div60, div59);
    			append_dev(div59, p63);
    			append_dev(div59, t131);
    			append_dev(div59, div58);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div62);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let posts = {};
    	let weekdays = [];

    	onMount(async () => {
    		const response = await fetch(`http://46.216.9.22:81/give?table`, {
    			method: 'GET',
    			headers: { 'Content-Type': 'text/plain' }
    		});

    		posts = await response.json();

    		// weekdays = posts.table.weekday[]
    		console.log(posts.table.weekday.length);

    		for (let i = 0; i < posts.table.weekday.length; i++) {
    			console.log(posts.table.weekday[i]);

    			if (posts.table.weekday[i] != null) {
    				for (let j = 0; j < posts.table.weekday[i].length; j++) {
    					weekdays[i].push(posts.table.weekday[i][j]);
    					console.log(posts.table.weekday[i][j]);
    				}
    			}
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, posts, weekdays });

    	$$self.$inject_state = $$props => {
    		if ('posts' in $$props) posts = $$props.posts;
    		if ('weekdays' in $$props) weekdays = $$props.weekdays;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Authorization.svelte generated by Svelte v3.44.0 */
    const file = "src\\Authorization.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (151:8) {#each paragraphs as paragraph}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*paragraph*/ ctx[4].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*paragraph*/ ctx[4];
    			option.value = option.__value;
    			attr_dev(option, "class", "name-paragraphs svelte-1gn0wnf");
    			add_location(option, file, 151, 10, 3720);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(151:8) {#each paragraphs as paragraph}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div12;
    	let div7;
    	let h20;
    	let t1;
    	let div2;
    	let div0;
    	let input0;
    	let t2;
    	let div1;
    	let input1;
    	let t3;
    	let div6;
    	let div3;
    	let input2;
    	let t4;
    	let div4;
    	let input3;
    	let t5;
    	let div5;
    	let input4;
    	let t6;
    	let button0;
    	let t8;
    	let div10;
    	let h21;
    	let t10;
    	let div8;
    	let p;
    	let t12;
    	let select;
    	let t13;
    	let div9;
    	let input5;
    	let t14;
    	let input6;
    	let t15;
    	let button1;
    	let t17;
    	let div11;
    	let h22;
    	let t19;
    	let button2;
    	let t21;
    	let button3;
    	let mounted;
    	let dispose;
    	let each_value = /*paragraphs*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div12 = element("div");
    			div7 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Авторизационные данные";
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t3 = space();
    			div6 = element("div");
    			div3 = element("div");
    			input2 = element("input");
    			t4 = space();
    			div4 = element("div");
    			input3 = element("input");
    			t5 = space();
    			div5 = element("div");
    			input4 = element("input");
    			t6 = space();
    			button0 = element("button");
    			button0.textContent = "Подтвердить";
    			t8 = space();
    			div10 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Настройки wi-fi";
    			t10 = space();
    			div8 = element("div");
    			p = element("p");
    			p.textContent = "Выберите пункт:";
    			t12 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			div9 = element("div");
    			input5 = element("input");
    			t14 = space();
    			input6 = element("input");
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "Подтвердить";
    			t17 = space();
    			div11 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Настройки контроллера";
    			t19 = space();
    			button2 = element("button");
    			button2.textContent = "Сброс настроек";
    			t21 = space();
    			button3 = element("button");
    			button3.textContent = "Рестарт микроконтроллера";
    			attr_dev(h20, "class", "title svelte-1gn0wnf");
    			add_location(h20, file, 122, 4, 2461);
    			attr_dev(input0, "class", "current-login-input-field svelte-1gn0wnf");
    			attr_dev(input0, "placeholder", "Текущий логин");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file, 125, 8, 2576);
    			attr_dev(div0, "class", "current-login");
    			add_location(div0, file, 124, 6, 2539);
    			attr_dev(input1, "class", "current-login-input-field svelte-1gn0wnf");
    			attr_dev(input1, "placeholder", "Новый логин");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file, 128, 8, 2713);
    			attr_dev(div1, "class", "new-login");
    			add_location(div1, file, 127, 7, 2680);
    			attr_dev(div2, "class", "login svelte-1gn0wnf");
    			add_location(div2, file, 123, 4, 2512);
    			attr_dev(input2, "class", "current-password-input-field svelte-1gn0wnf");
    			attr_dev(input2, "placeholder", "Текущий пароль");
    			attr_dev(input2, "type", "password");
    			add_location(input2, file, 133, 8, 2894);
    			attr_dev(div3, "class", "current-password");
    			add_location(div3, file, 132, 6, 2854);
    			attr_dev(input3, "class", "new-password-input-field svelte-1gn0wnf");
    			attr_dev(input3, "placeholder", "Новый пароль");
    			attr_dev(input3, "type", "password");
    			add_location(input3, file, 136, 8, 3041);
    			attr_dev(div4, "class", "new-password");
    			add_location(div4, file, 135, 6, 3005);
    			attr_dev(input4, "class", "confirmation-password-input-field svelte-1gn0wnf");
    			attr_dev(input4, "placeholder", "Подтвердите пароль");
    			attr_dev(input4, "type", "password");
    			add_location(input4, file, 139, 8, 3191);
    			attr_dev(div5, "class", "confirmation-password");
    			add_location(div5, file, 138, 6, 3146);
    			attr_dev(div6, "class", "password svelte-1gn0wnf");
    			add_location(div6, file, 131, 4, 2824);
    			attr_dev(button0, "class", "authoraization-button svelte-1gn0wnf");
    			add_location(button0, file, 142, 4, 3321);
    			attr_dev(div7, "class", "authorization svelte-1gn0wnf");
    			add_location(div7, file, 121, 2, 2428);
    			attr_dev(h21, "class", "title svelte-1gn0wnf");
    			add_location(h21, file, 146, 4, 3459);
    			attr_dev(p, "class", "block-paragraphs svelte-1gn0wnf");
    			add_location(p, file, 148, 6, 3537);
    			attr_dev(select, "class", "paragraphs svelte-1gn0wnf");
    			add_location(select, file, 149, 6, 3592);
    			attr_dev(div8, "class", "access-point svelte-1gn0wnf");
    			add_location(div8, file, 147, 4, 3503);
    			attr_dev(input5, "class", "confirm svelte-1gn0wnf");
    			attr_dev(input5, "placeholder", "Введите SSID");
    			attr_dev(input5, "type", "text");
    			add_location(input5, file, 158, 6, 3897);
    			attr_dev(input6, "class", "confirm svelte-1gn0wnf");
    			attr_dev(input6, "placeholder", "Введите пароль");
    			attr_dev(input6, "type", "password");
    			add_location(input6, file, 159, 6, 3967);
    			attr_dev(div9, "class", "ssid svelte-1gn0wnf");
    			add_location(div9, file, 157, 4, 3871);
    			attr_dev(button1, "class", "settings-wi-fi-button svelte-1gn0wnf");
    			add_location(button1, file, 161, 4, 4053);
    			attr_dev(div10, "class", "settings-wi-fi svelte-1gn0wnf");
    			add_location(div10, file, 145, 2, 3425);
    			attr_dev(h22, "class", "title svelte-1gn0wnf");
    			add_location(h22, file, 165, 4, 4189);
    			attr_dev(button2, "class", "reset svelte-1gn0wnf");
    			add_location(button2, file, 166, 4, 4239);
    			attr_dev(button3, "class", "restart svelte-1gn0wnf");
    			add_location(button3, file, 167, 4, 4290);
    			attr_dev(div11, "class", "controller svelte-1gn0wnf");
    			add_location(div11, file, 164, 2, 4159);
    			attr_dev(div12, "class", "settings svelte-1gn0wnf");
    			add_location(div12, file, 119, 0, 2375);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div7);
    			append_dev(div7, h20);
    			append_dev(div7, t1);
    			append_dev(div7, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, input1);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, input2);
    			append_dev(div6, t4);
    			append_dev(div6, div4);
    			append_dev(div4, input3);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, input4);
    			append_dev(div7, t6);
    			append_dev(div7, button0);
    			append_dev(div12, t8);
    			append_dev(div12, div10);
    			append_dev(div10, h21);
    			append_dev(div10, t10);
    			append_dev(div10, div8);
    			append_dev(div8, p);
    			append_dev(div8, t12);
    			append_dev(div8, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[2]);
    			append_dev(div10, t13);
    			append_dev(div10, div9);
    			append_dev(div9, input5);
    			append_dev(div9, t14);
    			append_dev(div9, input6);
    			append_dev(div10, t15);
    			append_dev(div10, button1);
    			append_dev(div12, t17);
    			append_dev(div12, div11);
    			append_dev(div11, h22);
    			append_dev(div11, t19);
    			append_dev(div11, button2);
    			append_dev(div11, t21);
    			append_dev(div11, button3);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*change_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paragraphs*/ 2) {
    				each_value = /*paragraphs*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div12);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Authorization', slots, []);

    	let paragraphs = [
    		{ id: 1, text: 'Независимая точка доступа' },
    		{
    			id: 2,
    			text: 'Подключиться к существующей сети'
    		}
    	];

    	let selected;
    	let value = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Authorization> was created with unknown prop '${key}'`);
    	});

    	const change_handler = () => $$invalidate(0, value = '');

    	$$self.$capture_state = () => ({
    		missing_component,
    		paragraphs,
    		selected,
    		value
    	});

    	$$self.$inject_state = $$props => {
    		if ('paragraphs' in $$props) $$invalidate(1, paragraphs = $$props.paragraphs);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, paragraphs, selected, change_handler];
    }

    class Authorization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Authorization",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\Router.svelte generated by Svelte v3.44.0 */

    const { console: console_1 } = globals;

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $location;
    	validate_store(location, 'location');
    	component_subscribe($$self, location, $$value => $$invalidate(1, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);

    	let routes = {
    		"/": Main,
    		"/sign-in": SignIn,
    		"/auth": Authorization
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		tick,
    		push,
    		replace,
    		location,
    		Router,
    		SignIn,
    		Main,
    		Authorization,
    		routes,
    		$location
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(0, routes = $$props.routes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$location*/ 2) {
    			console.log("navigate to " + $location);
    		}
    	};

    	return [routes, $location];
    }

    class Router_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router_1",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Router_1({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
