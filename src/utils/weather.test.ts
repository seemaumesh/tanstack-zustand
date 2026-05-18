import { describe, it, expect } from 'vitest'
import {
  getWeatherDescription,
  getWeatherEmoji,
  formatDay,
  formatHour,
} from './weather'

describe('getWeatherDescription', () => {
  it('returns Clear sky for code 0', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky')
  })
  it('returns Partly cloudy for codes 1-2', () => {
    expect(getWeatherDescription(1)).toBe('Partly cloudy')
    expect(getWeatherDescription(2)).toBe('Partly cloudy')
  })
  it('returns Overcast for code 3', () => {
    expect(getWeatherDescription(3)).toBe('Overcast')
  })
  it('returns Rain for codes 61-69', () => {
    expect(getWeatherDescription(61)).toBe('Rain')
    expect(getWeatherDescription(69)).toBe('Rain')
  })
  it('returns Thunderstorm for codes 95-99', () => {
    expect(getWeatherDescription(95)).toBe('Thunderstorm')
    expect(getWeatherDescription(99)).toBe('Thunderstorm')
  })
  it('returns Unknown for out-of-range codes', () => {
    expect(getWeatherDescription(100)).toBe('Unknown')
  })
})

describe('getWeatherEmoji', () => {
  it('returns ☀️ for code 0', () => {
    expect(getWeatherEmoji(0)).toBe('☀️')
  })
  it('returns ⛅ for codes 1-2', () => {
    expect(getWeatherEmoji(1)).toBe('⛅')
  })
  it('returns ❄️ for snow codes 71-79', () => {
    expect(getWeatherEmoji(71)).toBe('❄️')
  })
  it('returns ⛈️ for thunderstorm codes', () => {
    expect(getWeatherEmoji(95)).toBe('⛈️')
  })
  it('returns 🌡️ for unknown codes', () => {
    expect(getWeatherEmoji(100)).toBe('🌡️')
  })
})

describe('formatDay', () => {
  it('returns a non-empty string for a valid date', () => {
    const result = formatDay('2026-05-18')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatHour', () => {
  it('returns a non-empty string for a valid datetime', () => {
    const result = formatHour('2026-05-18T14:00')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
