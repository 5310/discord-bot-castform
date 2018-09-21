exports.run = f => f()

exports.floorDateToHour = date => new Date(date.valueOf() - (date.getMinutes() * 60 * 1000 + date.getSeconds() * 1000 + date.getMilliseconds()))

exports.enumify = keys => {
  const result = {}
  keys.forEach((key, i) => result[key] = i)
  return result
}

exports.compare = (a, b) => {
  for (let key in a) if (a[key] !== b[key]) return false
  return true
}

exports.utc2istString = date => (new Date(date.valueOf() + 5.5*60*60*1000)).toISOString().slice(0, -1) + '+05:30'

exports.hour2meridian = hour => {
  const hour_ = parseInt(hour)
  if (hour_ === 0) return '12am'
  if (hour_ < 12 ) return `${hour_}am`
  else return `${hour_ - 12}pm`
}