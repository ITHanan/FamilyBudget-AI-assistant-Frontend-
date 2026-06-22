import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <main className="landing">
      <section className="landing-content">
        <p className="eyebrow">FamilyBudget AI</p>
        <h1>Your family's AI finance assistant</h1>
        <p className="lead">
          Track subscriptions, understand recurring monthly and yearly costs, see renewals before they hit, and ask questions about your household spending.
        </p>
        <div className="actions">
          <Link className="button" to="/login">Login</Link>
          <Link className="secondary-button" to="/register">Register</Link>
        </div>
      </section>
    </main>
  );
}
