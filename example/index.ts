import { effect, reactive } from '../src'

const state = reactive({ counts: { a: 1, b: 2 } })

effect(() => {
  console.log(Reflect.has(state.counts, 'a'))
})

Reflect.deleteProperty(state.counts, 'a')
