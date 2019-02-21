/**
 * Created by Jack V on 9/22/2017.
 */
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
let Service = '';
let Keyword = '';
let User = '';
let ServiceMetadata = '';
let ServicePackage = '';

const init = (app, mongoose) =>
{
    Service = mongoose.model('Service');
    Keyword = mongoose.model('Keyword');
    User = mongoose.model('User');
    ServiceMetadata = mongoose.model('ServiceMetadata');
    ServicePackage = mongoose.model('ServicePackage');

    app.post('/processServiceBasics', processServiceBasics);
    app.post('/processCategorisation', processCategorisation);
    app.post('/processServicePackages', processServicePackages);
    app.post('/removeImage', removeImage);
    app.post('/removePdf', removePdf);
    app.post('/toggleAsset', toggleAssetProvisionStatus);
    app.post('/takeServiceOffline', takeServiceOffline);
    app.post('/swOnl', switchOnline);
    app.get('/getService', getService);
    app.get('/getServiceInfo', getServiceInfo);
    app.get('/searchService', searchService);
    app.get('/getScoPackages', getScoPackages);
    app.post('/getSrvcs', getServices);
    app.get('/getAllServices', getAllServices);
    app.post('/getSrvByCtr', getServicesByCategory);
    app.post('/getSrvBySctr', getServicesBySubcategory);    
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
    
function processServiceBasics(req, res)
{
    try{

        let service = req.body;
        let fl = { $and: [{ addedBy: service.addedBy}, {status: { $lt: 5}}]};
        Service.find(fl, (error, vl) =>
        {
            if(!error && vl.length >= 2)
            {
                return res.json({code: -1, message: 'You can only have two (2) unpublished Services at a time'});
            }
            else{
                let service = req.body;

                if(service === undefined || service === null || service.addedBy.length < 1)
                {
                    return res.json({code: -1, message: 'An unexpected error was encountered. \nPlease refresh the page and try again'});
                }
                if(service.title.length < 1)
                {
                    return res.json({code: -1, message: 'Please give your service a catchy label'});
                }
                if(service.description.length < 1)
                {
                    return res.json({code: -1, message: 'It is important that you give your service a befitting description'});
                }
                else
                {
                    if(service._id === undefined || service._id === null || service._id.length < 1)
                    {
                        service.dateProfiled = new Date;
                        service.lastModified = new Date;
                        service.serviceStatus = serviceStatusMap['basicsProvided'];
                        const newService = new Service(service);
                        return newService.save((err, savedService) =>
                        {
                            if (err)
                            {
                                console.log('err 1');
                                console.log(err);
                                return res.json({code: -1, message: 'Your request could not be processed now. Please try again'});
                            }
                            else
                            {
                                Keyword.find({creativeSection: service.creativeSection}).exec((error, keywords) =>
                                {
                                    return res.json({code: 5, serviceId: savedService._id, keywords: keywords, message: 'Service was successfully processed'});
                                });
                            }
                        });
                    }
                    else
                    {
                        Service.findOne({_id: service._id, addedBy: service.addedBy}, (err, existingService) =>
                        {
                            if (existingService !== null)
                            {
                                existingService.lastModified = new Date;
                                existingService.title = service.title;
                                existingService.description = service.description;
                                existingService.keywords = service.keywords;

                                return existingService.save((err, savedService) =>
                                {
                                    if (err)
                                    {
                                        console.log('\nerr 2');
                                        console.log(err);
                                        return res.json({code: -1, message: 'Your request could not be completed now. Please try again'});
                                    }
                                    else
                                    {
                                        Keyword.find({creativeSection: service.creativeSection}).populate('keyword').sort({name: 'asc'}).exec((error, keywords) =>
                                        {
                                            return res.json({code: 5, serviceId: savedService._id, keywords: keywords, message: 'Service was successfully processed'});
                                        });
                                    }
                                });
                            }
                            else
                            {
                                return res.json({code: -1, message: 'An unknown error was encountered. \nPlease refresh the page and try again'});
                            }
                        });
                    }

                }
            }
        });
    }
    catch(e)
    {
        console.log('\nExceptions\n');
        console.log(e);
        return res.json({code: -1, message: 'An internal server error was encountered. Please try again'});
    }
}

function processCategorisation(req, res)
{
    try
    {
        let payload = req.body;

        if(payload === undefined || payload === null || payload.serviceId.length < 1)
        {
            return res.json({code: -1, message: 'A fatal error was encountered. Please refresh the page and try again'});
        }
        if(payload.creativeCategory.length < 1)
        {
            return res.json({code: -1, message: 'Please select a Category for your service'});
        }
        if(payload.creativeSubCategory.length < 1)
        {
            return res.json({code: -1, message: 'Please select your service Subcategory'});
        }
        if(payload.creativeType.length < 1)
        {
            return res.json({code: -1, message: 'Please select your service Type'});
        }
        if(payload.serviceStatus < 1)
        {
            return res.json({code: -1, message: 'A surprising error was encountered. Please be sure to provide the Basic information on your service first before making this request'});
        }
        else
        {
            Service.findOne({_id: payload.serviceId}, (err, existingService) =>
            {
                if (err || !existingService)
                {
                    console.log('\nFind Error\n');
                    console.log(err);
                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                }
                else
                {
                    existingService.lastModified = new Date();
                    existingService.creativeCategory = payload.creativeCategory;
                    existingService.creativeSubCategory = payload.creativeSubCategory;
                    existingService.creativeType = payload.creativeType;
                    existingService.serviceStatus = serviceStatusMap['categoryProvided'];
                    let metadataList = [];

                    if(payload.metadata.length > 0)
                    {
                        let processed = 0;
                        for(let i = 0; i < payload.metadata.length; i++)
                        {
                            let m = payload.metadata[i];
                            let meta = {};

                            let find = { $and: [{metadata: m.metadata}, {service: payload.serviceId}]};
                            if(m._id !== undefined && m._id !== null && m._id.length > 0)
                            {
                                find = {_id: m._id};
                            }

                            ServiceMetadata.findOne(find, (err, existingMetadata) =>
                            {
                                if (existingMetadata)
                                {
                                    meta = existingMetadata;
                                    meta.textValue = m.textValue;
                                    meta.metadataOption = m.metadataOption;
                                    meta.metadataOptionRange = m.metadataOptionRange;
                                    meta.providedDateRange = m.providedDateRange;
                                    meta.providedDate = m.providedDate;
                                    meta.checkedOptions = m.checkedOptions;
                                }
                                else
                                {
                                    meta = new ServiceMetadata(m);
                                }

                                meta.save((err, savedMeta) =>
                                {
                                    processed += 1;

                                    if (err || savedMeta === null || savedMeta._id.length < 1)
                                    {
                                        console.log('\nError');
                                        console.log(err);
                                    }
                                    else
                                    {
                                        metadataList.push(savedMeta._id);
                                        if(processed === payload.metadata.length)
                                        {
                                            existingService.metadata = metadataList;
                                            if(processed === metadataList.length)
                                            {
                                                existingService.save((err, savedService) =>
                                                {
                                                    if (err)
                                                    {
                                                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                                    }
                                                    else
                                                    {
                                                        return res.json({code: 5, serviceId: savedService._id, message: 'Request was successfully executed'});
                                                    }
                                                });
                                            }
                                            else
                                            {
                                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    }
                    else {
                        existingService.save((err, savedService) =>
                        {
                            if (err)
                            {
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                return res.json({code: 5, serviceId: savedService._id, message: 'Request was successfully executed'});
                            }
                        });
                    }
                }
            });
        }
    }
    catch(e)
    {
        console.log('\nERROR\n');
        console.log(e);
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
}

function processServicePackages(req, res)
{
    try
    {
        let packages = req.body;

        if(packages === undefined || packages === null  || packages.length < 1)
        {
            return res.json({code: -1, message: 'A fatal error was encountered. Please refresh the page and try again'});
        }
        else{
            Service.findOne({_id: packages[0].service}, (err, eService) =>
            {
                if (!eService)
                {
                    return res.json({code: -1, message: 'A fatal error was encountered. Please refresh the page and try again'});
                }
                else
                {
                    if(eService.serviceStatus < serviceStatusMap['assetsProvided'])
                    {
                        return res.json({code: -1, message: 'A surprising error was encountered. \nPlease be sure to provide the the needed resources (files) for your service first before making this request'});
                    }
                    else
                    {
                        let errors = 0;
                        eService.packages = eService.packages.length < 1? [] : eService.packages;
                        for(let i = 0; i < packages.length; i++)
                        {
                            let p = packages[i];
                            if(p.description.trim().length < 1)
                            {
                                return res.json({code: -1, message: 'Please provide description for all selected price packages'});
                            }

                            else if(p.delivery === undefined || p.delivery === null || p.delivery.length < 1 || parseInt(p.delivery) < 1)
                            {
                                return res.json({code: -1, message: 'The Delivery field is mandatory for all selected price packages'});
                            }

                            else if(p.price === undefined || p.price === null || p.price.length < 1 || parseInt(p.price) < 1)
                            {
                                return res.json({code: -1, message: 'The Price field is mandatory and must be valid numeric figures for all selected price packages'});
                            }

                            let pack = {};
                            let find = { $and: [{ service: p.service}, {packageType: p.packageType._id}, {package: p.package}]};
                            ServicePackage.findOne(find, (err, sPackage) =>
                            {
                                if (!sPackage)
                                {
                                    pack = new ServicePackage();
                                    pack.service = p.service;
                                    pack.packageType = p.packageType._id;
                                    pack.packageExtras = [];
                                }
                                else
                                {
                                    pack = sPackage;
                                }

                                pack.description = p.description;
                                pack.package = p.package;
                                pack.delivery = p.delivery;
                                pack.price = p.price;
                                pack.featureOptions = p.featureOptions;
                                pack.packageExtras = p.packageExtras;
                                pack.selectedFeatures = [];

                                for(let j = 0; j < p.features.length; j++)
                                {
                                    let m = p.features[j];

                                    if(m.feature !== undefined && m.feature !== null && m.feature.length > 0)
                                    {
                                        pack.selectedFeatures.push({
                                            feature: m.feature,
                                            value: ((m.value !== undefined && m.value !== null && m.value.length > 0) || (m.value !== undefined && m.value !== null && m.value > 0))? m.value : ''
                                        });
                                    }
                                }
                                pack.save((err, savedPackage) =>
                                {
                                    if (err)
                                    {
                                        console.log('Package err');
                                        console.log(err);
                                        errors++;
                                    }
                                    else
                                    {
                                        if (!sPackage)
                                        {
                                            eService.packages.push(savedPackage._id);
                                        }
                                        let ii = eService.packages.find(o => o === savedPackage._id);
                                        if(ii === undefined || i === null || ii.length < 1)
                                        {
                                            eService.packages.push(savedPackage._id);
                                        }

                                        if(i+1 === packages.length)
                                        {
                                            if(eService.serviceStatus <= serviceStatusMap['packagesProvided'])
                                            {
                                                eService.serviceStatus = serviceStatusMap['packagesProvided'];
                                            }
                                            eService.save((err2, savedService) =>
                                            {
                                                if (err2)
                                                {
                                                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                                }
                                                else
                                                {
                                                    return res.json({code: 5, serviceId: savedService._id, packages: savedService.packages, message: 'Request was successfully processed'});
                                                }
                                            });
                                        }
                                    }
                                });

                            });
                        }
                    }
                }
            });
        }

    }
    catch(e)
    {
        console.log('Catch Error');
        console.log(e);
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
}

function toggleAssetProvisionStatus(req, res)
{
    try{
        let serviceId = req.query.id;
        if(serviceId === undefined || serviceId === null || serviceId.length < 1)
        {
            return res.json({code: -1, message: 'A fatal error was encountered. Please refresh the page and try again'});
        }
        else
        {
            Service.findOne({_id: serviceId}, (err, existingService) =>
            {
                if (!existingService)
                {
                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                }
                else
                {

                    if(existingService.serviceStatus < serviceStatusMap['categoryProvided'])
                    {
                        return res.json({code: -1, message: 'A surprising error was encountered. Please be sure to provide information on Categorization & more for your service first before making this request'});
                    }
                    else
                     {
                        existingService.lastModified = new Date();
                        existingService.serviceStatus = serviceStatusMap['assetsProvided'];

                        return existingService.save((err, savedService) =>
                        {
                            if (err)
                            {
                                return res.json({code: -1, message: 'An error was encountered. Please try again'});
                            }
                            else
                            {
                                return res.json({code: 5, serviceId: savedService._id, message: 'Request was successfully processed'});
                            }
                        });
                    }
                }
            });
        }
    }
    catch (e)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
}

function removeImage(req, res)
{
    try
    {
        if(!req.query.section || req.query.section.length < 1 || !req.query.itemId || req.query.itemId.lenght < 1 || !req.query.prop || req.query.prop.lenght < 1)
        {
            return res.send({code: -1, message: 'An error was encountered. Please try again', fileDeleted: false});
        }
        else
        {
            let model = req.query.section === 'service'? Service : Craft;
            model.findOne({_id: req.query.itemId}, (err, existingModel) =>
            {
                if (!existingModel)
                {
                    return res.json({code: -1, message: 'An error was encountered. Please try again', fileDeleted: false});
                }
                else
                {
                    let absolutePath = path.join(__filedir, existingModel[req.query.prop].replace('/flt', '').replace('/', '\\'));
                    if (absolutePath === undefined || absolutePath === null || absolutePath.length < 1)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }

                    fs.stat(absolutePath, function(err, stats)
                    {
                        if (!err || err === null || err === undefined)
                        {
                            fs.unlinkSync(absolutePath);
                            existingModel[req.query.prop] = '';
                            existingModel.save((err, savedModel) =>
                            {
                                if (err)
                                {

                                    return res.json({code: -1, message: 'An error was encountered. Please try again', fileDeleted: false});
                                }
                                else
                                {
                                    return res.json({code: 5, message: 'Request was successfully processed', fileDeleted: true});
                                }
                            });
                        }
                        else
                        {
                            let exists = fs.existsSync(absolutePath);
                            if(!exists)
                            {
                                // fs.unlinkSync(absolutePath);
                                existingModel[req.query.prop] = '';
                                existingModel.save((err, savedModel) =>
                                {
                                    return res.json({code: 5, message: 'File was successfully deleted', fileDeleted: true});
                                });
                            }
                            else
                                {
                                return res.json({code: -1, message: 'An error was encountered. Please try again', fileDeleted: true});
                            }
                        }
                    });

                }
            });
        }
    }
    catch (e)
    {
        return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
    }

}

function removePdf(req, res)
{
    try
    {
        if(!req.query.section || req.query.section.length < 1 || !req.query.itemId || req.query.itemId.lenght < 1)
        {
            fs.unlinkSync(absolutePath);
            return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
        }
        else
        {
            let model = req.query.section === 'service'? Service : Craft;
            model.findOne({_id: req.query.itemId}, (err, existingModel) =>
            {
                if (!existingModel)
                {
                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                }
                else
                {
                    let absolutePath = path.join(__filedir, existingModel.pdfResource.path.replace('/flt', '').replace('/', '\\'));
                    if (absolutePath === undefined || absolutePath === null || absolutePath.length < 1)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    fs.stat(absolutePath, function(err, stats)
                    {
                        if (!err || err === null || err === undefined)
                        {
                            fs.unlinkSync(absolutePath);
                            existingModel.pdfResource  = {name: '', path: ''};
                            existingModel.save((err, savedModel) =>
                            {
                                if (err)
                                {

                                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                }
                                else
                                {
                                    return res.json({code: 5, message: 'Request was successfully processed'});
                                }
                            });
                        }
                        else
                        {
                            return res.json({code: -1, message: 'An error was encountered. Please try again'});
                        }
                    });

                }
            });
        }
    }
    catch (e)
    {
        return res.json({code: -1, message: 'An internal server error was encountered. Please try again later'});
    }

}

function processRequirements(req, res)
{
    let service = req.body;
    if(service === undefined || service === null || service.serviceId.length < 1)
    {
        return res.json({code: -1, message: 'A fatal error was encountered. Please refresh the page and try again'});
    }
    if(service.requirements.length < 1)
    {
        return res.json({code: -1, message: 'Please provide at least one requirement to help your customers better \nprovide you with the necessary data to render this service'});
    }

    let noLabel = service.requirements.some(s => s.label.length < 1);
    if(noLabel === true)
    {
        return res.json({code: -1, message: 'Please specify your requirement(s) so as to help your customers better \nprovide you with the necessary data to render this service'});
    }

    let noRequirementResponseType = service.requirements.some(s => s.requirementResponseType.length < 1);
    if(noRequirementResponseType === true)
    {
        return res.json({code: -1, message: 'Please specify the Response Type to your requirement(s) so your customers can be clear on what you need to render this service'});
    }

    let noRequirementResponseOptions = (service.requirements.some(s => s.requirementResponseType.toLowerCase() === 'single_answer' || s.requirementResponseType.toLowerCase() === 'multi-choice_answer') && s.requirementResponseOptions.length  < 1);
    if(noRequirementResponseOptions === true)
    {
        return res.json({code: -1, message: 'Please specify the Response Option(s) to your requirement(s) so your customers can be clear on what you need to render this service'});
    }
    if(service.serviceStatus < serviceStatusMap['categoryProvided'])
    {
        return res.json({code: -1, message: 'A surprising error was encountered. Please be sure to provide information on Categorization & more for your service first before making this request'});
    }
    else
    {
        Service.findOne({_id: service.serviceId}, (err, existingService) =>
        {
            if (!existingService)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                existingService.lastModified = new Date();
                existingService.requirements = service.requirements;
                existingService.serviceStatus = serviceStatusMap['requirementsProvided'];

                return existingService.save((err, savedService) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, serviceId: savedService._id, message: 'Service Requirements was successfully processed'});
                    }
                });
            }
        });
    }
}

function takeServiceOffline(req, res)
{
    let id = req.serviceId;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        Service.findOne({_id: id}, (err, service)  =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                service.serviceStatus = serviceStatusMap['offline'];

                return service.save((err, savedService) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        return res.json({code: 5, serviceId: savedService._id, message: 'Service was successfully taken Offline. \nYou can bring it back online when it becomes convenient for you to do so.'});
                    }
                });
            }
        });
    }
}

