import { useState, useEffect } from 'react'

export default function App() {
  const [pong, setPong] = useState<string>('')

  useEffect(() => {
    window.api.ping().then(setPong)
  }, [])

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold text-neutral-900">
          时间规划工具
        </h1>
        <p className="text-neutral-500 text-lg">Time Planner MVP v0.1</p>
        {pong && (
          <p className="text-sm text-emerald-600">
            IPC Bridge: {pong}
          </p>
        )}
      </div>
    </div>
  )
}
