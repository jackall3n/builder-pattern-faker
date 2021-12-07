import faker from 'faker';
import { Clazz, isClass } from "./utils/isClass";

export type Faker = Faker.FakerStatic;
export type PropArg<T> = T | ((faker: Faker) => T)

export type IBuilder<T> = {
    [k in keyof T]-?: (arg: PropArg<T[k]>) => IBuilder<T>
  }
  & {
  build(): T;
};

export type Template<T> = ((faker: Faker) => Partial<T>) | Partial<T>

/**
 * Create a Builder for a class. Returned objects will be of the class type.
 *
 * e.g. let obj: MyClass = Builder(MyClass).setA(5).setB("str").build();
 *
 * @param type the name of the class to instantiate.
 * @param template optional class partial which the builder will derive initial params from.
 */
export function Builder<T>(type: Clazz<T>, template?: Template<T>): IBuilder<T>;

/**
 * Create a Builder for an interface. Returned objects will be untyped.
 *
 * e.g. let obj: Interface = Builder<Interface>(faker => ({})).setA(5).setB("str").build();
 *
 * @param templateFn optional partial object which the builder will derive initial params from.
 */

export function Builder<T>(templateFn?: (faker: Faker) => Partial<T>): IBuilder<T>;
/**
 * Create a Builder for an interface. Returned objects will be untyped.
 *
 * e.g. let obj: Interface = Builder<Interface>().setA(5).setB("str").build();
 *
 * @param template optional partial object which the builder will derive initial params from.
 */

export function Builder<T>(template?: Partial<T>): IBuilder<T>;
export function Builder<T>(type?: Clazz<T>, template?: Template<T>): IBuilder<T>;
export function Builder<T>(typeOrTemplate?: Clazz<T> | Template<T>, template?: Template<T>): IBuilder<T> {
  let type: Clazz<T> | undefined;

  if (isClass(typeOrTemplate)) {
    type = typeOrTemplate
  } else {
    template = typeOrTemplate;
  }

  let initialValue: Partial<T> | undefined;

  if (template instanceof Function) {
    initialValue = template(faker)
  } else {
    initialValue = template
  }

  const built: Record<string, unknown> = { ...initialValue }

  const builder = new Proxy(
    {},
    {
      get(target, prop) {
        if ('build' === prop) {
          if (type) {
            // A class name (identified by the constructor) was passed. Instantiate it with props.
            const obj: T = new type();
            return () => Object.assign(obj, { ...built });
          } else {
            // No type information - just return the object.
            return () => built;
          }
        }

        return (x: unknown): unknown => {
          built[prop.toString()] = x instanceof Function ? x(faker) : x;

          return builder;
        };
      }
    }
  );

  return builder as IBuilder<T>;
}
