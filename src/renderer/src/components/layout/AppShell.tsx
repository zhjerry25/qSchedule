import { Sidebar } from './Sidebar'
import { CardStream } from './CardStream'

export function AppShell() {
  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <CardStream />
    </div>
  )
}
