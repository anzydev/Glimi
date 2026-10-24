// 100 Realistic International Developer Profiles for Glimi Testing

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1525130413817-d45c1d127c42?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&auto=format&fit=crop&q=80",
];

export function getAvatar(i) {
  return AVATARS[i % AVATARS.length];
}

// 100 Rich International Developers
export const DEVELOPERS_DATA = [
  // 1. Rust / Distributed Systems
  {
    username: "marcus-vance",
    name: "Marcus Vance",
    bio: "Systems architect specializing in low-latency async network protocols and distributed Raft consensus engines in Rust.",
    location: "Seattle, WA, USA",
    company: "Apex Distributed Labs",
    website: "https://marcusvance.tech",
    intents: ["side-projects", "open-source"],
    time_commitment: "part-time",
    timezones: ["UTC-7", "UTC-8"],
    contact_preference: "in-app",
    summary_ai: "Experienced Rust systems architect with deep expertise in asynchronous networking, Raft consensus, and zero-allocation serialization.",
    skills: [
      { name: "Rust", category: "language", evidence_type: "verified", repo_count: 12, primary_language: true, evidence_summary: "Backed by 12 repositories including tokio-raft and zero-copy-buffer" },
      { name: "Distributed Systems", category: "tool", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "Author of async Raft consensus engine" },
      { name: "C++", category: "language", evidence_type: "reported", repo_count: 4, primary_language: false, evidence_summary: "Low latency audio and memory mapping" },
      { name: "Tokio", category: "framework", evidence_type: "verified", repo_count: 9, primary_language: false, evidence_summary: "Multi-threaded async actors and stream handling" },
    ],
    repositories: [
      { name: "tokio-raft", description: "Async Raft consensus implementation in Rust with zero-copy network serialization", language: "Rust", stars_count: 245, forks_count: 32, topics: ["rust", "raft", "distributed-systems", "tokio"] },
      { name: "turbo-channel", description: "High-throughput lock-free ring buffer channel for inter-thread message passing", language: "Rust", stars_count: 112, forks_count: 14, topics: ["concurrency", "lock-free", "ring-buffer"] },
    ],
  },
  // 2. Fullstack AI & Next.js
  {
    username: "chloe-bennett",
    name: "Chloe Bennett",
    bio: "Product engineer building interactive generative AI interfaces, streaming canvas apps, and realtime multiplayer tools.",
    location: "London, UK",
    company: "Synthetix Studio",
    website: "https://chloebennett.dev",
    intents: ["hackathons", "side-projects"],
    time_commitment: "weekends",
    timezones: ["UTC+0", "UTC+1"],
    contact_preference: "in-app",
    summary_ai: "Product-focused fullstack engineer skilled in Next.js 15, streaming UI, and generative AI agent workflows.",
    skills: [
      { name: "TypeScript", category: "language", evidence_type: "verified", repo_count: 15, primary_language: true, evidence_summary: "15 repositories with strict typing and modern tooling" },
      { name: "Next.js", category: "framework", evidence_type: "verified", repo_count: 11, primary_language: false, evidence_summary: "Production App Router, React Server Components, and edge streaming" },
      { name: "Python", category: "language", evidence_type: "reported", repo_count: 5, primary_language: false, evidence_summary: "FastAPI endpoints and LangChain orchestration" },
      { name: "TailwindCSS", category: "tool", evidence_type: "verified", repo_count: 12, primary_language: false, evidence_summary: "Complex accessible component design systems" },
    ],
    repositories: [
      { name: "canvas-flow", description: "Infinite collaborative whiteboard with real-time vector canvas and generative layout assistance", language: "TypeScript", stars_count: 380, forks_count: 45, topics: ["nextjs", "react", "whiteboard", "canvas"] },
      { name: "stream-agent-ui", description: "Composable React components for generative AI chat and tool call visualization", language: "TypeScript", stars_count: 195, forks_count: 22, topics: ["ai", "streaming", "react-components"] },
    ],
  },
  // 3. Cloud Native & Kubernetes Go
  {
    username: "lucas-chen-dev",
    name: "Lucas Chen",
    bio: "Platform engineer obsessed with Kubernetes operators, eBPF network observability, and cloud cost governance.",
    location: "Toronto, Canada",
    company: "CloudScale Infrastructure",
    website: "https://lucaschen.cloud",
    intents: ["open-source", "side-projects"],
    time_commitment: "part-time",
    timezones: ["UTC-5", "UTC-4"],
    contact_preference: "github",
    summary_ai: "Go platform engineer with deep experience in Kubernetes custom resource controllers and eBPF kernel tracing.",
    skills: [
      { name: "Go", category: "language", evidence_type: "verified", repo_count: 14, primary_language: true, evidence_summary: "Backed by 14 repositories including k8s-cost-watcher and grpc-mesh" },
      { name: "Kubernetes", category: "tool", evidence_type: "verified", repo_count: 8, primary_language: false, evidence_summary: "Custom Resource Definitions, controllers, and Helm charts" },
      { name: "Docker", category: "tool", evidence_type: "verified", repo_count: 12, primary_language: false, evidence_summary: "Multi-stage distroless container builds" },
      { name: "PostgreSQL", category: "database", evidence_type: "reported", repo_count: 5, primary_language: false, evidence_summary: "High-volume metric storage and indexing" },
    ],
    repositories: [
      { name: "k8s-cost-watcher", description: "Kubernetes operator that predicts cloud egress costs and scales down idle clusters", language: "Go", stars_count: 420, forks_count: 58, topics: ["kubernetes", "finops", "operator", "go"] },
      { name: "bpf-traffic-trace", description: "Kernel-level HTTP/2 and gRPC latency tracer using eBPF and Go", language: "Go", stars_count: 210, forks_count: 31, topics: ["ebpf", "networking", "observability"] },
    ],
  },
  // 4. Data Engineering & High-throughput Pipelines
  {
    username: "maya-patel-cloud",
    name: "Maya Patel",
    bio: "Data architect building real-time stream processing pipelines, ClickHouse analytical stores, and Kafka event buses.",
    location: "Bengaluru, India",
    company: "DataNode Global",
    website: "https://mayapatel.tech",
    intents: ["hackathons", "pairing", "side-projects"],
    time_commitment: "flexible",
    timezones: ["UTC+5:30"],
    contact_preference: "in-app",
    summary_ai: "Backend and data engineer specializing in Kafka distributed log streaming, ClickHouse analytics, and Go ETL services.",
    skills: [
      { name: "Go", category: "language", evidence_type: "verified", repo_count: 9, primary_language: true, evidence_summary: "9 repositories in stream processing and consumer workers" },
      { name: "Kafka", category: "tool", evidence_type: "verified", repo_count: 6, primary_language: false, evidence_summary: "Partition rebalancing, schema registry, and exactly-once semantics" },
      { name: "ClickHouse", category: "database", evidence_type: "verified", repo_count: 4, primary_language: false, evidence_summary: "Petabyte-scale time-series analytics and materialized views" },
      { name: "Python", category: "language", evidence_type: "reported", repo_count: 7, primary_language: false, evidence_summary: "Data validation pipelines with Pydantic and Polars" },
    ],
    repositories: [
      { name: "clickhouse-sinker-go", description: "Sub-second batch consumer streaming Kafka events directly into ClickHouse tables", language: "Go", stars_count: 315, forks_count: 42, topics: ["clickhouse", "kafka", "data-engineering", "go"] },
      { name: "lakehouse-router", description: "Smart query dispatcher routing transactional writes to Postgres and analytics to ClickHouse", language: "Go", stars_count: 178, forks_count: 19, topics: ["databases", "routing", "analytics"] },
    ],
  },
  // 5. Mobile Architect React Native & iOS
  {
    username: "liam-oc",
    name: "Liam O'Connor",
    bio: "Mobile engineer crafting fluid 60fps animations, native iOS bridges, and offline-first state synchronization.",
    location: "Dublin, Ireland",
    company: "Pulse Mobility",
    website: "https://liamoconnor.ie",
    intents: ["side-projects", "open-source"],
    time_commitment: "part-time",
    timezones: ["UTC+0", "UTC+1"],
    contact_preference: "in-app",
    summary_ai: "Mobile architect experienced in React Native New Architecture, Swift native modules, and gesture spring physics.",
    skills: [
      { name: "React Native", category: "framework", evidence_type: "verified", repo_count: 11, primary_language: true, evidence_summary: "Published libraries for gesture navigation and audio synthesis" },
      { name: "Swift", category: "language", evidence_type: "verified", repo_count: 6, primary_language: false, evidence_summary: "CoreAudio and Metal shaders bridged to React Native" },
      { name: "TypeScript", category: "language", evidence_type: "verified", repo_count: 14, primary_language: false, evidence_summary: "Strict offline-first state synchronization models" },
      { name: "Kotlin", category: "language", evidence_type: "reported", repo_count: 3, primary_language: false, evidence_summary: "Android foreground services and BLE bridges" },
    ],
    repositories: [
      { name: "fluid-spring-gestures", description: "Physics-based gesture spring interaction library for mobile React Native applications", language: "TypeScript", stars_count: 512, forks_count: 63, topics: ["react-native", "gestures", "physics", "mobile"] },
      { name: "react-native-metal-canvas", description: "Hardware-accelerated Apple Metal graphics canvas for React Native", language: "Swift", stars_count: 189, forks_count: 24, topics: ["metal", "ios", "react-native-turbo-module"] },
    ],
  },
  // 6. Security, Zero Knowledge & Cryptography
  {
    username: "henrik-lind",
    name: "Henrik Lindqvist",
    bio: "Security researcher & cryptographic protocol developer. Working on zero-knowledge SNARKs and verifiable computation.",
    location: "Stockholm, Sweden",
    company: "ZeroProof Security",
    website: "https://henriklindqvist.se",
    intents: ["open-source", "hackathons"],
    time_commitment: "weekends",
    timezones: ["UTC+1", "UTC+2"],
    contact_preference: "github",
    summary_ai: "Cryptographic engineer specialized in Rust zero-knowledge proving systems, secure enclaves, and protocol auditing.",
    skills: [
      { name: "Rust", category: "language", evidence_type: "verified", repo_count: 10, primary_language: true, evidence_summary: "ZK-circuit generation and curve arithmetic libraries" },
      { name: "Cryptography", category: "tool", evidence_type: "verified", repo_count: 6, primary_language: false, evidence_summary: "Plonk, Groth16, and polynomial commitment schemes" },
      { name: "C", category: "language", evidence_type: "reported", repo_count: 5, primary_language: false, evidence_summary: "Assembly-optimized field multiplication algorithms" },
      { name: "TypeScript", category: "language", evidence_type: "learning", repo_count: 3, primary_language: false, evidence_summary: "Client-side proving in WebAssembly runtimes" },
    ],
    repositories: [
      { name: "snark-eval-rs", description: "Modular Groth16 prover and verifier with AVX-512 vector acceleration", language: "Rust", stars_count: 290, forks_count: 38, topics: ["cryptography", "zero-knowledge", "zk-snarks", "rust"] },
      { name: "wasm-zk-auth", description: "Browser-side zero-knowledge proof generator for privacy-preserving authentication", language: "Rust", stars_count: 140, forks_count: 18, topics: ["wasm", "privacy", "auth"] },
    ],
  },
  // 7. Fullstack Python & PyTorch ML
  {
    username: "sofia-rossi-sys",
    name: "Sofia Rossi",
    bio: "Machine learning engineer focused on open-source LLM fine-tuning, retrieval-augmented generation, and model quantization.",
    location: "Milan, Italy",
    company: "NeuroScale Lab",
    website: "https://sofiarossi.ai",
    intents: ["hackathons", "side-projects"],
    time_commitment: "flexible",
    timezones: ["UTC+1", "UTC+2"],
    contact_preference: "in-app",
    summary_ai: "AI/ML engineer with deep experience in PyTorch model distillation, vLLM inference optimization, and multi-modal embeddings.",
    skills: [
      { name: "Python", category: "language", evidence_type: "verified", repo_count: 18, primary_language: true, evidence_summary: "18 repositories across neural models, data pipelines, and APIs" },
      { name: "PyTorch", category: "framework", evidence_type: "verified", repo_count: 10, primary_language: false, evidence_summary: "LoRA fine-tuning, custom loss functions, and distributed training" },
      { name: "FastAPI", category: "framework", evidence_type: "verified", repo_count: 8, primary_language: false, evidence_summary: "Low-latency asynchronous inference microservices" },
      { name: "Docker", category: "tool", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "NVIDIA CUDA runtime container deployments" },
    ],
    repositories: [
      { name: "quant-stream-llm", description: "Ultra-low latency 4-bit streaming inference server with speculative decoding", language: "Python", stars_count: 670, forks_count: 85, topics: ["llm", "pytorch", "vllm", "inference"] },
      { name: "agent-rag-toolkit", description: "Evaluation harness for RAG citation accuracy and semantic drift detection", language: "Python", stars_count: 230, forks_count: 34, topics: ["rag", "nlp", "evaluation", "python"] },
    ],
  },
  // 8. Systems C++ & Graphics Vulkan
  {
    username: "kenji-systems",
    name: "Kenji Sato",
    bio: "Graphics engine programmer building real-time ray tracing renderers, spatial audio pipelines, and WebGPU compute shaders.",
    location: "Tokyo, Japan",
    company: "Vertex Engine Works",
    website: "https://kenjisato.dev",
    intents: ["open-source", "side-projects"],
    time_commitment: "part-time",
    timezones: ["UTC+9"],
    contact_preference: "github",
    summary_ai: "Graphics programmer specializing in Vulkan 1.3, WebGPU compute pipelines, and hardware-accelerated BVH ray tracing.",
    skills: [
      { name: "C++", category: "language", evidence_type: "verified", repo_count: 14, primary_language: true, evidence_summary: "Modern C++20 game engine architecture and memory managers" },
      { name: "Vulkan", category: "tool", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "Hardware ray tracing acceleration pipelines and descriptor indexing" },
      { name: "Rust", category: "language", evidence_type: "reported", repo_count: 4, primary_language: false, evidence_summary: "WebGPU shader compilation tooling" },
      { name: "GLSL", category: "language", evidence_type: "verified", repo_count: 8, primary_language: false, evidence_summary: "Physically based atmospheric scattering shaders" },
    ],
    repositories: [
      { name: "lumina-vk", description: "Lightweight physically-based path tracer written in modern C++20 and Vulkan 1.3", language: "C++", stars_count: 490, forks_count: 52, topics: ["vulkan", "ray-tracing", "graphics", "cpp20"] },
      { name: "webgpu-particles-compute", description: "Compute-shader based 1,000,000 particle simulation running in Chrome WebGPU", language: "TypeScript", stars_count: 215, forks_count: 28, topics: ["webgpu", "shaders", "particles"] },
    ],
  },
  // 9. Fullstack Elixir & Realtime Phoenix
  {
    username: "camila-silva-ml",
    name: "Camila Silva",
    bio: "Distributed systems engineer building fault-tolerant concurrent services with Elixir, Phoenix LiveView, and OTP supervision trees.",
    location: "São Paulo, Brazil",
    company: "HexStream Technologies",
    website: "https://camilasilva.tech",
    intents: ["side-projects", "pairing"],
    time_commitment: "weekends",
    timezones: ["UTC-3"],
    contact_preference: "in-app",
    summary_ai: "Elixir and OTP architect with deep expertise in highly concurrent realtime backends, WebSockets, and distributed clustering.",
    skills: [
      { name: "Elixir", category: "language", evidence_type: "verified", repo_count: 12, primary_language: true, evidence_summary: "Backed by 12 repositories leveraging OTP GenServers and supervision trees" },
      { name: "Phoenix", category: "framework", evidence_type: "verified", repo_count: 9, primary_language: false, evidence_summary: "LiveView interactive dashboards and presence clustering" },
      { name: "PostgreSQL", category: "database", evidence_type: "verified", repo_count: 6, primary_language: false, evidence_summary: "Ecto multi-tenant schema migrations" },
      { name: "Docker", category: "tool", evidence_type: "reported", repo_count: 5, primary_language: false, evidence_summary: "Fly.io distributed cluster deployment configs" },
    ],
    repositories: [
      { name: "phoenix-multiplayer-mesh", description: "Realtime presence and state synchronization engine using Phoenix Channels and libcluster", language: "Elixir", stars_count: 280, forks_count: 35, topics: ["elixir", "phoenix", "realtime", "otp"] },
      { name: "ecto-partition-helper", description: "Automated table partitioning and index rotation for high-volume PostgreSQL events in Ecto", language: "Elixir", stars_count: 145, forks_count: 16, topics: ["ecto", "postgres", "partitioning"] },
    ],
  },
  // 10. Cyber Security & AppSec
  {
    username: "amara-okafor-sec",
    name: "Amara Okafor",
    bio: "Application security engineer, penetration tester, and bug bounty hunter. Building automated SAST and dependency vulnerability scanners.",
    location: "Lagos, Nigeria",
    company: "CyberShield West Africa",
    website: "https://amaraokafor.io",
    intents: ["open-source", "hackathons"],
    time_commitment: "flexible",
    timezones: ["UTC+1"],
    contact_preference: "email",
    summary_ai: "AppSec specialist skilled in static code vulnerability analysis, OAuth2/OIDC threat modeling, and Go security tooling.",
    skills: [
      { name: "Python", category: "language", evidence_type: "verified", repo_count: 11, primary_language: true, evidence_summary: "AST-based taint analysis and automated exploit generation" },
      { name: "Go", category: "language", evidence_type: "verified", repo_count: 6, primary_language: false, evidence_summary: "Fast network reconnaissance and port scanning tools" },
      { name: "Docker", category: "tool", evidence_type: "verified", repo_count: 8, primary_language: false, evidence_summary: "Isolated vulnerability sandbox environments" },
      { name: "Kubernetes", category: "tool", evidence_type: "reported", repo_count: 3, primary_language: false, evidence_summary: "Cluster security auditing and RBAC validation" },
    ],
    repositories: [
      { name: "sast-ast-scanner", description: "Static analysis engine detecting SQL injection and prototype pollution in TypeScript ASTs", language: "Python", stars_count: 390, forks_count: 48, topics: ["security", "sast", "vulnerability-scanner", "appsec"] },
      { name: "jwt-sentinel", description: "Command-line tool testing JWT signature bypasses and weak secret dictionary attacks", language: "Go", stars_count: 195, forks_count: 27, topics: ["jwt", "auth", "security-tools"] },
    ],
  },
];

