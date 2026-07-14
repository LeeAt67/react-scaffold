import { observer } from 'mobx-react-lite'
import { useStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Counter = observer(() => {
  const { counter } = useStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>计数器</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <p className="text-5xl font-bold tabular-nums text-foreground">
            {counter.count}
          </p>
          <p className="text-sm text-muted-foreground">
            两倍值：<span className="font-mono font-medium text-foreground">{counter.double}</span>
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => counter.decrement()}>
              -1
            </Button>
            <Button variant="secondary" onClick={() => counter.reset()}>
              重置
            </Button>
            <Button onClick={() => counter.increment()}>+1</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default Counter
