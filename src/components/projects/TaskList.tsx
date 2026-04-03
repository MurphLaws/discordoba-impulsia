'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate: Date | null
  assigneeId: string | null
  assignee: {
    id: string
    name: string | null
    email: string
  } | null
}

interface User {
  id: string
  name: string | null
  email: string
}

interface TaskListProps {
  projectId: string
  initialTasks?: Task[]
  canManage?: boolean
}

export default function TaskList({ projectId, initialTasks = [], canManage = false }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', assigneeId: '', dueDate: '' })
  const [addLoading, setAddLoading] = useState(false)

  // Fetch tasks on mount if not provided
  useEffect(() => {
    if (initialTasks.length === 0) {
      fetchTasks()
    }
    if (canManage) {
      fetchUsers()
    }
  }, [projectId])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (res.ok) {
        setTasks(
          tasks.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t))
        )
      }
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar tarea?')) return
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId))
      }
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    setAddLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          assigneeId: newTask.assigneeId || null,
          dueDate: newTask.dueDate || null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setTasks([...tasks, data.task])
        setNewTask({ title: '', assigneeId: '', dueDate: '' })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Error adding task:', err)
    } finally {
      setAddLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando tareas...</div>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tareas</h3>
        {canManage && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <Plus className="w-4 h-4" />
            Nueva tarea
          </button>
        )}
      </div>

      {showAddForm && canManage && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
          <div>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Título de la tarea"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newTask.assigneeId}
              onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Sin asignar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewTask({ title: '', assigneeId: '', dueDate: '' })
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddTask}
              disabled={addLoading || !newTask.title.trim()}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {addLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Sin tareas</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id, task.completed)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    task.completed
                      ? 'text-gray-500 line-through'
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  {task.assignee && (
                    <span>{task.assignee.name || task.assignee.email}</span>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
              {canManage && (
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
