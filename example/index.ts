import { effect, reactive } from '../src'

// 创建一个响应式对象
const state = reactive({ counts: { a: 1, b: 2 } })

// 执行effect
effect(() => {
  console.log(Object.keys(state.counts))
})

setTimeout(() => {
  Reflect.set(state.counts, 'c', 3)
})
