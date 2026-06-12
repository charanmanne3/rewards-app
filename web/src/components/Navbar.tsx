import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-[var(--text-h)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-[var(--accent)]"
          >
            <path d="M4 4a2 2 0 0 0-2 2v1h20V6a2 2 0 0 0-2-2H4z" />
            <path
              fillRule="evenodd"
              d="M18 9H2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H2zm-12 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <span>RewardsApp</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--accent-bg)] font-medium text-[var(--accent)]'
                  : 'text-[var(--text)] hover:text-[var(--text-h)]'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/rewards"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--accent-bg)] font-medium text-[var(--accent)]'
                  : 'text-[var(--text)] hover:text-[var(--text-h)]'
              }`
            }
          >
            Find Cards
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
