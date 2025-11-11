'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function ReadingPrefs(){
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const translit = (params.get('translit') ?? 'off') as 'on'|'off'
  const trans = (params.get('trans') ?? 'off') as 'on'|'off'

  function setParam(key: 'translit'|'trans', value: 'on'|'off'){
    const p = new URLSearchParams(params)
    p.set(key, value)
    router.replace(`${pathname}?${p.toString()}`)
  }

  const baseBtn = 'px-3 py-1.5 rounded-lg text-sm border';
  const active = 'bg-primary text-primary-foreground border-transparent';
  const idle = 'bg-card text-gray-700 border-gray-200 dark:text-gray-200 dark:border-gray-700';

  return (
    <div className="flex items-center gap-2">
      <button
        className={`${baseBtn} ${translit==='on'?active:idle}`}
        onClick={()=>setParam('translit', translit==='on'?'off':'on')}
      >
        Roman transliteration
      </button>
      <button
        className={`${baseBtn} ${trans==='on'?active:idle}`}
        onClick={()=>setParam('trans', trans==='on'?'off':'on')}
      >
        English translation
      </button>
    </div>
  )
}