// Helper to expand and generate full 100 developers
const FIRST_NAMES = [
  "Marcus", "Chloe", "Lucas", "Maya", "Liam", "Henrik", "Sofia", "Kenji", "Camila", "Amara",
  "Devon", "Aria", "Mateo", "Priya", "Nikolai", "Zoe", "Julian", "Fatima", "Ethan", "Nia",
  "Tariq", "Elena", "Siddharth", "Hannah", "Hiroshi", "Freja", "Diego", "Leila", "Sean", "Yuki",
  "Alexander", "Ananya", "Kofi", "Mia", "Gabriel", "Olga", "Jonas", "Mei", "Oliver", "Noor",
  "Sora", "Victor", "Zara", "Aarav", "Astrid", "Dmitri", "Keisha", "Chen", "Clara", "Rohan",
  "Isabella", "Lars", "Chioma", "Arjun", "Hanna", "Valentin", "Siti", "Danilo", "Amina", "Einar",
  "Lin", "Maxim", "Yara", "Aditya", "Elise", "Bao", "Faye", "Kaelen", "Natasha", "Oluwaseun",
  "Ryosuke", "Sybilla", "Tenzin", "Vivian", "Waleed", "Xiomara", "Yosef", "Zuzana", "Alvaro", "Bettina",
  "Cian", "Dafne", "Emil", "Gita", "Hassan", "Ilona", "Javier", "Katja", "Lev", "Malika",
  "Nico", "Orla", "Pavel", "Quinn", "Rashid", "Soraya", "Tomas", "Uma", "Vincenzo", "Zhen"
];

