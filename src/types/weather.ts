export interface City {
  id: string
  name: string
  state: string
  lat: number
  lon: number
  timezone: string
}

export interface CurrentWeather {
  temperature: number
  weathercode: number
  windspeed: number
  winddirection: number
  time: string
}

export interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  precipitation_probability: number[]
  weathercode: number[]
}

export interface DailyWeather {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  weathercode: number[]
  precipitation_sum: number[]
}

export interface WeatherData {
  current_weather: CurrentWeather
  hourly: HourlyWeather
  daily: DailyWeather
}
