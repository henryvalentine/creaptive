export default (state = null, action = {}) =>
  (action.type === 'LOGIN' && action.payload) || state
