import { NOT_FOUND } from 'redux-first-router'

export default (state = 'HOME', action = {}) => components[action.type] || state;

const components = {
    HOME: 'landing',
    SERVICES: 'services',
    SERVICE: 'service',
    BUYS: 'buys',
    SALES: 'sales',
    CRAFTS: 'handcrafts',
    COUNTRY: 'country',
    CRE: 'cre',
    CR: 'cr',
    VERIFY: 'verifyAccount',
    COMPLAINT_TYPE: 'complaintType',
    AUTH: 'auth',
    ADMIN: 'Admin',
    CATEGORY: 'creativeCategory',
    SUBCATEGORY: 'subCategory',
    TYPE: 'creativeType',
    TYP: 'packageType',
    PACKAGE: 'pricePackage',
    FEATURE: 'feature',
    OPTION: 'creativeOption',
    METADATA: 'creativeMetadata',
    LOGIN: 'Login',
    [NOT_FOUND]: 'NotFound'
};
