import { useState, useRef } from "react"

let Listener
// 创建沙箱环境
export function createSignal(value) {
  // 创建一个与外部环境隔离的对象变量
  const context = {
    value,
    observers: null
  }
  // 创建一个外部环境可以访问 context 对象的方法
  function getter() {
    if (Listener) {
        if (!context.observers) {
            context.observers = new Set([Listener])
        } else {
            context.observers.add(Listener)
        }
    }
    return context.value
  }
  // 创建一个外部环境可以访问 context 对象的方法
  function setter(val) {
    context.value = val
    // 把存储订阅者的变量的订阅者全部通知一次
    context.observers.forEach(o => o.onInvalid ? o.onInvalid() : o.fn())
  }

  // 暴露外部环境可以访问 context 对象的方法
  return [getter, setter]
}

function createEffect(fn, onInvalid) {
  // 把需要观察的函数赋值到一个中间变量中去
  Listener = {
    fn,
    onInvalid
  }
  // 初始化
  fn()
  Listener = null
}

export function createRenderEffect(baseComponent) {
    return (props) => {
        const [, setState] = useState()
        const adm = useRef()
        let renderResult
        if (!adm.current) {
          // 保存字面量的订阅者中介
          adm.current = { 
              fn: baseComponent, 
              onInvalid: () => {
                  setState(Symbol())
              }
          }
        }
        Listener = adm.current
        renderResult = Listener.fn(props)
        Listener = null
        return renderResult    
    }
}