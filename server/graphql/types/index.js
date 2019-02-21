import CountryType from 'country/countryType';
import StateType from 'state/stateType';
import CraftType from 'craft/craftType';
import ServiceType from 'service/serviceType';

export default
{
  ...CountryType,
  ...StateType,
  ...CraftType,
  ...ServiceType
};
