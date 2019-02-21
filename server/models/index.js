/**
 * Created by Jack V on 12/7/2017.
 */

'use strict';

import User from '.././models/user';
import Country from '.././models/country';
import State from '.././models/state';
import City from '.././models/city';
import Service from '.././models/service';
import Craft from '.././models/craft';
import Academic from '.././models/academic';
import CraftRegion from '.././models/craftRegion';
import CreativeType from '.././models/creativeType';
import CreativeSection from '.././models/creativeSection';
import CreativeMetadata from '.././models/creativeMetadata';
import Option from '.././models/option';
import Keyword from '.././models/keyword';
import MetadataOption from '.././models/metadataOption';
import packageType from './packageType';
import packageFeature from './packageFeature';
import pricePackage from './pricePackage';
import servicePackage from './servicePackage';
import ServiceMetadata from '.././models/serviceMetadata';
import CreativeCategory from '.././models/creativeCategory';
import CreativeSubCategory from '.././models/creativeSubCategory';
import TechnologyStack from '.././models/technologyStack';
import Skill from '.././models/skill';
import Chat from '.././models/chat';
import Review from '.././models/review';
import AdvertResource from '.././models/advertResource';
import Advert from '.././models/advert';
import Coupon from '.././models/coupon';
import Order from './order';
import OrderPayment from './orderPayment';
import OrderRef from '.././models/orderRef';
import OrderToggleReason from '.././models/orderToggleReason';
import ToggledOrder from '.././models/toggledOrder';
import OrderRating from '.././models/orderRating';
import ComplaintType from '.././models/complaintType';
import Complaint from '.././models/complaint';

let models =
    [
        User,Country, State, City, Service, Craft, CraftRegion,Academic, Coupon, Order, ToggledOrder, Chat,
        CreativeType, TechnologyStack, Advert, Skill, Review, AdvertResource, OrderPayment, OrderRef,
        CreativeSection, Option, CreativeMetadata, MetadataOption, CreativeCategory, OrderToggleReason,
        CreativeSubCategory, Keyword, ServiceMetadata, packageFeature, packageType, pricePackage, servicePackage,
        OrderRating, ComplaintType, Complaint
    ];

module.exports = function(mongoose)
{
    for(let i = 0; i < models.length; i++)
    {
        models[i](mongoose);
    }

    //seed the db with the major creative sections if they are not yet seeded into the db
    let CreativeSection = mongoose.model('CreativeSection');
    CreativeSection.find({}).exec((err, creativeSections) =>
    {
        if(err || creativeSections === null || creativeSections.length < 1)
        {
            let sections = [{ name: 'Handcrafts' }, { name: 'Services' }];
            CreativeSection.insertMany(sections, function(error, docs) {});
        }
    });

};