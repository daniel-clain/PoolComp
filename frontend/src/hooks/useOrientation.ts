import { useEffect, useState } from "react";

export function useOrientation() {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );

  useEffect(() => {
    const mql = window.matchMedia("(orientation: portrait)");
    const update = () => setOrientation(mql.matches ? "portrait" : "landscape");
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return { orientation };
}
