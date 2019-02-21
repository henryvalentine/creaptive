import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLID
} from 'graphql';

import CountryType from '../../types/country/countryType';
import GenericQueryType from '../../types/genericQueryType';
import CountryOutput from '../../types/country/countryOutputType';

let Country = {};

module.exports = function(mongoose)
{
  Country = mongoose.model('Country');
  return{
    getCountries: getCountries,
    getAllCountries: getAllCountries,
    getCountryById: getCountryById,
    currencyCode: currencyCode,
    getCountryByCountryCode: getCountryByCountryCode
  }
};

const getCountries =
{
  type: CountryOutput,
  args: {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(GenericQueryType)
    }
  },
  resolve (root, req, options)
  {
    var find = req.data.searchText && req.data.searchText.length > 0?
    { $or: [ { name: { "$regex": req.data.searchText, "$options": "i" } }, { currencyCode: { "$regex": req.data.searchText, "$options": "i" }}, { currency: { "$regex": req.data.searchText, "$options": "i" }}, { countryCode: { "$regex": req.data.searchText, "$options": "i" }}]} : {};
    return {totalItems: Country.count(find), items: Country.find(find).sort({[req.data.sortField]: req.data.sortOrder}).skip((req.data.page - 1) * req.data.itemsPerPage).limit(req.data.itemsPerPage)};
  }
};

const getAllCountries =
{
  type: CountryOutput,
  args:
  {

  },
  resolve (root, req, options)
  {
    return Country.find({}).sort({name: 'desc'});
  }
};

const getCountryById =
{
  type: CountryType,
  args: {
    countryId:
    {
      name: 'countryId',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, req, options)
  {
    return Country.findOne({_id: req.countryId});
  }
};

const currencyCode =
{
  type: CountryType,
  args: {
    countryId: {
      name: 'postalCode',
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve (root, req, options)
  {
    return Country.findOne({currencyCode: req.currencyCode});
  }
};

const getCountryByCountryCode =
{
  type: CountryType,
  args: {
    countryId: {
      name: 'countryCode',
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve (root, req, options)
  {
    return Country.findOne({countryCode: req.countryCode});
  }
};