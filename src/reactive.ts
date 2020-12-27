import { baseHandlers } from './handlers'
import { isObject } from './utils'

export type Target = object

const proxyMap = new WeakMap()

export function reactive<T extends object>(target: T): T {
  return createReactiveObject(target)
}

function createReactiveObject(target: Target) {
  // 只对对象添加reactive
  if (!isObject(target)) {
    return target
  }
  // 不能重复定义响应式数据
  if (proxyMap.has(target)) {
    return proxyMap.get(target)
  }
  // 通过Proxy拦截对数据的操作
  const proxy = new Proxy(target, baseHandlers)
  // 数据添加进ProxyMap中
  proxyMap.set(target, proxy)
  return proxy
}
