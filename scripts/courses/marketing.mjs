export const MARKETING = {
    name: "Digital Marketing",
    palette: ["#f97316", "#ec4899"],
    kw: "marketing,digital",
    images: ["1432888622747-4eb9a8efeb07", "1460925895917-afdab827c52f", "1533750349088-cd871a92f312"],
    levels: {
        Basic: [
            {
                t: "The Digital Marketing Landscape", s: "digital-marketing-landscape",
                e: "A map of the whole territory — channels, funnels, and the vocabulary every marketer needs on day one.",
                sec: [
                    ["Owned, earned, and paid media", "Everything you do fits three buckets. Owned: your website, email list, and content — assets you control. Earned: reviews, shares, press, and word of mouth — credibility you can't buy. Paid: ads on search, social, and display — reach you rent. Healthy strategies build owned assets with paid acceleration; unhealthy ones rent everything and own nothing."],
                    ["The funnel: awareness to advocacy", "Customers move through stages: they discover you (awareness), evaluate you (consideration), buy (conversion), and ideally return and refer (retention, advocacy). Every channel and message should know which stage it serves — a discount code is wasted on someone who's never heard of you, and a brand video is wasted on someone with a full cart."],
                    ["The metrics that matter", "Learn five numbers before any tool: CAC (cost to acquire a customer), LTV (lifetime value of one), conversion rate (visitors who act), CTR (who clicks what you show), and ROAS (revenue per ad rupee). The golden ratio: LTV should be at least 3× CAC — below that, growth burns money."],
                ],
                ex: "Pick any brand you admire. Identify one owned, one earned, and one paid channel they use, and map one example of their messaging to a funnel stage. Write it up in half a page.",
                tips: ["Build owned assets; rent paid reach strategically", "Match every message to its funnel stage", "LTV ≥ 3× CAC or growth is a leak"],
            },
            {
                t: "SEO Foundations: Being Found on Google", s: "seo-foundations",
                e: "Search traffic is free, compounding, and high-intent. Learn how ranking actually works in the AI-search era.",
                sec: [
                    ["How search engines decide", "Google crawls pages, indexes their content, and ranks results by hundreds of signals that cluster into three groups: relevance (does the page answer the query?), authority (do trusted sites link to it?), and experience (is it fast, mobile-friendly, and satisfying to use?). Modern addition: AI Overviews now answer many queries directly — being cited by them requires the same fundamentals plus clear, quotable answers."],
                    ["Keyword research and search intent", "Behind every query is an intent: informational (how to...), navigational (brand names), commercial (best X for Y), transactional (buy X). Free tools (Google's autocomplete, People Also Ask, Keyword Planner) reveal what your customers actually type. Target specific long-tail phrases first — 'best running shoes for flat feet' converts far better than 'shoes' and is winnable."],
                    ["On-page essentials", "For each target query, one page: the phrase in the title tag (under 60 chars), a compelling meta description, one H1, descriptive headings, and content that genuinely answers the question better than the current results. Internal links pass authority; image alt text and fast load times round out the basics. No tricks survive algorithm updates — usefulness does."],
                ],
                ex: "Choose a topic you know well. Find five long-tail keywords using Google autocomplete and People Also Ask, classify each by intent, and draft a title tag + meta description + H2 outline for a page targeting the best one.",
                tips: ["Relevance + authority + experience = rankings", "Target intent-rich long-tail phrases first", "Write the page that deserves to rank"],
            },
            {
                t: "Social Media and Content Marketing", s: "social-content-marketing",
                e: "Attention is earned in feeds now. Build a content engine that compounds instead of a posting treadmill that exhausts.",
                sec: [
                    ["Platform-native or invisible", "Each platform rewards its own format: short vertical video (Reels/Shorts/TikTok), carousels and aesthetics (Instagram), professional insight (LinkedIn), conversation (X), search-like discovery (YouTube, Pinterest). Reposting one asset unchanged everywhere underperforms everywhere — adapt the idea to each platform's native grammar, or focus on fewer platforms."],
                    ["The content pillar system", "Sustainable creators work from 3–5 pillars — recurring themes their audience expects (e.g., a bakery: recipes, behind-the-scenes, customer stories, local events). Pillars remove the daily 'what do I post?' crisis, train the algorithm on your niche, and let one strong idea become a month of coordinated posts across formats."],
                    ["Hooks, value, and the 80/20 rule", "The first line or first second decides everything — lead with the outcome, the question, or the tension, never the throat-clearing. Follow the 80/20 rule: four posts that teach, entertain, or inspire for every one that sells. Audiences tolerate promotion from accounts that consistently give; they unfollow accounts that only take."],
                ],
                ex: "Define three content pillars for a business you know. For one pillar, write a week of content: one short-video script with a strong first-second hook, one carousel outline, and one text post — each native to its platform.",
                tips: ["Adapt to each platform's native format", "Pillars turn posting into a system", "Give value 4× for every 1× ask"],
            },
            {
                t: "Understanding Your Customer", s: "understanding-your-customer",
                e: "Marketing that skips the customer is expensive guessing. Learn to research, segment, and empathize systematically.",
                sec: [
                    ["Personas from evidence, not imagination", "A useful persona is built from real signals — interviews, reviews, support tickets, search queries — not invented demographics. Capture their goal, their obstacle, what triggers a purchase, and where they look for solutions. One well-researched persona beats five fictional ones."],
                    ["Jobs to be done", "People 'hire' products to make progress in their lives. The JTBD lens asks 'what job is the customer hiring this for?' — a drill buyer wants a hole, a hole-hanger wants a tidy home. Marketing the deeper job (the outcome, the emotion) out-converts marketing the features."],
                    ["The customer journey map", "Chart the real path from first spark to loyal advocate: the questions, doubts, and touchpoints at each stage. Mapping it reveals gaps — the unanswered question that stalls buyers, the silent post-purchase period that kills retention — that no channel tactic would surface."],
                ],
                ex: "Interview three real customers (or read 15 reviews) of a product you know. Build one evidence-based persona, articulate the core 'job' they hire it for, and map their journey noting one improvement opportunity per stage.",
                tips: ["Personas come from research, not imagination", "Sell the job/outcome, not the features", "Journey maps expose the gaps tactics miss"],
            },
            {
                t: "Copywriting That Converts", s: "copywriting-that-converts",
                e: "Words are the interface of marketing. Learn the frameworks that turn readers into buyers.",
                sec: [
                    ["Headlines and hooks", "Most people read the headline and nothing else, so it does 80% of the work. Effective headlines promise a specific benefit, spark curiosity, or name the reader's problem. Lead with the outcome ('Cut your invoice time in half'), never with your company. Test multiple angles — the winner often surprises you."],
                    ["Proven frameworks", "Don't stare at a blank page — use structures. AIDA (Attention, Interest, Desire, Action) for ads; PAS (Problem, Agitate, Solve) for pain-driven offers; FAB (Features → Advantages → Benefits) to translate specs into meaning. Frameworks give reliable scaffolding you fill with customer language.", "PAS example:\nProblem: Your team drowns in manual reports.\nAgitate: Hours lost weekly, errors, burnout.\nSolve: Automated dashboards in one click."],
                    ["Clarity, benefits, and one CTA", "Cut jargon and hype; clear beats clever. Translate every feature into a benefit ('256-bit encryption' → 'your data stays private'). Address objections head-on, add proof near the ask, and end with one unambiguous call to action. Confused readers never convert."],
                ],
                ex: "Write three headline variants for a product using different angles (benefit, curiosity, problem), then write a short PAS-structured ad and a FAB table converting three features into benefits.",
                tips: ["The headline does most of the work — sweat it", "Use AIDA/PAS/FAB instead of blank-page guessing", "One clear CTA; translate features into benefits"],
            },
        ],
        Intermediate: [
            {
                t: "Paid Advertising: Google and Meta That Doesn't Burn Money", s: "paid-ads-google-meta",
                e: "The two ad duopolies, their opposite logics, and the campaign structures that survive contact with reality.",
                sec: [
                    ["Search ads capture demand; social ads create it", "Google Ads intercepts people actively searching — high intent, you bid on their words. Meta ads interrupt people scrolling — you target audiences and earn attention with creative. This difference drives everything: search ads win with keyword-to-landing-page relevance; social ads win with thumb-stopping creative tested in volume."],
                    ["Campaign structure and budgets", "Start narrow: one campaign, one goal, tightly-themed ad groups (search) or 2–3 audiences (Meta), and let each ad set exit the learning phase (~50 conversions/week) before judging. The classic beginner's death: ten fragmented campaigns splitting a small budget so nothing ever learns. Modern platforms reward consolidation + creative variety over micro-segmentation."],
                    ["Tracking or gambling", "Without conversion tracking you're buying traffic, not results. Install Google Tag / Meta Pixel with server-side events where possible, define the conversions that map to money (purchase, lead, call), and judge campaigns on cost per conversion and ROAS — never on clicks or impressions. Check search-term reports weekly and add negatives; that's where Google budgets quietly leak."],
                ],
                ex: "Design on paper a ₹30,000/month plan for a local service business: split between one Google Search campaign (list 10 keywords + 5 negatives, write 2 ads) and one Meta campaign (define audience, write 2 hooks). State the single conversion metric each will be judged on.",
                tips: ["Search = capture intent; social = create demand", "Consolidate budgets until campaigns exit learning", "No conversion tracking = gambling"],
            },
            {
                t: "Email Marketing and Automation", s: "email-marketing-automation",
                e: "The highest-ROI channel in marketing, and the automated flows that sell while you sleep.",
                sec: [
                    ["List building that works", "The money is in the list because you own it — no algorithm between you and the inbox. Grow it with lead magnets that solve one specific problem (checklist, template, calculator), placed at high-intent moments: exit intent, post-purchase, content upgrades inside articles. Never buy lists — deliverability damage outlasts any short-term gain."],
                    ["The four automated flows", "Before any newsletter, build the automations that run forever: Welcome (3–5 emails introducing your story and best content — highest open rates you'll ever see), Abandoned Cart (1h, 24h, 72h — recovers 5–15% of lost sales), Post-Purchase (delivery info, usage tips, review request), and Win-Back (re-engage 90-day-silent subscribers, then prune). These four typically produce the majority of email revenue on autopilot."],
                    ["Deliverability and testing", "Reaching the inbox requires authentication (SPF, DKIM, DMARC — mandatory since 2024 for bulk senders), a warmed sending domain, and engagement hygiene: prune non-openers, make unsubscribing easy. Then optimize with A/B tests one variable at a time — subject line first (it controls opens), then send time, then content. Small consistent lifts compound enormously across a year."],
                ],
                ex: "Write a complete 4-email welcome flow for a business of your choice: subject line + goal + 3-bullet outline per email, with day delays specified. Email 1 delivers the lead magnet; only email 4 makes an offer.",
                tips: ["The list is the only audience you own", "Four automations beat any newsletter", "Authenticate your domain or land in spam"],
            },
            {
                t: "Analytics: GA4, Attribution, and Reading the Numbers", s: "analytics-ga4-attribution",
                e: "Data settles arguments. Set up measurement properly and learn to read it without fooling yourself.",
                sec: [
                    ["GA4 in one sitting", "GA4 tracks events, not pageviews — everything (scroll, click, purchase) is an event with parameters. Set up: install via Google Tag Manager, mark your money events as key events (conversions), link Google Ads and Search Console. The four reports that answer 90% of questions: Traffic acquisition (where users come from), Engagement (what they do), Conversions (what pays), and the Funnel exploration (where they leak)."],
                    ["Attribution: who gets credit", "A customer sees an Instagram ad, later Googles you, clicks a search ad, then converts from an email. Which channel 'won'? Last-click credits email and starves discovery channels; data-driven attribution splits credit statistically. The honest posture: treat attribution as directional, watch blended CAC (total spend ÷ total customers) as the ground truth, and beware channels that only claim credit for demand others created."],
                    ["UTMs and the reporting habit", "Tag every campaign link with UTM parameters (source, medium, campaign) — untagged links become 'direct' traffic, the junk drawer of analytics. Then institutionalize a weekly 30-minute ritual: last week vs prior week on sessions, conversion rate, CAC, and revenue by channel, ending with one decision. Dashboards nobody acts on are decoration."],
                ],
                ex: "Define a measurement plan for an online store: list 6 GA4 events (with parameters) from first visit to purchase, mark which are key events, and write the full UTM-tagged URL you'd use for a Diwali email campaign.",
                tips: ["GA4 = events + parameters; mark key events", "Blended CAC is the attribution tiebreaker", "Untagged links lie — UTM everything"],
            },
            {
                t: "Content Strategy and SEO That Compounds", s: "content-strategy-seo-compounds",
                e: "Move from random posts to a content engine that ranks, nurtures, and converts for years.",
                sec: [
                    ["Topic clusters and authority", "Google rewards topical depth. Build a 'pillar' page on a broad topic linked to many 'cluster' articles on specifics — the internal linking signals expertise and lifts the whole cluster. This structure beats publishing scattered, unconnected posts that never establish authority in any area."],
                    ["Content for every funnel stage", "Top-of-funnel educational content earns awareness (how-to guides, explainers); middle-funnel comparison and case-study content aids evaluation; bottom-funnel content (pricing, demos, testimonials) closes. A blog full of only awareness content generates traffic that never buys — map content to intent deliberately."],
                    ["Repurposing and distribution", "Creation is half the job; distribution is the other half. One pillar article becomes a video, a newsletter, five social posts, and a slide deck. 'Create once, distribute everywhere' multiplies ROI — most content underperforms not from quality but from being published once and abandoned."],
                ],
                ex: "Design a topic cluster for a business: one pillar page and six cluster article titles mapped to funnel stages. Then take one article and list five repurposed formats with the platform for each.",
                tips: ["Pillar + cluster structure builds topical authority", "Map content to funnel stages, not just traffic", "Distribution multiplies content ROI more than creation"],
            },
            {
                t: "Marketing Automation and CRM", s: "marketing-automation-crm",
                e: "Scale personal-feeling marketing with systems: lead scoring, nurture workflows, and a single customer view.",
                sec: [
                    ["The CRM as single source of truth", "A CRM (HubSpot, Zoho, Salesforce) unifies every interaction — visits, emails, purchases, support — into one contact record. This is the foundation automation runs on: without a clean central record, personalization is guesswork and teams contradict each other."],
                    ["Lead scoring and lifecycle stages", "Not all leads are equal. Score them on fit (do they match your buyer?) and engagement (opens, visits, demo requests), then route hot leads to sales and keep others nurturing. Defining lifecycle stages (subscriber → lead → MQL → SQL → customer) aligns marketing and sales on who does what, when."],
                    ["Behavioral workflows", "Automation triggers on behavior: downloaded a guide → send a related sequence; abandoned a cart → remind; went quiet → re-engage. Well-built workflows feel personal at scale — but audit them regularly, since stale automations quietly send irrelevant or broken messages that erode trust."],
                ],
                ex: "Design a lead-nurture system on paper: define 4 lifecycle stages, a simple lead-scoring model (3 fit + 3 engagement signals with points), and one behavioral workflow with its trigger, 3 steps, and exit condition.",
                tips: ["A clean CRM is the foundation of all automation", "Score leads on fit + engagement, then route", "Audit workflows — stale automation erodes trust"],
            },
        ],
        Advanced: [
            {
                t: "Conversion Rate Optimization and Experimentation", s: "cro-experimentation",
                e: "Doubling conversion beats doubling traffic — and costs less. Build a rigorous experimentation practice.",
                sec: [
                    ["Research before ideas", "CRO fails when it's redesign roulette. Start with evidence: analytics funnels show WHERE users leave; session recordings and heatmaps show WHAT they do; user surveys and support tickets show WHY. Every test hypothesis should trace to observed friction: 'Because 60% abandon at shipping cost reveal (data), showing shipping earlier (change) will raise checkout completion (metric).'"],
                    ["Testing with statistical honesty", "A/B tests need predetermined sample sizes (use a calculator: baseline rate, minimum detectable effect, 95% confidence) and fixed durations — full weeks, minimum two, to capture weekday cycles. The cardinal sins: peeking and stopping early when results look good (false positives), testing ten things at once, and declaring winners on 50 conversions. Low-traffic sites should test bigger, bolder changes — subtle tweaks need volumes they don't have."],
                    ["The levers that consistently win", "Across thousands of published tests, the reliable winners: clarity over cleverness in headlines (say what it is), visible social proof near the decision point, reduced form fields, transparent pricing/shipping early, urgency only when real, and page speed (every second of load time costs conversions). Start with the checkout and forms — friction there is worth 10× friction on the homepage."],
                ],
                ex: "Take any e-commerce site. Identify three friction points using its live funnel as a visitor, write a properly-structured hypothesis for each (evidence → change → expected metric), and calculate the sample size needed to detect a 15% relative lift from a 3% baseline.",
                tips: ["Hypotheses come from research, not brainstorms", "Fix sample size and duration before starting", "Checkout friction is 10× homepage friction"],
            },
            {
                t: "Marketing Strategy: Positioning, Pricing Psychology, and Brand Moats", s: "strategy-positioning-brand",
                e: "Tactics get copied in weeks. Positioning, category design, and brand are the compounding advantages.",
                sec: [
                    ["Positioning: the choice everything else obeys", "Positioning is the market's answer to 'why you, for whom, instead of what?'. April Dunford's framework: identify true alternatives (often 'do nothing' or Excel), isolate your unique attributes, map them to value for a specific segment, and choose the market frame that makes you the obvious winner. Weak positioning shows up as feature-list marketing and price-based competition — if customers can't articulate your difference, you don't have one."],
                    ["Pricing as strategy", "Price communicates position: premium prices need premium proof, and discounting trains customers to wait. The tools: value-based pricing anchored to outcomes (not costs), tiered packaging with a designed hero tier, decoys that steer choice, and annual plans that trade discount for retention and cash flow. Raising prices is the most under-used growth lever — a 10% price increase typically beats a 10% traffic increase on profit."],
                    ["Brand as the compounding moat", "Performance marketing harvests demand; brand creates it. The measurable version: branded search volume, direct traffic, and unaided recall growing over time — assets that lower CAC across every channel simultaneously. The mechanism is distinctive, consistent presence: codes (colors, voice, characters) repeated until attribution-proof familiarity forms. The 60/40 rule from Binet & Field's research: mature brands should weight ~60% long-term brand building to ~40% activation — companies that cut brand in downturns pay for it with rising CAC for years."],
                ],
                ex: "Write a positioning one-pager for a product you know: competitive alternatives, unique attributes, value mapping, target segment, and market category. Then propose a 3-tier pricing structure with a deliberate hero tier and one decoy, justifying each price point.",
                tips: ["Position against real alternatives, not just competitors", "Pricing is a growth lever, not an afterthought", "Brand spend lowers CAC everywhere — measure branded search"],
            },
            {
                t: "AI-Era Marketing: Automation, Personalization, and Search's New Rules", s: "ai-era-marketing",
                e: "The playbook is being rewritten: generative AI in the workflow, personalization at scale, and marketing for AI-mediated discovery.",
                sec: [
                    ["AI in the marketing workflow", "The leverage is in the middle of the funnel of work: AI drafts (ads variants, email subject lines, briefs, repurposed formats), humans direct and edit (strategy, brand voice, final judgment). Winning teams build prompt libraries encoding their voice and use AI for the 10× variant testing that manual writing never had time for. The failure mode: publishing undifferentiated AI-generic content at scale — engines and audiences are both learning to discount it."],
                    ["Personalization without the creep factor", "Segment-of-one marketing is now practical: behavioral triggers (browsed X twice → email about X), dynamic site content by source and history, and predictive scoring for churn and purchase propensity. The constraints are trust and law: first-party data with clear value exchange, honest preference centers, and compliance (GDPR, India's DPDP Act). The durable strategy: earn data through usefulness — quizzes, configurators, accounts — not through surveillance."],
                    ["GEO: being the answer, not just the result", "AI Overviews, ChatGPT, and Perplexity increasingly answer queries directly, citing sources. Generative Engine Optimization is the response: structure content as clear questions and answers, lead with quotable definitive statements, maintain entity consistency (same name, facts, and schema everywhere), earn mentions on the sources AI systems trust (Wikipedia-grade references, industry publications), and track your appearance in AI answers the way you once tracked rankings. Zero-click is the new default — plan for value capture beyond the visit."],
                ],
                ex: "Take one strong article from any site. Rewrite its opening as a direct quotable answer, add an FAQ section with schema-ready Q&As, and list three authority sources where a mention would raise its odds of AI citation. Then check: does ChatGPT currently cite this domain for its topic?",
                tips: ["AI drafts, humans direct — never unsupervised publishing", "Earn first-party data with genuine value exchange", "Optimize for being cited, not just ranked"],
            },
            {
                t: "Growth Marketing and Retention Economics", s: "growth-retention-economics",
                e: "Sustainable growth is won in retention, not just acquisition. Master the loops and the unit economics.",
                sec: [
                    ["The leaky bucket", "Pouring acquisition spend into a product people abandon is filling a leaky bucket. Retention is the multiplier: a small churn improvement compounds enormously over time. Measure cohort retention curves — if they flatten (some users stick forever), you have product-market fit to scale; if they hit zero, fix retention before spending on growth."],
                    ["Growth loops beat funnels", "Funnels end; loops compound. A growth loop reinvests output into input: referrals (users bring users), user-generated content (usage creates marketing), network effects (each user adds value). Loops are why some companies grow with near-zero paid spend — engineer at least one into the product experience."],
                    ["Unit economics that scale", "Growth only works if the math does: LTV must comfortably exceed CAC (aim 3:1+), and CAC payback should be months, not years. Track contribution margin per customer, cohort LTV over time, and the payback period. A channel that acquires unprofitable customers faster is a faster way to go broke."],
                ],
                ex: "For a subscription business of your choice, sketch a cohort retention table over 6 months, identify whether the curve flattens, propose one retention improvement, and design one growth loop the product could build in.",
                tips: ["Fix retention before scaling acquisition", "Engineer growth loops, not just funnels", "LTV:CAC ≥ 3:1 with a short payback, or the math breaks"],
            },
            {
                t: "Building a Marketing Career or Practice", s: "marketing-career-practice",
                e: "Turn these skills into a job, a freelance practice, or a growth role — with a portfolio that proves you can deliver.",
                sec: [
                    ["T-shaped skills", "The most employable marketers are 'T-shaped': broad literacy across all channels plus deep expertise in one (SEO, paid, lifecycle, analytics, or content). Generalists coordinate; specialists get hired for the hard problems. Choose a depth based on what energizes you and where demand is strong."],
                    ["A portfolio of results", "Marketing hiring rewards proof over credentials. Document real outcomes: a campaign you ran, a page you optimized with before/after numbers, a content piece that ranked. No client yet? Market your own project, a local business (often free), or run a documented self-experiment. Numbers and case studies beat any certificate."],
                    ["Staying current deliberately", "The field changes fast — algorithms, platforms, AI tools, privacy rules. Build a learning system: follow a few high-signal sources, run small experiments monthly, and join a community. But anchor on fundamentals (customer, positioning, economics) that outlast every tactic — chasing only tactics leaves you obsolete when they change."],
                ],
                ex: "Draft your marketing positioning: pick your 'deep' specialty, list your 'broad' competencies, and outline three portfolio pieces you could build in the next month (even self-initiated) with the specific metric each would showcase.",
                tips: ["Be T-shaped: broad literacy, one deep specialty", "A results portfolio beats certificates", "Anchor on fundamentals; experiment with tactics"],
            },
        ],
    },
}
