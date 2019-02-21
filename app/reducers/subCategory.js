export default (state = '', action = {}) =>
    action.type === 'SUBCATEGORY' ? action.payload : state
