import Link from "next/link";

const featureItems = [
  {
    title: "Request Building",
    text: "Compose GET, POST, PUT, PATCH, and DELETE calls with headers, query params, authentication details, and raw/JSON payloads.",
  },
  {
    title: "Response Inspection",
    text: "Inspect status codes, response time, body output, and headers so you can diagnose behavior quickly and accurately.",
  },
  {
    title: "Collections and Reuse",
    text: "Save requests into reusable collections so teams can standardize API workflows across development and QA.",
  },
  {
    title: "Environment Separation",
    text: "Run the same request against local, staging, and production environments by switching variable sets.",
  },
];

const workflow = [
  "Define endpoint URLs and methods for each API operation.",
  "Configure headers, authentication, and request payloads.",
  "Send requests and inspect the full server response.",
  "Iterate quickly until endpoints behave as expected.",
  "Organize tested requests into clean, shareable collections.",
];

export default function Home() {
  return (
    <main className="landing-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-mark">AT</span>
          <span className="brand-text">API Tester</span>
        </div>

        <nav className="auth-actions" aria-label="Authentication actions">
          <Link href="/login" className="btn btn-ghost" role="button">
            Login
          </Link>
          <Link href="/signup" className="btn btn-solid" role="button">
            Sign Up
          </Link>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Web API Development Workspace</p>
        <h1>Understand APIs. Test faster. Deliver reliable integrations.</h1>
        <p className="hero-copy">
          API Tester is a web-based platform inspired by tools like Postman,
          built to help developers, testers, and teams design, validate, and
          debug APIs in one focused environment.
        </p>
      </section>

      <section className="panel">
        <h2>What is an API?</h2>
        <p>
          An API (Application Programming Interface) is a contract that allows
          two software systems to communicate with each other in a structured
          way. Instead of one application directly accessing another
          application&apos;s internal code or database, it sends requests to
          defined endpoints and receives standardized responses.
        </p>
        <p>
          APIs power modern digital products by connecting frontend interfaces,
          backend services, databases, payment gateways, third-party platforms,
          and microservices. In practice, APIs make software modular,
          maintainable, and scalable.
        </p>
      </section>

      <section className="panel">
        <h2>What is this API Tester?</h2>
        <p>
          This API Tester is your central place to execute HTTP requests,
          inspect responses, and validate endpoint behavior before integrating
          into frontend or external systems. It helps reduce debugging cycles by
          giving clear visibility into request configuration and server output.
        </p>
        <div className="feature-grid">
          {featureItems.map((item) => (
            <article key={item.title} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel panel-workflow">
        <h2>Typical API Testing Workflow</h2>
        <ol>
          {workflow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="panel panel-footer-note">
        <h2>Why it matters</h2>
        <p>
          Reliable APIs are the backbone of modern applications. By testing early
          and often, teams prevent production defects, accelerate release cycles,
          and improve confidence in every integration.
        </p>
      </section>
    </main>
  );
}
