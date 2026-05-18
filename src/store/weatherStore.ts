import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WeatherStore {
  favourites: string[]
  toggleFavourite: (cityId: string) => void
  isFavourite: (cityId: string) => boolean
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      favourites: [],
      toggleFavourite: (cityId) =>
        set((state) => ({
          favourites: state.favourites.includes(cityId)
            ? state.favourites.filter((id) => id !== cityId)
            : [...state.favourites, cityId],
        })),
      isFavourite: (cityId) => get().favourites.includes(cityId),
    }),
    { name: 'weather-store' }
  )
)
