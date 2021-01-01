import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { reactive, Target } from './reactive'
import { isObject, hasOwn } from './utils'

export const ITERATE_KEY = Symbol()

export const baseHandlers: ProxyHandler<object> = {
  get(target: Target, key: string | symbol, receiver: object) {
    // 收集effect函数
    track(target, TrackOpTypes.GET, key)
    // 获取返回值
    const res = Reflect.get(target, key, receiver)
    // 如果是对象，要再次执行reactive并返回
    if (isObject(res)) {
      return reactive(res)
    }
    return res
  },
  set(target: Target, key: string | symbol, value: any, receiver: object) {
    // 设置value
    const hadKey = hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    // 通知更新
    trigger(
      target,
      hadKey ? TriggerOpTypes.SET : TriggerOpTypes.ADD,
      key,
      value
    )
    return result
  },
  deleteProperty(target: Target, key: string | symbol) {
    // 判断要删除的key是否存在
    const hadKey = hasOwn(target, key)
    // 执行删除操作
    const result = Reflect.deleteProperty(target, key)
    // 只在存在key并且删除成功时再通知更新
    if (hadKey && result) {
      trigger(target, TriggerOpTypes.DELETE, key, undefined)
    }
    return result
  },
  ownKeys(target: Target): (string | number | symbol)[] {
    track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
    return Reflect.ownKeys(target)
  },
  has(target: object, key: string | symbol): boolean {
    const result = Reflect.has(target, key)
    track(target, TrackOpTypes.HAS, key)
    return result
  }
}
