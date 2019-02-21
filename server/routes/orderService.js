/**
 * Created by Jack V on 9/22/2017.
 */
import path from 'path';
import fs from 'fs';
import uniRest from 'unirest';
import config from '../common/config';
import idGen from 'shortid';

let Service = '';
let Order = '';
let OrderPayment = '';
let ServicePackage = '';
let OrderRef = '';
let OrderRating = '';
let ToggledOrder = '';

const init = (app, mongoose) =>
{
    Service = mongoose.model('Service');
    Order = mongoose.model('Order');
    OrderPayment = mongoose.model('OrderPayment');
    OrderRating = mongoose.model('OrderRating');
    ServicePackage = mongoose.model('ServicePackage');
    OrderRef = mongoose.model('OrderRef');
    ToggledOrder = mongoose.model('ToggledOrder');

    app.post('/prs', processOrder);
    app.post('/acpO', acceptOrder);
    app.post('/tgl', toggleOrder);
    app.post('/markDelivery', deliverOrder);
    app.get('/trFg', generateOrderRef);
    app.post('/getGeekOrders', getGeekOrders);
    app.post('/myBuys', getMyOrders);
    app.post('/mySales', getMySales);
    app.get('/getOrder', getOrder);
    app.get('/getAcpO', getOrderAcceptance);
    app.get('/getOrderWRef', getOrderWRef);
    app.get('/getOrders', getOrder);
    app.get('/getOrderedPackage', getOrderedServicePackage);
};

let orderStatusMap =
{
    pending: 1,
    paid: 2,
    packaged: 3,
    inTransit: 4,
    delivered_pending_reception: 5,
    delivered_and_accepted: 6,
    delivered_but_rejected: 7,
    revoked: 8,
    cancelled: 9
};

let orderRefStatusMap =
{
    unUsed: 1,
    used: 2
};

