/**
 * A collection of helpers to manipulate immutable arrays.
 */
export class ImmutableArrays {
  /**
   * Returns a new array, where oldT is replaced (in place) with newT.
   * The old array is unafffected.
   */
  public static replaceElement<T>(arr: T[], oldT: T, newT: T): T[] {
    return arr.map(elem => elem === oldT ? newT : elem);
  }

  /**
   * Generates a new array from arr, with arg appended. The old array is unaffected.
   */
  public static append<T>(arr: T[], arg: T): T[] {
    return [
      ...arr,
      arg,
    ];
  }

  /**
   * Removes all occurences of arg from arr, and returns a new array.
   * The old array is unaffected.
   */
  public static remove<T>(arr: T[], arg: T): T[] {
    return arr.filter(elem => elem !== arg);
  }

  /**
   * Removes all elements from arr for which fn returns true, and returns a new array.
   * The old array is unaffected.
   */
  public static removeMatching<T>(arr: T[], fn: ((T) => boolean)): T[] {
    return arr.filter(elem => !fn(elem));
  }
}

