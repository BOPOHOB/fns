
const c = function<T>(condition: boolean, value: T): [] | [T] { return condition ? [value] : []; };

export { c };
