import { redirect, NOT_FOUND } from 'redux-first-router'
import { fetchData, postQuery } from './utils'

export default 
{
  HOME: {
      path: '/',
      thunk: async (dispatch, getState) =>
      {

      },
      display: 'Home'
  }
    ,
    TYP:
    {
        path: '/packageType',
        thunk: async (dispatch, getState) =>
        {

        },
        display: 'Package Types'
    },
  PACKAGE:
      {
          path: '/pricePackage',
          thunk: async (dispatch, getState) =>
          {

          },
          display: 'Price Packages'
      },
    FEATURE:
    {
        path: '/feature',
        thunk: async (dispatch, getState) =>
        {

        },
        display: 'Package Features'
    },
  COUNTRY:
  {
    path: '/country',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Countries'
  },
  CATEGORY:
  {
    path: '/creativeCategory',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Categories'
  },
  METADATA:
  {
    path: '/creativeMetadata',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Service Metadata'
  },
  SUBCATEGORY:
  {
    path: '/subCategory',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Subcategories'
  },
  TYPE:
  {
    path: '/creativeType',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Creative Type'
  },
  COMPLAINT_TYPE:
  {
    path: '/complaintType',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Complaint Type'
  },
  OPTION:
  {
    path: '/creativeOption',
    thunk: async (dispatch, getState) =>
    {},
      display: 'Creative Options'
  },
  AUTH:
  {
    path: '/auth',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Account Auth'
  },
  VERIFY:
  {
    path: '/verifyAccount',
    thunk: async (dispatch, getState) =>
    {

    },
      display: 'Account Verification'
  },
    GEEKS:
    {
        path: '/geeks',
        thunk: async (dispatch, getState) =>
        {
            
        },
        display: 'Geeks'
    },
    CR:
    {
      path: '/cr/:slug?',
      thunk: async (dispatch, getState) =>
      {
        const {cre} = getState();
        if (cre !== undefined && cre.slug !== undefined && cre.slug.length > 0)
        {
            let theGeek = await fetchData(`/getGeek?cre=` + cre.slug);
            if (!theGeek || theGeek.id.length < 1)
            {
                dispatch({ type: 'GEEK_MISS',  payload: {slug: theGeek}});
            }
            else
            {
                dispatch({ type: 'GEEK', payload: {slug: theGeek}});
                let body = JSON.stringify({geekId: theGeek.id, itemsPerPage: 10, searchText:"", page:1, sortField:"lastModified",sortOrder:"desc"});
                let res = await postQuery('/getGeekSpace', body);
                dispatch({ type: 'GEEK_SPACE', payload: {slug: res}});
            }
        }
      },
        display: 'Geek'
    },
  CRE:
  {
    path: '/cre',
    thunk: async (dispatch, getState) =>
    {
      
    },
      display: 'Geeks'
  },
    BUYS:
      {
          // path: '/buys/:slug?',
          path: '/buys',
          thunk: async (dispatch, getState) =>
          {
              // const {buyer} = getState();
              // if (!buyer || !buyer.slug || buyer.slug.length < 1) return;
              // let body = JSON.stringify({buyer: buyer.slug, itemsPerPage: 10, searchText:"", page:1});
              // let myBuys = await postQuery('/myBuys', body);
              // dispatch({ type: 'BUYER', payload: buyer.slug});
              // dispatch({ type: 'BUYS', payload: (!myBuys || myBuys.length < 1)? [] : myBuys});
          },
          display: 'My Buys'
      },
    SALES:
        {
            // path: '/sales/:slug?',
            path: '/sales',
            thunk: async (dispatch, getState) =>
            {
                // const {seller} = getState();
                // if (!seller || !seller.slug || seller.slug.length < 1) return;
                // let body = JSON.stringify({seller: seller.slug, itemsPerPage: 10, searchText:"", page:1});
                // let mySales = await postQuery('/mySales', body);
                // dispatch({ type: 'SELLER', payload: seller.slug});
                // dispatch({ type: 'SALES', payload: (!mySales || mySales.length < 1)? [] : mySales});
            },
            display: 'My Sales'
        },
    SERVICE:
        {
            path: '/service/:slug?',
            thunk: async (dispatch, getState) =>
            {
                const {service} = getState();
                if (!service || !service.slug || service.slug.length < 1) return;
                let theService = await fetchData(`/getServiceInfo?service=` + service.slug);
                if (!theService || theService._id.length < 1)
                {
                    dispatch({ type: 'SERVICE_NULL',  payload: true});
                }
                else
                {
                    dispatch({ type: 'SID', payload: service.slug});
                    dispatch({ type: 'SCO', payload: theService});
                }
            },
            display: 'Service'
        },
  SERVICES: 
  {
    path: '/services/:recx1?/:recx2?/:recx',
    thunk: async (dispatch, getState) => 
    {
    },
      display: 'Services'
  },
  MORE_SERVICES:
  {
    path: '/services',
    thunk: async (dispatch, getState) => 
    {       
        const {section, payload} = getState();
        if(section !== 'services') return;
        const { fetchedItems, page = 0, itemCount = 50} = payload;
        let currentPage = page + 1;
        const services = await fetchData(`/api/services?page=${currentPage}&size=${itemCount}`);
        if (services.length > 0) 
        {
          let items = [...fetchedItems, ...services];
          dispatch({ type: 'SERVICE_ITEMS', section: 'services', payload: {fetchedItems: items, page: currentPage, itemCount: 50}});
        }       
        else
        {
          dispatch({ type: 'SERVICE_ITEMS_NOT_FOUND', section: 'services', payload: {fetchedItems, page: currentPage, itemCount: 50}});
        }
    }
  },
  CRAFTS: 
  {
    path: '/crafts/:recx1?/:recx2?/:recx',
    thunk: async (dispatch, getState) => 
    {
      // console.log(getState());
      const {craftSection, payload} = getState();
      if(!craftSection || craftSection.location !== 'crafts') return;

      const fetchedItems = payload? payload.fetchedItems : [];
      if (fetchedItems || fetchedItems.length > 0) return;

      const crafts = await fetchData(`/api/crafts?page=1&size=50`);    
      if (crafts.length > 0) 
      {
        let items = [...fetchedItems, ...crafts];
        dispatch({ type: 'CRAFT_ITEMS', craftSection, payload: {fetchedItems: items, page: 1, itemCount: 50}});
      }       
      else
      {
        dispatch({ type: 'CRAFT_ITEMS_NOT_FOUND', craftSection, payload: {fetchedItems, page: 1, itemCount: 50}});
      }     
    },
      display: 'Crafts'
  },
  MORE_CRAFTS: 
  {
    path: '/crafts',
    thunk: async (dispatch, getState) => 
    {
        const {section, payload} = getState();
        if(section !== 'crafts') return;

        const { fetchedItems, page = 0, itemCount = 50} = payload;
        let currentPage = page + 1;
        const crafts = await fetchData(`/api/crafts?page=${currentPage}&size=${itemCount}`);
      
        if (crafts.length > 0) 
        {
          let items = [...fetchedItems, ...crafts];
          dispatch({ type: 'CRAFT_ITEMS', section: 'crafts', payload: {fetchedItems: items, page: currentPage, itemCount}});
        }       
        else
        {
          dispatch({ type: 'CRAFT_ITEMS_NOT_FOUND', section: 'crafts', payload: {fetchedItems, page: currentPage, itemCount}});
        }
    }
  },
  SERVICE_ARTICLE: 
  {
    path: '/services/:slug',
    thunk: async (dispatch, getState) => 
    {
      const {section, payload} = getState();
      if(section !== 'services' || !payload.service) return;
      
      const {service, slug} = payload;
      const item = await fetchData(`/api/services/getServiceById?id=${slug}`);
    
      if (!item || !item.id.length > 0) 
      {
        dispatch({ type: 'SERVICE_ARTICLE', section: 'services', payload: {service, slug, item}});
      }
      else
      {
        dispatch({ type: 'SERVICE_ARTICLE_NOT_FOUND', section: 'services', payload: {service, slug, item: {}}});
      }
    }
  },
  CRAFT_ARTICLE: 
  {
    path: '/crafts/:slug',
    thunk: async (dispatch, getState) => 
    {
      const {section, payload} = getState();
      if(section !== 'crafts' || !payload.craft) return;      
      const {category, subCategory, slug} = payload;
      const item = await fetchData(`/api/crafts/getCraftById?id=${slug}`);
      
      if (!item || !item.id.length > 0) 
      {
        dispatch({ type: 'SERVICE_ARTICLE', section: 'crafts', payload: {craft, slug, item}});
      }
      else{
        dispatch({ type: 'SERVICE_ARTICLE_NOT_FOUND', section: 'crafts', payload: {craft, slug, item: {}}});
      }
    }
  },
  SERVICE_SEARCH: 
  {
    path: '/services/:search',
    thunk: async (dispatch, getState) => 
    {
      const {section, search, fetchedItems, page, itemCount} = getState();
      if(section !== 'services' || !search) return;
      let items = fetchedItems;
      currentPage = !page ? 0 : page + 1;
      const services = await fetchData(`/api/services/search?searchTerm=${search}page=`+ currentPage + `&size=` + itemCount);
    
      if (services.length > 0) 
      {
        items = [...fetchedItems, ...services];
        dispatch({ type: 'SERVICE_SEARCH', section, fetchedItems: items, page: currentPage, itemCount, search});
      }
      else{
        dispatch({ type: 'SERVICE_SEARCH_NOT_FOUND', section, fetchedItems: items, page: currentPage, itemCount, search});
      }
      
    }
  },
  CRAFTS_SEARCH: 
  {
    path: '/crafts/:search',
    thunk: async (dispatch, getState) => 
    {
      const {section, search, fetchedItems, page, itemCount} = getState();
      if(section !== 'crafts' || !search) return;
      let items = fetchedItems;
      currentPage = !page ? 0 : page + 1;
      const crafts = await fetchData(`/api/crafts/search?searchTerm=${search}page=`+ currentPage + `&size=` + itemCount);
    
      if (services.length > 0) 
      {
        items = [...fetchedItems, ...crafts];
        dispatch({ type: 'CRAFTS_SEARCH', section, fetchedItems: items, page: currentPage, itemCount, search});
      }
      else{
        dispatch({ type: 'CRAFTS_SEARCH_NOT_FOUND', section, fetchedItems: items, page: currentPage, itemCount, search});
      }
      
    }
  },
  LOGIN: '/',
  ADMIN: 
  {
    path: '/admin',
    role: 'admin',
    thunk: async (dispatch, getState) => 
    {
      state = getState();
      if(state.user || state.user.id.length < 1) return;
      const {id} = state.user;
      const user = await fetchData(`/api/users/getUserProfile?id=${id}`);    
      if (!user || !user.id.length > 0) 
      {
        dispatch({ type: 'ADMIN_FOUND', user});
      }
      else
      {
        dispatch({ type: 'ADMIN_NOT_FOUND', user: {}});
      }
    }
  }
}
