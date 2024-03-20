const globalState = {
    trackingDerivation: null,
    // 是否允许修改状态的开关
    allowStateChanges: false
  }
  // 对象观察器
  class ObservableObjectAdministration{
      constructor(target) {
          // 原始值保存
          this.target_ = target
          // 订阅者存储中心
          this.values_ = new Map()
      }

      defineObservableProperty_(key, value) {
          const observable = new ObservableValue(value)
          this.values_.set(key, observable)
          Object.defineProperty(this.target_, key, {
              get: () => {
                  return this.values_.get(key).get()
              },
              set: (val) => {
                  this.values_.get(key).setNewVal(val)
              }
          })
      }
  }
  export class Reaction {
    constructor(onInvalidate) {
        this.onInvalidate_ = onInvalidate
    }

    track(fn) {
        globalState.trackingDerivation = this
        fn()
        globalState.trackingDerivation = null
    }

    schedule_() {
        this.onInvalidate_()
    }
  }

  function createAction(fn) {
    // 这里有一个需要注意的点，返回函数需要使用 function 进行声明会比较方便获取原生对象的上下文，这里涉及到 this 的问题
    function res() {
      // 最后通过 executeAction 执行
      return executeAction(fn, this, arguments)
    }
    return res
  }

  function executeAction(fn, scope, args) {
    // 在执行原始函数之前开启允许修改开关
    globalState.allowStateChanges = true
    // 因为是用户写的函数，可能会存在错误，所以使用 try
    try {
      // 通过 apply 执行原始函数
      return fn.apply(scope, args)
    } catch (err) {
      throw err
    } finally {
      // 执行完原始函数后又关闭开关
      globalState.allowStateChanges = false
    }
  }

  function deepEnhancer(value) {
    // 如果是函数则封装 action 高阶函数
    if (typeof value === 'function') {
        return createAction(value) 
    }

    // todo

    // 如果是 observable 对象就返回，不处理
    // 如果是对象进行递归处理
    // 如果是数组也进行数组的递归处理

    return value
  }      

  // 将属性值包装成响应式对象
  class ObservableValue {
      constructor(value) {
        // 通过 deepEnhancer 处理 value 值
        this.value_ = deepEnhancer(value),
        this.observers_ = new Set()
      }

      get() {
          // 在这里进行依赖收集
          if (globalState.trackingDerivation) {
            this.observers_.add(globalState.trackingDerivation)
          }
          return this.value_
      }

      setNewVal(val) {
        // 在设置值之前判断是否允许修改
        checkIfStateModificationsAreAllowed(this)
        this.value_ = val
        // 在这里进行依赖触发
        this.observers_.forEach(derivation => derivation.schedule_())
      }
  }

  function checkIfStateModificationsAreAllowed(atom) {
    if (!globalState.allowStateChanges) {
      console.warn('Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed')
    }
  }

  export function observable(target) {
    const adm = new ObservableObjectAdministration(target)
    target.__ob__ = adm
    Object.keys(target).forEach(key => {
        adm.defineObservableProperty_(key, target[key])
    })
    return target
  }

  export function makeAutoObservable(target) {
    const adm = new ObservableObjectAdministration(target)
    target.__ob__ = adm
    // 获取实例的原型对象
    const proto = Object.getPrototypeOf(target)
    // 同时获取实例对象上的 key 和 原型对象上的 key，才能完整获取 class 中的属性和方法
    const keys = new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(proto)])
    // 删除不需要监听的属性
    keys.delete("constructor")
    keys.delete('__ob__')
    // 遍历所有属性进行监听
    keys.forEach(key => {
      adm.defineObservableProperty_(key, target[key])
    })
    return target
  }

  export function autorun(view) {
    // 实例化订阅者中介
    const reaction = new Reaction(
        () => {
            // 回调函数中执行依赖收集函数
            reaction.track(view)
        }
    )
    // 立即执行
    reaction.schedule_()  
  }