export class Arrays {
  public static updateElement<T>(arr: T[], oldT: T, newT: T): T[] {
    let index = arr.indexOf(oldT)
    return [
      ...arr.slice(0, index),
      newT,
      ...arr.slice(index + 1)
    ]
  }

  public static append<T>(arr: T[], arg: T): T[] {
    return [
      ...arr,
      arg,
    ];
  }

  public static remove<T>(arr: T[], arg: T): T[] {
    let index = arr.indexOf(arg)
    return [
      ...arr.slice(0, index),
      arg,
      ...arr.slice(index + 1)
    ]
  }

  public static removeMatching<T>(arr: T[], fn: ((T)=>boolean)): T[] {
    return arr.filter(elem => !fn(elem));
  }
}

