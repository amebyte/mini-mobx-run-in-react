import { createSignal, createRenderEffect } from './co-reactivity'
const [count, setCount] = createSignal(1)

const TimerView = createRenderEffect(({ count }) => <span>this counter is: {count()}</span>)

function App() {
  return (
    <TimerView count={count}></TimerView>
  );
}

setInterval(() => {
  setCount(count() + 1)
}, 1000)

export default App;