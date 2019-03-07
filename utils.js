exports.run = f => f()

// Reduce with spread `flattenObj` to flatten an array of objects together
exports.flattenObj = [(a, x) => ({ ...a, ...x }), {}]

// For regular functional pipeline use
exports.tap = f => x => {
  f(x)
  return x
}
