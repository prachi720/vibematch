import type {
  SkillAnalysisResult,
  TeamBuilderResult,
  ValidationResult,
  ArchitectureResult,
  RoadmapResult,
  FeaturePrioritizationResult,
  PitchResult,
  JudgeResult,
  DocumentationResult,
} from '@/types';

// VibeMatch Simulated AI Engine
// Since no real LLM API keys are configured, this module generates realistic,
// structured AI outputs and streams them token-by-token to simulate the real
// streaming experience. Each module gets tailored, context-aware content.

export type StreamCallback = (chunk: string) => void;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function streamText(text: string, cb: StreamCallback, speed = 15) {
  const tokens = text.split(/(\s+)/);
  for (const token of tokens) {
    cb(token);
    await delay(speed + Math.random() * 20);
  }
}

async function streamObject<T>(obj: T, cb: (partial: T) => void, delayMs = 200): Promise<T> {
  cb(obj);
  await delay(delayMs);
  return obj;
}

// ============ SKILL ANALYZER ============
export async function generateSkillAnalysis(
  skills: { name: string; proficiency: number; category: string }[],
  experienceLevel: string,
  onChunk: StreamCallback,
): Promise<SkillAnalysisResult> {
  await delay(400);

  const topSkills = [...skills].sort((a, b) => b.proficiency - a.proficiency);
  const strengths = topSkills.slice(0, 3).map((s) => ({
    skill: s.name,
    note: `Your ${s.proficiency}/5 proficiency in ${s.name} places you in the upper quartile for ${s.category} work. This is a core differentiator for hackathon teams.`,
  }));

  const allCategories = ['frontend', 'backend', 'database', 'devops', 'ai', 'design', 'product'];
  const userCategories = new Set(skills.map((s) => s.category));
  const missingCategories = allCategories.filter((c) => !userCategories.has(c));
  const gaps = missingCategories.slice(0, 3).map((area) => ({
    area,
    note: `No ${area} skills detected. A well-rounded team needs ${area} coverage — either learn basics or find a teammate who complements you.`,
  }));

  const growthAreas = [
    { area: 'System Design', suggestion: 'Practice designing scalable architectures. Study patterns like CQRS, event sourcing, and microservices.' },
    { area: 'DevOps Fundamentals', suggestion: 'Learn Docker and basic CI/CD. Even basic deployment skills dramatically increase your value to a team.' },
    { area: 'Product Thinking', suggestion: 'Develop your ability to articulate the "why" behind features. Judges reward clear problem-solution fit.' },
  ];

  const radarData = skills.slice(0, 6).map((s) => ({
    skill: s.name,
    level: s.proficiency,
  }));

  const summary = `Based on your ${skills.length} skills and ${experienceLevel} experience level, you have a strong foundation in ${topSkills[0]?.name ?? 'your core stack'}. To maximize hackathon success, focus on ${gaps[0]?.area ?? 'broadening your skill set'} and finding teammates who complement your gaps.`;

  await streamText('Analyzing your skill profile...\n\n', onChunk);
  await streamText(summary, onChunk, 10);

  const result: SkillAnalysisResult = { strengths, gaps, growthAreas, radarData, summary };
  await streamObject(result, () => {});
  return result;
}

