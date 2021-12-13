
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    const missing_component = {
        $$render: () => ''
    };
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
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

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.44.0 */

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

    derived(loc, $loc => $loc.location);
    derived(loc, $loc => $loc.querystring);

    /* src\App.svelte generated by Svelte v3.44.0 */

    const file$1 = "src\\App.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let a;
    	let t6;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("Hello ");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = text("!");
    			t3 = space();
    			p = element("p");
    			t4 = text("Visit the ");
    			a = element("a");
    			a.textContent = "Svelte tutorial";
    			t6 = text(" to learn how to build Svelte apps.");
    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file$1, 5, 1, 51);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file$1, 6, 14, 89);
    			add_location(p, file$1, 6, 1, 76);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file$1, 4, 0, 42);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(main, t3);
    			append_dev(main, p);
    			append_dev(p, t4);
    			append_dev(p, a);
    			append_dev(p, t6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Authorization.svelte generated by Svelte v3.44.0 */

    const { console: console_1 } = globals;
    const file = "src\\Authorization.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (172:8) {#each paragraphs as paragraph}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*paragraph*/ ctx[6].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*paragraph*/ ctx[6];
    			option.value = option.__value;
    			attr_dev(option, "class", "name-paragraphs svelte-1gn0wnf");
    			add_location(option, file, 172, 10, 4152);
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
    		source: "(172:8) {#each paragraphs as paragraph}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div11;
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
    	let div9;
    	let h21;
    	let t10;
    	let div8;
    	let p;
    	let t12;
    	let select;
    	let t13;
    	let button1;
    	let t15;
    	let div10;
    	let h22;
    	let t17;
    	let button2;
    	let t19;
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
    			div11 = element("div");
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
    			div9 = element("div");
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
    			button1 = element("button");
    			button1.textContent = "Подтвердить";
    			t15 = space();
    			div10 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Настройки контроллера";
    			t17 = space();
    			button2 = element("button");
    			button2.textContent = "Сброс настроек";
    			t19 = space();
    			button3 = element("button");
    			button3.textContent = "Рестарт микроконтроллера";
    			attr_dev(h20, "class", "title svelte-1gn0wnf");
    			add_location(h20, file, 143, 4, 2893);
    			attr_dev(input0, "class", "current-login-input-field svelte-1gn0wnf");
    			attr_dev(input0, "placeholder", "Текущий логин");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file, 146, 8, 3008);
    			attr_dev(div0, "class", "current-login");
    			add_location(div0, file, 145, 6, 2971);
    			attr_dev(input1, "class", "current-login-input-field svelte-1gn0wnf");
    			attr_dev(input1, "placeholder", "Новый логин");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file, 149, 8, 3145);
    			attr_dev(div1, "class", "new-login");
    			add_location(div1, file, 148, 7, 3112);
    			attr_dev(div2, "class", "login svelte-1gn0wnf");
    			add_location(div2, file, 144, 4, 2944);
    			attr_dev(input2, "class", "current-password-input-field svelte-1gn0wnf");
    			attr_dev(input2, "placeholder", "Текущий пароль");
    			attr_dev(input2, "type", "password");
    			add_location(input2, file, 154, 8, 3326);
    			attr_dev(div3, "class", "current-password");
    			add_location(div3, file, 153, 6, 3286);
    			attr_dev(input3, "class", "new-password-input-field svelte-1gn0wnf");
    			attr_dev(input3, "placeholder", "Новый пароль");
    			attr_dev(input3, "type", "password");
    			add_location(input3, file, 157, 8, 3473);
    			attr_dev(div4, "class", "new-password");
    			add_location(div4, file, 156, 6, 3437);
    			attr_dev(input4, "class", "confirmation-password-input-field svelte-1gn0wnf");
    			attr_dev(input4, "placeholder", "Подтвердите пароль");
    			attr_dev(input4, "type", "password");
    			add_location(input4, file, 160, 8, 3623);
    			attr_dev(div5, "class", "confirmation-password");
    			add_location(div5, file, 159, 6, 3578);
    			attr_dev(div6, "class", "password svelte-1gn0wnf");
    			add_location(div6, file, 152, 4, 3256);
    			attr_dev(button0, "class", "authoraization-button svelte-1gn0wnf");
    			add_location(button0, file, 163, 4, 3753);
    			attr_dev(div7, "class", "authorization svelte-1gn0wnf");
    			add_location(div7, file, 142, 2, 2860);
    			attr_dev(h21, "class", "title svelte-1gn0wnf");
    			add_location(h21, file, 167, 4, 3891);
    			attr_dev(p, "class", "block-paragraphs svelte-1gn0wnf");
    			add_location(p, file, 169, 6, 3969);
    			attr_dev(select, "class", "paragraphs svelte-1gn0wnf");
    			add_location(select, file, 170, 6, 4024);
    			attr_dev(div8, "class", "access-point svelte-1gn0wnf");
    			add_location(div8, file, 168, 4, 3935);
    			attr_dev(button1, "class", "settings-wi-fi-button svelte-1gn0wnf");
    			add_location(button1, file, 190, 4, 4712);
    			attr_dev(div9, "class", "settings-wi-fi svelte-1gn0wnf");
    			add_location(div9, file, 166, 2, 3857);
    			attr_dev(h22, "class", "title svelte-1gn0wnf");
    			add_location(h22, file, 194, 4, 4848);
    			attr_dev(button2, "class", "reset svelte-1gn0wnf");
    			add_location(button2, file, 195, 4, 4898);
    			attr_dev(button3, "class", "restart svelte-1gn0wnf");
    			add_location(button3, file, 196, 4, 4949);
    			attr_dev(div10, "class", "controller svelte-1gn0wnf");
    			add_location(div10, file, 193, 2, 4818);
    			attr_dev(div11, "class", "settings svelte-1gn0wnf");
    			add_location(div11, file, 140, 0, 2807);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div7);
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
    			append_dev(div11, t8);
    			append_dev(div11, div9);
    			append_dev(div9, h21);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			append_dev(div8, p);
    			append_dev(div8, t12);
    			append_dev(div8, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[2]);
    			append_dev(div9, t13);
    			append_dev(div9, button1);
    			append_dev(div11, t15);
    			append_dev(div11, div10);
    			append_dev(div10, h22);
    			append_dev(div10, t17);
    			append_dev(div10, button2);
    			append_dev(div10, t19);
    			append_dev(div10, button3);

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
    			if (detaching) detach_dev(div11);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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
    	let wifies;
    	let section;

    	onMount(async () => {
    		const response = await fetch(`http://46.216.22.74:81/give?wifi`, { method: 'GET' }); // headers: {'Content-Type': 'text/plain'},
    		wifies = await response.json();

    		for (let i in wifies) {
    			console.log(i);
    		}

    		console.log(wifies);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Authorization> was created with unknown prop '${key}'`);
    	});

    	const change_handler = () => $$invalidate(0, value = '');

    	$$self.$capture_state = () => ({
    		onMount,
    		missing_component,
    		App,
    		paragraphs,
    		selected,
    		value,
    		wifies,
    		section
    	});

    	$$self.$inject_state = $$props => {
    		if ('paragraphs' in $$props) $$invalidate(1, paragraphs = $$props.paragraphs);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('wifies' in $$props) wifies = $$props.wifies;
    		if ('section' in $$props) section = $$props.section;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, paragraphs, selected, change_handler];
    }

    class Authorization extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Authorization",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Authorization({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
