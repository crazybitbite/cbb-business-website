export const QUANTUM = {
    name: "Quantum Computing",
    palette: ["#8b5cf6", "#06b6d4"],
    kw: "quantum,physics",
    images: ["1635070041078-e363dbe005cb", "1462331940025-496dfbfc7564", "1451187580459-43490279c0fa"],
    levels: {
        Basic: [
            {
                t: "Why Quantum Computing Exists", s: "why-quantum-computing",
                e: "No physics degree required: what quantum computers are, what they're genuinely good at, and what's pure hype.",
                sec: [
                    ["The limits of classical bits", "Classical computers store bits — each definitively 0 or 1 — and some problems scale catastrophically on them. Simulating a molecule with n electrons or searching enormous combinatorial spaces can require exponentially many classical steps: chemistry, materials, optimization, and cryptanalysis all hit this wall."],
                    ["The qubit: superposition intuitively", "A qubit can exist in a combination (superposition) of 0 and 1, described by two complex numbers called amplitudes. Crucially, superposition is not 'both at once' in a usable sense — when measured, a qubit yields a single 0 or 1, with probabilities given by the squared amplitudes. The art of quantum algorithms is choreographing amplitudes so wrong answers cancel and right answers reinforce."],
                    ["What quantum computers will and won't do", "They won't replace laptops, speed up spreadsheets, or 'try everything in parallel'. Proven advantages exist for specific structures: factoring (Shor), unstructured search (Grover, quadratic only), and quantum simulation — likely the first practical win, since simulating quantum systems is what qubits naturally do."],
                ],
                ex: "Write a one-paragraph explanation of superposition for a friend, avoiding the phrase 'both 0 and 1 at the same time'. Then list two problems quantum computers should help with and two they won't.",
                tips: ["Qubits hold amplitudes; measurement yields one classical bit", "Quantum advantage is problem-specific, not general speedup", "Quantum simulation is the most likely first killer app"],
            },
            {
                t: "Qubits, Bloch Sphere, and Measurement", s: "qubits-bloch-measurement",
                e: "Build a working mental model of a single qubit: state vectors, the Bloch sphere, and what measurement does.",
                sec: [
                    ["The state vector", "A qubit state is written |ψ⟩ = α|0⟩ + β|1⟩ where α and β are complex amplitudes with |α|² + |β|² = 1. Measuring gives 0 with probability |α|² and 1 with probability |β|². Example: α = β = 1/√2 is a perfect coin flip — the state produced by a Hadamard gate.", "|ψ⟩ = α|0⟩ + β|1⟩,  |α|² + |β|² = 1\nH|0⟩ = (|0⟩ + |1⟩)/√2   →  P(0) = P(1) = 50%"],
                    ["The Bloch sphere picture", "Every single-qubit state maps to a point on a sphere: |0⟩ at the north pole, |1⟩ at the south, superpositions on the equator. Quantum gates are rotations of this sphere — a picture that makes single-qubit operations geometric instead of algebraic."],
                    ["Measurement changes the state", "Measurement is not a passive peek: it collapses the state to the observed outcome, destroying the superposition. Measure the same qubit twice and the second result always matches the first. This is why quantum algorithms delay measurement until the very end — and why you cannot copy an unknown qubit (the no-cloning theorem)."],
                ],
                ex: "For the state |ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩: verify the amplitudes are normalized, compute the probability of measuring 0 and of measuring 1, and state what the qubit's state is immediately after measuring a 1.",
                tips: ["Probabilities are squared amplitudes", "Gates are rotations on the Bloch sphere", "Measurement collapses — and can't be undone"],
            },
            {
                t: "Quantum Gates and Your First Circuit", s: "quantum-gates-first-circuit",
                e: "The quantum equivalent of logic gates — and the two-gate circuit that creates 'spooky' entanglement.",
                sec: [
                    ["Single-qubit gates", "X flips |0⟩↔|1⟩ (quantum NOT). H (Hadamard) creates equal superposition from |0⟩. Z flips the sign of |1⟩'s amplitude — invisible to immediate measurement but crucial for interference. All gates are reversible, unlike classical AND/OR.", "X|0⟩ = |1⟩\nH|0⟩ = (|0⟩+|1⟩)/√2\nZ(α|0⟩+β|1⟩) = α|0⟩ − β|1⟩"],
                    ["CNOT and entanglement", "CNOT flips a target qubit only when the control is |1⟩. Apply H to one qubit then CNOT to a second, and you get a Bell state: (|00⟩+|11⟩)/√2. Measure either qubit and the other instantly agrees — perfectly correlated outcomes that no classical story of hidden pre-set values can reproduce (Bell's theorem).", "q0: ──H──●──   Bell state:\nq1: ─────X──   (|00⟩ + |11⟩)/√2"],
                    ["Running it for real", "You can run this today: IBM Quantum's free tier executes circuits on real hardware, and Qiskit is the Python SDK. The 4-line circuit below yields roughly half '00' and half '11' — and on real devices, a few '01'/'10' results too. That's noise, the central villain of the field.", 'from qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])'],
                ],
                ex: "Create a free IBM Quantum account, build the Bell circuit in the Composer (H on q0, CNOT q0→q1, measure both), run it on a simulator with 1024 shots, and screenshot the histogram. Explain why 01 and 10 barely appear.",
                tips: ["H makes superposition; CNOT ties qubits together", "Bell states: measure one, know the other", "Real hardware adds noise — expect imperfect histograms"],
            },
            {
                t: "The Math You Actually Need", s: "quantum-math-foundations",
                e: "Just enough linear algebra and complex numbers to read quantum notation confidently — no more, no less.",
                sec: [
                    ["Complex numbers and amplitudes", "Amplitudes are complex numbers (a + bi). What matters for measurement is the magnitude squared: |a + bi|² = a² + b². The phase (the angle in the complex plane) carries no probability by itself but is everything for interference — two amplitudes can cancel only because of relative phase."],
                    ["Vectors and Dirac notation", "A qubit state is a 2-element column vector; |0⟩ = [1,0] and |1⟩ = [0,1]. The 'ket' |ψ⟩ is just notation for that vector. n qubits live in a 2ⁿ-dimensional vector — the exponential growth that makes simulation hard and computation potentially powerful.", "|0⟩ = [1, 0]ᵀ   |1⟩ = [0, 1]ᵀ\n|ψ⟩ = α|0⟩ + β|1⟩ = [α, β]ᵀ"],
                    ["Matrices as gates", "A quantum gate is a matrix that multiplies the state vector. Gates must be unitary (reversible, norm-preserving) — that's the mathematical reason quantum operations are always reversible. Applying a gate is matrix × vector.", "X = [[0,1],[1,0]]   H = (1/√2)[[1,1],[1,-1]]\nX|0⟩ = [[0,1],[1,0]][1,0]ᵀ = [0,1]ᵀ = |1⟩"],
                ],
                ex: "By hand, multiply the Hadamard matrix by |0⟩ and by |1⟩ to confirm H|0⟩ and H|1⟩. Then verify both results are normalized (amplitudes squared sum to 1).",
                tips: ["Probability = |amplitude|²; phase drives interference", "Kets are column vectors; n qubits → 2ⁿ dimensions", "Gates are unitary matrices — hence reversible"],
            },
            {
                t: "Multi-Qubit Systems and Entanglement", s: "quantum-multiqubit-entanglement",
                e: "How qubits combine, why the state space explodes, and what entanglement really means.",
                sec: [
                    ["The tensor product", "Combining qubits multiplies their state spaces: two qubits have 4 basis states (|00⟩,|01⟩,|10⟩,|11⟩), three have 8, n have 2ⁿ. This exponential scaling is why classically simulating 50+ qubits is infeasible — the vector has over a quadrillion entries."],
                    ["Separable vs entangled", "Some multi-qubit states factor into independent single-qubit states (separable); entangled states cannot be described qubit-by-qubit at all. The Bell state (|00⟩+|11⟩)/√2 has no 'qubit 0 state' on its own — the information lives in the correlation, not the parts."],
                    ["Entanglement is a resource", "Entanglement powers teleportation, superdense coding, and the speedups in quantum algorithms — but it can't send information faster than light (measurement outcomes are random locally). It's correlation stronger than any classical system allows, which Bell test experiments have confirmed and which won the 2022 Nobel Prize in Physics."],
                ],
                ex: "Show that |00⟩ is separable by writing it as (|0⟩)⊗(|0⟩), then argue why (|00⟩+|11⟩)/√2 cannot be written as (a|0⟩+b|1⟩)⊗(c|0⟩+d|1⟩) for any a,b,c,d.",
                tips: ["n qubits → 2ⁿ amplitudes: the exponential wall", "Entangled states don't factor into per-qubit states", "Entanglement is a resource, but transmits no signal alone"],
            },
        ],
        Intermediate: [
            {
                t: "Quantum Algorithms I: Deutsch-Jozsa and Grover", s: "deutsch-jozsa-grover",
                e: "The first algorithms that provably beat classical computers — and the interference trick they share.",
                sec: [
                    ["Interference is the engine", "Every quantum speedup follows one recipe: spread amplitude across many computational paths in superposition, arrange phases so paths to wrong answers cancel (destructive interference) and paths to right answers add up, then measure. No algorithm 'checks all answers and picks the best' — that's the most common misconception in the field."],
                    ["Deutsch-Jozsa: the proof of concept", "Given a function promised to be either constant (same output always) or balanced (half 0s, half 1s), classically you may need 2ⁿ⁻¹+1 evaluations. Deutsch-Jozsa decides it in exactly one quantum evaluation: H gates on all qubits, one oracle call, H again — measure all-zeros means constant, anything else means balanced. Useless in practice, historic in significance: the first exponential separation."],
                    ["Grover: quadratic search speedup", "Finding a marked item among N unsorted possibilities takes ~N/2 classical checks; Grover finds it in ~√N iterations. Each iteration flips the marked item's phase then reflects all amplitudes about their average, ratcheting probability toward the target. Quadratic, not exponential — a million items needs ~1000 iterations, and it degrades gracefully if over-rotated.", "Grover iterations ≈ (π/4)·√N\nN = 1,000,000 → ~785 iterations vs ~500,000 classical checks"],
                ],
                ex: "For a 4-item Grover search (2 qubits), work through one iteration by hand starting from equal superposition (all amplitudes ½), marking item |10⟩: apply the phase flip, then inversion about the mean, and show the amplitude of |10⟩ afterward.",
                tips: ["Speedups come from interference, not parallel checking", "Deutsch-Jozsa: 1 query vs exponentially many", "Grover is quadratic — powerful, not magic"],
            },
            {
                t: "Shor's Algorithm and the Threat to Cryptography", s: "shors-algorithm-cryptography",
                e: "Why one 1994 algorithm made governments plan a migration of the world's cryptography.",
                sec: [
                    ["Factoring is the foundation of RSA", "RSA security rests on one asymmetry: multiplying two large primes is instant, but recovering them from the product is classically infeasible — the best known algorithms are super-polynomial, and a 2048-bit key would take longer than the universe's age. Shor's algorithm factors in polynomial time, breaking that asymmetry completely."],
                    ["How Shor works, structurally", "Shor reduces factoring to period-finding: pick a random a, and finding the period r of f(x) = aˣ mod N yields the factors with high probability. The quantum core is the Quantum Fourier Transform, which extracts that period from a massive superposition in one interference step. Everything else is classical pre/post-processing — the QFT does the impossible part."],
                    ["Harvest now, decrypt later — and PQC", "Breaking RSA-2048 needs millions of high-quality qubits (today's machines: hundreds to thousands, noisy) — but adversaries can record encrypted traffic today and decrypt when hardware arrives. That's why NIST standardized post-quantum cryptography in 2024: ML-KEM (Kyber) for key exchange and ML-DSA (Dilithium) for signatures, both based on lattice problems believed hard even for quantum computers. Migration is underway now."],
                ],
                ex: "Do Shor's classical part by hand for N=15, a=7: compute 7^x mod 15 for x = 1..6, find the period r, then use gcd(a^(r/2) ± 1, N) to recover the factors 3 and 5.",
                tips: ["Shor turns factoring into period-finding via the QFT", "'Harvest now, decrypt later' makes the threat current", "Post-quantum crypto (ML-KEM/ML-DSA) is already standardized"],
            },
            {
                t: "Programming Real Quantum Hardware with Qiskit", s: "programming-with-qiskit",
                e: "From circuit diagrams to Python: build, simulate, and run circuits on IBM's actual quantum processors.",
                sec: [
                    ["Circuits as code", "Qiskit mirrors the circuit model directly: create a QuantumCircuit, apply gates as method calls, and measure. The simulator gives you ideal, noise-free results for validating logic before touching hardware.", 'from qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\n\nqc = QuantumCircuit(3, 3)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(1, 2)          # 3-qubit GHZ state\nqc.measure(range(3), range(3))\n\nresult = AerSimulator().run(qc, shots=1000).result()\nprint(result.get_counts())   # ~{"000": 500, "111": 500}'],
                    ["Transpilation: your circuit vs the chip", "Real devices support only a small native gate set and limited qubit connectivity — your CNOT between distant qubits becomes a chain of SWAPs. The transpiler rewrites your circuit for the target chip; optimization_level=3 works hardest. Depth after transpilation is the number that determines whether noise eats your result."],
                    ["Noise, error mitigation, and reading results", "Every gate has an error rate (~0.1–1%) and qubits decohere in microseconds, so deep circuits decay toward random noise. Practical mitigations: fewer two-qubit gates, dynamical decoupling, measurement-error mitigation, and running many shots. Full error correction — thousands of physical qubits per logical qubit — is the field's current summit."],
                ],
                ex: "Install qiskit and qiskit-aer, build the 3-qubit GHZ circuit, simulate it, then transpile it for a fake 127-qubit backend (FakeBrisbane) at optimization levels 0 and 3, and compare the resulting circuit depths.",
                tips: ["Simulate first — hardware time is precious", "Transpiled depth predicts how much noise you'll suffer", "Two-qubit gates are ~10× noisier than single-qubit ones"],
            },
            {
                t: "The Quantum Fourier Transform and Phase Estimation", s: "quantum-fourier-phase-estimation",
                e: "The two subroutines at the heart of the most powerful quantum algorithms, explained by what they do.",
                sec: [
                    ["What the QFT does", "The Quantum Fourier Transform is the quantum analogue of the discrete Fourier transform — it moves information between the 'computational' basis and the 'frequency' basis. Its magic is efficiency: it acts on all 2ⁿ amplitudes with only ~n² gates, exponentially fewer than the classical FFT's n·2ⁿ operations. It never outputs the frequencies directly, but it makes periodic structure measurable."],
                    ["Phase kickback", "Many algorithms exploit a trick: a controlled operation can 'kick' a phase from the target qubit back onto the control. This is how information about an operator's eigenvalue gets written into qubits you can measure — the mechanism beneath phase estimation and Shor's period-finding."],
                    ["Quantum phase estimation", "QPE estimates the phase (eigenvalue angle) of a unitary applied to an eigenstate, writing it into a register of counting qubits via controlled applications and an inverse QFT. It's the workhorse subroutine: Shor's algorithm, quantum chemistry energy estimation, and more are QPE in disguise. More counting qubits = more precision."],
                ],
                ex: "Explain in your own words why the QFT is used to find periods rather than to read out amplitudes directly. Then, conceptually, describe what the counting register holds after phase estimation on a unitary with eigenphase 0.25.",
                tips: ["QFT exposes periodic/frequency structure efficiently", "Phase kickback writes eigenvalue info onto measurable qubits", "Phase estimation is the reusable core of Shor and chemistry"],
            },
            {
                t: "Quantum Software Ecosystem and Simulators", s: "quantum-software-ecosystem",
                e: "The practical toolbox: SDKs, simulators, and how to develop quantum software productively today.",
                sec: [
                    ["The SDK landscape", "Qiskit (IBM) is the most widely taught; Cirq (Google), PennyLane (quantum ML and differentiable circuits), and Amazon Braket (multi-hardware) round out the field. They share the circuit model, so skills transfer. PennyLane is especially strong for variational/ML work with autodiff."],
                    ["Simulators are where you live", "You'll spend far more time on simulators than hardware. Statevector simulators give exact, noise-free results up to ~30 qubits on a laptop; noise-model simulators reproduce a real device's error rates so you can predict hardware behavior before queuing. Use exact sims to validate logic, noisy sims to set expectations.", 'from qiskit_aer import AerSimulator\nfrom qiskit_aer.noise import NoiseModel\n# ideal:\nAerSimulator()\n# realistic: build a NoiseModel from a real backend'],
                    ["A productive workflow", "Develop iteratively: write the circuit, verify on a statevector simulator, add a realistic noise model to gauge feasibility, minimize depth via transpilation, then run on hardware only when the simulated results justify the queue time. Version your circuits and record shots, backend, and calibration data — quantum results aren't reproducible without them."],
                ],
                ex: "Using Qiskit, run the Bell circuit three ways: statevector simulator (exact), AerSimulator with a noise model derived from a fake backend, and compare the histograms. Quantify how much noise shifted the results.",
                tips: ["Circuit-model skills transfer across all SDKs", "Exact sims validate logic; noisy sims predict hardware", "Record backend + shots + calibration for reproducibility"],
            },
        ],
        Advanced: [
            {
                t: "Quantum Error Correction: From Noisy to Logical Qubits", s: "quantum-error-correction",
                e: "The engineering summit of the field: how thousands of fragile qubits become one reliable one.",
                sec: [
                    ["Why classical redundancy fails", "You can't copy a qubit (no-cloning) and you can't measure it without destroying superposition — so 'store three copies and vote' is impossible directly. QEC's insight: encode one logical qubit across many physical qubits and measure only stabilizers — parity-like observables that reveal errors without revealing (or disturbing) the encoded data."],
                    ["The surface code", "The leading scheme arranges qubits on a 2D grid where each plaquette's stabilizer is repeatedly measured; error chains show up as syndrome patterns that a classical decoder matches and corrects. Its virtues: needs only nearest-neighbor interactions and tolerates ~1% physical error rates. Its cost: roughly a thousand physical qubits per logical qubit at useful error rates."],
                    ["The threshold theorem and the roadmap", "If physical error rates sit below the code's threshold, adding more qubits suppresses logical errors exponentially — that theorem is why the field believes scaling works at all. Milestones are arriving: demonstrations that bigger code distances yield lower logical error rates (Google 2023-24) mark the transition from 'NISQ era' noisy devices toward fault tolerance. Watch logical qubit counts, not raw qubit counts."],
                ],
                ex: "Work through the 3-qubit bit-flip code by hand: encode |ψ⟩ = α|0⟩+β|1⟩ as α|000⟩+β|111⟩, apply an X error to qubit 2, compute the two parity syndromes (Z₁Z₂ and Z₂Z₃), and show how the syndrome identifies which qubit to fix without measuring the data.",
                tips: ["Stabilizers detect errors without reading data", "Surface code: ~1000 physical → 1 logical qubit", "Below threshold, more qubits = exponentially fewer errors"],
            },
            {
                t: "Variational Algorithms: VQE and QAOA on Today's Hardware", s: "variational-algorithms-vqe-qaoa",
                e: "The hybrid quantum-classical approach designed for noisy devices — chemistry and optimization without error correction.",
                sec: [
                    ["The hybrid loop", "Variational algorithms split the work: a shallow parameterized quantum circuit prepares a trial state and measures an expectation value; a classical optimizer adjusts the parameters; repeat. Shallow circuits survive noise, making this the dominant paradigm for near-term hardware."],
                    ["VQE for quantum chemistry", "The Variational Quantum Eigensolver estimates molecular ground-state energies: map the molecule's Hamiltonian to qubit operators, prepare a parameterized ansatz, and minimize the measured energy — the variational principle guarantees you approach from above. H₂ and LiH have been solved on real devices; the open question is whether VQE beats classical methods on molecules that matter before error correction arrives.", "E(θ) = ⟨ψ(θ)| H |ψ(θ)⟩ ≥ E_ground\nminimize E(θ) over circuit parameters θ"],
                    ["QAOA and the honest caveats", "QAOA attacks combinatorial optimization (MaxCut, scheduling) by alternating problem-Hamiltonian and mixing layers p times — deeper p approximates the optimum better but costs noise. Honest state of play: barren plateaus (gradients vanishing exponentially with size) and strong classical competition mean neither VQE nor QAOA has demonstrated practical advantage yet. Learn them as the vocabulary of near-term research, not as solved victories."],
                ],
                ex: "Using Qiskit's optimization module (or by hand for a 4-node graph), formulate MaxCut as a cost Hamiltonian, build a p=1 QAOA circuit, and sweep the two parameters (γ, β) on a simulator to plot the expected cut value landscape.",
                tips: ["Shallow variational circuits are noise-resilient by design", "VQE bounds ground-state energy from above", "Barren plateaus are the field's hardest open scaling problem"],
            },
            {
                t: "The Quantum Landscape: Hardware, Players, and Career Paths", s: "quantum-landscape-careers",
                e: "A clear-eyed map of the industry: competing hardware platforms, realistic timelines, and how to position yourself.",
                sec: [
                    ["Competing qubit technologies", "Superconducting circuits (IBM, Google): fast gates, microsecond coherence, dilution refrigerators. Trapped ions (IonQ, Quantinuum): slower but higher fidelity and all-to-all connectivity. Neutral atoms (QuEra, Pasqal): rapid scaling of qubit counts. Photonics (PsiQuantum): room-temperature ambitions, betting everything on fault tolerance. No platform has won; each trades speed, fidelity, connectivity, and scalability differently."],
                    ["Reading the roadmaps skeptically", "Vendor announcements measure different things: qubit count says little without fidelity and connectivity; 'quantum utility' ≠ 'quantum advantage' ≠ 'commercial value'. The metrics that matter: two-qubit gate fidelity (want 99.9%+), logical qubit demonstrations, and error-corrected operation depth. Consensus timeline for commercially valuable fault-tolerant machines: 2030s, with genuine uncertainty in both directions."],
                    ["Where the jobs actually are", "The field hires more software than physics: quantum SDK engineering, compiler/transpiler development, error-correction decoders (classical algorithms!), algorithm research, and application benchmarking. A strong path: master linear algebra + Python + Qiskit/Cirq, contribute to open-source quantum tooling, and specialize in one application domain (chemistry, optimization, or cryptography migration)."],
                ],
                ex: "Pick two hardware platforms and write a one-page comparison for a CTO: gate fidelity, coherence, connectivity, scaling story, and one risk each. End with a recommendation for which to run a 2-year pilot on and why.",
                tips: ["No qubit technology has won — track fidelity, not counts", "Logical qubits are the milestone that matters", "Quantum careers are mostly software careers"],
            },
            {
                t: "Quantum Machine Learning and Optimization Applications", s: "quantum-ml-applications",
                e: "Where quantum computing meets AI and industry problems — the promise, the methods, and the honest caveats.",
                sec: [
                    ["Quantum machine learning approaches", "QML spans several ideas: quantum kernels that map data into high-dimensional Hilbert space for classification, variational quantum circuits as trainable models, and quantum-enhanced sampling. PennyLane makes circuits differentiable so they train with the same gradient descent as neural nets. The honest status: no proven advantage over classical ML on real data yet — it's an active research frontier, not a deployable edge."],
                    ["Optimization in the wild", "Portfolio optimization, logistics routing, and scheduling map naturally to QAOA and quantum annealing (D-Wave's approach). Companies run pilots today, but classical solvers remain competitive or better on most real instances. The value now is capability-building and problem formulation experience, positioning for when hardware matures."],
                    ["Reading claims critically", "The field is noisy with hype. A rigorous check for any 'quantum advantage' claim: Is the classical baseline state-of-the-art (not a strawman)? Does the advantage survive at problem sizes that matter? Is it demonstrated on hardware or only in theory? Healthy skepticism plus genuine enthusiasm is the professional's stance."],
                ],
                ex: "Pick one industry (finance, logistics, or pharma) and write a realistic one-page brief: which quantum method applies, what the current classical baseline is, and an honest assessment of whether/when quantum could help.",
                tips: ["QML is a research frontier, not a deployable edge yet", "Optimization pilots build capability; classical still wins mostly", "Always demand a strong classical baseline before believing advantage"],
            },
            {
                t: "Quantum Cryptography and the Security Transition", s: "quantum-cryptography-security",
                e: "The two-sided coin: quantum computers break some cryptography and enable a new, physically-secure kind.",
                sec: [
                    ["Quantum key distribution", "QKD (e.g., the BB84 protocol) uses quantum mechanics to detect eavesdropping physically: measuring a qubit disturbs it, so an interceptor leaves traces. It provides information-theoretic security for key exchange — already deployed in some banking and government links over fiber and even satellite, though limited by distance and cost."],
                    ["The threat side, precisely", "Shor's algorithm breaks RSA and elliptic-curve cryptography (public-key); Grover's weakens symmetric ciphers only quadratically, fixable by doubling key sizes (AES-256 stays safe). So the crisis is specifically public-key: key exchange and digital signatures — the backbone of TLS, code signing, and certificates."],
                    ["Migrating to post-quantum crypto", "The practical response is software, not exotic hardware: NIST's standardized algorithms (ML-KEM/Kyber for key exchange, ML-DSA/Dilithium and SLH-DSA/SPHINCS+ for signatures) run on classical computers and resist quantum attack. Organizations should inventory their cryptography, prioritize long-lived secrets against 'harvest now, decrypt later', and adopt crypto-agility so algorithms can be swapped as standards evolve."],
                ],
                ex: "Audit a system you know (a website, an app): list where it uses public-key crypto (TLS, signatures, tokens), classify each by how long its secrets must stay safe, and draft a prioritized post-quantum migration order.",
                tips: ["QKD detects eavesdropping via physics — but is distance-limited", "Quantum breaks public-key; symmetric just needs bigger keys", "Post-quantum crypto is a software migration to start now"],
            },
        ],
    },
}