// ============ TEAM BUILDER ============
export async function generateTeamSuggestions(
  skills: { name: string; proficiency: number; category: string }[],
  gaps: string[],
  onChunk: StreamCallback,
): Promise<TeamBuilderResult> {
  await delay(400);

  const userCategories = new Set(skills.map((s) => s.category));
  const neededRoles = [
    { role: 'Frontend Specialist', category: 'frontend' },
    { role: 'Backend Engineer', category: 'backend' },
    { role: 'DevOps Lead', category: 'devops' },
    { role: 'AI/ML Engineer', category: 'ai' },
    { role: 'UI/UX Designer', category: 'design' },
  ].filter((r) => !userCategories.has(r.category));

  const suggestions = neededRoles.slice(0, 4).map((r, i) => ({
    name: ['Alex Chen', 'Maya Patel', 'Jordan Kim', 'Sam Rodriguez'][i] ?? 'Teammate',
    role: r.role,
    skills: getSkillsForCategory(r.category),
    matchReason: `You lack ${r.category} coverage. A ${r.role} would fill this gap perfectly and round out your team for full-stack delivery.`,
    complementScore: 85 + Math.floor(Math.random() * 14),
  }));

  const reasoning = `Your profile shows strength in ${skills.slice(0, 2).map((s) => s.name).join(' and ')}. ` +
    `To build a complementary team, I recommend ${suggestions.length} teammates who cover your gaps in ${gaps.join(', ') || 'the identified areas'}. ` +
    `Each suggestion is scored on how well their skills complement yours.`;

  await streamText('Finding complementary teammates...\n\n', onChunk);
  await streamText(reasoning, onChunk, 10);

  return { suggestions, reasoning, summary: reasoning };
}

function getSkillsForCategory(cat: string): string[] {
  const map: Record<string, string[]> = {
    frontend: ['React', 'TypeScript', 'Tailwind CSS'],
    backend: ['Node.js', 'PostgreSQL', 'API Design'],
    devops: ['Docker', 'AWS', 'CI/CD'],
    ai: ['Python', 'PyTorch', 'LLM Integration'],
    design: ['Figma', 'UI/UX Design', 'Prototyping'],
  };
  return map[cat] ?? ['General'];
}

// ============ PROJECT VALIDATOR ============
export async function generateValidation(
  project: { title: string; description: string; target_users: string; tech_approach: string },
  onChunk: StreamCallback,
): Promise<ValidationResult> {
  await delay(400);

  const feasibilityScore = Math.min(90, 50 + project.description.length / 10);
  const originalityScore = Math.min(85, 40 + project.title.length * 2);
  const scopeScore = Math.min(80, 45 + (project.target_users ? 15 : 0) + (project.tech_approach ? 15 : 0));

  const result: ValidationResult = {
    feasibility: {
      score: Math.round(feasibilityScore),
      note: `The proposed tech approach (${project.tech_approach || 'not specified'}) is achievable within a hackathon timeframe. The core MVP scope is realistic for a 24-48 hour build.`,
    },
    originality: {
      score: Math.round(originalityScore),
      note: `"${project.title}" addresses a recognizable space. Consider what makes your angle unique — the specific target user (${project.target_users || 'unspecified'}) could be your differentiator.`,
    },
    scope: {
      score: Math.round(scopeScore),
      note: 'The scope is manageable but risks feature creep. Prioritize the core loop first; add polish only if time permits.',
    },
    risks: [
      'Scope creep — define your MVP boundary before coding starts.',
      'API rate limits or third-party dependencies may fail during judging.',
      'Demo-day presentation risk: a working subset beats a broken full feature set.',
    ],
    suggestions: [
      'Narrow your target user to a specific persona for a sharper pitch.',
      'Build a fallback/demo mode in case live APIs fail during presentation.',
      'Identify the single "wow moment" your demo must deliver.',
    ],
    summary: `"${project.title}" is a feasible project with moderate originality. The key to success will be disciplined scoping and a memorable demo moment.`,
  };

  await streamText('Validating your project idea...\n\n', onChunk);
  await streamText(result.summary, onChunk, 10);
  return result;
}