function processOrder(req, res)
{
   try{
       let order = req.body;

       if(order === undefined || order === null)
       {
           return res.json({code: -1, message: 'An internal server error was encountered. \nPlease refresh the page and try again'});
       }
       if(order.orderedBy.length < 1)
       {
           return res.json({code: -1, message: 'An internal server error was encountered. \nPlease refresh the page and try again'});
       }
       if(order.geek.length < 1)
       {
           return res.json({code: -1, message: 'An internal server error was encountered. \nPlease refresh the page and try again'});
       }
       if((order.service === undefined || order.service === null || order.service.length < 1) && (order.craft === undefined || order.craft === null || order.craft.length < 1))
       {
           return res.json({code: -1, message: 'A systematic error was encountered. \nPlease refresh the page and try again'});
       }
       if(order.orderRef.length < 1)
       {
           return res.json({code: -1, message: 'A systematic error was encountered. \nPlease refresh the page and try again'});
       }
       if(order.orderedServicePackage.length < 1)
       {
           return res.json({code: -1, message: 'A systematic error was encountered. \nPlease refresh the page and try again'});
       }

       if(order.orderedBy === order.geek)
       {
           return res.json({code: -1, message: 'You cannot buy your own service'});
       }
       else
       {
           OrderRef.findOne({ $and: [{ buyer: order.orderedBy}, { code: order.orderRef}, {status: orderRefStatusMap.unUsed}]}, (err, tRef) =>
           {
               if (!tRef)
               {
                   return res.json({code: -1, message: 'A systematic error was encountered. \nPlease refresh the page and try again'});
               }
               else
               {
                   uniRest.post(config.rave.testRaveUrl)
                   .headers({'Content-Type': 'application/json'})
                   .send({SECKEY: config.rave.testSecKey, txref: order.orderRef})
                   .end(function(response)
                   {
                       if (response.body.data.status === "successful" && (response.body.data.chargecode === '00' ||  response.body.data.chargecode === '0'))
                       {
                           if (parseFloat(response.body.data.amount) === parseFloat(order.payment.amountPaid))
                           {
                               const newOrder = new Order(order);
                               newOrder.dateOrdered = new Date;
                               newOrder.lastModified = new Date;
                               newOrder.status = orderStatusMap.paid;
                               newOrder.orderPayment = null;
                               newOrder.sellerDeliveryDate = null;
                               newOrder.sellerDeliveryNote = '';

                               return newOrder.save((err, savedOrder) =>
                               {
                                   if (err)
                                   {
                                       console.log('Order error');
                                       console.log(err);
                                       return res.json({code: -1, message: 'Your order details could not be processed now. We will try again. Please bear with us'});
                                   }
                                   else
                                   {
                                       const orderPayment = new OrderPayment(order.payment);
                                       orderPayment.datePaid = response.body.data.created;
                                       orderPayment.flwRef = response.body.data.flwref;
                                       orderPayment.order = savedOrder._id;
                                       orderPayment.appFee = response.body.data.appfee;
                                       orderPayment.currency = response.body.data.currency;
                                       orderPayment.amountPaid = response.body.data.amount;
                                       orderPayment.amountSettledForTransaction = response.body.data.amountsettledforthistransaction;

                                       return orderPayment.save((er, savedOrderPayment) =>
                                       {
                                           if (er)
                                           {
                                               console.log('\npayment error\n');
                                               console.log(er);
                                               Order.remove({_id: savedOrder._id}).exec(err =>
                                               {
                                                   if(err)
                                                   {
                                                       return res.json({code: -2, orderId: savedOrder._id,  message: 'A fatal internal server error was encountered. Please try again later'});
                                                   }
                                                   else
                                                   {
                                                       return res.json({code: -1, message: 'Your order could not be placed due to unknown error. Please try again later'});
                                                   }
                                               });
                                           }
                                           else
                                           {
                                               //Notify geek with socket.io
                                               tRef.status = orderRefStatusMap.used;
                                               return tRef.save((err, sRef) =>
                                               {
                                                   if (err)
                                                   {
                                                       return res.json({code: 5, OrderId: savedOrder._id, pId: savedOrderPayment._id, refU: false, message: 'Your Order was successfully processed. The seller will spring to action immediately.'});
                                                   }
                                                   else
                                                   {
                                                       let pps = [savedOrderPayment._id];
                                                       Order.findByIdAndUpdate(savedOrder._id, { orderPayments: pps},  function (ers, ord) {
                                                           if (ers)
                                                           {
                                                               return res.json({code: 5, paymentIdSaved: false, OrderId: savedOrder._id, pId: savedOrderPayment._id, refU: false, message: 'Your Order was successfully processed. The seller will spring to action immediately.'});
                                                           }
                                                           else
                                                           {
                                                               return res.json({code: 5, paymentIdSaved: true, OrderId: savedOrder._id, pId: savedOrderPayment._id, refU: true, message: 'Your Order was successfully processed. The seller will spring to action immediately.'});
                                                           }
                                                       });
                                                   }
                                               });
                                           }
                                       });
                                   }
                               });
                           }
                           else
                           {
                               return res.json({code: -1, message: 'The amount paid could not be verified. Please try again'});
                           }
                       }
                       else
                       {
                           return res.json({code: -1, message: 'The payment information could not be verified. Please try again'});
                       }
                   });
               }
           });
       }
   }
   catch(e)
   {
       console.log('\nERROR\n');
       console.log(e);
       return res.json({code: -1, message: 'An unknown error was encountered. Please try again'});
   }
}