const LAST_NAMES = [
  "Vance", "Bennett", "Chen", "Patel", "O'Connor", "Lindqvist", "Rossi", "Sato", "Silva", "Okafor",
  "Hayes", "Novak", "Morales", "Sharma", "Volkov", "Washington", "Keller", "Mansour", "Cole", "Nwosu",
  "Al-Mansoor", "Rostova", "Verma", "Schmidt", "Tanaka", "Johansen", "Ramirez", "Haddad", "Murphy", "Watanabe",
  "Dubois", "Sengupta", "Mensah", "Larsen", "Santos", "Ivanova", "Nystrom", "Lin", "Wright", "Khoury",
  "Takahashi", "Nowak", "Al-Fassi", "Mehta", "Berg", "Kuznetsov", "Adeyemi", "Zhao", "Moreau", "Mehra",
  "Costa", "Van Dijk", "Eze", "Reddy", "Bakker", "Dumont", "Rahman", "Ferreira", "Diallo", "Lindholm",
  "Wang", "Popov", "Saad", "Iyer", "Fontaine", "Nguyen", "Campbell", "Tierney", "Morozov", "Balogun",
  "Nakamura", "Holm", "Dorji", "MacLeod", "Farooq", "Gomez", "Stern", "Horvat", "Navarro", "Fischer",
  "Gallagher", "Castillo", "Mertens", "Das", "Nasir", "Varga", "Serrano", "Kowalska", "Smirnov", "Benali",
  "Ricci", "Byrne", "Kovacs", "Sinclair", "Jalil", "Mirza", "Bauer", "Bhatt", "Conti", "Zhou"
];

