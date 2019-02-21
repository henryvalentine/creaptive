export default (state = '', action = {}) =>
    action.type === 'METADATA' ? action.payload : state