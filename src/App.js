import { makeAutoObservable, observer } from "./mini-mobx"

class Timer {
  secondsPassed = 0

  constructor() {
    makeAutoObservable(this)
  }

  increaseTimer() {
    this.secondsPassed += 1
  }
}

const myTimer = new Timer()

const TimerView = observer(({ timer }) => <span>Seconds passed: {timer.secondsPassed}</span>)

function App() {
  return (
    <TimerView timer={myTimer}></TimerView>
  );
}

setInterval(() => {
    myTimer.increaseTimer()
}, 1000)

export default App;