// ============ ARCHITECTURE GENERATOR ============
export async function generateArchitecture(
  project: { title: string; description: string; tech_approach: string },
  onChunk: StreamCallback,
): Promise<ArchitectureResult> {
  await delay(400);

  const result: ArchitectureResult = {
    frontend: `Use React with TypeScript for the frontend. Tailwind CSS for rapid styling. Structure as: a landing page, main app view, and settings. Use React Router or Next.js App Router for navigation. State management via React Context or Zustand — keep it simple for a hackathon.`,
    backend: `Build a REST API with Node.js/Express or Python/FastAPI. Key endpoints: auth, CRUD for core entities, and an AI integration layer. Use Supabase for auth + database to skip infrastructure setup. Keep the API layer thin — business logic in service modules.`,
    database: `PostgreSQL via Supabase. Core tables: users, projects, and a polymorphic outputs table for AI-generated content. Enable Row Level Security from day one. Use JSONB columns for flexible AI output payloads.`,
    deployment: `Deploy frontend to Vercel (zero-config for React/Next.js). Backend to Railway, Render, or Supabase Edge Functions. Use environment variables for all secrets. Set up a staging URL for testing before demo day. Have a local fallback in case of deployment issues.`,
    diagram: [
      { layer: 'Client', components: ['Web App (React)', 'Mobile Responsive'] },
      { layer: 'API Gateway', components: ['REST API', 'Auth Middleware'] },
      { layer: 'Services', components: ['Project Service', 'AI Service', 'User Service'] },
      { layer: 'Data', components: ['PostgreSQL', 'Supabase Auth', 'File Storage'] },
      { layer: 'External', components: ['AI Provider', 'Email Service'] },
    ],
    summary: `A pragmatic full-stack architecture for "${project.title}" — React frontend, thin API layer, PostgreSQL via Supabase, and Vercel deployment. Optimized for hackathon speed.`,
  };

  await streamText('Generating system architecture...\n\n', onChunk);
  await streamText(result.summary, onChunk, 10);
  return result;
}

// ============ ROADMAP GENERATOR ============
export async function generateRoadmap(
  project: { title: string; description: string },
  onChunk: StreamCallback,
): Promise<RoadmapResult> {
  await delay(400);

  const result: RoadmapResult = {
    milestones: [
      {
        title: 'Project Setup & Scaffolding',
        description: 'Initialize repo, set up CI/CD, configure environment, create base project structure.',
        effort: '2 hours',
        dependencies: [],
        phase: 1,
      },
      {
        title: 'Core Data Models & API',
        description: 'Define database schema, create migrations, build CRUD endpoints for primary entities.',
        effort: '3 hours',
        dependencies: ['Project Setup & Scaffolding'],
        phase: 1,
      },
      {
        title: 'Authentication & User Flow',
        description: 'Implement sign-up, login, session management. Set up protected routes.',
        effort: '2 hours',
        dependencies: ['Core Data Models & API'],
        phase: 2,
      },
      {
        title: 'Main Feature Implementation',
        description: `Build the core feature set for "${project.title}". Focus on the primary user journey end-to-end.`,
        effort: '6 hours',
        dependencies: ['Authentication & User Flow'],
        phase: 2,
      },
      {
        title: 'AI Integration',
        description: 'Wire up AI provider, implement streaming responses, handle errors gracefully.',
        effort: '3 hours',
        dependencies: ['Main Feature Implementation'],
        phase: 3,
      },
      {
        title: 'UI Polish & Responsive Design',
        description: 'Refine visual design, add animations, ensure mobile responsiveness, test edge cases.',
        effort: '2 hours',
        dependencies: ['Main Feature Implementation'],
        phase: 3,
      },
      {
        title: 'Testing & Bug Fixes',
        description: 'Write critical path tests, fix known bugs, prepare demo data.',
        effort: '2 hours',
        dependencies: ['UI Polish & Responsive Design', 'AI Integration'],
        phase: 4,
      },
      {
        title: 'Demo Preparation',
        description: 'Create demo script, prepare fallback scenarios, rehearse pitch, deploy to production.',
        effort: '1 hour',
        dependencies: ['Testing & Bug Fixes'],
        phase: 4,
      },
    ],
    summary: `An 8-milestone roadmap for "${project.title}" spanning ~21 hours of work across 4 phases. Phase 1: foundation. Phase 2: core features. Phase 3: integration & polish. Phase 4: testing & demo prep.`,
  };

  await streamText('Generating execution roadmap...\n\n', onChunk);
  await streamText(result.summary, onChunk, 10);
  return result;
}

