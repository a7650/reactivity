import { effect, reactive } from '../reactivity/src'

const state = reactive({ count: 1 })

effect(() => {
  console.log('count is ', state.count)
})

setTimeout(() => {
  state.count += 1
}, 1000)