function toggleOrder(req, res)
{
    let orderInfo = req.orderInfo;
    if(orderInfo === undefined || orderInfo === null || orderInfo.order.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        Order.findOne({_id: orderInfo.order}, (err, order)  =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else
            {
                let originalStatus = {keyVal: order.status};
                order.status = orderInfo.status;
                return order.save((err, savedOrder) =>
                {
                    if (err)
                    {
                        return res.json({code: -1, message: 'An error was encountered. Please try again'});
                    }
                    else
                    {
                        if(orderInfo.orderToggle !== undefined && orderInfo.orderToggle !== null && orderInfo.orderToggle.toggleReason.length > 0)
                        {
                            const toggledOrder = new ToggledOrder(orderInfo.orderToggle);
                            toggledOrder.dateProfiled = new Date();
                            toggledOrder.resolutionInitiated = false;
                            return toggledOrder.save((er1, response) =>
                            {
                                if (er1)
                                {
                                    console.log('order Toggle error');
                                    console.log(er1);

                                    order.status = originalStatus.keyVal;
                                    return order.save((err, ss) =>
                                    {
                                        if (err)
                                        {
                                            return res.json({code: -2, Order: savedOrder._id, message: 'An error was encountered. Please try again'});
                                        }
                                        else
                                        {
                                            return res.json({code: -1, message: 'An error was encountered. Please try again'});
                                        }
                                    });
                                }
                                else
                                {
                                    //Notify geek with socket.io about order status change if s/he didn't make the change
                                    return res.json({code: 5, Order: savedOrder._id, toggledOrder: response._id, message: 'Your request was successfully processed. We will review this and get back to you if there be the need'});
                                }
                            });
                        }
                        else{
                            return res.json({code: 5, order: savedOrder._id, message: 'Your request was successfully processed'});
                        }
                    }
                });
            }
        });
    }
}

function acceptOrder(req, res)
{
    try{
        let accept = req.body;
        if(accept === undefined || accept.order.length < 1)
        {
            return res.json({code: -1, message: 'An error was encountered. Please try again'});
        }
        if(accept.deliveryDate === undefined || accept.deliveryDate === null || accept.deliveryDate.length < 1)
        {
            return res.json({code: -1, message: 'Please provide the date this purchase was delivered'});
        }
        else
        {
            Order.findOne({_id: accept.order}).populate('service').populate('craft').exec((ee, order) =>
            {
                if(!order || (!order.service && !order.craft))
                {
                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                }
                else{                  
                    
                    let originalStatus = {keyVal: order.status};
                    order.status = orderStatusMap.delivered_and_accepted;
                    order.actualDeliveryDate = accept.deliveryDate
                    let rr = '';
                    let orR = '';
                    if(accept.caption.length > 0 && accept.note.length > 0 && accept.rating > 0)
                    {
                        let query = accept._id && accept._id.length > 0? accept._id : null;
                        OrderRating.findOneAndUpdate(query, { $set: 
                            {  
                                caption: accept.caption,
                                note: accept.note,    
                                addedBy: accept.addedBy,
                                rating: accept.rating,
                                dateAdded: accept.dateAdded,
                                service: accept.service,
                                deliveryDate: accept.deliveryDate,
                                craft: accept.craft
                            }}, { upsert: true, new: true, setDefaultsOnInsert: true},
                            function (e, rr) 
                            {
                                console.log('\nrr: \n');
                                console.log(rr);
                                if (e) 
                                {
                                    console.log('\nservice rating error: \n');
                                    console.log(e);
                                }
                                else
                                {
                                    console.log('\nservice: \n');
                                    console.log(order.service);

                                    if(order.service !== undefined && order.service !== null)
                                    {
                                        if(order.service.ratings === undefined || order.service.ratings === null)
                                        {
                                            order.service.ratings = [];
                                        }
                                        order.service.ratings.push(rr._id);  

                                        console.log('\nservice.ratings: \n');
                                        console.log(order.service.ratings);    

                                        return order.service.save((e, r) =>
                                        {
                                            if (e)
                                            {
                                                //nothing to return now
                                            }
                                            else{
                                                orR = r._id;
                                            }
                                        });
                                    }
    
                                    if(order.craft && order.craft._id.length > 0)
                                    {
                                        if(order.craft.ratings === undefined || order.craft.ratings === null)
                                        {
                                            order.craft.ratings = [];
                                        }
                                        order.craft.ratings.push(rr._id);
                                        return order.craft.save((ec, c) =>
                                        {
                                            if (ec)
                                            {
                                                //nothing to return now
                                            }
                                            else{
                                                orR = c._id;
                                            }
                                        });
                                    }
                                }   
                               
                          });                      
        
                    }
        
                    return order.save((er1, or) =>
                    {
                        if (er1)
                        {
                            order.status = originalStatus.keyVal;
                            return order.save((err, ss) =>
                            {
                                if (err)
                                {
                                    return res.json({code: -2, Order: or._id,ratingMsg: rr, message: 'An error was encountered. Please try again'});
                                }
                                else
                                {
                                    return res.json({code: -1, ratingMsg: rr, message: 'An error was encountered. Please try again'});
                                }
                            });
                        }
                        else
                        {
                            //Notify creaptive admin with socket.io about order acceptance
                            return res.json({code: 5, Order: or._id, ratingId: orR, ratingMsg: rr, message: 'Thanks for your patronage. We do hope you can continue doing business with us'});
                        }
                    });
                }
               
            });
        } 
    }
    catch(e)
    {
        return res.json({code: -1, ratingMsg: '', message: 'An error was encountered. Please try again'});
    }
}

