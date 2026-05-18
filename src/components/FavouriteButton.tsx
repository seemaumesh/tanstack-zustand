import { useWeatherStore } from '../store/weatherStore'

export function FavouriteButton({ cityId }: { cityId: string }) {
  const { toggleFavourite, isFavourite } = useWeatherStore()
  const fav = isFavourite(cityId)

  return (
    <button
      onClick={() => toggleFavourite(cityId)}
      className={[
        'text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer',
        fav
          ? 'bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100'
          : 'border-slate-200 text-slate-400 hover:border-yellow-300 hover:text-yellow-500',
      ].join(' ')}
    >
      {fav ? 'Saved' : 'Save'}
    </button>
  )
}
