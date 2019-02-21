export default (state = null, action = {}) =>
  (action.type === 'SCREEN' && action.payload) || state
