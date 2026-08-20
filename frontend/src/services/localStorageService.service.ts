const localStorageKeys = ["isCompManager", "isAdmin"] as const;
type LocalStorageKey = typeof localStorageKeys[number];


export function setLocalStorageVariable(localStorageKey: LocalStorageKey, value: boolean): void {
  if (value) {
    localStorage.setItem(localStorageKey, "true");
  } else {
    localStorage.removeItem(localStorageKey);
  }
}

export function readLocalStorageVariable(localStorageKey: LocalStorageKey): boolean {
  return localStorage.getItem(localStorageKey) === "true";
}