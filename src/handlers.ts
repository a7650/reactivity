import { track, trigger } from './effect'
import { reactive } from './reactive'
import { isObject, hasOwn } from './utils'

export const baseHandlers: ProxyHandler<object> = {
  get(target, key) {
    track(target, key)
    const res = Reflect.get(target, key)
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  },
  set(target, key, value) {
    const result = Reflect.set(target, key, value)
    trigger(target, key, value)
    return result
  },
  deleteProperty(target, key: string | symbol) {
    const hadKey = hasOwn(target, key)
    const result = Reflect.deleteProperty(target, key)
    if (hadKey && result) {
      trigger(target, key, undefined)
    }
    return result
  }
}
