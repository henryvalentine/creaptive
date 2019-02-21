import Jwt from "jsonwebtoken";
const config = require('../common/config');
/**
 * Created by Jack V on 9/22/2017.
 */

let Service = '';
let Craft = '';
let ServicePackage = '';
const init = (app, mongoose) =>
{
    Service = mongoose.model('Service');
    Craft = mongoose.model('Craft');
    ServicePackage = mongoose.model('ServicePackage');
    app.post('/getGeekSpace', getGeekSpace);
    app.post('/getServices', getServices);
};

let serviceStatusMap =
{
    basicsProvided: 1,
    categoryProvided: 2,
    assetsProvided: 3,
    packagesProvided: 4,
    published: 5,
    offline: 6
};

function getGeekSpace(req, res)
{
    let find = {addedBy: req.body.geekId};
    if(req.searchText !== undefined && req.searchText.length > 0)
    {
        find = { $and: [{ addedBy: req.body.geekId}, {title: { "$regex": req.body.searchText, "$options": "i" }}]};
    }

    Service.find(find).populate('creativeType').populate('techStacks').populate('creativeSubCategory').populate('creativeCategory')
        .populate('keywords').populate({path: 'metadata'}).populate({path: 'packages'})
        .sort({lastModified: req.body.sortOrder}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage)
    .then((services) =>
    {
        Craft.find(find).sort({[req.body.sortField]: req.body.sortOrder}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage).then((crafts) => {
            return res.json({services: services, crafts: crafts});
        });
    });
}

function getServices(req, res)
{
    let find = {serviceStatus: serviceStatusMap.published};
    if(req.searchText !== undefined && req.searchText.length > 0)
    {
        find = { $and: [{serviceStatus: serviceStatusMap.published}, {title: { "$regex": req.body.searchText, "$options": "i" }}]};
    }
    Service.find(find).populate('creativeSubCategory').populate('creativeCategory')
        .sort({lastModified: req.body.sortOrder}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage)
        .then((services) =>
        {
            let ss = services.length > 0? services : [];
            return res.json({services: ss});
        });
}

module.exports = init;