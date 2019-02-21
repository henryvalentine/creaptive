let func = function(state = '', action = {})
{
    return action.type === 'RECEIVE' ? action.payload : state;
};
export default func;