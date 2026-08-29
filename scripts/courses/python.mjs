// Python Programming course — 3 levels × 3 lessons.
// Lesson: t=title, s=slug, e=lead, sec=[heading, paragraph, code?][], ex=exercise, tips=[...]

export const PYTHON = {
    name: "Python Programming",
    palette: ["#3776ab", "#ffd43b"],
    kw: "python,programming",
    images: ["1526379095098-d400fd0bf935", "1555949963-aa79dcee981c", "1515879218367-8466d910aaa4"],
    levels: {
        Basic: [
            {
                t: "Getting Started: Your First Python Program", s: "getting-started-first-program",
                e: "Install Python, run your first program, and understand what actually happens when you execute code.",
                sec: [
                    ["Installing Python the right way", "Download Python from python.org (3.12 or newer) and, on Windows, tick 'Add Python to PATH' during installation. Verify with `python --version` in a terminal. On macOS and Linux, Python is often preinstalled — but install a current version anyway, since system Python can be years old.", "python --version\n# Python 3.12.4"],
                    ["Hello, World — and what it means", "Create a file called hello.py, write one line, and run it with `python hello.py`. The print() function sends text to the screen. That's the whole loop of programming: you write instructions, the interpreter executes them top to bottom, and you observe the result.", 'print("Hello, World!")\nprint("Python is running my instructions, line by line.")'],
                    ["Variables: naming your data", "A variable is a name attached to a value. Python figures out the type on its own — text (str), whole numbers (int), decimals (float), and True/False (bool). Use lowercase names with underscores, and pick names that describe the contents.", 'name = "Asha"\nage = 24\nheight_m = 1.62\nis_student = True\nprint(f"{name} is {age} years old")'],
                ],
                ex: "Write a program that stores your name, your birth year, and computes your age this year, then prints a sentence like 'Asha is 24 this year'. Use an f-string for the output.",
                tips: ["Python executes files top to bottom", "print() displays values; f-strings embed variables in text", "Variables get their type from the value you assign"],
            },
            {
                t: "Making Decisions: Conditions and Loops", s: "conditions-and-loops",
                e: "Programs become useful the moment they can decide and repeat. Master if/elif/else, for, and while.",
                sec: [
                    ["Branching with if / elif / else", "Conditions let code react to data. Python uses indentation (4 spaces) instead of braces — the indented block belongs to the condition above it. Comparison operators: ==, !=, <, >, <=, >=, plus and/or/not to combine them.", 'marks = 78\nif marks >= 90:\n    grade = "A"\nelif marks >= 75:\n    grade = "B"\nelse:\n    grade = "C"\nprint(grade)  # B'],
                    ["Repeating with for loops", "A for loop walks through a sequence one item at a time. range(n) generates numbers 0 to n-1 — the workhorse of counted repetition. You'll use for loops on lists, strings, files, and query results constantly.", 'for i in range(3):\n    print("run", i)\n\nfor letter in "abc":\n    print(letter.upper())'],
                    ["while loops and break", "A while loop repeats as long as a condition stays true — ideal when you don't know the iteration count in advance, like waiting for valid input. Use break to exit early and continue to skip to the next round; beware conditions that never become false.", 'count = 0\nwhile True:\n    count += 1\n    if count == 5:\n        break\nprint("stopped at", count)'],
                ],
                ex: "Write a number-guessing game: pick a secret number, loop asking the user for guesses with input(), print 'higher' or 'lower' hints, and break with a success message when they get it.",
                tips: ["Indentation defines blocks — be consistent", "for iterates sequences; while repeats on a condition", "break exits a loop, continue skips one iteration"],
            },
            {
                t: "Lists, Dictionaries, and Functions", s: "lists-dicts-functions",
                e: "The three constructs you'll use in every real Python program: collections for data, functions for structure.",
                sec: [
                    ["Lists: ordered collections", "A list holds items in order and can grow and shrink. Index from 0, slice with [start:end], append to add, and use len() for the count. Lists are the default container for 'many things' in Python.", 'fruits = ["apple", "mango", "banana"]\nfruits.append("kiwi")\nprint(fruits[0])      # apple\nprint(fruits[-1])     # kiwi\nprint(fruits[1:3])    # [\'mango\', \'banana\']'],
                    ["Dictionaries: labeled data", "A dict maps keys to values — like a real dictionary maps words to meanings. Perfect for structured records: fast lookup by key, .get() for safe access with a default, and .items() to loop over pairs.", 'user = {"name": "Ravi", "age": 30}\nprint(user["name"])          # Ravi\nprint(user.get("city", "?")) # ?\nfor key, value in user.items():\n    print(key, "→", value)'],
                    ["Functions: reusable logic", "A function packages steps behind a name. Parameters bring data in, return sends results out. Default values make arguments optional. If you copy-paste code twice, it should probably be a function.", 'def greet(name, lang="en"):\n    if lang == "hi":\n        return f"Namaste, {name}!"\n    return f"Hello, {name}!"\n\nprint(greet("Asha"))\nprint(greet("Asha", lang="hi"))'],
                ],
                ex: "Build a tiny contact book: a list of dicts with name and phone keys. Write functions add_contact(book, name, phone) and find_contact(book, name), then demonstrate adding three contacts and finding one.",
                tips: ["Lists for ordered items, dicts for labeled fields", "Negative indexes count from the end", "Functions should do one thing and return a value"],
            },
            {
                t: "Working With Strings and Text", s: "python-strings",
                e: "Text is everywhere — names, files, user input, APIs. Master Python's rich string toolkit.",
                sec: [
                    ["Slicing and core methods", "Strings are immutable sequences you can index and slice like lists. The everyday methods: .strip() trims whitespace, .lower()/.upper() change case, .replace() swaps text, .split()/.join() convert between strings and lists, and .startswith()/.endswith() test edges.", 'raw = "  Hello, World  "\nprint(raw.strip().lower())        # hello, world\nprint("a,b,c".split(","))         # [\'a\', \'b\', \'c\']\nprint("-".join(["2024", "07"]))  # 2024-07'],
                    ["f-strings and formatting", "f-strings interpolate expressions and control presentation: :.2f for two decimals, :, for thousands separators, alignment and padding for tables. They're faster and clearer than older % or .format() styles.", 'price = 1234.5\nqty = 3\nprint(f"Total: ₹{price * qty:,.2f}")   # Total: ₹3,703.50\nprint(f"{\'Name\':<10}{\'Score\':>5}")     # left/right aligned'],
                    ["Searching and cleaning text", "Use `in` to test substrings, .find()/.index() for positions, and .count() to tally. For pattern work beyond literals — emails, phone numbers, dates — the re module brings regular expressions, the professional tool for text extraction and validation.", 'text = "Contact: asha@mail.com"\nimport re\nmatch = re.search(r"[\\w.]+@[\\w.]+", text)\nprint(match.group())   # asha@mail.com'],
                ],
                ex: "Write clean_name(raw) that trims whitespace, title-cases the words, and collapses multiple internal spaces into one — so '  john   DOE ' becomes 'John Doe'. Then write a function that extracts all email addresses from a block of text using re.",
                tips: ["Strings are immutable — methods return new strings", "f-strings with format specs handle money and tables", "Reach for re when patterns go beyond literal text"],
            },
            {
                t: "The Standard Library Toolkit", s: "python-standard-library",
                e: "Python ships 'batteries included'. Knowing what's already there saves you from reinventing (or installing) it.",
                sec: [
                    ["Dates, math, and random", "datetime handles dates and durations, math has the numeric functions, and random covers shuffling and sampling. These three cover a huge share of everyday scripting needs with zero installation.", 'from datetime import date, timedelta\nimport random\n\ntoday = date.today()\nprint(today + timedelta(days=30))     # date a month out\nprint(random.choice(["heads", "tails"]))'],
                    ["Collections and counting", "The collections module upgrades the built-ins: Counter tallies occurrences in one line, defaultdict removes 'if key not in dict' boilerplate, and namedtuple/dataclass give lightweight records. Counter alone replaces dozens of manual loops.", 'from collections import Counter\nwords = "the cat sat on the mat".split()\nprint(Counter(words).most_common(1))  # [(\'the\', 2)]'],
                    ["Paths and JSON", "pathlib makes file paths clean and cross-platform (no string gluing), and json converts between Python objects and JSON text — the lingua franca of APIs and config files.", 'from pathlib import Path\nimport json\n\nconfig = json.loads(Path("config.json").read_text())\nprint(config["setting"])'],
                ],
                ex: "Read a text file of words and use collections.Counter to print the 5 most common words longer than 3 letters. Then write the result to a JSON file using pathlib and json.",
                tips: ["Check the standard library before pip installing", "Counter and defaultdict erase counting boilerplate", "pathlib for paths, json for data interchange"],
            },
        ],
        Intermediate: [
            {
                t: "Files, Errors, and Modules", s: "files-errors-modules",
                e: "Real programs read files, survive bad input, and split across modules. Level up from scripts to software.",
                sec: [
                    ["Reading and writing files", "Use the with statement — it opens the file and guarantees it closes, even on errors. Read whole files with .read(), line by line with a for loop, and write with mode 'w' (overwrite) or 'a' (append).", 'with open("notes.txt", "w") as f:\n    f.write("first line\\n")\n\nwith open("notes.txt") as f:\n    for line in f:\n        print(line.strip())'],
                    ["Handling errors with try/except", "Crashes come from the unexpected: missing files, bad numbers, network failures. Wrap risky code in try, catch the specific exception you expect, and always avoid a bare except that hides real bugs. finally runs no matter what.", 'try:\n    age = int(input("Age: "))\nexcept ValueError:\n    print("That is not a number")\nelse:\n    print("You are", age)'],
                    ["Modules and pip", "Split code into files and import between them — a file named utils.py is imported as `import utils`. The standard library covers dates, JSON, paths, and more; everything else installs with pip inside a virtual environment (python -m venv .venv) so projects don't fight over versions.", 'import json\nfrom datetime import date\n\ndata = {"day": str(date.today())}\nprint(json.dumps(data))'],
                ],
                ex: "Write a program that reads a text file of one number per line, ignores lines that aren't numbers (using try/except), and writes the total and average to results.txt.",
                tips: ["Always open files with `with`", "Catch specific exceptions, never bare except", "One virtual environment per project"],
            },
            {
                t: "Object-Oriented Python", s: "object-oriented-python",
                e: "Classes bundle data with the functions that operate on it — the pattern behind almost every Python library you'll use.",
                sec: [
                    ["Classes and instances", "A class is a blueprint; each object built from it is an instance with its own data. __init__ runs at creation and stores attributes on self. Methods are functions that automatically receive the instance as self.", 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\nacc = BankAccount("Asha")\nacc.deposit(500)\nprint(acc.balance)  # 500'],
                    ["Inheritance and overriding", "A subclass inherits everything from its parent and can override or extend behavior. Use super() to call the parent's version. Prefer shallow hierarchies — one level of inheritance solves most real problems.", 'class SavingsAccount(BankAccount):\n    def __init__(self, owner, balance=0, rate=0.04):\n        super().__init__(owner, balance)\n        self.rate = rate\n\n    def add_interest(self):\n        self.balance *= (1 + self.rate)'],
                    ["Dunder methods make objects feel native", "Special methods like __str__ (printing), __eq__ (==), and __len__ (len()) let your objects work with Python's built-in syntax. Implementing a few of these is what makes a class pleasant to use.", 'class Playlist:\n    def __init__(self, songs):\n        self.songs = songs\n    def __len__(self):\n        return len(self.songs)\n    def __str__(self):\n        return f"Playlist({len(self)} songs)"\n\nprint(Playlist(["a", "b"]))  # Playlist(2 songs)'],
                ],
                ex: "Model a library: a Book class (title, author, available) and a Library class holding books with methods borrow(title) and return_book(title) that flip availability and refuse to lend an unavailable book.",
                tips: ["__init__ + self store per-instance data", "Override methods in subclasses; call super() when extending", "__str__ and friends integrate objects with built-ins"],
            },
            {
                t: "Comprehensions, Generators, and Pythonic Style", s: "pythonic-style",
                e: "Write the Python that experienced developers write: expressive one-liners, lazy iteration, and clean idioms.",
                sec: [
                    ["List and dict comprehensions", "Comprehensions build collections in one readable expression: transform + filter in a single line. They replace three-line loop-and-append patterns and usually run faster too. Keep them to one condition — beyond that, use a normal loop.", 'nums = [1, 2, 3, 4, 5, 6]\nsquares = [n * n for n in nums]\nevens = [n for n in nums if n % 2 == 0]\nby_name = {n: len(n) for n in ["asha", "ravi"]}'],
                    ["Generators: lazy sequences", "A generator produces values one at a time, on demand, using yield — so you can process millions of items without loading them into memory. Any function with yield becomes a generator; generator expressions use () instead of [].", 'def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nfor x in countdown(3):\n    print(x)   # 3 2 1\n\ntotal = sum(n * n for n in range(1_000_000))'],
                    ["Idioms that mark clean Python", "Unpack tuples (a, b = b, a), enumerate instead of manual counters, zip to walk lists together, and truthiness instead of comparing to empty. Run your code through a formatter (black) and a linter (ruff) — consistency is a feature.", 'names = ["Asha", "Ravi"]\nscores = [91, 84]\nfor i, (name, score) in enumerate(zip(names, scores), 1):\n    print(f"{i}. {name}: {score}")'],
                ],
                ex: "Given a list of dicts representing orders (each with 'amount' and 'status'), use one comprehension to get amounts of all 'paid' orders, sum them with a generator expression, and print the total.",
                tips: ["Comprehensions: transform + filter in one line", "yield turns a function into a memory-friendly generator", "enumerate and zip beat manual index juggling"],
            },
            {
                t: "Dataclasses and Type Hints", s: "python-dataclasses-typing",
                e: "Write self-documenting Python that tools can check: typed function signatures and clean data records.",
                sec: [
                    ["Type hints", "Annotations state intent and let editors and mypy catch mismatches before runtime. Hint the boundaries — parameters and returns — and let inference cover locals. They don't affect execution; they're a safety net and living documentation.", 'def total(prices: list[float], tax: float = 0.18) -> float:\n    return sum(prices) * (1 + tax)'],
                    ["Dataclasses", "@dataclass generates __init__, __repr__, and __eq__ from typed fields — records without boilerplate. Defaults, ordering, and immutability (frozen=True) come free, making them ideal for the small structured objects that litter real code.", 'from dataclasses import dataclass\n\n@dataclass\nclass Product:\n    name: str\n    price: float\n    in_stock: bool = True\n\np = Product("Pen", 40)\nprint(p)   # Product(name=\'Pen\', price=40, in_stock=True)'],
                    ["Optionals and unions", "Model 'maybe missing' with `X | None` and alternatives with unions. Combined with a checker, this eliminates whole bug classes — the forgotten None that crashes in production becomes an error in your editor.", 'def find_user(uid: int) -> "User | None":\n    return db.get(uid)  # caller is forced to handle None'],
                ],
                ex: "Model a shopping cart with dataclasses: a CartItem (name, price, qty) and a Cart holding a list of them, with a typed total() method and an add(item) method. Add type hints throughout and run mypy.",
                tips: ["Type the boundaries, infer the rest", "@dataclass removes record boilerplate", "X | None forces callers to handle absence"],
            },
            {
                t: "Virtual Environments, pip, and Project Structure", s: "python-project-structure",
                e: "Move from single scripts to real projects: isolated dependencies, sane layout, and reproducible installs.",
                sec: [
                    ["Virtual environments", "Each project gets its own isolated set of packages so versions never collide. Create with `python -m venv .venv`, activate it, and install into it — never into system Python. Freeze exact versions for reproducibility.", 'python -m venv .venv\nsource .venv/bin/activate      # Windows: .venv\\Scripts\\activate\npip install requests\npip freeze > requirements.txt'],
                    ["Project layout", "A predictable structure scales: source in a package folder, tests alongside, config in pyproject.toml, secrets in a .gitignored .env. This is what makes a project navigable by others (and future you).", '# project/\n#   myapp/__init__.py\n#   myapp/core.py\n#   tests/test_core.py\n#   pyproject.toml\n#   .env  (gitignored)'],
                    ["Imports and __main__", "Understand absolute imports within your package, and the `if __name__ == \"__main__\":` guard that lets a file be both importable and runnable — the idiom behind every well-behaved Python script.", 'def main():\n    print("run directly")\n\nif __name__ == "__main__":\n    main()'],
                ],
                ex: "Restructure your earlier contact-book script into a proper project: a package folder with the logic, a __main__ guard for the CLI, a requirements.txt, and a .gitignore excluding .venv and .env.",
                tips: ["One virtual environment per project, always", "Pin versions with requirements.txt or a lockfile", "The __main__ guard makes files import- and run-safe"],
            },
        ],
        Advanced: [
            {
                t: "Decorators and Context Managers", s: "decorators-context-managers",
                e: "The two constructs behind Python's most elegant APIs — and behind frameworks like Flask and pytest.",
                sec: [
                    ["Functions are objects", "Python functions can be stored in variables, passed as arguments, and returned from other functions. That's the foundation: a decorator is just a function that takes a function and returns an enhanced replacement.", 'def shout(func):\n    def wrapper(*args, **kwargs):\n        result = func(*args, **kwargs)\n        return result.upper()\n    return wrapper\n\n@shout\ndef greet(name):\n    return f"hello {name}"\n\nprint(greet("asha"))  # HELLO ASHA'],
                    ["Practical decorators: timing and caching", "Decorators shine for cross-cutting concerns — logging, timing, retries, authentication — applied without touching the function body. The standard library ships ready ones: functools.lru_cache memoizes expensive calls in one line. Use functools.wraps inside your own to preserve the function's name and docs.", 'import functools, time\n\ndef timed(func):\n    @functools.wraps(func)\n    def wrapper(*a, **kw):\n        start = time.perf_counter()\n        result = func(*a, **kw)\n        print(f"{func.__name__}: {time.perf_counter()-start:.3f}s")\n        return result\n    return wrapper'],
                    ["Context managers beyond files", "Anything with setup/teardown fits the with statement: locks, database transactions, temporary directories, timers. Write your own trivially with contextlib.contextmanager — code before yield is setup, after is guaranteed cleanup.", 'from contextlib import contextmanager\n\n@contextmanager\ndef transaction(db):\n    db.begin()\n    try:\n        yield db\n        db.commit()\n    except Exception:\n        db.rollback()\n        raise'],
                ],
                ex: "Write a @retry(times=3) decorator factory that re-runs a failing function up to N times with a short delay, re-raising the last exception if all attempts fail. Test it on a function that fails randomly.",
                tips: ["A decorator wraps a function with extra behavior", "functools.wraps preserves metadata; lru_cache is free performance", "with = guaranteed setup/teardown for any resource"],
            },
            {
                t: "Concurrency: Threads, Processes, and asyncio", s: "python-concurrency",
                e: "Make Python fast where it matters: know which of the three concurrency models fits your workload.",
                sec: [
                    ["The GIL and choosing a model", "CPython's Global Interpreter Lock means only one thread executes Python bytecode at a time. The rule of thumb: I/O-bound work (network, disk) → threads or asyncio; CPU-bound work (math, parsing) → multiprocessing, which sidesteps the GIL with separate processes."],
                    ["ThreadPoolExecutor for easy parallel I/O", "For 'do these 50 downloads faster', concurrent.futures is the highest-value API: submit tasks to a pool and collect results. Threads share memory, so guard shared mutable state — or better, avoid sharing by returning values.", 'from concurrent.futures import ThreadPoolExecutor\nimport urllib.request\n\ndef fetch(url):\n    with urllib.request.urlopen(url, timeout=10) as r:\n        return url, r.status\n\nurls = ["https://example.com"] * 5\nwith ThreadPoolExecutor(max_workers=5) as pool:\n    for url, status in pool.map(fetch, urls):\n        print(status, url)'],
                    ["asyncio: cooperative concurrency", "async/await handles thousands of simultaneous connections on a single thread by switching tasks at every await point. It requires async libraries end to end (aiohttp, asyncpg) — one blocking call stalls the entire event loop.", 'import asyncio\n\nasync def work(n):\n    await asyncio.sleep(1)\n    return n * n\n\nasync def main():\n    results = await asyncio.gather(*(work(i) for i in range(5)))\n    print(results)\n\nasyncio.run(main())  # finishes in ~1s, not 5'],
                ],
                ex: "Take a list of 10 URLs and time three versions of fetching them: sequential, ThreadPoolExecutor with 10 workers, and asyncio with aiohttp. Print the three durations and explain the difference in a comment.",
                tips: ["I/O-bound → threads/asyncio; CPU-bound → processes", "ThreadPoolExecutor.map is the easy 80% solution", "In asyncio, one blocking call blocks everything"],
            },
            {
                t: "Testing, Typing, and Packaging Like a Professional", s: "testing-typing-packaging",
                e: "The habits that separate scripts from software: automated tests, type hints, and shippable packages.",
                sec: [
                    ["pytest: tests that pay rent", "pytest discovers any function named test_* and makes assertions plain: just assert. Parametrize to cover many cases in one test, and fixtures to share setup. A test suite is what lets you refactor without fear.", 'import pytest\nfrom mymath import divide\n\n@pytest.mark.parametrize("a,b,expected", [(10, 2, 5), (9, 3, 3)])\ndef test_divide(a, b, expected):\n    assert divide(a, b) == expected\n\ndef test_divide_by_zero():\n    with pytest.raises(ZeroDivisionError):\n        divide(1, 0)'],
                    ["Type hints and mypy", "Annotations document intent and let tools catch bugs before runtime: mismatched arguments, forgotten Nones, wrong returns. Start at function boundaries — parameters and returns — and let inference handle locals. Run mypy (or pyright) in CI.", 'def parse_price(raw: str, currency: str = "INR") -> float | None:\n    try:\n        return float(raw.replace(",", ""))\n    except ValueError:\n        return None'],
                    ["Packaging with pyproject.toml", "Modern packaging is one declarative file: metadata, dependencies, and entry points in pyproject.toml. `pip install -e .` gives you an editable install for development; `python -m build` produces wheels you can publish or ship internally.", '[project]\nname = "pricetools"\nversion = "0.1.0"\ndependencies = ["requests>=2.31"]\n\n[project.scripts]\nprice = "pricetools.cli:main"'],
                ],
                ex: "Take your contact-book exercise from the Basic level, add type hints to every function, write five pytest tests (including one edge case with pytest.raises), and package it with pyproject.toml so `pip install -e .` works.",
                tips: ["If it isn't tested, it's broken — you just don't know yet", "Type the boundaries: parameters and returns", "pyproject.toml is the single source of packaging truth"],
            },
            {
                t: "Performance and Profiling", s: "python-performance-profiling",
                e: "Make Python fast where it counts — measure first, then apply the optimizations that actually move the needle.",
                sec: [
                    ["Measure before optimizing", "Intuition about slowness is usually wrong. Time with timeit for snippets and cProfile for whole programs to find the real hot spot — then optimize only that. Premature optimization wastes effort on code that isn't the bottleneck.", 'import cProfile\ncProfile.run("main()")   # shows cumulative time per function'],
                    ["Choose the right data structure", "Algorithmic wins dwarf micro-tweaks: membership testing in a set is O(1) vs O(n) in a list; a dict lookup beats scanning. Turning an accidental O(n²) loop into O(n) with a set is often a 100× win no C rewrite can match.", 'seen = set(big_list)      # O(1) membership\nif target in seen: ...    # vs `in big_list` = O(n)'],
                    ["When Python isn't enough", "For numeric heavy lifting, NumPy vectorization runs C-speed loops. For CPU-bound parallelism, multiprocessing sidesteps the GIL. And caching (functools.lru_cache) turns repeated expensive calls into instant lookups — often the highest ROI line you'll write."],
                ],
                ex: "Write a function that finds duplicate values in a list of 100,000 items two ways — nested loops and a set — and use timeit to measure both. Report the speedup and explain the complexity difference.",
                tips: ["Profile to find the real bottleneck first", "The right data structure beats micro-optimization", "NumPy, multiprocessing, and lru_cache are the heavy hitters"],
            },
            {
                t: "Building a Real Project: CLI to API", s: "python-real-project",
                e: "Tie it all together — turn your code into a tool others can install and a service others can call.",
                sec: [
                    ["A polished CLI with argparse", "argparse turns a script into a proper command-line tool with arguments, flags, help text, and validation — the difference between a personal hack and something a teammate can use.", 'import argparse\np = argparse.ArgumentParser(description="Contact manager")\np.add_argument("name")\np.add_argument("--phone", required=True)\nargs = p.parse_args()\nprint(args.name, args.phone)'],
                    ["Exposing an API with FastAPI", "FastAPI turns typed functions into a documented HTTP API with automatic validation and interactive docs. Type hints drive request/response schemas — the payoff for learning typing earlier.", 'from fastapi import FastAPI\napp = FastAPI()\n\n@app.get("/greet/{name}")\ndef greet(name: str, formal: bool = False):\n    return {"message": f"{\'Good day\' if formal else \'Hi\'}, {name}"}'],
                    ["Shipping it", "Real delivery means: environment variables for config, logging instead of print, a requirements lockfile, tests in CI, and a container or host to run on. These habits turn 'works on my machine' into 'works in production'."],
                ],
                ex: "Build a URL-shortener: a FastAPI app with POST /shorten (returns a code) and GET /{code} (redirects), storing mappings in a dict, with type hints, three pytest tests against the app, and a README explaining how to run it.",
                tips: ["argparse makes scripts into real CLI tools", "FastAPI turns typed functions into documented APIs", "Config in env vars, logging over print, tests in CI"],
            },
        ],
    },
}
