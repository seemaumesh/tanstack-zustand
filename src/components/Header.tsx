import { Link, useRouterState } from '@tanstack/react-router'

export function Header() {
  const { location } = useRouterState()
  const isHome = location.pathname === '/'
  const isFavourites = location.pathname === '/favourites'

  return (
    <header className="bg-sky-600 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="text-xl font-semibold tracking-tight">AusWeather</span>
        </Link>
        <nav className="flex gap-1">
          <Link
            to="/"
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isHome ? 'bg-white text-sky-700' : 'hover:bg-sky-500',
            ].join(' ')}
          >
            All Cities
          </Link>
          <Link
            to="/favourites"
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isFavourites ? 'bg-white text-sky-700' : 'hover:bg-sky-500',
            ].join(' ')}
          >
            Favourites
          </Link>
        </nav>
      </div>
    </header>
  )
}
