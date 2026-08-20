import { type ReactNode } from "react";
import { useAppContext } from "../../AppContext";

export function ViewContainer({ children }: { children: ReactNode }) {
  const {
    userIsCompManager,
    setUserIsCompManager,
    userIsAdmin,
    setUserIsAdmin,
    setActiveView,
  } = useAppContext();
  const pockets = 6;
  const studs = 18;

  function handlePocketClick(pocketIndex: number) {
    if (pocketIndex === 0) {
      if (userIsCompManager) {
        setUserIsCompManager(false);
        return;
      }
      const compManagerAccessCode = "123";
      const enteredCode = window.prompt("Enter comp manager access code");
      if (enteredCode === compManagerAccessCode) {
        setUserIsCompManager(true);
      } else {
        window.alert("Denied 👎");
      }
    }
    if (pocketIndex === 1) {
      if (!userIsAdmin) {
        const adminAccessCode = "147";
        const enteredCode = window.prompt("Admin access code");
        if (enteredCode === adminAccessCode) {
          setUserIsAdmin(true);
          setActiveView("Admin");
        } else {
          window.alert("Denied 👎");
        }
      } else {
        setActiveView("Admin");
      }
    }
  }

  return (
    <view-container>
      <pool-table>
        <view-content>{children}</view-content>
        <table-frame>
          <table-felt />
          <table-pockets>
            {Array.from({ length: pockets }).map((_, pocketIndex) => (
              <table-pocket
                key={pocketIndex + 1}
                id={`pocket-${pocketIndex + 1}`}
                onClick={() => handlePocketClick(pocketIndex)}
              />
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
