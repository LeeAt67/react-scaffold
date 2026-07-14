import { observer } from 'mobx-react-lite'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Todo } from '@/types'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

const TodoItem = observer(({ todo, onToggle, onRemove }: Props) => {
  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-lg border px-4 py-3 transition',
        todo.completed
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
          : 'border-border bg-card hover:border-muted-foreground/30',
      )}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
      />
      <span
        className={cn(
          'flex-1 text-sm',
          todo.completed
            ? 'text-muted-foreground line-through'
            : 'text-foreground',
        )}
      >
        {todo.text}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        删除
      </Button>
    </li>
  )
})

export default TodoItem
