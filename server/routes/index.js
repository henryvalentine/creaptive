/**
 * Created by Jack V on 9/22/2017.
 */

import AccountMaintenanceService from './accountManagementService';
import skillService from './skillService';
import creativeCategoryService from './creativeCategoryService';
import creativeSubCategoryService from './creativeSubCategoryService';
import creativeMetadataService from './creativeMetadataService';
import packageFeatureService from './packageFeatureService';
import pricePackageService from './pricePackageService';
import packageTypeService from './packageTypeService';
import optionService from './optionService';
import keywordService from './keywordService';
import creativeService from './creativeService';
import serviceAndCraftQueriesService from './serviceAndCraftQueriesService';
import creativeTypeService from './creativeTypeService';
import creativeSectionService from './creativeSectionService';
import countryService from './countryServicer';
import fileUploadService from './fileUploadService';
import auth from '../authentication';
import authEndPoints from './authEndpoints';
import io from './io';
import enrollment from './enrollment';
import orderService from './orderService';
import complaintTypeService from './complaintTypeService';
import complaintService from './complaintService';
import serverUploads from './serverUpload';

const init = (app, mongoose) =>
{
    //Authentication middleware for passport
    auth.init(app, mongoose);

    //Other endpoints
    authEndPoints(app, mongoose);
    AccountMaintenanceService(app, mongoose);
    skillService(app, mongoose);
    creativeSectionService(app, mongoose);
    serverUploads(app, mongoose);
    creativeSubCategoryService(app, mongoose);
    creativeCategoryService(app, mongoose);
    creativeMetadataService(app, mongoose);
    optionService(app, mongoose);
    creativeTypeService(app, mongoose);
    countryService(app, mongoose);
    keywordService(app, mongoose);
    creativeService(app, mongoose);
    fileUploadService(app, mongoose);
    orderService(app, mongoose);
    serviceAndCraftQueriesService(app, mongoose);
    packageFeatureService(app, mongoose);
    pricePackageService(app, mongoose);
    packageTypeService(app, mongoose);
    enrollment(app, mongoose);
    complaintTypeService(app, mongoose);
    complaintService(app, mongoose);
    io(app, mongoose);
};

module.exports = init;