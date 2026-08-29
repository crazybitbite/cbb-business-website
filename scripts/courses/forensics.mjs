export const FORENSICS = {
    name: "Digital Forensics",
    palette: ["#6366f1", "#8b5cf6"],
    kw: "forensics,investigation",
    images: ["1573164713714-d95e436ab8d6", "1518709268805-4e9042af9f23", "1544197150-b99a580bb7a8"],
    levels: {
        Basic: [
            {
                t: "What Digital Forensics Is", s: "what-is-digital-forensics",
                e: "The science of recovering and interpreting digital evidence — where it's used, and the principles that make it hold up.",
                sec: [
                    ["The discipline and where it's applied", "Digital forensics is the systematic recovery, preservation, analysis, and presentation of data from digital devices. It's used in criminal cases, corporate investigations (fraud, IP theft, policy violations), incident response (how did the breach happen?), and litigation (e-discovery). The output must survive scrutiny — often in court — so rigor and documentation are everything."],
                    ["The core principle: don't alter the evidence", "The foundational rule: never work on original evidence. Any interaction can change data, and changed evidence is challengeable evidence. Forensics works on verified copies, uses write-blockers to prevent accidental modification, and proves the copy is identical to the original with cryptographic hashes. If you might have altered it, you might have invented it."],
                    ["Forensic soundness and reproducibility", "Sound forensics is reproducible: another examiner following your documented steps on the same evidence reaches the same result. This demands meticulous notes, validated tools, and methods that don't rely on the examiner's word alone. The goal is objective findings a court, board, or opposing expert can verify."],
                ],
                ex: "Read one public case summary where digital evidence was pivotal (many are documented online). Identify what device/data mattered, and note one way mishandling the evidence could have undermined the case.",
                tips: ["Forensics = recover, preserve, analyze, present — verifiably", "Never work on originals; prove copies with hashes", "Sound methods are reproducible by another examiner"],
            },
            {
                t: "Evidence Handling and Chain of Custody", s: "evidence-chain-of-custody",
                e: "Evidence is only as good as its handling. The procedures that keep digital evidence admissible and trustworthy.",
                sec: [
                    ["Chain of custody", "Chain of custody is the documented, unbroken record of who handled evidence, when, why, and what they did — from seizure to courtroom. A gap lets anyone argue the evidence was tampered with. Every transfer is logged and signed; the evidence is sealed, labeled, and stored securely. This paper trail is often what makes or breaks admissibility."],
                    ["Seizure and acquisition order", "How you collect matters. Capture the most volatile data first (the 'order of volatility'): memory (RAM) and running network connections vanish on shutdown, while disk data persists. Photograph the scene, document the device state (on/off — and never 'just check' a running phone), and follow legal authority (warrant, consent, policy)."],
                    ["Hashing to prove integrity", "The moment you acquire evidence, you hash it (SHA-256). Re-hashing later and getting the same value proves the data hasn't changed since acquisition — the mathematical guarantee behind 'this is exactly what we found'. A mismatch means the evidence is compromised. This single practice underpins the credibility of everything that follows."],
                ],
                ex: "Design a chain-of-custody form: list every field it needs (item, source, collector, date/time, hash, transfers). Then hash a file, copy it, hash the copy to confirm they match, and modify one byte to watch the hash break.",
                tips: ["Unbroken, documented chain of custody = admissible evidence", "Collect most-volatile first: RAM before disk", "Hash at acquisition; matching hashes prove integrity"],
            },
            {
                t: "How Data Is Stored (and Recovered)", s: "how-data-is-stored",
                e: "You can't recover what you don't understand. File systems, storage media, and why 'deleted' rarely means gone.",
                sec: [
                    ["File systems and metadata", "File systems (NTFS, APFS, ext4, FAT) organize data and record rich metadata: timestamps (created, modified, accessed), permissions, and file locations. This metadata is often the investigation's goldmine — establishing when a file appeared, was opened, or was tampered with, and building a timeline of events."],
                    ["Why 'deleted' isn't gone", "Deleting a file usually just removes its directory entry and marks its space as available — the actual data lingers until overwritten. That's why file recovery ('file carving') works: examiners scan raw storage for file signatures and reconstruct data the user thought was erased. Formatting and even some 'secure' deletes leave recoverable traces."],
                    ["Storage media differences", "Media behave differently forensically. Spinning hard drives retain deleted data well. SSDs complicate recovery: the TRIM command proactively erases deleted blocks, so time matters. Mobile flash storage, cloud storage, and RAID arrays each need specific approaches. Knowing the medium shapes what's recoverable and how to acquire it."],
                ],
                ex: "On a spare USB drive (nothing important), copy some files, delete them, and use a free recovery tool (like PhotoRec/TestDisk) to recover them. Observe what comes back and what metadata survives. Never do this on evidence.",
                tips: ["File system metadata builds the timeline", "'Deleted' data survives until overwritten — carving recovers it", "SSD TRIM and cloud storage change what's recoverable"],
            },
            {
                t: "The Forensic Toolkit and Lab Setup", s: "forensic-toolkit-lab",
                e: "The hardware and software of a working forensics practice, and how to build skills legally and safely.",
                sec: [
                    ["Acquisition hardware and imaging", "Core kit: write-blockers (hardware or software) that let you read a drive without writing to it, and imaging tools that create a bit-for-bit copy — an 'image' — of the entire storage, including deleted and slack space. Common formats: raw (dd) and E01 (with built-in hashing and metadata). You analyze the image, never the original."],
                    ["Analysis software", "The field runs on a mix of suites and open tools: Autopsy/The Sleuth Kit (free, excellent starting point), plus commercial platforms (EnCase, FTK, Magnet AXIOM, Cellebrite for mobile). They parse file systems, recover deleted files, index content for search, extract artifacts, and build timelines — turning a raw image into investigable evidence."],
                    ["Building skills safely", "Practice on data you're allowed to use: publicly available forensic images and challenges (Digital Corpora, DFIR CTFs, the Autopsy sample images), and your own devices. Never examine others' devices or data without authorization — the same legal lines as ethical hacking apply. A home lab with a spare machine and free tools is enough to start."],
                ],
                ex: "Install Autopsy (free), load one of its sample disk images (or image your own USB with dd/FTK Imager first), and complete a basic examination: browse the file system, find deleted files, and note file timestamps.",
                tips: ["Write-blockers + imaging preserve the original", "Autopsy/Sleuth Kit are the free way to start", "Practice only on authorized or public forensic data"],
            },
            {
                t: "Building a Timeline and Basic Investigation", s: "timeline-basic-investigation",
                e: "Turn scattered artifacts into a coherent story of what happened, when, and in what order.",
                sec: [
                    ["Timelines are the backbone", "Investigations answer 'what happened and when'. A timeline aggregates timestamped events — file activity, logins, browser history, program execution — into chronological order. 'Super timelines' (built with tools like Plaso/log2timeline) merge dozens of sources into one view where patterns and anomalies jump out."],
                    ["Common artifacts and their meaning", "Learn what everyday traces reveal: browser history and cache (what was viewed and searched), recently-opened files, USB device history (what was plugged in), and account login records. Each artifact answers a question; combined, they corroborate or contradict a claim. Correlation across independent artifacts is what makes findings robust."],
                    ["From evidence to conclusion", "Good investigation is hypothesis-driven and honest: form a theory, seek evidence for and against it, and follow where the data leads — not where you expect. Distinguish fact ('this file was created at 14:32') from inference ('therefore the user did X'). Document uncertainty; overstated conclusions collapse under cross-examination."],
                ],
                ex: "Using the Autopsy sample image, build a mini timeline: extract 5–10 timestamped events (file creation, browser visits, logins), order them, and write a short factual narrative — carefully separating what the data shows from what you infer.",
                tips: ["Timelines turn artifacts into a sequence of events", "Correlate independent artifacts to strengthen findings", "Separate fact from inference; document uncertainty"],
            },
        ],
        Intermediate: [
            {
                t: "Disk Forensics in Depth", s: "disk-forensics-in-depth",
                e: "Go beyond the file browser: partitions, slack space, carving, and the hidden corners where evidence hides.",
                sec: [
                    ["Partitions, volumes, and the raw disk", "Below the file system lies structure: partition tables (MBR/GPT), volumes, and unallocated space. Evidence hides in gaps — deleted partitions, areas between partitions, and space marked free but not yet overwritten. Examining the raw disk, not just mounted files, is where deeper forensics begins."],
                    ["Slack space and file carving", "A file rarely fills its last allocated block; the leftover 'slack space' can contain fragments of previously deleted files. File carving reconstructs files from raw data using header/footer signatures, ignoring the file system entirely — recovering data even when directory entries are long gone. It's how examiners recover the file a suspect deliberately deleted."],
                    ["Registry and system artifacts", "On Windows, the registry is a forensic treasure: it records installed software, USB devices, user accounts, recently accessed files, and system configuration with timestamps. Combined with event logs, prefetch (program execution evidence), and shellbags (folder access), these artifacts reconstruct user activity in remarkable detail."],
                ],
                ex: "On the Autopsy sample image (or your own), examine unallocated space and run file carving to recover a deleted file the file system no longer lists. Then, on a Windows system, locate one registry-based artifact (e.g., USB device history).",
                tips: ["Evidence hides below the file system — examine the raw disk", "Carving recovers files from slack and unallocated space", "The Windows registry and logs richly reconstruct activity"],
            },
            {
                t: "Memory Forensics", s: "memory-forensics",
                e: "RAM holds what the disk never sees — running processes, encryption keys, and active malware. Learn to capture and read it.",
                sec: [
                    ["Why memory matters", "Volatile memory contains a snapshot of the live system: running and hidden processes, network connections, command history, decrypted data, injected code, and even passwords and encryption keys. Much of this never touches disk. Capturing RAM before shutdown can be the difference between solving and missing a case — especially with fileless malware and full-disk encryption."],
                    ["Acquisition and its trade-offs", "Memory is captured with tools (WinPmem, LiME, or built into IR suites) that dump RAM to a file. The act of capturing slightly alters memory — an accepted trade-off, documented honestly. Order of volatility puts memory near the top: capture it while the system runs, because it's gone the instant power is lost."],
                    ["Analysis with Volatility", "The Volatility framework is the standard for memory analysis: list processes (and spot hidden ones), examine network connections, dump a suspicious process's memory, extract command history, and recover injected code. Memory forensics frequently reveals malware and attacker activity that left no trace on disk at all."],
                ],
                ex: "Download a public memory image (many DFIR challenges provide them) and use Volatility to list running processes and network connections, then identify one suspicious process. Document your reasoning.",
                tips: ["RAM holds keys, live processes, and fileless malware", "Capture memory before shutdown — it's the most volatile", "Volatility is the standard framework for reading it"],
            },
            {
                t: "Network Forensics", s: "network-forensics",
                e: "Evidence in motion: reconstruct what crossed the wire from packet captures and logs to trace an intrusion.",
                sec: [
                    ["Packet captures and flow data", "Network forensics analyzes traffic — full packet captures (PCAP) for content and depth, or flow data (NetFlow) for who-talked-to-whom at scale. PCAPs can reconstruct entire sessions: files transferred, credentials sent in the clear, commands issued. Wireshark and tshark are the core tools for dissecting them."],
                    ["What the network reveals", "Traffic analysis exposes an intrusion's shape: command-and-control beacons (regular callbacks to an attacker's server), data exfiltration (large or unusual outbound transfers), lateral movement between internal hosts, and DNS abuse. Even encrypted traffic reveals metadata — who, when, how much, how often — that tells a story."],
                    ["Logs as network evidence", "Full captures aren't always available, so logs fill the gap: firewall, proxy, DNS, and server logs record connections and requests over time. Correlating logs across devices reconstructs an attacker's path when no PCAP exists. Time synchronization across sources (NTP) is critical — misaligned clocks scramble the timeline."],
                ],
                ex: "Open a sample PCAP (Wireshark provides many, or use a DFIR challenge) and investigate: identify the conversation endpoints, find a transferred file or suspicious request, and note one indicator of malicious activity.",
                tips: ["PCAPs reconstruct sessions; flow/logs scale to the big picture", "C2 beacons and unusual outbound transfers signal intrusion", "Synchronize clocks — logs are useless with skewed time"],
            },
            {
                t: "Mobile Device Forensics", s: "mobile-forensics",
                e: "Phones are the richest evidence source of the modern era — and the hardest to acquire. The methods and obstacles.",
                sec: [
                    ["Why mobile is different and rich", "Phones hold a person's life: messages, location history, photos with GPS metadata, app data, call logs, and browsing. But they're locked, encrypted by default, cloud-synced, and constantly changing. Mobile forensics is among the fastest-moving, most challenging specialties — and often the most decisive for a case."],
                    ["Acquisition levels", "Extraction ranges in depth: logical (files and databases the OS exposes), file system (broader access to app data and some deleted content), and physical (a full bit-level image — most complete but hardest, often impossible on modern encrypted devices). Which is achievable depends on the device, OS version, lock state, and available tools."],
                    ["Encryption, the cloud, and legal limits", "Modern phones encrypt by default, so a locked device may be genuinely inaccessible — a real and growing barrier. Investigators increasingly turn to cloud backups (with legal authority) that often hold the same data. Airplane-mode isolation (or a Faraday bag) prevents remote wipes during seizure. Every step here is bounded by law and consent."],
                ],
                ex: "Research the acquisition options for a specific recent phone model: what extraction levels are realistically possible, what the encryption obstacles are, and where cloud data might substitute. Summarize in a one-page brief.",
                tips: ["Phones are rich but locked, encrypted, and cloud-synced", "Acquisition depth: logical < file system < physical", "Isolate seized phones (Faraday bag) to prevent remote wipe"],
            },
            {
                t: "Reporting and Testifying", s: "forensic-reporting-testifying",
                e: "An investigation is worthless if it can't be communicated and defended. Writing reports and surviving cross-examination.",
                sec: [
                    ["The forensic report", "The report is the deliverable. It states the scope and authority, the tools and methods used (with versions), the evidence handled (with hashes), the findings, and the conclusions — written so both technical and non-technical readers can follow. It must be objective, complete, and reproducible: another examiner should be able to verify every claim."],
                    ["Facts, opinions, and honesty", "Distinguish clearly between fact (what the data shows), and expert opinion (what you infer). Include exculpatory findings — evidence that cuts against your theory — because hiding them destroys credibility and violates ethics. Acknowledge limitations and alternative explanations. Overreaching is the fastest way to be discredited."],
                    ["Expert testimony", "In court, you may testify as an expert: explaining technical findings plainly, defending your methods, and staying within your expertise under cross-examination designed to find any crack. Preparation, precise language, and intellectual honesty ('I don't know' when you don't) are what hold up. Your credibility is the evidence's credibility."],
                ],
                ex: "Write a short forensic report for one of your earlier lab exercises: scope, tools/versions, evidence hashes, findings, and conclusions — explicitly separating facts from inferences and noting one limitation of your analysis.",
                tips: ["Reports must be objective, complete, and reproducible", "Separate fact from opinion; include exculpatory findings", "In testimony, precision and honesty preserve credibility"],
            },
        ],
        Advanced: [
            {
                t: "Anti-Forensics and Counter-Techniques", s: "anti-forensics",
                e: "Sophisticated subjects hide, wipe, and mislead. Recognize anti-forensic techniques and how examiners counter them.",
                sec: [
                    ["How evidence is hidden and destroyed", "Anti-forensics spans data wiping (secure deletion, disk sanitization), encryption and steganography (hiding data inside images or files), timestamp manipulation (timestomping to break timelines), log deletion, and living-off-the-land (using legitimate tools to avoid dropping malware). Recognizing these is half the battle."],
                    ["Detecting manipulation", "Counter-techniques exploit the fact that hiding leaves its own traces: inconsistent timestamps across correlated artifacts betray timestomping, wiping tools leave signatures, and gaps in logs are themselves evidence. Cross-referencing independent sources — a file's registry entry vs its file-system timestamp — exposes tampering the subject didn't think to synchronize."],
                    ["Encryption: the hard limit", "Strong, properly-implemented encryption can be a genuine dead end — no examiner brute-forces AES-256. The realistic paths are elsewhere: keys in a memory capture, passphrases reused or recovered, cloud copies of the same data, or unencrypted derivatives (thumbnails, temp files, backups). Understanding these avenues matters more than fantasies of 'cracking' modern crypto."],
                ],
                ex: "Take a file, alter its timestamps with a timestomping tool on a test system, then investigate: find at least one corroborating artifact whose timestamp contradicts the faked one, demonstrating how correlation exposes manipulation.",
                tips: ["Anti-forensics: wipe, encrypt, hide, timestomp, live off the land", "Hiding leaves traces — correlate independent artifacts", "Modern encryption is a real wall; hunt keys and copies instead"],
            },
            {
                t: "Cloud and Virtualization Forensics", s: "cloud-virtualization-forensics",
                e: "When the evidence lives in someone else's data center, the rules change. Investigating modern distributed systems.",
                sec: [
                    ["The cloud forensics challenge", "Cloud data isn't on a seizable drive — it's distributed, multi-tenant, and controlled by a provider. You often can't image the hardware, jurisdiction is murky, and data may span countries. Investigations rely on provider APIs, logs (CloudTrail, audit logs), and legal process to compel access. The chain of custody extends to the provider's own records."],
                    ["What to collect and how", "Cloud evidence sources: API/audit logs (who did what, when), snapshots of virtual disks, object storage contents, identity and access logs, and configuration history. Acquisition uses provider tooling and APIs rather than write-blockers — so validating and hashing exported data, and documenting the export process, becomes the integrity anchor."],
                    ["Containers and ephemeral infrastructure", "Modern workloads are ephemeral: containers live for minutes, servers autoscale away, and infrastructure is recreated from code. Evidence vanishes fast. Forensics here depends on centralized logging, image registries, and orchestration records captured before resources disappear — you investigate the logs and artifacts, because the 'machine' may no longer exist."],
                ],
                ex: "For a cloud service you can access (or conceptually), identify the forensic evidence sources available: which logs record actions, how you'd snapshot a volume, and how you'd preserve and hash the exported evidence. Note the jurisdictional questions.",
                tips: ["Cloud evidence = provider logs, snapshots, and APIs, not seized disks", "Validate and hash exported data — that's your integrity anchor", "Ephemeral infrastructure vanishes; centralized logging is essential"],
            },
            {
                t: "Advanced Malware and Intrusion Forensics", s: "advanced-intrusion-forensics",
                e: "Reconstruct a full intrusion: how the attacker got in, what they did, and what they took.",
                sec: [
                    ["Root cause and the full story", "Post-breach forensics answers the questions that matter: initial access vector (the patient zero), what the attacker did at each stage, what data was accessed or exfiltrated, and whether they still have access. This reconstruction — mapped to the attack lifecycle — drives both remediation and the honest disclosure the organization owes."],
                    ["Correlating across evidence sources", "Serious intrusions leave scattered traces: endpoint artifacts (prefetch, registry, event logs), memory (injected code, C2 connections), network logs (beaconing, exfil), and cloud/identity logs. The skill is fusing them into one coherent narrative — an artifact on one host corroborated by a network flow and a login record becomes an undeniable finding."],
                    ["Threat actor attribution and IOCs", "Advanced work extracts indicators (hashes, C2 domains, TTPs) and maps behavior to known actors via frameworks like MITRE ATT&CK. Attribution is done carefully — attackers plant false flags — and always hedged appropriately. The practical payoff is defensive: IOCs to hunt with, techniques to detect, and lessons that harden the environment against the next attempt."],
                ],
                ex: "Take a DFIR intrusion challenge (many are public with disk, memory, and network artifacts) and reconstruct the incident: initial access, actions taken, and data impact — citing the specific artifact behind each conclusion.",
                tips: ["Answer: how in, what done, what taken, still present?", "Fuse endpoint + memory + network + identity into one narrative", "Extract IOCs and TTPs; attribute cautiously"],
            },
            {
                t: "Legal Foundations and Ethics", s: "forensics-legal-ethics",
                e: "The law and professional ethics that govern every step — get these wrong and the best analysis is worthless.",
                sec: [
                    ["Authority, warrants, and admissibility", "Evidence gathered without proper legal authority — warrant, consent, or clear policy — is often inadmissible and can expose the investigator to liability. Rules of evidence (relevance, authenticity, reliability) and standards for expert testimony govern what a court will accept. The examiner must understand the legal frame their work lives in, and coordinate with counsel."],
                    ["Privacy, jurisdiction, and proportionality", "Investigations collide with privacy laws (GDPR, India's DPDP Act, wiretap statutes) and cross-border jurisdiction when data lives abroad. Proportionality matters: collect what's relevant to the scope, not everything possible. Over-collection and privacy violations can taint a case and breach the law — even with good intentions."],
                    ["Professional ethics", "The forensic examiner's duty is to the truth, not to whoever pays them. That means objectivity, reporting exculpatory evidence, staying within your competence, maintaining confidentiality, and refusing to shade findings to fit a desired outcome. Integrity is the profession's entire foundation — a single dishonest report ends a career and frees the guilty or convicts the innocent."],
                ],
                ex: "For a hypothetical corporate investigation (suspected data theft by an employee), outline the legal and ethical prerequisites: what authority you'd need, what privacy limits apply, how you'd scope collection proportionally, and one ethical dilemma you might face.",
                tips: ["No proper authority can make evidence inadmissible", "Respect privacy law and jurisdiction; collect proportionally", "The examiner's duty is to the truth — objectivity is everything"],
            },
            {
                t: "Building a Digital Forensics Career", s: "forensics-career",
                e: "Roles, certifications, and the hands-on practice that builds a credible DFIR professional.",
                sec: [
                    ["The roles and where they sit", "Digital forensics careers span law enforcement (criminal investigation), corporate/internal (investigations, e-discovery, insider threat), consulting (incident response for clients), and specialized DFIR within security teams. Adjacent paths include malware analysis and threat intelligence. Demand is strong and growing as everything becomes digital and breaches multiply."],
                    ["Certifications and knowledge base", "Respected certs structure the path: GIAC's GCFE/GCFA (forensic examiner/analyst), vendor certs (Cellebrite for mobile, EnCE for EnCase), and broader security foundations. They validate methodology and tool proficiency — but employers ultimately want examiners who can work a real case soundly, so pair certs with demonstrable hands-on skill."],
                    ["Practice, community, and continuous learning", "Build skills on public forensic images, DFIR CTFs and challenges (many run regularly), and a home lab. Follow the community's blogs and tool releases — the field evolves constantly as devices, encryption, and cloud change. Document your work publicly. The through-line of the whole discipline: methodical rigor, honest reporting, and never stopping learning, because the evidence keeps changing form."],
                ],
                ex: "Plan your entry: pick a forensics role, identify its typical certification and core tools, and design a 90-day hands-on plan — public images to examine, a CTF to attempt, and a documented case write-up to showcase your methodology.",
                tips: ["DFIR spans law enforcement, corporate, consulting, and security", "Certs validate method; hands-on case skill gets you hired", "Practice on public images/CTFs and document your methodology"],
            },
        ],
    },
}
