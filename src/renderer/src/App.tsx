import { useState, useEffect } from 'react'
import { taskApi, tagApi } from './lib/ipc'
import type { TaskWithTags } from '@shared/task'
import type { Tag } from '@shared/tag'

export default function App() {
  const [pong, setPong] = useState<string>('')
  const [tasks, setTasks] = useState<TaskWithTags[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [todayTasks, setTodayTasks] = useState<TaskWithTags[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    window.api.ping().then(setPong)

    Promise.all([
      taskApi.list({}),
      tagApi.list(),
      taskApi.getToday(),
    ])
      .then(([allTasks, allTags, today]) => {
        setTasks(allTasks)
        setTags(allTags)
        setTodayTasks(today)
      })
      .catch((e: Error) => setError(e.message))
  }, [])

  const handleCreateTest = async () => {
    try {
      const task = await taskApi.create({
        title: `Test Task ${Date.now()}`,
        kind: 'todo',
        frequency: 'once',
      })
      setTasks((prev) => [...prev, { ...task, tags: [] }])
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleCreateTag = async () => {
    try {
      const tag = await tagApi.create(`tag-${Date.now()}`, '#FEE2E2')
      setTags((prev) => [...prev, tag])
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-semibold text-neutral-900">
          时间规划工具
        </h1>
        <p className="text-neutral-500 text-lg">Time Planner MVP v0.1</p>
        {pong && (
          <p className="text-sm text-emerald-600">IPC Bridge: {pong}</p>
        )}
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 p-2 rounded-smooth">
            {error}
          </p>
        )}

        <div className="border border-neutral-200 rounded-smooth p-4 space-y-2 text-left text-sm">
          <p>
            <span className="font-medium">All Tasks:</span> {tasks.length}
          </p>
          <p>
            <span className="font-medium">Today Tasks:</span> {todayTasks.length}
          </p>
          <p>
            <span className="font-medium">Tags:</span> {tags.length}
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={handleCreateTest}
            className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded-smooth hover:bg-neutral-800 transition-colors"
          >
            + Task
          </button>
          <button
            onClick={handleCreateTag}
            className="px-3 py-1.5 text-sm bg-neutral-200 text-neutral-800 rounded-smooth hover:bg-neutral-300 transition-colors"
          >
            + Tag
          </button>
        </div>
      </div>
    </div>
  )
}
