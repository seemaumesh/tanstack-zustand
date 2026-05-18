import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { weatherQueryOptions } from '../api/weather'
import { FavouriteButton } from './FavouriteButton'
import { getWeatherEmoji, getWeatherDescription } from '../utils/weather'
import type { City } from '../types/weather'

interface CityCardProps {
  city: City
}

export function CityCard({ city }: CityCardProps) {
  const { data, isLoading, isError } = useQuery(weatherQueryOptions(city))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
      <Link to="/city/$cityId" params={{ cityId: city.id }} className="block p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
              {city.name}
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-wide">{city.state}</p>
          </div>
          {isLoading ? (
            <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
          ) : (
            <span className="text-3xl">
              {data ? getWeatherEmoji(data.current_weather.weathercode) : null}
            </span>
          )}
        </div>

        {isError && <p className="text-xs text-red-400">Failed to load weather</p>}

        {isLoading && (
          <div className="space-y-2">
            <div className="h-8 bg-slate-100 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
          </div>
        )}

        {data && (
          <div>
            <p className="text-4xl font-bold text-slate-800 my-1">
              {Math.round(data.current_weather.temperature)}°C
            </p>
            <p className="text-sm text-slate-500">
              {getWeatherDescription(data.current_weather.weathercode)}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {Math.round(data.current_weather.windspeed)} km/h wind
            </p>
          </div>
        )}
      </Link>

      <div className="px-5 pb-4">
        <FavouriteButton cityId={city.id} />
      </div>
    </div>
  )
}
