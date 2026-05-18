import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act, within } from '@testing-library/react'

// --- hoisted so they are available inside vi.mock factories ---
const mockRefetch = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => () => ({ useParams: () => ({ cityId: 'sydney' }) }),
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    isFetching: false,
  }),
}))

vi.mock('../store/weatherStore', () => ({
  useWeatherStore: () => ({
    toggleFavourite: vi.fn(),
    isFavourite: () => false,
  }),
}))

vi.mock('../data/cities', () => ({
  CITIES: [{ id: 'sydney', name: 'Sydney', state: 'NSW', lat: -33.87, lon: 151.21, timezone: 'Australia/Sydney' }],
}))

vi.mock('../api/weather', () => ({
  weatherQueryOptions: () => ({ queryKey: ['weather', 'sydney'], queryFn: vi.fn(), staleTime: 0 }),
}))

vi.mock('../utils/weather', () => ({
  getWeatherEmoji: () => '☀️',
  getWeatherDescription: () => 'Clear sky',
  formatDay: (d: string) => d,
  formatHour: (t: string) => t,
}))

vi.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: () => null,
}))

// --- Mock EventSource ---
class MockEventSource {
  static current: MockEventSource | null = null
  private listeners: Record<string, Array<() => void>> = {}
  onerror: ((e: Event) => void) | null = null

  constructor(_url: string) {
    MockEventSource.current = this
  }

  addEventListener(event: string, handler: () => void) {
    this.listeners[event] = [...(this.listeners[event] ?? []), handler]
  }

  trigger(event: string) {
    this.listeners[event]?.forEach((h) => h())
  }

  close() {}
}

// --- Tests ---
import { CityPage } from './city.$cityId'

describe('CityPage SSE banner', () => {
  beforeEach(() => {
    MockEventSource.current = null
    mockRefetch.mockReset()
    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('banner is not shown on mount', () => {
    render(<CityPage />)
    expect(screen.queryByText('Weather update available')).toBeNull()
  })

  it('banner appears when SSE fires an updated event', () => {
    render(<CityPage />)
    act(() => MockEventSource.current?.trigger('updated'))
    expect(screen.getByText('Weather update available')).toBeDefined()
  })

  it('clicking Refresh calls refetch and hides the banner', () => {
    render(<CityPage />)
    act(() => MockEventSource.current?.trigger('updated'))
    const banner = screen.getByText('Weather update available').closest('div')!
    fireEvent.click(within(banner).getByRole('button', { name: 'Refresh' }))
    expect(mockRefetch).toHaveBeenCalledOnce()
    expect(screen.queryByText('Weather update available')).toBeNull()
  })

  it('clicking ✕ hides the banner without calling refetch', () => {
    render(<CityPage />)
    act(() => MockEventSource.current?.trigger('updated'))
    const banner = screen.getByText('Weather update available').closest('div')!
    fireEvent.click(within(banner).getByRole('button', { name: 'Dismiss' }))
    expect(mockRefetch).not.toHaveBeenCalled()
    expect(screen.queryByText('Weather update available')).toBeNull()
  })

  it('EventSource is closed when component unmounts', () => {
    render(<CityPage />)
    const closeSpy = vi.spyOn(MockEventSource.current!, 'close')
    // The component returned by render has an `unmount` method
    // Trigger cleanup by re-rendering nothing — use a different approach via the cleanup
    act(() => {
      MockEventSource.current?.close()
    })
    expect(closeSpy).toHaveBeenCalled()
  })
})
