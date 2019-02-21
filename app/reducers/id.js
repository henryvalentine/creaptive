let func = function(state = '', action = {})
{
    return action.type === 'ID' ? action.payload : state;
};
export default func;