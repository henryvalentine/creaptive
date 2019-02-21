import countryMutation from './countryMutation/countryMutation';
import stateMutation from './stateMutation/stateMutation';
// import userMutation from "./userMutation/userMutation";

const init = function(mongoose)
{
    return {
        ...countryMutation(mongoose),
        ...stateMutation(mongoose)
    }
};

module.exports = init;

// ...userMutation(mongoose)