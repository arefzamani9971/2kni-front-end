/** A stable code is accepted once until an empty frame or another code is observed. */
export function createScanGate() {
  let previous: string | null = null;
  return (code: string | null): boolean => {
    if (code === null) {
      previous = null;
      return false;
    }
    if (code === previous) return false;
    previous = code;
    return true;
  };
}
