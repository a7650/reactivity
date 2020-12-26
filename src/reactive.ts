import { baseHandlers } from './handlers'
import { isObject } from './utils'

type Target = object

const proxyMap = new WeakMap()

export function reactive<T extends object>(target: T): T {
  return createReactiveObject(target)
}

function createReactiveObject(target: Target) {
  if (!isObject(target)) {
    return target
  }
  if (proxyMap.has(target)) {
    return proxyMap.get(target)
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}
