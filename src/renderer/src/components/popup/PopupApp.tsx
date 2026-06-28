import { useEffect, useRef } from 'react'
import { PopupHeader } from './PopupHeader'
import { TodayTaskList } from './TodayTaskList'
import { QuickAddInput } from '../todo/QuickAddInput'

export function PopupApp() {
  const contentRef = useRef<HTMLDivElement>(null)

  // Report content height to main process for responsive popup sizing
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    // Measure after render
    const raf = requestAnimationFrame(() => {
      const totalHeight = el.scrollHeight + 16 // 16px padding
      window.api.window.setPopupHeight(totalHeight)
    })
    return () => cancelAnimationFrame(raf)
  })

  return (
    <div className="flex flex-col h-screen bg-white">
      <PopupHeader />
      <div ref={contentRef} id="popup-content" className="flex-1 overflow-y-auto px-3 pb-3">
        <QuickAddInput className="mb-2" />
        <TodayTaskList />
      </div>
    </div>
  )
}
