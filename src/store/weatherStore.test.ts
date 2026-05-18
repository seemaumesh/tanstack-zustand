import { describe, it, expect, beforeEach } from 'vitest'
import { useWeatherStore } from './weatherStore'

beforeEach(() => {
  useWeatherStore.setState({ favourites: [] })
})

describe('weatherStore', () => {
  it('starts with no favourites', () => {
    expect(useWeatherStore.getState().favourites).toEqual([])
  })

  it('isFavourite returns false for unknown city', () => {
    expect(useWeatherStore.getState().isFavourite('sydney')).toBe(false)
  })

  it('toggleFavourite adds a city', () => {
    useWeatherStore.getState().toggleFavourite('sydney')
    expect(useWeatherStore.getState().isFavourite('sydney')).toBe(true)
  })

  it('toggleFavourite removes a city that is already saved', () => {
    useWeatherStore.getState().toggleFavourite('sydney')
    useWeatherStore.getState().toggleFavourite('sydney')
    expect(useWeatherStore.getState().isFavourite('sydney')).toBe(false)
  })

  it('can save multiple cities independently', () => {
    useWeatherStore.getState().toggleFavourite('sydney')
    useWeatherStore.getState().toggleFavourite('melbourne')
    expect(useWeatherStore.getState().isFavourite('sydney')).toBe(true)
    expect(useWeatherStore.getState().isFavourite('melbourne')).toBe(true)
    expect(useWeatherStore.getState().isFavourite('brisbane')).toBe(false)
  })

  it('removing one city does not affect others', () => {
    useWeatherStore.getState().toggleFavourite('sydney')
    useWeatherStore.getState().toggleFavourite('melbourne')
    useWeatherStore.getState().toggleFavourite('sydney')
    expect(useWeatherStore.getState().isFavourite('sydney')).toBe(false)
    expect(useWeatherStore.getState().isFavourite('melbourne')).toBe(true)
  })
})