// ============ FEATURE PRIORITIZER ============
export async function generateFeaturePrioritization(
  features: string[],
  onChunk: StreamCallback,
): Promise<FeaturePrioritizationResult> {
  await delay(400);

  const result: FeaturePrioritizationResult = {
    features: features.map((f, i) => {
      const isCore = i < Math.ceil(features.length / 3);
      const isSecondary = i < Math.ceil((features.length * 2) / 3);
      return {
        name: f,
        priority: (isCore ? 'must' : isSecondary ? 'should' : i % 2 === 0 ? 'could' : 'wont') as 'must' | 'should' | 'could' | 'wont',
        impact: isCore ? 9 - i : isSecondary ? 6 - (i % 3) : 3,
        effort: (i % 5) + 2,
        note: isCore
          ? 'Core to the MVP — this must ship for the demo.'
          : isSecondary
          ? 'High value but can be simplified for the hackathon timeline.'
          : 'Nice to have — only attempt if ahead of schedule.',
      };
    }),
    summary: `Prioritized ${features.length} features using MoSCoW method. ${Math.ceil(features.length / 3)} must-haves, ${Math.ceil(features.length / 3)} should-haves, and the rest are could/wont. Focus on the must-haves first.`,
  };

  await streamText('Prioritizing features...\n\n', onChunk);
  await streamText(result.summary, onChunk, 10);
  return result;
}

// ============ PITCH GENERATOR ============
export async function generatePitch(
  project: { title: string; description: string; target_users: string },
  context: { validation?: string; architecture?: string; roadmap?: string },
  onChunk: StreamCallback,
): Promise<PitchResult> {
  await delay(400);

  const result: PitchResult = {
    sections: [
      {
        title: 'Problem',
        content: `${project.target_users || 'Users'} struggle with a specific, painful problem: ${project.description}. Existing solutions are either too complex, too expensive, or don't exist. This gap represents a real opportunity that we can address within a hackathon timeframe.`,
      },
      {
        title: 'Solution',
        content: `${project.title} solves this by providing a streamlined, intuitive approach. Our solution leverages ${project.description.slice(0, 80)}... to deliver immediate value. The key innovation is making the complex simple.`,
      },
      {
        title: 'Demo',
        content: `In our demo, you'll see a user sign up, complete their profile, and immediately get AI-powered insights. The "wow moment" happens when the AI response streams in real-time — it feels like magic. We'll show the full user journey from start to finish in under 2 minutes.`,
      },
      {
        title: 'Market',
        content: `Our target users — ${project.target_users || 'developers and builders'} — represent a growing market. The trend toward AI-assisted tooling means our solution is timely. We're positioning at the intersection of developer tools and AI, a space with strong momentum.`,
      },
      {
        title: 'Ask',
        content: `We're looking for feedback on our core concept and potential paths forward. With additional development time, we'd expand to ${context.roadmap ? 'the full roadmap outlined' : 'additional feature areas'} and explore monetization. We'd love to connect with mentors who can help us refine the go-to-market strategy.`,
      },
    ],
    summary: `A 5-section pitch for "${project.title}" covering problem, solution, demo, market, and ask. Designed for a 3-minute hackathon presentation.`,
  };

  await streamText('Crafting your pitch...\n\n', onChunk);
  await streamText(result.summary, onChunk, 10);
  return result;
}

