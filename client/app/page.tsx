<<<<<<< HEAD
export const dynamic = 'force-dynamic';

async function getApiStatus(): Promise<'ok' | 'degraded' | 'unreachable'> {
  const base = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' });
    const body = (await res.json()) as { data?: { status?: 'ok' | 'degraded' } };
    return body.data?.status ?? 'degraded';
  } catch {
    return 'unreachable';
  }
}

export default async function HomePage() {
  const status = await getApiStatus();
  return (
    <main>
      <h1>Practice the interview before it counts.</h1>
      <p>
        An AI interviewer asks, listens, and adjusts the next question to how you answered. Sign-in
        and interview setup arrive in the next phases.
      </p>
      <div className="status" role="status">
        Backend: <strong>{status}</strong>
      </div>
    </main>
=======
import Link from 'next/link';

const reasons = [
  {
    title: 'It adapts to how you answer',
    body: 'A strong answer earns a harder question. A shaky one gets a clarifying follow-up. Like a real interviewer, it never just reads from a fixed list.',
  },
  {
    title: 'Speak it or type it',
    body: 'Practice out loud the way the real interview will go, or type when you want to think. Switch between the two mid-session.',
  },
  {
    title: 'Built around your target job',
    body: 'Upload your resume and paste the job description. Questions come from the skills and projects you will actually be asked about.',
  },
  {
    title: 'Feedback that says what was missing',
    body: 'Not just a score. For every answer you see what you covered, which concepts you skipped, and a stronger version to learn from.',
  },
  {
    title: 'See your progress over time',
    body: 'Skill-by-skill scores across sessions show your weak spots, and a study plan points you at what to fix first.',
  },
  {
    title: 'Private by design',
    body: 'Your resume and recordings are stored securely and are only visible to you.',
  },
];

const steps = [
  { n: '1', title: 'Set up', body: 'Pick the role, level, interview type and length. Add a resume or job description if you have one.' },
  { n: '2', title: 'Get interviewed', body: 'Answer one question at a time. The interviewer follows up, probes gaps and adjusts difficulty.' },
  { n: '3', title: 'Review and improve', body: 'Get a full report with scores, strengths, gaps and a plan for what to practice next.' },
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="wrap bar">
          <Link href="/" className="brand">
            Interview<span>Pro</span>
          </Link>
          <nav aria-label="Account" className="bar-actions">
            <Link href="/login" className="link">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="wrap hero">
          <div>
            <p className="eyebrow">AI mock interviews</p>
            <h1>Practice the interview before it counts.</h1>
            <p className="lead">
              An AI interviewer asks, listens, and adjusts the next question to how you answered.
              Then it tells you exactly what to work on.
            </p>
            <div className="cta-row">
              <Link href="/register" className="btn btn-primary btn-lg">
                Start practicing
              </Link>
              <Link href="/login" className="btn btn-ghost btn-lg">
                I have an account
              </Link>
            </div>
          </div>

          <figure className="exchange" aria-label="Example interview exchange">
            <div className="turn">
              <span className="who">Interviewer</span>
              <p>What is middleware in Express?</p>
            </div>
            <div className="turn turn-you">
              <span className="who">You</span>
              <p>It runs between the request and the response.</p>
            </div>
            <div className="turn">
              <span className="who">Interviewer</span>
              <p>Right. How does Express decide the order in which middleware runs?</p>
              <span className="tag">Follow-up on a gap</span>
            </div>
            <figcaption>Illustrative example</figcaption>
          </figure>
        </section>

        <section className="wrap section" aria-labelledby="why">
          <h2 id="why">Why practice here</h2>
          <p className="section-lead">
            Reading answers is not the same as giving them under pressure. This is built to close
            that gap.
          </p>
          <ul className="reasons">
            {reasons.map((r) => (
              <li key={r.title}>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="wrap section" aria-labelledby="how">
          <h2 id="how">How it works</h2>
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.n}>
                <span className="step-n" aria-hidden="true">
                  {s.n}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="wrap final">
          <h2>Your next interview starts with one practice run.</h2>
          <Link href="/register" className="btn btn-primary btn-lg">
            Create your free account
          </Link>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">© {new Date().getFullYear()} AI InterviewPro</div>
      </footer>
    </>
>>>>>>> 69790ac84eecb67513ed2092a1f6cb35277c2da6
  );
}
