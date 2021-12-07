export type Clazz<T> = new(...args: unknown[]) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
export function isClass<T>(value: unknown): value is Clazz<T> {
  return value instanceof Function && /^class\s/.test(Function.prototype.toString.call(value))
}
