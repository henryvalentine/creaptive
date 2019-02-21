export default (state = '', action = {}) =>
  action.type === 'CRAFTS' ? action.payload : state
