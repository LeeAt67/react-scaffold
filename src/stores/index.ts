import { createContext, useContext } from 'react'

class RootStore {
  // 在此添加新的 store 实例
}

const rootStore = new RootStore()
const StoreContext = createContext(rootStore)

export function useStore() {
  return useContext(StoreContext)
}

export { RootStore, StoreContext, rootStore }
export default rootStore