function switchOnline(req, res)
{
    let id = req.body.service;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        Service.findOne({_id: id}, (err, service)  =>
        {
            if(err || !service)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                if(service.serviceStatus < serviceStatusMap['packagesProvided'])
                {
                    return res.json({code: -1, message: 'A surprising error was encountered. \nPlease be sure to provide the the needed Price packages for your service first before making this request'});
                }
                else
                {
                    service.serviceStatus = serviceStatusMap.published;
                    User.findOne({_id: service.addedBy}, (err1, geek)  =>
                    {
                        if(err1|| !geek)
                        {
                            return res.json({code: -1, message: 'An error was encountered. Please try again'});
                        }
                        else
                        {
                            if(geek.services !== undefined && geek.services !== null && geek.services.length > 0)
                            {
                                let exs = geek.services.find(s => s === service._id);
                                if(exs === undefined || exs === null || exs.length < 1)
                                {
                                    geek.services.push(service._id);
                                }
                            }
                            else
                            {
                                geek.services = [service._id];
                            }

                            return service.save((err, savedService) =>
                            {
                                if (err)
                                {
                                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                }
                                else
                                {

                                    return geek.save((err, savedGeek) =>
                                    {
                                        if (err)
                                        {
                                            service.serviceStatus = serviceStatusMap.packagesProvided;
                                            service.save();
                                            return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                        }
                                        else
                                        {
                                            return res.json({code: 5, serviceId: savedService._id, message: 'Service was successfully brought Online. \nExpect customers to start making advances!'});
                                        }
                                    });

                                }
                            });

                        }
                    });

                }

            }
        });
    }
}

