import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type RecommendItem = {
  card_name: string
  reward_category: string
  reward_rate: string
  annual_fee: number | null
}

const CATEGORY_OPTIONS: Array<{ label: string; value: string }> = [
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

function formatAnnualFee(fee: number | null) {
  if (fee === null || fee === undefined) return 'N/A'
  return `$${fee}`
}

function apiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL as string | undefined
  if (!raw) return ''
  return raw.replace(/\/+$/, '')
}

function buildRecommendUrl(category: string) {
  const base = apiBaseUrl()
  const qs = new URLSearchParams({ category }).toString()
  return base ? `${base}/recommend?${qs}` : `/recommend?${qs}`
}

export default function Rewards() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialCategory = useMemo(() => {
    const param = searchParams.get('category') ?? ''
    return CATEGORY_OPTIONS.some((o) => o.value === param) ? param : CATEGORY_OPTIONS[0]!.value
  }, [])

  const [category, setCategory] = useState(initialCategory)
  const [items, setItems] = useState<RecommendItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedLabel = useMemo(() => {
    return CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category
  }, [category])

  function handleCategoryChange(value: string) {
    setCategory(value)
    setSearchParams({ category: value })
  }

  useEffect(() => {
    const ac = new AbortController()

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(buildRecommendUrl(category), {
          signal: ac.signal,
          headers: { Accept: 'application/json' },
        })

        const text = await res.text()
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}. ${text}`)
        }

        const json = JSON.parse(text) as unknown
        if (!Array.isArray(json)) throw new Error('Invalid response: expected a list')

        setItems(json as RecommendItem[])
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    run()
    return () => ac.abort()
  }, [category])

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-h)]">
          Card Recommendations
        </h1>
        <p className="mt-2 text-[var(--text)]">
          Pick a spending category and see the best rewards cards.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[var(--text-h)]">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] shadow-sm focus:border-[var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-bg)] sm:w-72"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-[var(--text)]">
            Showing best matches for:{' '}
            <span className="font-medium text-[var(--text-h)]">{selectedLabel}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-bg)] border-t-[var(--accent)]" />
          <div className="text-[var(--text)]">Loading recommendations...</div>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="text-sm font-semibold text-red-800">Something went wrong</div>
          <div className="mt-2 break-words text-sm text-red-700">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-10 text-center text-[var(--text)]">
          No recommendations found for this category.
        </div>
      ) : (
        <>
          <h2 className="mt-10 text-xl font-semibold text-[var(--text-h)]">Recommended cards</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <article
                key={`${it.card_name}-${it.reward_category}`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-h)]">{it.card_name}</h3>
                    <p className="mt-1 text-sm text-[var(--text)]">{it.reward_category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-[var(--text)]">Reward rate</div>
                    <div className="mt-1 text-2xl font-semibold text-[var(--accent)]">
                      {it.reward_rate}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--code-bg)] px-3 py-2">
                  <div className="text-sm text-[var(--text)]">Annual fee</div>
                  <div className="text-sm font-medium text-[var(--text-h)]">
                    {formatAnnualFee(it.annual_fee)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
