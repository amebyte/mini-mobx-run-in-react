import { reactive } from "@vue/reactivity";
import { observer } from "./vue-reactivity-react"

const proxy = reactive({ name: 'Cobyte', secondsPassed: 0 })


const TimerView = observer(({ proxy }) => <span>the content run in @vue/reactivity is "Seconds passed: {proxy.secondsPassed}"</span>)

function App() {
  return (
    <TimerView proxy={proxy}></TimerView>
  );
}

setInterval(() => {
  proxy.secondsPassed +=1
}, 1000)

export default App;