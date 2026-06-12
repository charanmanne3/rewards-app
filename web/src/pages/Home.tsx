import { Link } from 'react-router-dom'

const CATEGORY_OPTIONS = [
  { label: 'Dining', value: 'dining' },
  { label: 'Grocery', value: 'grocery' },
  { label: 'Pharmacy', value: 'pharmacy' },
  { label: 'Home Improvement', value: 'home' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Online Retail', value: 'online' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Convenience', value: 'convenience' },
  { label: 'Department Store', value: 'department' },
]

const FEATURES = [
  {
    title: '9 Spending Categories',
    description: 'Dining, grocery, coffee, and more — we cover how you actually spend.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    title: 'Real Reward Rates',
    description: 'See actual cash-back and points percentages straight from card issuers.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M7.75 8.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM12.25 14a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
        <path d="M13.78 6.22a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06-1.06l6.5-6.5a.75.75 0 0 1 1.06 0Z" />
      </svg>
    ),
  },
  {
    title: 'Zero Sign-up',
    description: 'No account or email required. Just pick a category and compare instantly.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1 text-sm text-[var(--accent)]">
          Free · No sign-up required
        </div>
        <h1
          className="text-5xl font-semibold text-[var(--text-h)]"
          style={{ letterSpacing: '-1.5px', lineHeight: 1.1 }}
        >
          Find the best card<br />for every purchase
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--text)]">
          Pick a spending category and instantly see which credit cards earn the most rewards.
        </p>
        <div className="mt-8">
          <Link
            to="/rewards"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Find My Card
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--accent)]">
                {f.icon}
              </div>
              <h3 className="mb-1 text-base font-semibold text-[var(--text-h)]">{f.title}</h3>
              <p className="text-sm text-[var(--text)]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category quick links */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <h2 className="mb-5 text-center text-xl font-semibold text-[var(--text-h)]">
          Browse by category
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <Link
              key={c.value}
              to={`/rewards?category=${c.value}`}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
