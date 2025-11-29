type Ok<T> = {
  ok: true;
  value: T;
};

type Err<E> = {
  ok: false;
  error: E;
};

export type Result<T, E = Error> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

function findUserById(id: string): Result<{ id: string; name: string }, "NOT_FOUND"> {
  if (id !== "123") {
    return err("NOT_FOUND");
  }

  return ok({ id: "123", name: "Lewis" });
}

const result = findUserById("999");

if (result.ok) {
  console.log("Usuario:", result.value.name);
} else {
  console.log("Error:", result.error);
}
