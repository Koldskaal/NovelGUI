
export function isEmpty(ob: Record<string, unknown>): boolean {
  for (const i in ob) {
    return false;
  }
  return true;
}
