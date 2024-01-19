import { type Query } from "@vyke/dom";

export type ClassId<TType> = Query<TType> & { name: string };

type TypeClass<TType> = {
  new (): TType;
  prototype: TType;
};

export function createClassId<TType = never>(
  name: string,
  instance?: TypeClass<TType>
) {
  const selector = `.${name}`;
  return {
    name,
    selector,
    instance,
    type: "one",
  } satisfies ClassId<TType>;
}