function deliverOrder(req, res)
{
    try
    {
        let delivery = req.body;
        if(delivery === undefined || delivery.order.length < 1)
        {
            return res.json({code: -1, message: 'An error was encountered. Please try again'});
        }
        if(delivery.sellerDeliveryDate === undefined || delivery.sellerDeliveryDate === null || delivery.sellerDeliveryDate.length < 1)
        {
            return res.json({code: -1, message: 'Please provide the date you delivered this order'});
        }
        else
        {
            Order.findOne({_id: delivery.order}, (err, order)  =>
            {
                if(err)
                {
                    return res.json({code: -1, message: 'An error was encountered. Please try again'});
                }
                else
                {
                    if( order.status < orderStatusMap.delivered_and_accepted)
                    {
                        order.status = orderStatusMap.delivered_pending_reception;
                    }                    
                    order.sellerDeliveryDate = delivery.sellerDeliveryDate;
                    order.sellerDeliveryNote = delivery.sellerDeliveryNote;
                    order.sellerMarkedDelivery = true;
                    return order.save((er1, or) =>
                    {
                        if (er1)
                        {
                            return res.json({code: -2, Order: or._id,ratingMsg: rr, message: 'An error was encountered. Please try again'});
                        }
                        else
                        {
                            return res.json({code: 5, Order: delivery.order, message: 'Thanks for your diligence. We do hope the buyer will indicate satisfaction with your delivery ASAP'});
                        }
                    });                 
                }
               
            });
        } 
    }
    catch(e)
    {
        return res.json({code: -1, ratingMsg: '', message: 'An error was encountered. Please try again'});
    }

}

function getOrder(req, res)
{
    let id = req.query.order.replace(' ', '');

    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({});
    }
    else
    {
        Order.findOne({_id: id}).populate({path: 'orderedPackage', populate: {path: 'service selectedFeatures selectedFeatures.feature packageType'}}).then((order) =>
        {
            if (!order)
            {
                return res.json({});
            }
            else
            {
                return res.json(order);
            }
        });
    }
}

function getOrderAcceptance(req, res)
{
    let order = req.query.order;
    if(order === undefined || order.length < 1)
    {
        return res.json({code: -1, message: 'An error was encountered. Please try again'});
    }
    else
    {
        OrderRating.findOne({order: order}, (err, rating)  =>
        {
            if(err)
            {
                return res.json({code: -1, message: 'An error was encountered. Please try again'});
            }
            else{
                return res.json({code: 5, message: '', rating: rating});
            }
           
        });
    } 

}

function getOrderWRef(req, res)
{
    let orderRef = req.query.orderRef.replace(' ', '');

    if(orderRef === undefined || orderRef === null || orderRef.length < 1)
    {
        return res.json({});
    }
    else
    {
        Order.findOne({orderRef: orderRef}).populate({path: 'orderedPackage', populate: {path: 'service selectedFeatures selectedFeatures.feature packageType'}}).then((order) =>
        {
            if (!order)
            {
                return res.json({});
            }
            else
            {
                return res.json(order);
            }
        });
    }
}

