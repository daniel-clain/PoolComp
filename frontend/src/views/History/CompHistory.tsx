import { useAppContext } from '../../AppContext'

export function CompHistory() {
  const { historicalMatches } = useAppContext()

  return (
    <history-view>
      <history-title>Comp History</history-title>
      <history-list>
        {historicalMatches.length === 0 ? (
          <history-empty>No comp history yet.</history-empty>
        ) : (
          historicalMatches.map((comp) => (
            <history-item key={comp.id} className="history-item">
              Comp {comp.id.slice(0, 8)} - {new Date(comp.createdAt).toLocaleDateString()}
            </history-item>
          ))
        )}
      </history-list>
    </history-view>
  )
}
