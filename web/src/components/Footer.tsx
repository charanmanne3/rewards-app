import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-[var(--text)]">
        <span>© 2025 RewardsApp</span>
        <Link to="/rewards" className="transition-colors hover:text-[var(--accent)]">
          Find Cards
        </Link>
      </div>
    </footer>
  )
}