const ROLES_POOLS = [
  {
    role: "Rust & Systems",
    bio: "Low-latency systems programmer building async runtime primitives, consensus algorithms, and zero-allocation memory pools in Rust.",
    primary: "Rust",
    skills: [
      { name: "Rust", category: "language", evidence_type: "verified", repo_count: 9, primary_language: true, evidence_summary: "Backed by 9 repositories (tokio-raft, micro-mesh)" },
      { name: "Tokio", category: "framework", evidence_type: "verified", repo_count: 6, primary_language: false, evidence_summary: "Async networking actors and stream transforms" },
      { name: "Distributed Systems", category: "tool", evidence_type: "verified", repo_count: 5, primary_language: false, evidence_summary: "Consensus engines and peer discovery protocols" },
      { name: "C++", category: "language", evidence_type: "reported", repo_count: 4, primary_language: false, evidence_summary: "Hardware-near system programming" }
    ],
    repos: [
      { name: "async-raft-kv", desc: "Linearizable distributed key-value store using Raft consensus in Rust", lang: "Rust", stars: 215, topics: ["rust", "raft", "distributed-systems"] },
      { name: "zero-copy-buf", desc: "SIMD-accelerated zero-copy byte slice parser for high-frequency trading feeds", lang: "Rust", stars: 140, topics: ["simd", "performance", "rust"] }
    ]
  },
  {
    role: "Frontend & Design Systems",
    bio: "Creative frontend technologist focusing on accessibility, micro-interactions, responsive design systems, and modern React 19.",
    primary: "TypeScript",
    skills: [
      { name: "TypeScript", category: "language", evidence_type: "verified", repo_count: 14, primary_language: true, evidence_summary: "14 repositories with strict type invariants and custom AST transformers" },
      { name: "React", category: "framework", evidence_type: "verified", repo_count: 12, primary_language: false, evidence_summary: "Component libraries, hooks, and suspense boundary architecture" },
      { name: "Next.js", category: "framework", evidence_type: "verified", repo_count: 8, primary_language: false, evidence_summary: "Server Actions and App Router implementations" },
      { name: "TailwindCSS", category: "tool", evidence_type: "verified", repo_count: 10, primary_language: false, evidence_summary: "Custom design systems and accessible tokens" }
    ],
    repos: [
      { name: "accessible-primitives-ui", desc: "Headless, unstyled accessible UI components compliant with WCAG 2.2 AAA", lang: "TypeScript", stars: 340, topics: ["react", "accessibility", "ui-components"] },
      { name: "fluid-motion-react", desc: "Spring physics animation engine for declarative interactive gestures in React", lang: "TypeScript", stars: 285, topics: ["animation", "gestures", "react"] }
    ]
  },
  {
    role: "AI/ML & LLM Engineering",
    bio: "Fullstack machine learning engineer building retrieval-augmented generation pipelines, fine-tuned agent workflows, and vector search systems.",
    primary: "Python",
    skills: [
      { name: "Python", category: "language", evidence_type: "verified", repo_count: 16, primary_language: true, evidence_summary: "16 public repositories across neural networks and production APIs" },
      { name: "PyTorch", category: "framework", evidence_type: "verified", repo_count: 9, primary_language: false, evidence_summary: "Custom attention heads and distributed model training" },
      { name: "FastAPI", category: "framework", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "Asynchronous high-throughput inference endpoints" },
      { name: "PostgreSQL", category: "database", evidence_type: "verified", repo_count: 5, primary_language: false, evidence_summary: "pgvector hybrid BM25 and semantic vector search" }
    ],
    repos: [
      { name: "hybrid-rag-engine", desc: "Dual reciprocal rank fusion combining dense vector embeddings and BM25 sparse lexical tokens", lang: "Python", stars: 410, topics: ["rag", "vector-search", "python", "nlp"] },
      { name: "agentic-eval-harness", desc: "Automated regression testing suite for multi-turn LLM reasoning chains", lang: "Python", stars: 195, topics: ["agents", "evaluations", "llm"] }
    ]
  },
  {
    role: "Go Cloud Native & Microservices",
    bio: "Backend architect passionate about distributed microservices, gRPC streaming, database connection multiplexing, and Kubernetes.",
    primary: "Go",
    skills: [
      { name: "Go", category: "language", evidence_type: "verified", repo_count: 15, primary_language: true, evidence_summary: "Backed by 15 repositories (grpc-balancer, pg-pool-go)" },
      { name: "Docker", category: "tool", evidence_type: "verified", repo_count: 11, primary_language: false, evidence_summary: "Distroless minimal production images" },
      { name: "Kubernetes", category: "tool", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "Custom admission webhooks and Horizontal Pod Autoscalers" },
      { name: "PostgreSQL", category: "database", evidence_type: "verified", repo_count: 8, primary_language: false, evidence_summary: "Connection pooling and query optimization" }
    ],
    repos: [
      { name: "grpc-smart-balancer", desc: "Dynamic least-connection client-side gRPC load balancer with outlier ejection", lang: "Go", stars: 320, topics: ["grpc", "load-balancer", "microservices", "go"] },
      { name: "pg-pool-mux", desc: "High-performance connection multiplexer for PostgreSQL in Go", lang: "Go", stars: 210, topics: ["postgres", "database", "pooling", "go"] }
    ]
  },
  {
    role: "Mobile App Specialist",
    bio: "Mobile engineer building native iOS/Android applications, React Native turbo modules, and offline-first SQLite synchronization.",
    primary: "React Native",
    skills: [
      { name: "React Native", category: "framework", evidence_type: "verified", repo_count: 10, primary_language: true, evidence_summary: "10 mobile repositories featuring New Architecture turbo modules" },
      { name: "Swift", category: "language", evidence_type: "verified", repo_count: 5, primary_language: false, evidence_summary: "Native iOS camera, biometrics, and audio capture bridging" },
      { name: "TypeScript", category: "language", evidence_type: "verified", repo_count: 12, primary_language: false, evidence_summary: "Offline data persistence with WatermelonDB and Zustand" },
      { name: "Kotlin", category: "language", evidence_type: "reported", repo_count: 3, primary_language: false, evidence_summary: "Android Jetpack components and work manager" }
    ],
    repos: [
      { name: "offline-sync-mobile", desc: "Conflict-free replicated data type (CRDT) synchronization engine for mobile clients", lang: "TypeScript", stars: 290, topics: ["react-native", "crdt", "offline-first"] },
      { name: "native-camera-vision", desc: "High-speed real-time optical barcode and edge detection native Swift module", lang: "Swift", stars: 175, topics: ["ios", "vision", "swift"] }
    ]
  },
  {
    role: "Security & Cryptography",
    bio: "Applied cryptographer and security researcher working on zero-knowledge SNARK circuits, secure multi-party computation, and protocol audits.",
    primary: "Rust",
    skills: [
      { name: "Rust", category: "language", evidence_type: "verified", repo_count: 8, primary_language: true, evidence_summary: "Mathematical curve arithmetic and constraint system verification" },
      { name: "Cryptography", category: "tool", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "Zero-knowledge proofs, Schnorr signatures, and BLS aggregations" },
      { name: "C", category: "language", evidence_type: "reported", repo_count: 4, primary_language: false, evidence_summary: "Side-channel resistant memory constant-time primitives" },
      { name: "Python", category: "language", evidence_type: "reported", repo_count: 5, primary_language: false, evidence_summary: "Symbolic fuzzing and constraint solver scripts" }
    ],
    repos: [
      { name: "zk-circuit-compiler", desc: "Domain-specific language compiler targeting R1CS arithmetic circuits", lang: "Rust", stars: 380, topics: ["zero-knowledge", "zk-snark", "compiler", "rust"] },
      { name: "threshold-crypto-rs", desc: "Non-interactive threshold signature scheme using Feldman verifiable secret sharing", lang: "Rust", stars: 165, topics: ["cryptography", "mpc", "signatures"] }
    ]
  },
  {
    role: "DevOps & SRE",
    bio: "Site reliability engineer crafting declarative Terraform modules, Prometheus alert rules, and self-healing infrastructure.",
    primary: "Go",
    skills: [
      { name: "Kubernetes", category: "tool", evidence_type: "verified", repo_count: 9, primary_language: false, evidence_summary: "GitOps deployment pipelines with ArgoCD and Flux" },
      { name: "Terraform", category: "tool", evidence_type: "verified", repo_count: 8, primary_language: false, evidence_summary: "Multi-region AWS and GCP infrastructure as code" },
      { name: "Go", category: "language", evidence_type: "verified", repo_count: 11, primary_language: true, evidence_summary: "Custom Prometheus exporter daemons and synthetic health checkers" },
      { name: "Docker", category: "tool", evidence_type: "verified", repo_count: 10, primary_language: false, evidence_summary: "Hardened rootless container profiles" }
    ],
    repos: [
      { name: "prom-slo-exporter", desc: "Generates real-time burn-rate error budget metrics for multi-cluster microservices", lang: "Go", stars: 260, topics: ["prometheus", "sre", "slo", "metrics"] },
      { name: "terraform-aws-secure-vpc", desc: "Production-ready enterprise VPC blueprint with strict egress filtering", lang: "HCL", stars: 190, topics: ["terraform", "aws", "security"] }
    ]
  },
  {
    role: "Data & Analytical Engines",
    bio: "Database internals enthusiast working on column-store query execution, Apache Arrow vector processing, and LSM-tree storage engines.",
    primary: "C++",
    skills: [
      { name: "C++", category: "language", evidence_type: "verified", repo_count: 12, primary_language: true, evidence_summary: "Columnar vector execution and vectorized expression evaluation" },
      { name: "PostgreSQL", category: "database", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "Custom foreign data wrappers and C extensions" },
      { name: "Rust", category: "language", evidence_type: "reported", repo_count: 5, primary_language: false, evidence_summary: "DataFusion query planner and Arrow integration" },
      { name: "Python", category: "language", evidence_type: "reported", repo_count: 6, primary_language: false, evidence_summary: "Automated benchmark harnesses using DuckDB and Polars" }
    ],
    repos: [
      { name: "arrow-column-engine", desc: "In-memory vectorized SQL query engine built on top of Apache Arrow C++", lang: "C++", stars: 440, topics: ["database", "apache-arrow", "analytics", "sql"] },
      { name: "mini-lsm-db", desc: "Educational log-structured merge-tree storage engine with SSTable compaction", lang: "C++", stars: 310, topics: ["lsm-tree", "database-internals", "storage"] }
    ]
  },
  {
    role: "Fullstack Web3 & Smart Contracts",
    bio: "Decentralized application engineer building audited EVM smart contracts, subgraphs, and cryptographic token bridges.",
    primary: "Solidity",
    skills: [
      { name: "Solidity", category: "language", evidence_type: "verified", repo_count: 10, primary_language: true, evidence_summary: "Gas-optimized ERC standards and automated Foundry fuzz tests" },
      { name: "TypeScript", category: "language", evidence_type: "verified", repo_count: 12, primary_language: false, evidence_summary: "Viem and Wagmi integration for non-custodial wallet flows" },
      { name: "Next.js", category: "framework", evidence_type: "verified", repo_count: 7, primary_language: false, evidence_summary: "Decentralized application frontend architectures" },
      { name: "Rust", category: "language", evidence_type: "learning", repo_count: 3, primary_language: false, evidence_summary: "Solana Anchor smart contract development" }
    ],
    repos: [
      { name: "vault-yield-evm", desc: "Automated liquidity vault with rebalancing and flash-loan protection", lang: "Solidity", stars: 275, topics: ["solidity", "defi", "smart-contracts"] },
      { name: "wagmi-multicall-cache", desc: "Optimized RPC request batching and optimistic contract state manager", lang: "TypeScript", stars: 155, topics: ["web3", "wagmi", "viem"] }
    ]
  },
  {
    role: "Embedded & IoT Systems",
    bio: "Firmware and IoT engineer designing bare-metal firmware, FreeRTOS task schedulers, and BLE mesh network sensors.",
    primary: "C",
    skills: [
      { name: "C", category: "language", evidence_type: "verified", repo_count: 13, primary_language: true, evidence_summary: "13 embedded firmware repositories for ARM Cortex-M and ESP32" },
      { name: "Rust", category: "language", evidence_type: "verified", repo_count: 6, primary_language: false, evidence_summary: "Embedded Rust drivers and no-std HAL implementations" },
      { name: "Python", category: "language", evidence_type: "reported", repo_count: 5, primary_language: false, evidence_summary: "Hardware-in-the-loop automated test scripts" },
      { name: "Linux", category: "tool", evidence_type: "reported", repo_count: 4, primary_language: false, evidence_summary: "Yocto custom board support package builds" }
    ],
    repos: [
      { name: "esp32-ble-mesh-sensor", desc: "Ultra-low power environmental sensor mesh protocol with 5-year battery life", lang: "C", stars: 310, topics: ["embedded", "esp32", "bluetooth", "iot"] },
      { name: "no-std-mpu6050", desc: "Platform-agnostic no-std driver for MPU6050 accelerometer and gyroscope in Rust", lang: "Rust", stars: 145, topics: ["embedded-rust", "driver", "sensor"] }
    ]
  }
];

