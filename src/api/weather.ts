import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import type { City, WeatherData } from '../types/weather'

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

async function fetchWeather(lat: number, lon: number, timezone: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone,
    current_weather: 'true',
    hourly: 'temperature_2m,precipitation_probability,weathercode',
    daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  })

  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`)
  return res.json()
}

export const getWeatherFn = createServerFn()
  .inputValidator((input: { lat: number; lon: number; timezone: string }) => input)
  .handler(({ data }) => fetchWeather(data.lat, data.lon, data.timezone))

export function weatherQueryOptions(city: City) {
  return queryOptions({
    queryKey: ['weather', city.id],
    queryFn: () => getWeatherFn({ data: { lat: city.lat, lon: city.lon, timezone: city.timezone } }),
    staleTime: 1000 * 60 * 10,
  })
}
