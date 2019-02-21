let func = function(state = '', action = {})
{
    return action.type === 'IO' ? action.payload : state;
};
export default func;