// ============ JUDGE SIMULATOR ============
export async function generateJudgeFeedback(
  project: { title: string; description: string },
  pitch: string,
  onChunk: StreamCallback,
): Promise<JudgeResult> {
  await delay(400);

  const personas = ['Skeptical Investor', 'Technical Expert', 'Design Critic', 'Product Leader'];
  const persona = personas[Math.floor(Math.random() * personas.length)];

  const result: JudgeResult = {
    scores: [
      { criterion: 'Innovation', score: 7, maxScore: 10, note: 'The concept is solid but not groundbreaking. The AI integration angle adds freshness.' },
      { criterion: 'Technical Complexity', score: 8, maxScore: 10, note: 'Good use of full-stack technologies. The streaming AI integration shows technical depth.' },
      { criterion: 'Design & UX', score: 6, maxScore: 10, note: 'Functional but could use more polish. The user journey is clear though.' },
      { criterion: 'Business Viability', score: 7, maxScore: 10, note: 'The market exists but the monetization path needs more definition.' },
      { criterion: 'Demo Quality', score: 8, maxScore: 10, note: 'The live demo was convincing. The "wow moment" landed well.' },
    ],
    overallScore: 7.2,
    feedback: `As a ${persona}, I see real potential in "${project.title}". The core idea is sound and the execution is impressive for a hackathon. The main concern is whether this solves a problem people will pay for. The technical implementation is strong, but the business model needs more thought.`,
    strengths: [
      'Clear problem-solution fit — the pitch made the value obvious.',
      'Strong technical execution with real AI integration.',
      'The live demo was the highlight — it showed the product working, not just slides.',
      'Good use of modern stack — React, TypeScript, Supabase.',
    ],
    improvements: [
      'Sharpen the target user — "everyone" is not a target market.',
      'Add a clearer monetization story — how does this make money?',
      'The UI needs more visual differentiation from competitors.',
      'Consider a mobile-first approach for broader reach.',
    ],
    persona,
  };

  await streamText(`Simulating judge: ${persona}...\n\n`, onChunk);
  await streamText(result.feedback, onChunk, 10);
  return result;
}

// ============ DOCUMENTATION GENERATOR ============
export async function generateDocumentation(
  project: { title: string; description: string; target_users?: string; tech_approach: string },
  context: { architecture?: string; roadmap?: string },
  onChunk: StreamCallback,
): Promise<DocumentationResult> {
  await delay(400);

  const sections = [
    { title: 'Overview', content: `# ${project.title}\n\n${project.description}\n\n## Target Users\n${project.target_users || 'Developers and builders'}\n\n## Tech Approach\n${project.tech_approach || 'Modern web stack'}` },
    { title: 'Getting Started', content: '## Getting Started\n\n### Prerequisites\n- Node.js 18+\n- npm or pnpm\n\n### Installation\n```bash\ngit clone <repo-url>\ncd project\nnpm install\n```\n\n### Running Locally\n```bash\nnpm run dev\n```\n\nThe app will be available at `http://localhost:5173`.' },
    { title: 'Architecture', content: `## Architecture\n\n${context.architecture || 'See the Architecture Generator output for full details.'}\n\n### Key Design Decisions\n- Supabase for auth + database (reduces infrastructure overhead)\n- React + TypeScript for type safety\n- Tailwind CSS for rapid styling\n- Streaming AI responses for real-time UX` },
    { title: 'API Reference', content: '## API Reference\n\n### Authentication\n- `POST /auth/register` — Create account\n- `POST /auth/login` — Sign in\n- `POST /auth/logout` — Sign out\n\n### Core Endpoints\n- `GET /projects` — List projects\n- `POST /projects` — Create project\n- `GET /ai-outputs` — List AI outputs' },
    { title: 'Deployment', content: '## Deployment\n\n### Frontend\nDeploy to Vercel:\n```bash\nvercel --prod\n```\n\n### Environment Variables\nSee `.env.example` for required variables.\n\n### Production Checklist\n- [ ] HTTPS enforced\n- [ ] Environment variables set\n- [ ] Database migrations applied\n- [ ] Error monitoring configured' },
    { title: 'Roadmap', content: `## Roadmap\n\n${context.roadmap || 'See the Roadmap Generator output for the full timeline.'}\n\n## Contributing\n\n1. Fork the repo\n2. Create a feature branch\n3. Submit a PR\n\n## License\nMIT` },
  ];

  const markdown = sections.map((s) => s.content).join('\n\n---\n\n');

  await streamText('Generating documentation...\n\n', onChunk);
  await streamText(`Generated ${sections.length} documentation sections.`, onChunk, 10);

  return { markdown, sections };
}
