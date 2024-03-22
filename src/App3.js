import { reactive, shallowRef } from "@vue/reactivity";
import { observer } from "./vue-reactivity-react"

class DataService {
  #r
  constructor(val) {
    this.#r = shallowRef(val)
  }
  get count() {
    return this.#r.value
  }
  setCount(val) {
    this.#r.value = val
  }
}
const dataService = new DataService(0)
const TimerView = observer(({ proxy }) => <span>the content run in @vue/reactivity is "Seconds passed: {proxy.count}"</span>)

function App() {
  return (
    <TimerView proxy={dataService}></TimerView>
  );
}

setInterval(() => {
  dataService.setCount(Date.now())
}, 1000)

export default App;