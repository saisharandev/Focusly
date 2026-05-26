function startOfDayUTC(date) {
  const d = new Date(date)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function daysBetween(dateA, dateB) {
  const a = startOfDayUTC(dateA)
  const b = startOfDayUTC(dateB)
  return Math.round(Math.abs(b - a) / 86_400_000)
}

module.exports = { startOfDayUTC, daysBetween }
