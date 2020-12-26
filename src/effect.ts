type Deps = Set<ReactiveEffect>
type DepsMap = Map<any, Deps>
type ReactiveEffect = () => any

const targetMap = new WeakMap<any, DepsMap>()

let activeEffect: ReactiveEffect | undefined
const effectStack: ReactiveEffect[] = []

export function track(target: object, key: unknown) {
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

export function trigger(target: object, key: any, newValue?: any) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key)
  if (effects) {
    effects.forEach((effect) => effect())
  }
}

export function effect(fn: () => any) {
  const effect = createReactiveEffect(fn)
  return effect
}

function createReactiveEffect(fn: () => any) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  return effect
}