function getServiceMetadataList(req, res)
{
    let id = req.serviceId;
    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({code: -1, message: 'Invalid selection!'});
    }
    else
    {
        Service.findOne({id: id}, (err, service) =>
        {
            if (!service)
            {
                return res.json({code: -1, message: 'Service was not found'});
            }
            else
            {
                return res.json({code: 5, service: service});
            }
        });
    }

}

function getService(req, res)
{
    let id = req.query.service.replace(' ', '');

    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({});
    }
    else
    {
        Service.findOne({_id: id}).populate('creativeType').populate('techStacks').populate('creativeSubCategory').populate('creativeCategory')
            .populate('keywords').populate({path: 'addedBy', select:'geekName geekNameUpper profileImagePath location rating'}).populate({path: 'metadata'}).populate({path: 'packages'}).then((service) =>
        {
            if (!service)
            {
                return res.json({});
            }
            else
            {
                return res.json(service);
            }
        });
    }
}

function getServiceInfo(req, res)
{
    let id = req.query.service.replace(' ', '');

    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({});
    }
    else
    {
        Service.findOne({_id: id}).populate({path: 'creativeType', select: 'name'}).populate({path: 'creativeSubCategory', select: 'name'}).populate({path: 'creativeCategory', select: 'name'})
            .populate({path: 'addedBy', select:'geekName geekNameUpper profileImagePath professionalCaption location rating'})
            .populate({path: 'packages', populate: {path: 'selectedFeatures selectedFeatures.feature packageType'}})
            .populate({path: 'metadata'}).then((service) =>
            {
                if (!service)
                {
                    return res.json({});
                }
                else
                {
                    return res.json(service);
                }
            });
    }
}

