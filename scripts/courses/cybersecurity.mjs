export const CYBERSECURITY = {
    name: "Cybersecurity",
    palette: ["#22c55e", "#0ea5e9",],
    kw: "cybersecurity,hacking",
    images: ["1550751827-4bd374c3f58b", "1518770660439-4636190af475", "1526374965328-7f61d4dc18c5"],
    levels: {
        Basic: [
            {
                t: "Security Fundamentals: Thinking Like a Defender", s: "security-fundamentals",
                e: "The mental models the whole field rests on — the CIA triad, threats vs vulnerabilities, and defense in depth.",
                sec: [
                    ["The CIA triad", "Every security decision protects one of three properties: Confidentiality (only authorized people see data), Integrity (data isn't tampered with), and Availability (systems are up when needed). A ransomware attack hits all three; encryption protects confidentiality; backups protect availability. Naming which property is at risk clarifies every control."],
                    ["Threats, vulnerabilities, and risk", "Precise vocabulary matters: a vulnerability is a weakness, a threat is something that could exploit it, and risk is the combination weighted by likelihood and impact. You can't fix everything — risk lets you prioritize the vulnerabilities that are both likely to be exploited and costly if they are."],
                    ["Defense in depth and least privilege", "No single control is perfect, so layer them: a firewall, plus patching, plus authentication, plus monitoring — an attacker must beat all of them. Pair this with least privilege: give every user and process only the access it truly needs, so a single compromise can't reach everything."],
                ],
                ex: "Pick a system you use daily (email, a bank app). List one risk to each CIA property, and for one of them, name two independent layers of defense that would have to fail for a breach to succeed.",
                tips: ["Every control protects Confidentiality, Integrity, or Availability", "Risk = vulnerability × threat × impact — prioritize with it", "Layer defenses; grant least privilege"],
            },
            {
                t: "How Attacks Actually Happen", s: "how-attacks-happen",
                e: "Understand the attacker's playbook — the kill chain, common attack types, and why humans are the top target.",
                sec: [
                    ["The attack lifecycle", "Real attacks follow stages: reconnaissance (research the target), initial access (phish, exploit, stolen credentials), execution and privilege escalation, lateral movement across the network, and finally the objective — data theft, encryption, or sabotage. Defenders who understand the chain can break it at multiple points, not just at the perimeter."],
                    ["Social engineering: hacking humans", "The easiest way in is rarely technical. Phishing emails, pretext phone calls, and fake login pages exploit trust, urgency, and authority. The vast majority of breaches involve a human element. No firewall stops an employee who types their password into a convincing fake — which is why awareness is a core control, not an afterthought."],
                    ["Malware and its families", "Know the categories: viruses and worms (self-spreading code), trojans (malicious code disguised as useful), ransomware (encrypts for extortion), spyware/keyloggers (steal data), and rootkits (hide deep in the system). Modern malware is often modular and delivered in stages, evading simple signature detection."],
                ],
                ex: "Find a real phishing email (your spam folder works) and dissect it: identify the urgency/authority tactic, the mismatched sender or link, and two signals that give it away. Then map a hypothetical breach to the attack lifecycle stages.",
                tips: ["Attacks are staged — you can break the chain anywhere", "Most breaches start with a human, not an exploit", "Learn malware families to reason about defenses"],
            },
            {
                t: "Passwords, MFA, and Authentication", s: "passwords-mfa-authentication",
                e: "Identity is the new perimeter. Master the single highest-impact area of personal and organizational security.",
                sec: [
                    ["Why passwords fail", "Passwords get reused, phished, guessed, and leaked in breaches — then replayed across sites (credential stuffing). Length beats complexity: a long passphrase resists cracking far better than a short scrambled one. And a password manager makes unique, strong passwords for every site effortless — the single best habit most people can adopt."],
                    ["Multi-factor authentication", "MFA requires something you know (password) plus something you have (phone, security key) or are (biometric). It blocks the overwhelming majority of account-takeover attacks even when the password leaks. Not all MFA is equal: authenticator apps and hardware keys (FIDO2) resist phishing far better than SMS codes, which can be SIM-swapped."],
                    ["Beyond passwords", "The industry is moving to passkeys — cryptographic credentials tied to your device that can't be phished or reused because there's no shared secret to steal. Understanding hashing (passwords are stored as one-way hashes, salted to defeat precomputation) explains why a good breach exposes hashes, not plaintext — if the site did it right."],
                ],
                ex: "Audit your own security: adopt a password manager if you haven't, enable app-based or hardware MFA on your email and bank, and check your email against a breach database (haveibeenpwned). Document what you changed.",
                tips: ["Length + uniqueness + a password manager beats complexity", "MFA stops most account takeovers — prefer app/key over SMS", "Passkeys eliminate the phishable shared secret"],
            },
            {
                t: "Networking and the Internet for Security", s: "networking-for-security",
                e: "You can't secure what you don't understand. The networking essentials every security practitioner needs.",
                sec: [
                    ["How data travels", "Data moves in packets across layers (the OSI/TCP-IP model): IP addresses route packets, ports identify services (80/443 web, 22 SSH), and DNS translates names to addresses. Attackers and defenders both work at these layers — understanding them turns 'the internet' from magic into a system you can reason about."],
                    ["TLS and encryption in transit", "HTTPS wraps web traffic in TLS, which provides confidentiality (eavesdroppers see gibberish) and authenticity (certificates prove you're talking to the real server). The padlock means encrypted transport, not a trustworthy site — a critical distinction phishers exploit with valid certificates on fake domains."],
                    ["Firewalls, VPNs, and network defense", "Firewalls filter traffic by rules (allow 443, block the rest); VPNs tunnel your traffic encrypted through an untrusted network; network segmentation limits how far an intruder can move. These perimeter tools matter, but the modern shift is to 'zero trust' — verify every request regardless of network location, because the perimeter has dissolved."],
                ],
                ex: "Use built-in tools to explore your own network: run `ping`, `traceroute`/`tracert` to a website, and `nslookup` on a domain. Then check a site's certificate in your browser and note who issued it and when it expires.",
                tips: ["Ports and DNS demystify how services connect", "HTTPS proves encryption + server identity, not trustworthiness", "Zero trust replaces 'inside = safe' perimeter thinking"],
            },
            {
                t: "Staying Safe: Practical Cyber Hygiene", s: "cyber-hygiene",
                e: "The everyday habits that prevent the majority of real-world compromises — for you and any organization.",
                sec: [
                    ["Patch, update, and back up", "Most successful attacks exploit known vulnerabilities that a patch already exists for. Enable automatic updates everywhere. Pair this with the 3-2-1 backup rule (three copies, two media, one offsite) — the only reliable defense against ransomware, and one you must test by actually restoring."],
                    ["Safe browsing and email", "Verify before you click: hover links to see real destinations, be suspicious of urgency and unexpected attachments, and type important URLs rather than following emailed links. Use a reputable browser with updates on, and treat public Wi-Fi as hostile (use HTTPS and, ideally, a VPN)."],
                    ["Device and data protection", "Encrypt your drives (BitLocker/FileVault) so a lost laptop isn't a breach, lock screens automatically, and be deliberate about what you install and what permissions you grant. Minimize data: you can't lose what you don't collect or keep. These basics stop far more attacks than any advanced tool."],
                ],
                ex: "Do a personal security review: turn on automatic updates on all devices, verify your backups actually restore a test file, enable full-disk encryption, and review app permissions on your phone. Write a short before/after checklist.",
                tips: ["Patch promptly — most attacks use known holes", "3-2-1 backups, tested, defeat ransomware", "Encrypt devices; minimize the data you hold"],
            },
        ],
        Intermediate: [
            {
                t: "Cryptography in Practice", s: "cryptography-in-practice",
                e: "How encryption, hashing, and signatures actually protect data — enough to use them correctly and spot misuse.",
                sec: [
                    ["Symmetric vs asymmetric encryption", "Symmetric encryption (AES) uses one shared key — fast, ideal for bulk data, but how do you share the key? Asymmetric encryption (RSA, ECC) uses a public/private key pair — anyone can encrypt to your public key, only your private key decrypts. Real systems combine them: asymmetric to exchange a symmetric key, symmetric for the data (exactly how TLS works)."],
                    ["Hashing and integrity", "A cryptographic hash (SHA-256) is a one-way fingerprint: same input → same hash, any change → wildly different hash, and you can't reverse it. Uses: verifying file integrity, storing passwords (salted + slow hashes like bcrypt/argon2), and detecting tampering. Never use fast or broken hashes (MD5, SHA-1) for security."],
                    ["Digital signatures and certificates", "Signing with a private key lets anyone verify with the public key that a message is authentic and unaltered — the basis of code signing, document signing, and TLS certificates. Certificate authorities vouch for public keys, creating the chain of trust your browser checks on every HTTPS connection."],
                ],
                ex: "Hash the same file with SHA-256, change one byte, and hash again to see the avalanche effect. Then explain, in your own words, exactly how TLS uses both asymmetric and symmetric cryptography in a single connection.",
                tips: ["Symmetric = fast bulk; asymmetric = key exchange + signatures", "Salted, slow hashes (bcrypt/argon2) for passwords — never MD5", "Signatures prove authenticity; CAs anchor the trust chain"],
            },
            {
                t: "Web Application Security and the OWASP Top 10", s: "web-app-security-owasp",
                e: "Most breaches target web apps. Learn the vulnerability classes every developer and tester must know.",
                sec: [
                    ["Injection and XSS", "Injection (SQL, command) happens when untrusted input is treated as code — the fix is parameterized queries and never concatenating input into commands. Cross-site scripting (XSS) injects malicious JavaScript into pages viewed by others; defend with output encoding and a Content Security Policy. Both stem from the same root: mixing data and code.", "// Vulnerable:\nquery(\"SELECT * FROM users WHERE id = \" + input)\n// Safe (parameterized):\nquery(\"SELECT * FROM users WHERE id = ?\", [input])"],
                    ["Broken access control and auth", "The #1 OWASP risk: users accessing what they shouldn't — viewing another user's data by changing an ID, or reaching admin functions without rights. Enforce authorization on the server for every request, never trust the client, and default to deny. Session and authentication flaws (weak tokens, no MFA, exposed secrets) compound the damage."],
                    ["Security misconfiguration and dependencies", "Default passwords, verbose error messages, open cloud storage buckets, and unpatched components cause enormous numbers of breaches. Modern apps are mostly third-party code — a single vulnerable dependency (think Log4Shell) exposes everything. Scan dependencies, harden configurations, and keep an inventory of what you run."],
                ],
                ex: "Set up OWASP Juice Shop (a deliberately vulnerable practice app) locally or online and solve three beginner challenges — an injection, an XSS, and a broken-access-control flaw. Document how each worked and its fix.",
                tips: ["Injection/XSS come from mixing data with code", "Enforce access control server-side, default to deny", "Your dependencies are your attack surface — scan them"],
            },
            {
                t: "Security Operations, Logging, and Monitoring", s: "security-operations-monitoring",
                e: "Prevention fails eventually — detection and response are what limit the damage. Inside the modern SOC.",
                sec: [
                    ["You can't defend what you can't see", "Logging is the foundation: authentication events, network flows, process execution, and file changes. A SIEM (Security Information and Event Management) aggregates logs from everywhere and correlates them into alerts. The goal is reducing 'dwell time' — how long an attacker operates undetected, often measured in weeks."],
                    ["Detection engineering", "Signatures catch known threats; behavioral detection catches the unknown by flagging anomalies — a service account logging in at 3am, mass file access, or a workstation talking to a rare foreign server. Frameworks like MITRE ATT&CK catalog real attacker techniques so defenders can build detections that map to how adversaries actually operate."],
                    ["The SOC and alert fatigue", "Security operations centers triage alerts, investigate, and escalate. The central challenge is signal vs noise — too many false positives cause analysts to miss real threats. Good SOCs tune detections ruthlessly, automate the repetitive (SOAR playbooks), and prioritize by asset value and threat severity."],
                ],
                ex: "Explore your own system logs: on your OS, find the authentication/security log and identify login events. Then read one MITRE ATT&CK technique and describe what log source would detect it.",
                tips: ["Comprehensive logging is the prerequisite for detection", "Behavioral detection catches what signatures miss", "Tune out false positives — alert fatigue kills detection"],
            },
            {
                t: "Ethical Hacking and Penetration Testing", s: "ethical-hacking-pentesting",
                e: "Think like an attacker, legally. The methodology, tools, and rules of professional offensive security.",
                sec: [
                    ["Rules of engagement first", "Ethical hacking is authorized hacking. Before any test: written permission, a defined scope (what's in and out of bounds), and rules of engagement. Testing systems without authorization is a crime, full stop. This legal-and-ethical foundation is what separates a penetration tester from a criminal — and it's non-negotiable."],
                    ["The pentest methodology", "Professional tests follow phases: reconnaissance (gather info), scanning (find live hosts, open ports, services — nmap), enumeration and vulnerability identification, exploitation (prove impact, often with Metasploit), and post-exploitation. It ends where it matters most: a clear report with findings, risk ratings, and remediation steps."],
                    ["The toolkit and how to practice", "Kali Linux bundles the standard tools: nmap (scanning), Burp Suite (web testing), Metasploit (exploitation), Wireshark (packet analysis). Practice legally on intentionally vulnerable targets — TryHackMe, Hack The Box, and VulnHub — never on systems you don't own or have written permission to test."],
                ],
                ex: "On a legal practice platform (TryHackMe's free tier), complete an introductory room: scan a target with nmap, identify a service, and exploit a known vulnerability in the sandboxed environment. Write up the steps as a mini-report.",
                tips: ["No authorization = crime; scope and permission first", "Recon → scan → exploit → report is the methodology", "Practice only on legal, intentionally-vulnerable targets"],
            },
            {
                t: "Cloud and Application Security", s: "cloud-application-security",
                e: "Workloads moved to the cloud and the risks moved with them. Secure modern infrastructure and pipelines.",
                sec: [
                    ["The shared responsibility model", "In the cloud, the provider secures the infrastructure; you secure what you put on it — your data, configurations, access, and code. Most cloud breaches are customer misconfigurations, not provider failures: public storage buckets, over-permissive IAM roles, exposed databases. Know exactly where your responsibility begins."],
                    ["Identity and access management", "IAM is the cloud's real perimeter. Apply least privilege rigorously, avoid long-lived credentials (use roles and short-lived tokens), enforce MFA on privileged accounts, and audit permissions continuously. An over-privileged leaked key is how many cloud breaches escalate from foothold to catastrophe."],
                    ["DevSecOps: security in the pipeline", "Shift security left — into development, not bolted on after. Scan code (SAST), dependencies (SCA), and running apps (DAST) automatically in CI/CD; manage secrets in a vault, never in code; and scan container images. Infrastructure-as-code lets you review and version security configuration like any other code."],
                ],
                ex: "Review a cloud account you have access to (or a free tier): find one over-permissive permission or public resource, and write a remediation plan. If none, explain the shared responsibility split for a service you'd deploy.",
                tips: ["Cloud breaches are usually your misconfiguration, not theirs", "IAM least privilege + short-lived credentials is the perimeter", "Automate security scans into CI/CD; vault your secrets"],
            },
        ],
        Advanced: [
            {
                t: "Threat Intelligence and Advanced Adversaries", s: "threat-intelligence-adversaries",
                e: "Understand who attacks, how sophisticated actors operate, and how to anticipate rather than merely react.",
                sec: [
                    ["Knowing your adversary", "Threats range from opportunistic criminals to organized ransomware crews to nation-state APTs (Advanced Persistent Threats) with time, funding, and patience. Their motivations — money, espionage, disruption — shape their methods. Threat intelligence maps which actors target your sector and what techniques they favor, turning defense from generic to targeted."],
                    ["The intelligence lifecycle and IOCs", "Threat intel is a process: collect data, analyze it into actionable insight, and disseminate it to defenders. Indicators of Compromise (malicious IPs, file hashes, domains) enable detection, but mature programs move up the 'pyramid of pain' to detect adversary tactics and tools — far harder for attackers to change than a swapped IP address."],
                    ["Threat hunting", "Instead of waiting for alerts, threat hunters proactively search for adversaries already inside, forming hypotheses from ATT&CK techniques ('if an attacker did X, I'd see Y in the logs') and investigating. Hunting finds the sophisticated intruders who evade automated detection — and improves detections for next time."],
                ],
                ex: "Pick a real threat actor or ransomware group (public reports abound), summarize their typical techniques mapped to MITRE ATT&CK, and propose two specific detections a defender in that target sector should build.",
                tips: ["Match defenses to the actors who target your sector", "Climb the pyramid of pain — detect tactics, not just IOCs", "Hunt proactively; don't only wait for alerts"],
            },
            {
                t: "Incident Response and Digital Recovery", s: "incident-response",
                e: "When (not if) a breach happens, a practiced response limits the damage. The professional IR framework.",
                sec: [
                    ["The IR lifecycle", "The standard model (NIST/SANS): Preparation (plans, tools, training before anything happens), Identification (confirm and scope the incident), Containment (stop the spread — isolate, don't tip off the attacker prematurely), Eradication (remove the foothold), Recovery (restore safely), and Lessons Learned. Preparation is where incidents are won — improvising mid-crisis fails."],
                    ["Containment decisions under pressure", "Real incidents force hard trade-offs: pull the plug (lose forensic evidence and availability) or watch and learn (risk more damage)? Isolate affected systems, preserve volatile evidence (memory, logs) before it's lost, rotate compromised credentials, and communicate on out-of-band channels the attacker can't monitor."],
                    ["After the incident", "Recovery must be safe, not just fast — restoring from a backup that contains the same vulnerability re-invites the attacker. The post-incident review is the highest-value step: a blameless analysis of what happened, what worked, and what to change, feeding back into preparation. Breaches also trigger legal duties: many jurisdictions mandate breach notification within tight deadlines."],
                ],
                ex: "Write an incident response runbook for a ransomware scenario at a small company: list the steps for each IR phase, who does what, what evidence to preserve, and the notification obligations to consider.",
                tips: ["Incidents are won in Preparation, before they happen", "Preserve volatile evidence before containment destroys it", "Recover to a patched state; run a blameless post-mortem"],
            },
            {
                t: "Malware Analysis and Reverse Engineering", s: "malware-analysis-reversing",
                e: "Understand malicious code deeply — the discipline behind detection signatures and threat attribution.",
                sec: [
                    ["Static vs dynamic analysis", "Static analysis examines malware without running it: strings, file structure, imported functions, and disassembly reveal capabilities and clues. Dynamic analysis runs it in an isolated sandbox and observes behavior — files created, registry changes, network callbacks. Together they build a full picture; each covers the other's blind spots (packing defeats static; sandbox-evasion defeats dynamic)."],
                    ["Safe analysis environments", "Malware analysis demands isolation: a dedicated virtual machine with no network (or a controlled fake one), snapshots to revert, and no bridge to real systems or data. A mistake here infects your own machine or network. Professionals use purpose-built, disposable analysis VMs and treat every sample as live ammunition."],
                    ["From analysis to defense", "The output is defensive value: extract IOCs, write detection signatures (YARA rules match malware families by patterns), understand the malware's goals and command-and-control, and contribute to attribution. Reverse engineering the code — with tools like Ghidra — reveals exactly how novel threats work when nothing else can."],
                ],
                ex: "Using a safe sandbox service (like an online malware sandbox) on a known-safe sample, review the behavioral report: list the file/network/registry actions and write a simple YARA rule matching a distinctive string or pattern.",
                tips: ["Combine static and dynamic — each covers the other's gaps", "Analyze only in isolated, disposable, snapshotted VMs", "Turn analysis into YARA rules, IOCs, and detections"],
            },
            {
                t: "Governance, Risk, and Compliance", s: "governance-risk-compliance",
                e: "Security at scale is a business discipline, not just technology. Frameworks, risk management, and the human side.",
                sec: [
                    ["Frameworks and standards", "Organizations structure security programs around frameworks: NIST CSF (identify, protect, detect, respond, recover), ISO 27001 (certifiable management system), CIS Controls (prioritized actions), and sector rules (PCI-DSS for cards, HIPAA for health). Frameworks turn 'be secure' into a concrete, auditable program with maturity you can measure and improve."],
                    ["Risk management as a business function", "Security exists to manage risk within business constraints — infinite security is impossible and unaffordable. The discipline: identify assets and risks, assess likelihood and impact, then treat each (mitigate, transfer via insurance, accept, or avoid). Communicating risk in business terms — money, downtime, reputation — is what earns security a seat at the table."],
                    ["Policy, awareness, and culture", "Technology alone can't secure an organization whose people click every link. Effective programs combine clear policies, regular training that goes beyond compliance theater, phishing simulations, and — most importantly — a culture where reporting mistakes is safe. Security is everyone's job, and leadership tone decides whether that's real or a poster on the wall."],
                ],
                ex: "For an organization you know, do a mini risk assessment: identify three key assets, a top risk to each with likelihood/impact, and a treatment decision for each. Then map your controls to one NIST CSF function.",
                tips: ["Frameworks turn 'be secure' into an auditable program", "Manage risk within business constraints — communicate in business terms", "Culture and awareness are controls, not afterthoughts"],
            },
            {
                t: "Building a Cybersecurity Career", s: "cybersecurity-career",
                e: "Map the field's many roles, the certifications that matter, and how to build hands-on credibility.",
                sec: [
                    ["The many paths in security", "Cybersecurity isn't one job: defensive (SOC analyst, incident responder, security engineer), offensive (penetration tester, red team), and strategic (GRC, security architect, CISO). There are roles for coders and non-coders, builders and breakers, technical and people-focused. Explore to find where your strengths and interests fit."],
                    ["Certifications and their place", "Certs open doors and structure learning: CompTIA Security+ (foundational), then role-specific ones — OSCP (hands-on offensive, highly respected), CISSP (management/breadth, experience-gated), cloud security certs, and vendor tracks. They complement but don't replace demonstrated skill; balance credentials with proof you can do the work."],
                    ["Hands-on credibility", "The field rewards what you can do. Build a home lab, compete in Capture The Flag events, practice on TryHackMe/Hack The Box, contribute to open-source security tools, and document your learning publicly. A GitHub of projects, write-ups, and CTF results speaks louder than any certificate — and the field's ethic of continuous learning never stops, because the threats never do."],
                ],
                ex: "Map your own path: pick a security role that fits you, identify the skills and one certification it typically wants, and outline a 90-day hands-on plan (labs, CTFs, a project) to build demonstrable credibility toward it.",
                tips: ["Security spans defensive, offensive, and strategic roles", "Certs structure learning but don't replace demonstrated skill", "A public portfolio of labs and CTFs proves you can do the work"],
            },
        ],
    },
}
