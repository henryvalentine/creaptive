let func = function (state = { auth: ''}, action = {})
{
    return action.type === 'VERIFY' ? action.payload : state;
};

export default func;