function getScoPackages(req, res)
{
    let id = req.query.service.replace(' ', '');

    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({});
    }
    else
    {
        ServicePackage.find({service: id}).populate({path: 'selectedFeatures selectedFeatures.feature packageType'})
            .then((packages) =>
        {
            if (!packages)
            {
                return res.json([]);
            }
            else
            {
                return res.json(packages);
            }
        });
    }
}

function searchService(req, res)
{
    let query = req.query;
    if(query === undefined || query === null || query.length < 1)
    {
        return res.json({code: -1, message: 'Invalid search criteris!'});
    }
    else
    {
        Service.findOne({ name: {"$regex": req.body.searchText, "$options": "i" }}, (err, services) =>
        {
            if (!services)
            {
                return res.json({code: -1, message: 'Service was not found'});
            }
            else
            {
                return res.json({code: 5, services: services});
            }
        });
    }

}

function getServices(req, res)
{    
    let find = { serviceStatus: serviceStatusMap.published };
    Service.find(find).populate('ratings').populate({path: 'addedBy', select:'geekName geekNameUpper profileImagePath professionalCaption'}).populate({path: 'packages', select:'price'}).sort({ratings: 'desc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage).exec((error, services) =>
    { 
        return res.json(services);
    });    
}

const getAllServices = (req, res) =>
{
    Service.find({}).exec((error, services) =>
    {
        return res.json(services);
    });
};

function getServicesByCategory(req, res)
{    
    let find =  {$and: [{creativeCategory: req.query.ctr }, {serviceStatus: serviceStatusMap.published}]};
    Service.find(find).populate({path: 'ratings'}).populate({path: 'addedBy', select:'geekName geekNameUpper profileImagePath professionalCaption'}).populate({path: 'packages', select:'price'}).sort({ratings: 'desc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage).exec((error, services) =>
    {
        return res.json(services);
    });    
}

function getServicesBySubcategory(req, res)
{ 
    let find =  {$and: [{creativeSubCategory: req.body.sctr }, {serviceStatus: serviceStatusMap.published}]};
    Service.find(find).populate('ratings').populate({path: 'addedBy', select:'geekName geekNameUpper profileImagePath professionalCaption'}).populate({path: 'packages', select:'price'}).sort({ratings: 'desc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage).exec((error, services) =>
    {
        return res.json(services);
    });    
}

module.exports = init;