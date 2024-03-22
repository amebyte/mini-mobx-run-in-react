import { shallowRef, triggerRef } from "@vue/reactivity";
import { observer } from "./vue-reactivity-react"

class DataService {
  #r
  constructor(val) {
    this.#r = shallowRef(val)

    return new Proxy(this, {
      get(target, key) {
        console.log('talll', key)
        if (target.#r.value[key]) {
          return target.#r.value[key]
        } else {
          return target[key]
        }
      }
    })
  }
  setState(val) {
    this.#r.value = val
    // triggerRef(this.#r)
  }
}
const dataService = new DataService({ name: 'Cobyte', date: '2024-03-22' })
const TimerView = observer(({ proxy }) => <span>the content run in @vue/reactivity is "Seconds passed: {proxy.name}, the date is: {proxy.date} now is {proxy.now}"</span>)

function App() {
  return (
    <TimerView proxy={dataService}></TimerView>
  );
}

setInterval(() => {
  dataService.setState({ name: '掘金签约作者', date: '2024年3月22日', now: Date.now() })
}, 1000)

export default App;