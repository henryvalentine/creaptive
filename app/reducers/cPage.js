let func = function(state = '', action = {})
{
    return action.type === 'CPAGE' ? action.payload : state;
};
export default func;