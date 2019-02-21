import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLID
} from 'graphql';

import CountryType from '../../types/country/countryType';
import CountryQuery from '../../types/genericQueryType';
import CountryOutput from '../../types/country/countryOutputType';
import mongoose from 'mongoose';
let Country = mongoose.model('Country');

exports.getCountries =
{
  type: CountryOutput,
  args: {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(CountryQuery)
    }
  },
  resolve (root, req, options)
  {
    var find = req.data.searchText && req.data.searchText.length > 0?
    { $or: [ { name: { "$regex": req.data.searchText, "$options": "i" } }, { currencyCode: { "$regex": req.data.searchText, "$options": "i" }}, { currency: { "$regex": req.data.searchText, "$options": "i" }}, { countryCode: { "$regex": req.data.searchText, "$options": "i" }}]} : {};
    return {totalItems: Country.count(), items: Country.find(find).sort({[req.data.sortField]: req.data.sortOrder}).skip((req.data.page - 1) * req.data.results).limit(req.data.results)};
  }
};

exports.getCountryById =
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

exports.currencyCode =
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

exports.getCountryByCountryCode =
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