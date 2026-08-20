import { format, parseISO } from "date-fns";
import { enAU } from "date-fns/locale";
import { useAppContext } from "../../AppContext";

export function Admin() {
  const { send, backendErrors, actionInProgress, setUserIsAdmin, setActiveView } = useAppContext();

  return (
    <admin-view>
      <view-title>Admin</view-title>
      <admin-actions>
        <button
          className="active"
          disabled={actionInProgress}
          onClick={() => send(['refreshDatabaseData'])}
        >
          Refresh Database Data
        </button>
        <button
          className="active"
          disabled={actionInProgress}
          onClick={() => {
            setUserIsAdmin(false)
            setActiveView("Pool Comp")
          }}
        >
          Clear Admin Access
        </button>
      </admin-actions>
      <admin-errors className="panel-container">
        <panel-heading>Backend errors ({backendErrors.length})</panel-heading>
        {backendErrors.length === 0 ? (
          <no-data-message>No errors.</no-data-message>
        ) : (
          <error-list>
            {backendErrors.map((backendError, backendErrorIndex) => (
              <error-entry key={`${backendError.timestamp}-${backendErrorIndex}`}>
                <error-timestamp>
                  {format(parseISO(backendError.timestamp), "d MMM HH:mm:ss", { locale: enAU })}
                </error-timestamp>
                <error-text>{backendError.text}</error-text>
              </error-entry>
            ))}
          </error-list>
        )}
      </admin-errors>
    </admin-view>
  );
}
