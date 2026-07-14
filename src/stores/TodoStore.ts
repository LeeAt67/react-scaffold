import { makeAutoObservable } from 'mobx'
import type { Todo } from '../types'

class TodoStore {
  todos: Todo[] = []

  constructor() {
    makeAutoObservable(this)
  }

  addTodo(text: string) {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    }
    this.todos.push(todo)
  }

  toggleTodo(id: string) {
    const todo = this.todos.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  removeTodo(id: string) {
    this.todos = this.todos.filter((t) => t.id !== id)
  }

  get completedCount() {
    return this.todos.filter((t) => t.completed).length
  }

  get pendingCount() {
    return this.todos.filter((t) => !t.completed).length
  }
}

export default TodoStore
