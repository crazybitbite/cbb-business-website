export const JAVASCRIPT = {
    name: "JavaScript",
    palette: ["#f7df1e", "#f97316"],
    kw: "javascript,code",
    images: ["1627398242454-45a1465c2479", "1593720213428-28a5b9e94613", "1579468118864-1b9ea3c0db4a"],
    levels: {
        Basic: [
            {
                t: "JavaScript Fundamentals: Values, Variables, and Types", s: "js-fundamentals",
                e: "The language of the web, from zero: where JS runs, how to declare variables, and the types underneath everything.",
                sec: [
                    ["Where JavaScript runs", "JavaScript executes in two main places: every browser (open DevTools with F12 and try the Console tab right now) and Node.js on servers. The same language powers interactive pages, APIs, mobile apps, and desktop software — which is why it's consistently the world's most-used language."],
                    ["let, const, and types", "Declare with const by default and let only when reassignment is needed — var is legacy, avoid it. Core types: string, number (one type for integers and decimals), boolean, null, undefined, and object. typeof reveals what you're holding.", 'const name = "Asha";\nlet score = 41.5;\nconst active = true;\nconsole.log(typeof name, typeof score, typeof active);\n// string number boolean'],
                    ["Template literals and basic operators", "Backtick strings embed expressions with ${...} and span multiple lines — use them everywhere. Know the equality trap: === compares value AND type (always use it); == coerces types and causes classic bugs like 0 == '' being true.", 'const user = "Ravi";\nconst msg = `Welcome back, ${user}!\\nYou have ${2 + 3} alerts.`;\nconsole.log(msg);\nconsole.log(0 === "");   // false — always use ===`'],
                ],
                ex: "In the browser console, create const variables for your name and city and a let for visit count. Print a template-literal sentence using all three, increment the count, and print it again.",
                tips: ["const by default, let when reassigning, never var", "Always compare with ===", "Backtick strings with ${} are the modern default"],
            },
            {
                t: "Functions, Arrays, and Objects", s: "js-functions-arrays-objects",
                e: "The building blocks of every JavaScript program — and the array methods you'll use daily for the rest of your career.",
                sec: [
                    ["Functions three ways", "Function declarations, function expressions, and arrow functions all create callable logic. Arrows are the modern default for short functions and callbacks; their concise form returns automatically without braces.", 'function add(a, b) { return a + b; }\nconst subtract = function (a, b) { return a - b; };\nconst multiply = (a, b) => a * b;\nconsole.log(add(2, 3), subtract(5, 2), multiply(4, 2));'],
                    ["Arrays and the big three methods", "map transforms every element, filter keeps some, reduce boils the array to one value. These three replace most loops and read as intent instead of mechanics — mastering them is the single biggest jump in JS fluency.", 'const prices = [120, 45, 99, 300];\nconst withTax = prices.map(p => p * 1.18);\nconst affordable = prices.filter(p => p < 100);\nconst total = prices.reduce((sum, p) => sum + p, 0);\nconsole.log(withTax, affordable, total);'],
                    ["Objects and destructuring", "Objects group labeled values; destructuring pulls fields out into variables in one line, and the spread operator copies/merges objects immutably — the pattern React state updates depend on.", 'const user = { name: "Asha", city: "Pune", age: 24 };\nconst { name, city } = user;\nconst updated = { ...user, age: 25 };\nconsole.log(name, city, updated.age);'],
                ],
                ex: "Given an array of product objects with name and price, use filter to keep products under ₹500, map to produce strings like 'Pen — ₹40', and reduce to compute the total price of the filtered set.",
                tips: ["Arrow functions are the modern default for callbacks", "map/filter/reduce replace most manual loops", "Spread (...) copies — it never mutates the original"],
            },
            {
                t: "The DOM: Making Pages Interactive", s: "js-dom-basics",
                e: "Select elements, react to clicks, and change the page — the skills behind every interactive website.",
                sec: [
                    ["Selecting and changing elements", "document.querySelector finds the first match for any CSS selector; querySelectorAll finds them all. Change text with textContent, styles via classList (never inline styles), and attributes with setAttribute.", 'const title = document.querySelector("h1");\ntitle.textContent = "Updated by JavaScript";\ntitle.classList.add("highlight");'],
                    ["Events: reacting to the user", "addEventListener attaches a function to run on clicks, typing, submits, and more. The handler receives an event object with details — which key, which element, mouse position. Call event.preventDefault() to stop default behavior like form navigation.", 'const btn = document.querySelector("#save");\nbtn.addEventListener("click", (event) => {\n    console.log("clicked", event.target);\n});\n\ndocument.querySelector("form").addEventListener("submit", (e) => {\n    e.preventDefault();\n    console.log("handled in JS instead");\n});'],
                    ["Creating elements dynamically", "Build UI from data: createElement, set its content, and append it. This is manual React — doing it a few times teaches you exactly what frameworks automate.", 'const list = document.querySelector("#todos");\n["Learn DOM", "Build project"].forEach(text => {\n    const li = document.createElement("li");\n    li.textContent = text;\n    list.append(li);\n});'],
                ],
                ex: "Build a click counter page: a button and a paragraph. Each click increments a counter and updates the paragraph text; at 10 clicks, add a CSS class that turns the text green.",
                tips: ["querySelector accepts any CSS selector", "classList beats inline style manipulation", "preventDefault() stops the browser's default action"],
            },
            {
                t: "Strings, Numbers, and Dates", s: "js-strings-numbers-dates",
                e: "The everyday data types and the built-in methods that save you from reinventing them.",
                sec: [
                    ["String methods you'll use constantly", "Strings have a rich method set: trim(), toLowerCase(), includes(), replaceAll(), split(), and slice(). Template literals with ${} remain the modern way to build text. Strings are immutable — every method returns a new one.", 'const raw = "  Hello, World  ";\nconsole.log(raw.trim().toLowerCase());   // "hello, world"\nconsole.log("a,b,c".split(","));         // ["a","b","c"]'],
                    ["Numbers and their traps", "JavaScript has one number type (floating point), so 0.1 + 0.2 !== 0.3 — round money in the smallest unit (paise/cents). Useful helpers: Number.parseInt/parseFloat, toFixed() for display, and Math for rounding, min/max, and random.", 'console.log((0.1 + 0.2).toFixed(2));   // "0.30"\nconsole.log(Math.round(4.6), Math.max(2, 9, 4));'],
                    ["Dates without tears", "The built-in Date handles timestamps and formatting via toLocaleDateString/toLocaleString. Date math is easiest in milliseconds (getTime). For heavy date work, libraries like day.js are tiny and pleasant — but the basics ship free.", 'const now = new Date();\nconsole.log(now.toLocaleDateString());\nconst inaWeek = new Date(now.getTime() + 7 * 864e5);'],
                ],
                ex: "Write formatPrice(paise) that takes an integer number of paise and returns a string like '₹1,234.50', and daysBetween(a, b) that returns whole days between two date strings.",
                tips: ["String methods return new strings — chain freely", "Store money as integers; round only for display", "Date math is cleanest in milliseconds"],
            },
            {
                t: "Forms, Storage, and Building a Todo App", s: "js-forms-storage",
                e: "Combine everything so far into a real, persistent mini-app running entirely in the browser.",
                sec: [
                    ["Reading form input", "Grab values with element.value, validate before using, and handle the submit event with preventDefault to stay on the page. Forms are how users hand data to your JavaScript.", 'const form = document.querySelector("#todo-form");\nform.addEventListener("submit", (e) => {\n    e.preventDefault();\n    const text = form.task.value.trim();\n    if (text) addTodo(text);\n    form.reset();\n});'],
                    ["Persisting with localStorage", "localStorage keeps string data in the browser across reloads. Store structured data by serializing with JSON.stringify and reading it back with JSON.parse — the simplest persistence there is, perfect for preferences and small app state.", 'function save(todos) {\n    localStorage.setItem("todos", JSON.stringify(todos));\n}\nfunction load() {\n    return JSON.parse(localStorage.getItem("todos") || "[]");\n}'],
                    ["Render from state", "Keep a single source of truth (an array), and re-render the DOM from it after every change. This 'state → UI' discipline is exactly the mental model frameworks like React formalize — learn it here in plain JS.", 'let todos = load();\nfunction render() {\n    list.innerHTML = "";\n    todos.forEach((t, i) => { /* build <li> */ });\n}'],
                ],
                ex: "Build a complete todo app: add tasks via a form, mark them done (toggling a class), delete them, and persist everything to localStorage so the list survives a page reload. Render the whole list from a single state array.",
                tips: ["Always preventDefault on form submits you handle", "localStorage stores strings — use JSON to (de)serialize", "One state array, re-render after every change"],
            },
        ],
        Intermediate: [
            {
                t: "Asynchronous JavaScript: Promises and async/await", s: "js-async-await",
                e: "JavaScript never waits — understand the event loop, promises, and the async/await syntax that tamed them.",
                sec: [
                    ["Why async exists", "JavaScript runs on one thread. If fetching data blocked it, the whole page would freeze. Instead, slow operations start in the background and your code continues; callbacks/promises deliver the result later via the event loop's queue."],
                    ["Promises and fetch", "A promise represents a value that will arrive: pending → fulfilled or rejected. fetch() returns one. Chain .then() for results and .catch() for failures — and remember fetch only rejects on network failure; check response.ok for HTTP errors.", 'fetch("https://api.github.com/users/torvalds")\n    .then(res => {\n        if (!res.ok) throw new Error(`HTTP ${res.status}`);\n        return res.json();\n    })\n    .then(user => console.log(user.name))\n    .catch(err => console.error("Failed:", err.message));'],
                    ["async/await: promises that read like prose", "async functions let you await promises with try/catch error handling — same behavior, dramatically clearer code. Run independent operations in parallel with Promise.all instead of awaiting one by one.", 'async function loadDashboard() {\n    try {\n        const [user, repos] = await Promise.all([\n            fetch("/api/user").then(r => r.json()),\n            fetch("/api/repos").then(r => r.json()),\n        ]);\n        console.log(user.name, repos.length);\n    } catch (err) {\n        console.error("Dashboard failed:", err);\n    }\n}'],
                ],
                ex: "Use the free JSONPlaceholder API: write an async function that fetches /users and /posts in parallel with Promise.all, then prints each user's name with their post count. Handle a failing URL gracefully.",
                tips: ["The event loop lets one thread feel concurrent", "Check response.ok — fetch doesn't reject on 404", "Promise.all for independent work; sequential await only when dependent"],
            },
            {
                t: "Closures, Scope, and the Weird Parts", s: "js-closures-scope",
                e: "The concepts interviewers love and bugs hide behind: scope chains, closures, hoisting, and this.",
                sec: [
                    ["Scope and closures", "A closure is a function that remembers the variables where it was created, even after that scope has finished. It's how JavaScript does private state — the counter below can't be modified except through its methods.", 'function makeCounter() {\n    let count = 0;\n    return {\n        increment: () => ++count,\n        current: () => count,\n    };\n}\nconst counter = makeCounter();\ncounter.increment();\ncounter.increment();\nconsole.log(counter.current()); // 2 — count is private'],
                    ["Hoisting and the TDZ", "Declarations are processed before execution: function declarations hoist fully (callable before their line), while let/const hoist but stay in a 'temporal dead zone' until declared — accessing them early throws. This is why const/let are safer than var, which silently yields undefined."],
                    ["Understanding this", "this depends on HOW a function is called, not where it's written: method call → the object; plain call → undefined (strict mode); arrow functions don't have their own this — they inherit from the surrounding scope, which is exactly why arrows are perfect for callbacks inside methods.", 'const timer = {\n    seconds: 0,\n    start() {\n        setInterval(() => {\n            this.seconds++;   // arrow inherits `this` = timer\n        }, 1000);\n    },\n};'],
                ],
                ex: "Write a createBank() function using closures: it returns deposit(amount), withdraw(amount), and balance() functions where the balance variable is completely inaccessible from outside. Withdrawals beyond the balance should throw.",
                tips: ["Closures = functions with a memory of their birthplace", "let/const throw before declaration; var silently doesn't", "Arrow functions inherit this — use them for callbacks"],
            },
            {
                t: "Modern Tooling: Modules, npm, and the Browser Toolchain", s: "js-modern-tooling",
                e: "How real projects are structured: ES modules, npm scripts, and the bundler pipeline behind every framework.",
                sec: [
                    ["ES modules", "import/export split code across files with explicit dependencies. Named exports for utilities, default export for a file's main thing. In browsers, use <script type=\"module\">; in Node, set \"type\": \"module\" in package.json.", '// utils.js\nexport const TAX = 0.18;\nexport function withTax(price) { return price * (1 + TAX); }\n\n// main.js\nimport { withTax } from "./utils.js";\nconsole.log(withTax(100)); // 118'],
                    ["npm: the package ecosystem", "package.json records your dependencies and scripts. npm install adds libraries into node_modules; npm run executes scripts. Know the difference: dependencies ship with your app, devDependencies (test runners, bundlers) don't.", 'npm init -y\nnpm install dayjs\nnpm install --save-dev vitest\n\n// package.json scripts\n"scripts": { "test": "vitest", "dev": "vite" }'],
                    ["What bundlers actually do", "Browsers want few, small files; developers want many, readable ones. Bundlers (Vite, esbuild, webpack) resolve your imports into optimized bundles, transpile modern syntax for older browsers, and hot-reload during development. Vite is today's easiest start: `npm create vite@latest`."],
                ],
                ex: "Create a Vite project, split the earlier product-filtering exercise into a data.js module and a render.js module, import both into main.js, and display the results on the page instead of the console.",
                tips: ["Explicit import/export beats global scripts", "dependencies vs devDependencies matters at deploy time", "Vite is the fastest way to a modern JS project"],
            },
            {
                t: "Working With APIs and Real Data", s: "js-apis-real-data",
                e: "Fetch, send, and handle data from servers — the core skill behind every dynamic web app.",
                sec: [
                    ["GET and POST with fetch", "fetch defaults to GET; for POST, pass method, headers, and a JSON body. Always await response.json() and check response.ok. This request/response cycle is 80% of front-end/back-end interaction.", 'async function createUser(data) {\n    const res = await fetch("/api/users", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify(data),\n    });\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return res.json();\n}'],
                    ["Loading, error, and empty states", "Real UIs have four states, not one: loading, error, empty, and success. Handling all four is what separates a robust app from a demo that breaks the moment the network hiccups. Show a spinner, catch failures, and design for zero results.", 'setLoading(true);\ntry {\n    const data = await getData();\n    render(data.length ? data : emptyState());\n} catch {\n    render(errorState());\n} finally {\n    setLoading(false);\n}'],
                    ["CORS and auth basics", "Browsers block cross-origin requests unless the server opts in via CORS headers — a concept that confuses every beginner exactly once. For protected APIs, send credentials via an Authorization header (bearer token) and never hardcode secrets in front-end code, which anyone can read."],
                ],
                ex: "Build a GitHub user search: an input, a fetch to the GitHub API on submit, and rendering of the avatar, name, and repo count — with explicit loading, error (invalid user), and empty states.",
                tips: ["Check response.ok — fetch doesn't reject on 4xx/5xx", "Design for loading, error, empty, and success", "Front-end code is public — never embed secrets"],
            },
            {
                t: "Debugging and DevTools Mastery", s: "js-debugging-devtools",
                e: "The skill that pays off every single day — find and fix bugs fast instead of guessing.",
                sec: [
                    ["Breakpoints beat console.log", "The Sources panel lets you pause execution, inspect every variable, and step through line by line. Conditional breakpoints stop only when a condition holds — vastly faster than scattering logs and reloading.", '// Or drop a breakpoint in code:\nfunction risky(x) {\n    debugger;   // execution pauses here in DevTools\n    return x * 2;\n}'],
                    ["Reading errors and the call stack", "An error message plus its stack trace usually names the exact file, line, and chain of calls. Read from the top (where it threw) down (how you got there). 'Cannot read properties of undefined' — the most common JS error — means you accessed a property on something that wasn't there; optional chaining (?.) prevents it."],
                    ["Network and console tools", "The Network panel shows every request, its status, timing, and payload — indispensable for API debugging. The console does more than log: console.table for arrays of objects, console.time for quick timing, and console.assert for sanity checks."],
                ],
                ex: "Take a small broken script (or intentionally break one), then fix it using DevTools only: set a breakpoint, inspect the failing variable, read the stack trace, and confirm the fix in the Network panel — without adding a single console.log.",
                tips: ["Breakpoints + step-through beat scattering logs", "Read stack traces top-down", "Optional chaining (?.) prevents the #1 JS error"],
            },
        ],
        Advanced: [
            {
                t: "JavaScript Performance: Rendering, Memory, and the Event Loop in Depth", s: "js-performance",
                e: "Why pages jank, where memory leaks hide, and the profiling workflow that finds both.",
                sec: [
                    ["The 16ms budget", "Smooth UIs render at 60fps, giving you ~16ms per frame for JS, style, layout, and paint. Long tasks block input and animation. Batch DOM reads and writes separately — interleaving them forces synchronous layout ('layout thrashing'), the classic silent killer.", '// BAD: read-write-read-write forces layout each loop\nitems.forEach(el => {\n    const h = el.offsetHeight;      // read\n    el.style.height = h * 2 + "px"; // write\n});\n\n// GOOD: batch reads, then writes\nconst heights = items.map(el => el.offsetHeight);\nitems.forEach((el, i) => el.style.height = heights[i] * 2 + "px");'],
                    ["Microtasks vs macrotasks", "Promise callbacks (microtasks) run before setTimeout callbacks (macrotasks) — the queue order explains countless 'why does this log first?' mysteries and matters when you're yielding to keep the UI responsive.", 'console.log("1");\nsetTimeout(() => console.log("4"));\nPromise.resolve().then(() => console.log("3"));\nconsole.log("2");\n// Output: 1 2 3 4'],
                    ["Memory leaks in long-lived apps", "SPAs leak through forgotten event listeners, timers, and detached DOM kept alive by closures. Remove listeners on teardown (or use AbortController), clear intervals, and use the DevTools Memory panel: two heap snapshots around a suspect action reveal what grew."],
                ],
                ex: "Build a page rendering 5,000 list items. Profile it with the Performance tab, then optimize: build rows in a DocumentFragment, batch reads/writes, and compare the before/after flame charts.",
                tips: ["Batch DOM reads and writes separately", "Microtasks (promises) run before macrotasks (timers)", "Every addEventListener needs a removal story"],
            },
            {
                t: "TypeScript for JavaScript Developers", s: "typescript-for-js-devs",
                e: "The 20% of TypeScript that delivers 80% of the value — catching bugs at compile time instead of production.",
                sec: [
                    ["Types at the boundaries", "Annotate function parameters, returns, and data shapes; let inference handle the rest. Interfaces describe objects; unions describe alternatives. The compiler now catches typos, missing fields, and wrong arguments as you type.", 'interface Order {\n    id: number;\n    amount: number;\n    status: "pending" | "paid" | "cancelled";\n}\n\nfunction totalPaid(orders: Order[]): number {\n    return orders\n        .filter(o => o.status === "paid")\n        .reduce((sum, o) => sum + o.amount, 0);\n}'],
                    ["Narrowing and null safety", "With strictNullChecks on, TypeScript forces you to handle null/undefined — the single largest bug class in JS. Narrow with typeof checks, the in operator, and discriminated unions; after a check, the compiler knows the type.", 'type ApiResult =\n    | { ok: true; data: string[] }\n    | { ok: false; error: string };\n\nfunction handle(res: ApiResult) {\n    if (res.ok) {\n        console.log(res.data.length);  // data exists here\n    } else {\n        console.error(res.error);      // error exists here\n    }\n}'],
                    ["Generics without fear", "Generics are just type parameters: 'this function works for any T and preserves it'. You've used them forever (Array<string>); writing your own turns copy-pasted utilities into one safe function.", 'function firstOrDefault<T>(items: T[], fallback: T): T {\n    return items.length ? items[0] : fallback;\n}\n\nconst n = firstOrDefault([1, 2, 3], 0);        // number\nconst s = firstOrDefault<string>([], "none");  // string'],
                ],
                ex: "Convert your bank-closure exercise to TypeScript: define an Account interface, type every function, model withdraw failures with a discriminated union result type instead of throwing, and compile with strict mode on.",
                tips: ["Type boundaries; infer locals", "strictNullChecks eliminates the biggest JS bug class", "Discriminated unions make invalid states unrepresentable"],
            },
            {
                t: "Design Patterns and Architecture in Modern JS", s: "js-design-patterns",
                e: "Patterns that survive framework churn: modules, observers, state machines, and dependency injection.",
                sec: [
                    ["Observer / pub-sub", "Decouple producers from consumers: emitters publish events, subscribers react, neither knows the other. It's the pattern beneath DOM events, Node streams, and every state library — and trivial to build.", 'function createEmitter() {\n    const handlers = new Map();\n    return {\n        on(event, fn) {\n            (handlers.get(event) ?? handlers.set(event, []).get(event)).push(fn);\n        },\n        emit(event, data) {\n            (handlers.get(event) || []).forEach(fn => fn(data));\n        },\n    };\n}'],
                    ["State machines for UI logic", "Booleans multiply into impossible states (isLoading && isError && hasData?). A state machine names each state and legal transitions — bugs become unrepresentable and the UI logic becomes a diagram you can read.", 'const machine = {\n    idle:    { FETCH: "loading" },\n    loading: { SUCCESS: "done", FAIL: "error" },\n    error:   { RETRY: "loading" },\n    done:    {},\n};\n\nfunction transition(state, event) {\n    return machine[state][event] ?? state;\n}'],
                    ["Dependency injection for testability", "Functions that create their own dependencies (fetch, database, clock) are untestable. Pass dependencies in — production wires real ones, tests wire fakes. This one habit makes 90% of code unit-testable without mocking frameworks.", 'function createUserService({ http, now = () => new Date() }) {\n    return {\n        async register(email) {\n            return http.post("/users", { email, at: now().toISOString() });\n        },\n    };\n}\n// test: createUserService({ http: fakeHttp, now: () => fixedDate })'],
                ],
                ex: "Build a tiny download-manager module combining all three patterns: a state machine (idle/downloading/paused/done), an emitter publishing progress events, and injected transport so tests can simulate a download without a network.",
                tips: ["Pub-sub decouples who-does from who-reacts", "Name your states; stop multiplying booleans", "Inject dependencies — testability is a design property"],
            },
            {
                t: "Testing JavaScript with Vitest", s: "js-testing-vitest",
                e: "Ship with confidence: unit tests, mocks, and the testing mindset that lets you refactor fearlessly.",
                sec: [
                    ["Your first tests", "Vitest (Jest-compatible, Vite-native) discovers *.test.js files. Structure with describe/it and assert with expect. A test names a behavior, runs it, and checks the result — the safety net that turns 'I think this works' into 'I know'.", 'import { describe, it, expect } from "vitest";\nimport { withTax } from "./utils.js";\n\ndescribe("withTax", () => {\n    it("adds 18% GST", () => {\n        expect(withTax(100)).toBe(118);\n    });\n});'],
                    ["Mocking and spying", "Isolate the unit under test by faking its dependencies: vi.fn() creates spies, vi.mock() replaces modules, and you can fake timers and fetch. Test your logic, not the network or the clock.", 'import { vi, expect, it } from "vitest";\nit("calls the API once", async () => {\n    const http = { post: vi.fn().mockResolvedValue({ id: 1 }) };\n    await register(http, "a@b.com");\n    expect(http.post).toHaveBeenCalledOnce();\n});'],
                    ["What to test (and what not to)", "Test behavior and edge cases (empty inputs, boundaries, errors), not implementation details that change on every refactor. Aim for confidence, not a coverage number. The best tests double as documentation of how code is meant to be used."],
                ],
                ex: "Take your bank-closure module, install Vitest, and write a suite: deposits increase balance, over-withdrawal throws, and balance stays private. Include one test using a mock for an injected logger dependency.",
                tips: ["Name behaviors; assert with expect", "Mock dependencies to isolate the unit", "Test behavior and edge cases, not internals"],
            },
            {
                t: "Frameworks and What's Next", s: "js-frameworks-next-steps",
                e: "Understand what React and its peers actually solve, and chart a deliberate path to specialization.",
                sec: [
                    ["Why frameworks exist", "Everything you built by hand — syncing state to the DOM, re-rendering on change, componentizing UI — is what React, Vue, and Svelte automate. Knowing the vanilla version makes the framework's magic legible: components are functions, state triggers re-render, props flow down.", 'function Counter() {\n    const [count, setCount] = useState(0);\n    return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}'],
                    ["The modern ecosystem", "React dominates hiring; Next.js adds server rendering and routing; Vue and Svelte offer gentler curves. Around them: a component library, a data-fetching tool (TanStack Query), and TypeScript. Pick one framework and go deep — the concepts transfer, the syntax is trivia."],
                    ["A deliberate learning path", "From here: (1) solidify JS + TypeScript, (2) learn React via the official docs by building projects, (3) add Next.js for full-stack, (4) learn one styling approach and testing. Build and ship real projects — a deployed portfolio teaches more than any tutorial, and it's what gets you hired."],
                ],
                ex: "Rebuild your vanilla todo app in React (use a Vite React template). Notice what the framework removes: no manual querySelector, no manual re-render — just state and JSX. Write a short note comparing the two versions.",
                tips: ["Frameworks automate the state→DOM work you did by hand", "Pick one framework, go deep — concepts transfer", "Shipped projects teach and get you hired"],
            },
        ],
    },
}
