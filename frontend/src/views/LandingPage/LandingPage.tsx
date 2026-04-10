import { useAppContext } from '../../AppContext'

export function LandingPage() {
  const { createPoolComp } = useAppContext()

  return (
    <home-view>
      <button data-variant="primary" onClick={createPoolComp}>
        New Pool Comp
      </button>
    </home-view>
  )
}