const LOCATIONS = [
  { city: "San Francisco, CA, USA", tz: "UTC-7" },
  { city: "New York, NY, USA", tz: "UTC-4" },
  { city: "Seattle, WA, USA", tz: "UTC-7" },
  { city: "Austin, TX, USA", tz: "UTC-5" },
  { city: "Toronto, Canada", tz: "UTC-4" },
  { city: "Vancouver, Canada", tz: "UTC-7" },
  { city: "London, United Kingdom", tz: "UTC+1" },
  { city: "Berlin, Germany", tz: "UTC+2" },
  { city: "Paris, France", tz: "UTC+2" },
  { city: "Amsterdam, Netherlands", tz: "UTC+2" },
  { city: "Stockholm, Sweden", tz: "UTC+2" },
  { city: "Zurich, Switzerland", tz: "UTC+2" },
  { city: "Dublin, Ireland", tz: "UTC+1" },
  { city: "Kyiv, Ukraine", tz: "UTC+3" },
  { city: "Warsaw, Poland", tz: "UTC+2" },
  { city: "Tokyo, Japan", tz: "UTC+9" },
  { city: "Seoul, South Korea", tz: "UTC+9" },
  { city: "Singapore", tz: "UTC+8" },
  { city: "Bengaluru, India", tz: "UTC+5:30" },
  { city: "Hyderabad, India", tz: "UTC+5:30" },
  { city: "Sydney, Australia", tz: "UTC+10" },
  { city: "Melbourne, Australia", tz: "UTC+10" },
  { city: "São Paulo, Brazil", tz: "UTC-3" },
  { city: "Buenos Aires, Argentina", tz: "UTC-3" },
  { city: "Lagos, Nigeria", tz: "UTC+1" },
  { city: "Nairobi, Kenya", tz: "UTC+3" },
  { city: "Cape Town, South Africa", tz: "UTC+2" },
  { city: "Cairo, Egypt", tz: "UTC+3" }
];

