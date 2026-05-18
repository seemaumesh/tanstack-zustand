import type { City } from '../types/weather'

export const CITIES: City[] = [
  { id: 'sydney',    name: 'Sydney',    state: 'NSW', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { id: 'melbourne', name: 'Melbourne', state: 'VIC', lat: -37.8136, lon: 144.9631, timezone: 'Australia/Melbourne' },
  { id: 'brisbane',  name: 'Brisbane',  state: 'QLD', lat: -27.4698, lon: 153.0251, timezone: 'Australia/Brisbane' },
  { id: 'perth',     name: 'Perth',     state: 'WA',  lat: -31.9505, lon: 115.8605, timezone: 'Australia/Perth' },
  { id: 'adelaide',  name: 'Adelaide',  state: 'SA',  lat: -34.9285, lon: 138.6007, timezone: 'Australia/Adelaide' },
  { id: 'hobart',    name: 'Hobart',    state: 'TAS', lat: -42.8821, lon: 147.3272, timezone: 'Australia/Hobart' },
  { id: 'darwin',    name: 'Darwin',    state: 'NT',  lat: -12.4634, lon: 130.8456, timezone: 'Australia/Darwin' },
  { id: 'canberra',  name: 'Canberra',  state: 'ACT', lat: -35.2809, lon: 149.1300, timezone: 'Australia/Sydney' },
]
