
let func = function (state = '', action = {})
{
  return action.type === 'SECTION' ? action.payload : state;
};

export default func;