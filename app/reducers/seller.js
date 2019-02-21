let func = function(state = '', action = {})
{
    return action.type === 'SELLER' ? action.payload : state;
};
export default func;