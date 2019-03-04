exports.run = f => f()

exports.floorDateToHour = date => new Date(date.valueOf() - (date.getMinutes() * 60 * 1000 + date.getSeconds() * 1000 + date.getMilliseconds()))

exports.enumify = keys => {
  const result = {}
  keys.forEach((key, i) => { result[key] = i })
  return result
}

exports.compare = (a, b) => {
  for (let key in a) if (a[key] !== b[key]) return false
  return true
}

exports.utc2istString = date => (new Date(date.valueOf() + 5.5 * 60 * 60 * 1000)).toISOString().slice(0, -1) + '+05:30'

exports.hour2meridian = hour => {
  if (hour === 0) return '12am'
  if (hour < 12) return `${hour}am`
  if (hour === 12) return '12pm'
  else return `${hour - 12}pm`
}

exports.objectFilter = (pred, obj) => Object.entries(obj)
  .filter(([key]) => pred(key))
  .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})

exports.pick = (keys, obj) => Object.entries(obj)
  .filter(([key]) => keys.includes(key))
  .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})

exports.flattenObj = [(a, x) => ({ ...a, ...x }), {}]
