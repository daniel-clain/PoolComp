import { type ReactNode } from "react";
import { useAppContext } from "../../AppContext";

export function ViewContainer({ children }: { children: ReactNode }) {
  const { userIsCompManager, setUserIsCompManager } = useAppContext();
  const pockets = 6;
  const studs = 18;

  return (
    <view-container>
      <pool-table>
        <view-content>{children}</view-content>
        <table-frame>
          <table-felt />
          <table-pockets>
            {Array.from({ length: pockets }).map((_, i) => (
              <table-pocket key={i + 1} id={`pocket-${i + 1}`} onClick={() => {
                if (i === 0) {
                  console.log('clicked')
                  if (!userIsCompManager) {
                    localStorage.setItem('userIsCompManager', 'true')
                    setUserIsCompManager(true)
                  } else {
                    localStorage.removeItem('userIsCompManager')
                    setUserIsCompManager(false)
                  }
                }
              }} />
            ))}
          </table-pockets>
          <table-studs>
            {Array.from({ length: studs }).map((_, i) => (
              <rail-stud key={i + 1} id={`stud-${i + 1}`} />
            ))}
          </table-studs>
        </table-frame>
      </pool-table>
    </view-container>
  );
}
