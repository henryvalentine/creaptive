let func = function(state = '', action = {})
{
    return action.type === 'MSG_READ' ? action.payload : state;
};
export default func;