const INTENT_COMBOS = [
  ["side-projects", "open-source"],
  ["hackathons", "side-projects"],
  ["open-source", "pairing"],
  ["hackathons", "open-source"],
  ["side-projects", "pairing"],
  ["hackathons", "side-projects", "open-source"],
  ["open-source"],
  ["pairing", "side-projects"],
  ["hackathons"],
  ["side-projects"]
];

const COMMITMENTS = ["part-time", "weekends", "flexible", "full-time"];
const CONTACT_PREFS = ["in-app", "github", "email"];

export function generate100Users() {
  const users = [];

  // Add the 10 hand-crafted rich profiles first
  for (let i = 0; i < DEVELOPERS_DATA.length; i++) {
    const d = DEVELOPERS_DATA[i];
    users.push({
      ...d,
      avatar_url: getAvatar(i),
      public_repos_count: 15 + ((i * 7) % 35),
      followers_count: 50 + ((i * 47) % 600),
      is_discoverable: true,
    });
  }

  // Generate the remaining 90 unique users
  for (let i = 10; i < 100; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3 + 7) % LAST_NAMES.length];
    const username = `${firstName.toLowerCase()}-${lastName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${(100 + i)}`;
    const roleTemplate = ROLES_POOLS[i % ROLES_POOLS.length];
    const loc = LOCATIONS[i % LOCATIONS.length];
    const intents = INTENT_COMBOS[i % INTENT_COMBOS.length];
    const commitment = COMMITMENTS[i % COMMITMENTS.length];
    const contactPref = CONTACT_PREFS[i % CONTACT_PREFS.length];

    const user = {
      username,
      name: `${firstName} ${lastName}`,
      avatar_url: getAvatar(i),
      bio: roleTemplate.bio,
      location: loc.city,
      company: i % 4 === 0 ? `${firstName} Tech Lab` : i % 3 === 0 ? "Independent Open-Source Contributor" : undefined,
      website: `https://${username.replace(/-\d+$/, "")}.dev`,
      twitter_username: i % 2 === 0 ? username : undefined,
      intents,
      time_commitment: commitment,
      timezones: [loc.tz],
      contact_preference: contactPref,
      summary_ai: `Developer specializing in ${roleTemplate.primary} with verified experience in ${roleTemplate.skills.slice(0, 2).map(s => s.name).join(" and ")}. Actively interested in ${intents.join(" and ")}.`,
      public_repos_count: 8 + ((i * 5) % 40),
      followers_count: 25 + ((i * 31) % 450),
      is_discoverable: true,
      skills: roleTemplate.skills.map((s) => ({
        ...s,
        repo_count: Math.max(1, s.repo_count + (i % 5) - 2),
      })),
      repositories: roleTemplate.repos.map((r) => ({
        name: `${r.name}-${i}`,
        description: r.desc,
        language: r.lang,
        stars_count: Math.max(15, r.stars + ((i * 13) % 200) - 50),
        forks_count: Math.max(2, Math.floor(r.stars / 8) + (i % 10)),
        topics: [...r.topics],
      })),
    };

    users.push(user);
  }

  return users;
}

