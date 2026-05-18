import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { CITIES } from '../data/cities'
import { weatherQueryOptions } from '../api/weather'
import { useWeatherStore } from '../store/weatherStore'
import { getWeatherEmoji, getWeatherDescription, formatDay, formatHour } from '../utils/weather'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const Route = createFileRoute('/city/$cityId')({
  component: CityPage,
})

function CityPage() {
  const { cityId } = Route.useParams()
  const city = CITIES.find((c) => c.id === cityId)
  const { toggleFavourite, isFavourite } = useWeatherStore()

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    ...weatherQueryOptions(city!),
    enabled: !!city,
  })

  const [showUpdateBanner, setShowUpdateBanner] = useState(false)

  useEffect(() => {
    const source = new EventSource(`/api/weather-stream/${cityId}`)

    source.addEventListener('updated', () => {
      setShowUpdateBanner(true)
    })

    source.onerror = () => source.close()

    return () => source.close()
  }, [cityId, refetch])

  if (!city) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 text-lg">City not found.</p>
        <Link to="/" className="mt-4 inline-block text-sky-600 hover:underline">
          Back to all cities
        </Link>
      </div>
    )
  }

  const fav = isFavourite(city.id)
  const now = new Date()
  const hourlySlice =
    data?.hourly.time
      .map((t, i) => ({
        time: t,
        temp: data.hourly.temperature_2m[i],
        precip: data.hourly.precipitation_probability[i],
        code: data.hourly.weathercode[i],
      }))
      .filter((h) => new Date(h.time) >= now)
      .slice(0, 12) ?? []

  return (
    <div className="space-y-6">
      {showUpdateBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-sky-600 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          <span>Weather update available</span>
          <button
            onClick={() => {
              refetch()
              setShowUpdateBanner(false)
            }}
            className="underline font-medium cursor-pointer bg-transparent border-0 text-white"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowUpdateBanner(false)}
            className="opacity-70 hover:opacity-100 cursor-pointer bg-transparent border-0 text-white"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <Link to="/" className="text-sky-600 hover:text-sky-700 text-sm inline-flex items-center gap-1">
        Back to all cities
      </Link>

      <div className="bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{city.name}</h1>
            <p className="text-sky-200 text-sm uppercase tracking-wide">{city.state}, Australia</p>
          </div>
          <button
            onClick={() => toggleFavourite(city.id)}
            title={fav ? 'Remove from favourites' : 'Add to favourites'}
            className="text-sm px-3 py-1.5 rounded-lg border border-sky-300 hover:bg-sky-400 transition-colors cursor-pointer bg-transparent"
          >
            {fav ? 'Saved' : 'Save'}
          </button>
        </div>

        {isLoading && <LoadingSpinner message="Fetching weather..." />}

        {isError && (
          <div className="mt-4 text-sky-100">
            <p>Failed to load weather data.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 underline text-sm cursor-pointer bg-transparent border-0 text-sky-100"
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <div className="mt-4 flex items-end gap-4">
            <span className="text-7xl">{getWeatherEmoji(data.current_weather.weathercode)}</span>
            <div>
              <p className="text-6xl font-bold leading-none">
                {Math.round(data.current_weather.temperature)}°C
              </p>
              <p className="text-sky-100 mt-1">
                {getWeatherDescription(data.current_weather.weathercode)}
              </p>
              <p className="text-sky-200 text-sm mt-1">
                {Math.round(data.current_weather.windspeed)} km/h wind
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs text-sky-200 hover:text-white transition-colors disabled:opacity-50 cursor-pointer bg-transparent border-0"
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {data && hourlySlice.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Hourly Forecast</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
              {hourlySlice.map((h) => (
                <div
                  key={h.time}
                  className="bg-white border border-slate-100 rounded-xl p-3 text-center shadow-sm min-w-[80px]"
                >
                  <p className="text-xs text-slate-400">{formatHour(h.time)}</p>
                  <p className="text-2xl my-1">{getWeatherEmoji(h.code)}</p>
                  <p className="text-sm font-semibold text-slate-700">{Math.round(h.temp)}°</p>
                  {h.precip > 0 && (
                    <p className="text-xs text-sky-500 mt-1">{h.precip}% rain</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {data && (
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">7-Day Forecast</h2>
          <div className="space-y-2">
            {data.daily.time.map((day, i) => (
              <div
                key={day}
                className="bg-white border border-slate-100 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm"
              >
                <p className="text-sm text-slate-600 w-36">{i === 0 ? 'Today' : formatDay(day)}</p>
                <span className="text-xl">{getWeatherEmoji(data.daily.weathercode[i])}</span>
                <p className="text-xs text-slate-400 flex-1 text-center">
                  {getWeatherDescription(data.daily.weathercode[i])}
                </p>
                <div className="flex gap-3 text-sm font-medium">
                  <span className="text-sky-500">{Math.round(data.daily.temperature_2m_min[i])}°</span>
                  <span className="text-slate-700">{Math.round(data.daily.temperature_2m_max[i])}°</span>
                </div>
                {data.daily.precipitation_sum[i] > 0 && (
                  <p className="text-xs text-sky-400 ml-3">{data.daily.precipitation_sum[i]}mm</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
