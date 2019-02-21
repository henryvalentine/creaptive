export default (state = '', action = {}) =>
    action.type === 'TYPE' ? action.payload : state
