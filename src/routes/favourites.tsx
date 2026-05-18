import { createFileRoute, Link } from '@tanstack/react-router'
import { useWeatherStore } from '../store/weatherStore'
import { CITIES } from '../data/cities'
import { CityCard } from '../components/CityCard'

export const Route = createFileRoute('/favourites')({
  component: FavouritesPage,
})

function FavouritesPage() {
  const { favourites } = useWeatherStore()
  const favCities = CITIES.filter((c) => favourites.includes(c.id))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Favourites</h1>
        <p className="text-slate-500 mt-1 text-sm">Your saved cities</p>
      </div>

      {favCities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-4xl mb-3">☆</p>
          <p className="text-slate-500">No favourites yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            Go to{' '}
            <Link to="/" className="text-sky-600 hover:underline">
              All Cities
            </Link>{' '}
            and save some!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favCities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      )}
    </div>
  )
}