function getMyOrders(req, res)
{
    try{
        let find = {orderedBy: req.body.buyer};
        if(req.searchText !== undefined && req.searchText.length > 0)
        {
            find = { $and: [{ orderedBy: req.body.buyer}, {orderRef: { "$regex": req.body.searchText}}]};
        }
        // let count = Order.count(find);
        Order.find(find)
            .populate('orderPayments')
            .populate({path: 'service', select: '_id title bannerImage'})
            .populate({path: 'geek', select:'_id geekName geekNameUpper profileImagePath professionalCaption onlineStatus'})
            .sort({dateOrdered: 'desc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage)
            .then((orders) =>
            {
                return res.json(orders);
            });

    }
    catch(e)
    {
        console.log('\nERROR\n');
        console.log(e);
        return res.json([]);
    }
}

function getMySales(req, res)
{
    try{
        let find = {geek: req.body.seller};
        if(req.searchText !== undefined && req.searchText.length > 0)
        {
            find = { $and: [{ orderedBy: req.body.buyer}, {orderRef: { "$regex": req.body.searchText}}]};
        }
        // let count = Order.count(find);
        Order.find(find)
            .populate('orderPayments')
            .populate({path: 'service', select: '_id title bannerImage'})
            .populate({path: 'orderedBy', select:'_id firstName lastName geekName geekNameUpper profileImagePath onlineStatus'})
            .sort({dateOrdered: 'desc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage)
            .then((orders) =>
            {
                return res.json(orders);
            });

    }
    catch(e)
    {
        console.log('\nERROR\n');
        console.log(e);
        return res.json([]);
    }
}

function getGeekOrders(req, res)
{
    let find = {geek: req.body.geek};
    if(req.searchText !== undefined && req.searchText.length > 0)
    {
        find = { $and: [{ orderedBy: req.body.orderedBy}, {orderRef: { "$regex": req.body.searchText, "$options": "i" }}]};
    }

    let count = Order.count(find);
    let orders = Order.find(find).sort({dateOrdered: 'desc'}).skip((req.body.page - 1) * req.body.itemsPerPage).limit(req.body.itemsPerPage);
    return res.json({totalItems: count, items: orders});
}

function generateOrderRef(req, res)
{
   try{
       let client = req.query.client;
       if(client === undefined || client === null || client.length < 1)
       {
           return res.json({code: -1, rRef: '', message: 'An error was encountered. Please try again'});
       }
       else
       {
           OrderRef.findOne({ $and: [{ buyer: client}, {status: orderRefStatusMap.unUsed}]}, (err, tRef) =>
           {
               if (!tRef)
               {
                   let refId = idGen.generate();
                   let orderRef = new OrderRef({
                       code: refId,
                       buyer: client,
                       dateGenerated: new Date(),
                       status: orderRefStatusMap.unUsed
                   });

                   return orderRef.save((err, sRef) =>
                   {
                       if (err)
                       {
                           return res.json({code: -1, rRef: '', message: 'An error was encountered. Please try again'});
                       }
                       else
                       {
                           return res.json({code: 5, rRef: sRef.code, message: 'Success'});
                       }
                   });

               }
               else
               {
                   return res.json({code: 5, rRef: tRef.code, message: 'Success'});
               }
           });
       }
   }
   catch (e)
   {
       return res.json({code: -1, rRef: '', message: 'An error was encountered. Please try again'});
   }
}

function getOrderedServicePackage(req, res)
{
    let id = req.query.sPackage.replace(' ', '');

    if(id === undefined || id === null || id.length < 1)
    {
        return res.json({});
    }
    else
    {
        ServicePackage.findOne({_id: id})
            .populate({path: 'selectedFeatures selectedFeatures.feature package packageType'})
            .then((servicePackage) =>
            {
                if (!servicePackage)
                {
                    return res.json({});
                }
                else
                {
                    return res.json(servicePackage);
                }
            });
    }
}

module.exports = init;