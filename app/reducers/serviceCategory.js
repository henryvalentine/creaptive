export default (state = '', action = {}) =>
  action.type === 'SERVICE_CATEGORY' ? action.payload : state
