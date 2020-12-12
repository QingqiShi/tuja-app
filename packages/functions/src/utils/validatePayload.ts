import * as functions from 'firebase-functions';

export function validatePayload<T>(
  data: unknown,
  shouldBe: T,
  name: string = 'data'
): T {
  if (typeof shouldBe === 'string' && typeof data !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${name} is not a string`
    );
  }
  if (typeof shouldBe === 'number' && typeof data !== 'number') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${name} is not a number`
    );
  }
  if (typeof shouldBe === 'boolean' && typeof data !== 'boolean') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${name} is not a boolean`
    );
  }
  if (Array.isArray(shouldBe) && Array.isArray(data)) {
    // @ts-ignore
    return data as T;
  }

  if (Array.isArray(shouldBe)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${name} is not an array`
    );
  } else if (typeof shouldBe === 'object' && typeof data !== 'object') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${name} is not an object`
    );
  }
  if (typeof shouldBe === 'object' && shouldBe && data) {
    return Object.keys(shouldBe).reduce(
      (validated, key) => ({
        ...validated,
        [key]: validatePayload(
          (data as any)[key],
          (shouldBe as any)[key],
          `${name}.${key}`
        ),
      }),
      {}
    ) as T;
  }

  return data as T;
}
