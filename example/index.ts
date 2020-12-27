import { effect, reactive } from '../src'

// 创建一个响应式对象
const state = reactive({ count: 1 })

// 执行effect
effect(() => {
  console.log(state.count)
})

Reflect.deleteProperty(state, 'count')
