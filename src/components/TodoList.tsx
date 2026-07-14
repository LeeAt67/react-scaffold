import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TodoItem from './TodoItem'

const TodoList = observer(() => {
  const { todo } = useStore()
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    todo.addTodo(text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>待办事项</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 统计 */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">
            总计：{todo.todos.length}
          </Badge>
          <Badge variant="secondary">
            待完成：{todo.pendingCount}
          </Badge>
          <Badge variant="default">
            已完成：{todo.completedCount}
          </Badge>
        </div>

        {/* 输入 */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入待办事项，按回车添加..."
          />
          <Button onClick={handleAdd} disabled={!input.trim()}>
            添加
          </Button>
        </div>

        {/* 列表 */}
        {todo.todos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            暂无待办事项，添加一条吧 ✨
          </p>
        ) : (
          <ul className="space-y-2">
            {todo.todos.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={(id) => todo.toggleTodo(id)}
                onRemove={(id) => todo.removeTodo(id)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
})

export default TodoList