export const SEED_RESCUES = [
  {
    userIndex: 0,
    repo_url: "https://github.com/marcus-vance/tokio-raft",
    issue_or_task: "Fix deadlocking peer heartbeat loop during election timeouts in Tokio Raft",
    task_type: "bugfix",
    tech_stack: ["Rust", "Tokio", "Networking"],
    description: "During aggressive simulated packet drops, candidate election timers occasionally deadlock when two nodes broadcast simultaneous RequestVote RPCs. Need help debugging the async select! loop state machine.",
  },
  {
    userIndex: 1,
    repo_url: "https://github.com/chloe-bennett/canvas-flow",
    issue_or_task: "Optimize vector canvas bezier curve rendering on 4K multi-monitor setups",
    task_type: "refactor",
    tech_stack: ["TypeScript", "Canvas", "Performance"],
    description: "When zooming past 300% on high-DPI displays with more than 10,000 shapes, canvas redraw frame rates drop to 24fps. Seeking assistance refactoring the dirty-rect spatial partitioning quadtree.",
  },
  {
    userIndex: 2,
    repo_url: "https://github.com/lucas-chen-dev/k8s-cost-watcher",
    issue_or_task: "Support GCP GKE spot node interruption notifications in cost controller",
    task_type: "feature",
    tech_stack: ["Go", "Kubernetes", "GCP"],
    description: "We currently capture AWS spot termination notices via IMDSv2 metadata polling. Looking for an experienced Kubernetes contributor to implement the GKE termination handler.",
  },
  {
    userIndex: 3,
    repo_url: "https://github.com/maya-patel-cloud/clickhouse-sinker-go",
    issue_or_task: "Resolve memory accumulation in Kafka schema registry decoding buffers",
    task_type: "bugfix",
    tech_stack: ["Go", "Kafka", "ClickHouse"],
    description: "High-throughput streams with Avro schemas leak approximately 40MB/hour due to unbounded schema cache retention. Need a peer to pair on introducing an LRU eviction strategy.",
  },
  {
    userIndex: 4,
    repo_url: "https://github.com/liam-oc/fluid-spring-gestures",
    issue_or_task: "Implement Android 14 predictive back gesture animation bridging",
    task_type: "feature",
    tech_stack: ["React Native", "Kotlin", "Android"],
    description: "iOS interactive pan dismiss is fully smooth, but Android predictive back gesture requires integrating the new OnBackInvokedCallback API into our native module.",
  },
  {
    userIndex: 5,
    repo_url: "https://github.com/henrik-lind/snark-eval-rs",
    issue_or_task: "Audit multi-scalar multiplication ASM routines for side-channel timing leaks",
    task_type: "review",
    tech_stack: ["Rust", "Cryptography", "Assembly"],
    description: "We implemented custom Pippenger exponentiation with AVX-512. Need a cryptographer or security researcher to review constant-time guarantees during scalar multiplication.",
  },
  {
    userIndex: 6,
    repo_url: "https://github.com/sofia-rossi-sys/quant-stream-llm",
    issue_or_task: "Setup Docker container with CUDA 12.4 and FlashAttention-3 precompiled wheels",
    task_type: "setup",
    tech_stack: ["Python", "Docker", "PyTorch", "CUDA"],
    description: "Building FlashAttention-3 from source in fresh CI runners takes 28 minutes. Looking for someone with Docker layer caching expertise to provide pre-baked multi-arch base images.",
  },
  {
    userIndex: 7,
    repo_url: "https://github.com/kenji-systems/lumina-vk",
    issue_or_task: "Refactor Vulkan descriptor set management to bindless indexing",
    task_type: "architecture",
    tech_stack: ["C++", "Vulkan", "Graphics"],
    description: "Migrating from traditional descriptor pools to Vulkan 1.3 descriptor indexing to eliminate per-material draw call overhead in complex scenes.",
  },
  {
    userIndex: 8,
    repo_url: "https://github.com/camila-silva-ml/phoenix-multiplayer-mesh",
    issue_or_task: "Fix partition healing race condition across cross-region Fly.io clusters",
    task_type: "bugfix",
    tech_stack: ["Elixir", "Phoenix", "Distributed Systems"],
    description: "When network connectivity between São Paulo and Frankfurt re-establishes, Phoenix Presence duplicate keys produce intermittent GenServer crashes. Need an Elixir OTP peer.",
  },
  {
    userIndex: 9,
    repo_url: "https://github.com/amara-okafor-sec/sast-ast-scanner",
    issue_or_task: "Add TypeScript 5.5 type-predicate ast visitor support to taint tracker",
    task_type: "feature",
    tech_stack: ["Python", "TypeScript", "Security"],
    description: "Our AST engine misses taint flows through custom user-defined type guards. Need help extending the symbol resolution table to track narrowed types correctly.",
  },
  {
    userIndex: 10,
    repo_url: "https://github.com/marcus-vance/async-raft-kv-10",
    issue_or_task: "Review asynchronous snapshot compaction and disk fsync concurrency",
    task_type: "review",
    tech_stack: ["Rust", "Storage", "Databases"],
    description: "Compacting 20GB WAL snapshots blocks read queries for ~400ms. Seeking a storage engineer to review moving fsync operations to a dedicated background rayon threadpool.",
  },
  {
    userIndex: 11,
    repo_url: "https://github.com/chloe-bennett/accessible-primitives-ui-11",
    issue_or_task: "Improve NVDA screen reader announcement timings for virtual combobox",
    task_type: "bugfix",
    tech_stack: ["TypeScript", "Accessibility", "React"],
    description: "NVDA in Firefox repeats aria-activedescendant announcements twice when navigating with down arrow keys. Looking for an accessibility specialist to verify the fix.",
  },
  {
    userIndex: 12,
    repo_url: "https://github.com/lucas-chen-dev/hybrid-rag-engine-12",
    issue_or_task: "Implement reciprocal rank fusion weight auto-tuning using NDCG benchmarks",
    task_type: "feature",
    tech_stack: ["Python", "Data Science", "Search"],
    description: "Dense vector weight and BM25 weight are currently hardcoded to 0.6 and 0.4. Looking for a collaborator to build an automated cross-validation grid search against MS MARCO.",
  },
  {
    userIndex: 13,
    repo_url: "https://github.com/maya-patel-cloud/grpc-smart-balancer-13",
    issue_or_task: "Configure Prometheus metrics exporter and Grafana dashboard for gRPC channels",
    task_type: "setup",
    tech_stack: ["Go", "gRPC", "Prometheus"],
    description: "The load balancer outputs internal channel states to logs. Need a dashboard and Prometheus metric instrumentation to visualize subchannel health in production.",
  },
  {
    userIndex: 14,
    repo_url: "https://github.com/liam-oc/offline-sync-mobile-14",
    issue_or_task: "Design vector clock compression for long-running disconnected devices",
    task_type: "architecture",
    tech_stack: ["TypeScript", "CRDT", "Mobile"],
    description: "After 30 days of offline use, vector clocks grow to several megabytes per document. Seeking an architect experienced in state-based CRDT pruning and garbage collection.",
  },
];
