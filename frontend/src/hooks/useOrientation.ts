import { useEffect, useState } from "react";

export function useOrientation() {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(orientation: portrait)");
    const update = () => setOrientation(mediaQueryList.matches ? "portrait" : "landscape");
    update();
    mediaQueryList.addEventListener("change", update);
    return () => mediaQueryList.removeEventListener("change", update);
  }, []);

  return { orientation };
}
