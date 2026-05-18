import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const POLL_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes — matches query staleTime

function weatherSsePlugin(): Plugin {
  return {
    name: 'weather-sse',
    configureServer(server) {
      server.middlewares.use(
        '/api/weather-stream',
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          // URL after the mount path: /api/weather-stream/sydney → '/sydney'
          const cityId = req.url?.slice(1).split('?')[0]
          if (!cityId) return next()

          const { CITIES } = await server.ssrLoadModule('/src/data/cities.ts')
          const city = CITIES.find((c: { id: string }) => c.id === cityId)
          if (!city) {
            res.statusCode = 404
            res.end('City not found')
            return
          }

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          })

          const send = (event: string, data: unknown) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          }

          let lastFingerprint: string | null = null

          const poll = async () => {
            try {
              const params = new URLSearchParams({
                latitude: String(city.lat),
                longitude: String(city.lon),
                timezone: city.timezone,
                current_weather: 'true',
                forecast_days: '1',
              })
              const weatherRes = await fetch(`${WEATHER_BASE_URL}?${params}`)
              if (!weatherRes.ok) return
              const json = await weatherRes.json() as { current_weather: unknown }
              const fingerprint = JSON.stringify(json.current_weather)
              if (lastFingerprint !== null && lastFingerprint !== fingerprint) {
                send('updated', { currentWeather: json.current_weather })
              }
              lastFingerprint = fingerprint
            } catch {
              // network errors are transient — silently retry on next interval
            }
          }

          send('connected', { cityId })
          await poll()

          let timeoutId: ReturnType<typeof setTimeout>
          const schedule = () => {
            timeoutId = setTimeout(() => poll().finally(schedule), POLL_INTERVAL_MS)
          }
          schedule()

          req.on('close', () => clearTimeout(timeoutId))
        },
      )
    },
  }
}

export default defineConfig({
  plugins: [
    tanstackStart(), // must come before react()
    react(),
    tailwindcss(),
    weatherSsePlugin(),
  ],
})
