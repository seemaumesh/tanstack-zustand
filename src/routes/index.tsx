import { createFileRoute } from '@tanstack/react-router'
import { CITIES } from '../data/cities'
import { CityCard } from '../components/CityCard'
import { weatherQueryOptions } from '../api/weather'

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) =>
    Promise.all(CITIES.map((city) => queryClient.ensureQueryData(weatherQueryOptions(city)))),
  component: HomePage,
})

function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Australian Capital Cities</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Live weather powered by{' '}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 hover:underline"
          >
            Open-Meteo
          </a>
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CITIES.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>
    </div>
  )
}
