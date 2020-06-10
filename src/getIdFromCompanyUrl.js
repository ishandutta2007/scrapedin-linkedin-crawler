module.exports = (url) => {
  const inIndex = url.indexOf('company/') + 8
  const id = url.substring(inIndex).replace('/', '')
  return id
}
