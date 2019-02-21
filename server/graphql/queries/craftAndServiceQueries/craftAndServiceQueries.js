import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLID
} from 'graphql';

import CountryType from '../../types/country/countryType';
import ServiceType from '../../types/service/serviceType';
import CraftType from '../../types/craft/craftType';
import CraftAndServiceOutputType from '../../types/craftAndServiceType';
import GenericQueryType from '../../types/genericQueryType';

let Craft = {};
let Service = {};

module.exports = function(mongoose)
{
  Service = mongoose.model('Service');
  Craft = mongoose.model('Craft');
  return{
    getGeekSpace: getGeekSpace,
    getServiceById: getServiceById,
    getCraftById: getCraftById
  }
};

const getGeekSpace =
{
  type: CraftAndServiceOutputType,
  args: {
    data:
    {
      name: 'data',
      type: new GraphQLNonNull(GenericQueryType)
    }
  },
  resolve (root, req, options)
  {
    var find = {addedBy: req.data.geekId};
    if(req.data.searchText && req.data.searchText.length > 0)
    {
       find = { $and: [{ addedBy: req.data.geekId}, {title: { "$regex": req.data.searchText, "$options": "i" }}]};
    }

    return {
      services: {items: Service.find(find).populate('addedBy').populate('creativeCategory').populate('creativeSubCategory').populate('creativeType').sort({lastModified: req.data.sortOrder}).skip((req.data.page - 1) * req.data.itemsPerPage).limit(req.data.itemsPerPage), totalItems: Service.count(find)},
      crafts: {items: Craft.find(find).populate('addedBy').populate('craftRegion').populate('creativeType').sort({[req.data.sortField]: req.data.sortOrder}).skip((req.data.page - 1) * req.data.itemsPerPage).limit(req.data.itemsPerPage), totalItems: Craft.count(find)}
    };
  } 
};

const getServiceById =
{
  type: ServiceType,
  args: {
    serviceId:
    {
      name: 'serviceId',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, req, options)
  {
    return Service.findOne({_id: req.serviceId});
  }
};

const getCraftById =
{
  type: CraftType,
  args: {
    craftId:
    {
      name: 'craftId',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, req, options)
  {
    return Craft.findOne({_id: req.craftId});
  }
};