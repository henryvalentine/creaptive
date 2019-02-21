
let func = function (state = '', action = {})
{
  return action.type === 'PACKS' ? action.payload : state;
};

export default func;