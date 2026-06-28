import { PopupHeader } from './PopupHeader'
import { TodayTaskList } from './TodayTaskList'

export function PopupApp() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <PopupHeader />
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <TodayTaskList />
      </div>
    </div>
  )
}
