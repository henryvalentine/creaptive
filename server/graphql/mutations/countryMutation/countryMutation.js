import {
  GraphQLNonNull,
    GraphQLList
} from 'graphql';

import CountryType from '../../types/country/countryType';
import countryInput from '../../types/country/countryInputType';

let Country = '';

module.exports = function(mongoose)
{
  Country = mongoose.model('Country');
  return{
    addCountry: addCountry,
    addCountries: addCountries,
    updateCountry: updateCountry
  }
};

const addCountry =
{
  type: CountryType,
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(countryInput)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) =>
    {
      Country.findOne({name: params.data.name}, (err, existingCountry) =>
      {
        if (!existingCountry)
        {
          const country = new Country(params.data);
          return country.save((err, savedCountry) =>
          {
            if (err)
            {
              reject({});
            }
            else
            {
              resolve(savedCountry);
            }
          });

        }
        else
        {
          resolve(existingCountry) ;
        }
      });
    });

  }
};

const addCountries =
{
  type: new GraphQLList(CountryType),
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLList(countryInput)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) =>
    {
      if(params.data.length < 1)
      {
        reject([{}]);
      }
      else
      {
        let processed = [];
        async.each(params.data, (country, callback) =>
        {
          Country.findOne({name: country.name}, (err, existingCountry) =>
          {
            if (!existingCountry)
            {
              return country.save((err, savedCountry) =>
              {
                if (err)
                {
                  callback();
                }
                else
                {
                  processed.push(savedCountry);
                  callback();
                }
              });

            }
            else
            {
              processed.push(existingCountry);
              callback();
            }
          });
        }, (err)=>
        {
          if( err )
          {
            reject([{}]);
          }
          else
          {
            resolve(processed)
          }
        });

      }
    });
  }
};

const updateCountry =
{
  type: CountryType,
  args:
  {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(countryInput)
    }
  },
  async resolve (root, params, options)
  {
    return new Promise((resolve, reject) => {
      Country.findOne({_id: params.data.id}, (err, countryToUpdate) => {
        if (!countryToUpdate) {
          reject({});
        }
        else {
          let country = params.data;
          countryToUpdate.name = country.name;
          countryToUpdate.postalCode = country.postalCode;
          countryToUpdate.countryCode = country.countryCode;
          countryToUpdate.save((err, countryInfo) => 
          {
            if (err)
            {
              reject({});
            }
            else {

              resolve(countryInfo);
            }
          });
        }
      });
    });
  }
};
