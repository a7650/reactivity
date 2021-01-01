import { ITERATE_KEY } from './handlers'
import { TrackOpTypes, TriggerOpTypes } from './operations'

// 存储依赖
type Deps = Set<ReactiveEffect>
// 通过key去获取依赖，key => Deps
type DepsMap = Map<any, Deps>

interface ReactiveEffect<T = any> {
  (): T
  raw: () => T
  options: ReactiveEffectOptions
}

//
interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: (job: ReactiveEffect) => void
}

// 通过target去获取DepsMap，target => DepsMap
const targetMap = new WeakMap<any, DepsMap>()

// 当前正在执行的effect
let activeEffect: ReactiveEffect | undefined

// 存储effect的调用栈
const effectStack: ReactiveEffect[] = []

// 收集依赖
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  if (!deps.has(activeEffect)) {
    deps.add(activeEffect)
  }
}

// 通知更新
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key: any,
  newValue?: any
) {
  // 获取该对象的depsMap
  const depsMap = targetMap.get(target)
  // 获取不到时说明没有触发过getter
  if (!depsMap) {
    return
  }
  const effects = new Set<ReactiveEffect>()
  const add = (data: Set<ReactiveEffect> | undefined) => {
    if (data) {
      data.forEach((effect) => {
        if (effect !== activeEffect) {
          effects.add(effect)
        }
      })
    }
  }
  add(depsMap.get(key))
  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    add(depsMap.get(Array.isArray(target) ? 'length' : ITERATE_KEY))
  }
  // 然后根据key获取deps，也就是之前存的effect函数
  // 执行所有的effect函数
  effects.forEach((effect) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })
}

export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = {}
): ReactiveEffect<T> {
  // 创建一个effect函数
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}

function createReactiveEffect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  const effect = function reactiveEffect() {
    // 当前effectStack调用栈不存在这个effect时再执行，避免死循环
    if (!effectStack.includes(effect)) {
      try {
        // 把当前的effectStack添加进effectStack
        effectStack.push(effect)
        // 设置当前的effect，这样Proxy中的getter就可以访问到了
        activeEffect = effect
        // 执行函数
        return fn()
      } finally {
        // 执行完后就将当前这个effect出栈
        effectStack.pop()
        // 把activeEffect恢复
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  effect.raw = fn
  effect.options = options
  return effect
}
