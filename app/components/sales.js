/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import {Row, Col, Tabs, Card, Menu, Select, Form, Spin, message, Collapse, DatePicker, Checkbox, Switch, Button, Icon, Avatar, AutoComplete, Input} from 'antd';
const {Item} = Form;
const {SubMenu} = Menu;
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
const { Option, OptGroup } = Select;
import moment from 'moment';
import {goToPage, setUser, dispatchAction} from '../actions';
import { connect } from 'react-redux';
import { fetchData, postQuery } from '../utils'
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Link, { NavLink } from 'redux-first-router-link';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {send_ash, send_active, attach_darker, chat_cover, crIcon, crImg} from './appImg';
import ContentEditable from 'react-contenteditable';
import io from "socket.io-client";
let orderStatusMap =
    {
        Pending: 1,
        Paid: 2,
        Packaged: 3,
        inTransit: 4,
        Delivered_pending_reception: 5,
        Delivered_and_accepted: 6,
        Delivered_but_rejected: 7,
        Revoked: 8,
        Cancelled: 9
    };

class sales extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
            {
                headerHeight: 0,
                loading: false,
                qView: 'app',
                showOrder: false,
                disabled: false,
                screen: {},
                msgPage: 0,
                activePanel: 1,
                creaptive: 7,
                creaptiveCut: 0,
                tValue: 0,
                vat: 5,
                isConnected: false,
                vatValue: 0,
                cTypes: [],
                mySales: [],
                orderedPackage: {delivery: '', price: '', title: '', packageType: {name: ''}, description: '', selectedFeatures: []},
                seller: '',
                user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', iAmTheGeek: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false},
                chat: {msg: '', me: '', peer: ''},
                messages: [],
                service:
                    {
                        _id: '',
                        title: '',
                        description:  '',
                        addedBy: '',
                        dateProfiled: '',
                        lastModified: '',
                        lastViewed: '',
                        numberOfTimesViewed: 0,
                        hasPackages: false,
                        packages: [],
                        details: [],
                        serviceStatus: 0,
                        metadata:[],
                        bannerImage: '',
                        secondImage: '',
                        thirdImage: ''
                    },
                order:
                    {
                        _id: '',
                        service: '',
                        craft: '',
                        geek: '',
                        sellerDeliveryNote: '',
                        orderPayments: [],
                        orderedBy: {
                            _id: '',
                            geekName: '',
                            geekNameUpper: '',
                            profileImagePath: '',
                            firstName: '',
                            lastName: '',
                            onlineStatus: false
                        },
                        dateOrdered: '',
                        orderRef: '',
                        expectedDeliveryDate: '',
                        actualDeliveryDate: '',
                        status: '',
                        orderedServicePackage: '',
                        orderedCraftPackage: '',
                        dateShipped: '',
                        dateReceived: '',
                        providedResources: []
                    },
                    order:
                        {
                            _id: '',
                            service: '',
                            craft: '',
                            orderedBy: '',
                            sellerMarkedDelivery: false,
                            orderPayments: [],
                            geek: {
                                _id: '',
                                geekName: '',
                                geekNameUpper: '',
                                profileImagePath: '',
                                professionalCaption: '',
                                onlineStatus: false
                            },
                            dateOrdered: '',
                            orderRef: '',
                            expectedDeliveryDate: '',
                            actualDeliveryDate: '',
                            sellerDeliveryDate: '',
                            status: '',
                            orderedServicePackage: '',
                            orderedCraftPackage: '',
                            dateShipped: '',
                            dateReceived: '',
                            providedResources: []
                        },
                    complaint:
                    {
                        caption: '',
                        note: '',
                        complaintType: '',
                        complaintTypeName: '',
                        addedBy: '',
                        dateAdded: new Date(),
                        status: '', 
                        dateResolved: null,
                        complainerFeedback: ''
                    },
                    delivery: 
                    {
                        order: '',
                        sellerDeliveryNote: '',
                        sellerDeliveryDate: null
                    }
            };

        this.goTo = this.goTo.bind(this);
        this.gtMs = this.gtMs.bind(this);
        this.setMsg = this.setMsg.bind(this);
        this.setPeer = this.setPeer.bind(this);
        this.sendMsg = this.sendMsg.bind(this);
        this.setPeers = this.setPeers.bind(this);
        this.showOrder = this.showOrder.bind(this);
        this.getMySales = this.getMySales.bind(this);
        this.receiveMsg = this.receiveMsg.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.hideMessage = this.hideMessage.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.getKeyByValue = this.getKeyByValue.bind(this);
        this.triggerSelect = this.triggerSelect.bind(this);
        this.cancelSummary = this.cancelSummary.bind(this);
        this.getServicePackage = this.getServicePackage.bind(this);
        this.msgRead = this.msgRead.bind(this);
        this.panelChanged = this.panelChanged.bind(this);
        this.updateId = this.updateId.bind(this);

        this.cTypeChanged = this.cTypeChanged.bind(this);
        this.setCNote = this.setCNote.bind(this);
        this.complain = this.complain.bind(this);
        this.textChange = this.textChange.bind(this);
        this.delivery = this.delivery.bind(this);
        this.getComplaint = this.getComplaint.bind(this);
        this.getOrderDelivery = this.getOrderDelivery.bind(this);
        this.setDeliveryDate = this.setDeliveryDate.bind(this);
        this.setDelieveryNote = this.setDelieveryNote.bind(this);

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    setDelieveryNote (e)
    {        
        let delivery = this.state.delivery;     
        let order = this.state.order;  
        delivery.sellerDeliveryNote = e.target.value;
        order.sellerDeliveryNote = e.target.value;
        this.setState({delivery: delivery, order: order});
    }

    setDeliveryDate(date)
    {
        let delivery = this.state.delivery;       
        delivery.sellerDeliveryDate = date;
        this.setState({delivery: delivery});
    }

    cTypeChanged (complaintType)
    {
        let complaint = this.state.complaint;
        complaint.complaintType = complaintType;
        this.setState({complaint: complaint});
    }

    setCNote (e)
    {
        let val = e.target.value;
        let complaint = this.state.complaint;
        complaint.note = val;
        this.setState({complaint: complaint});
    }

    textChange (e)
    {
        let val = e.target.value;
        let complaint = this.state.complaint;
        complaint.caption = val;
        this.setState({complaint: complaint});
    }  
    
    async complain ()
    {
        if(this.state.complaint.note.length < 1)
        {
            message.error('Please Explain your complaint in detail');
            document.getElementsByClassName('ant-message-notice-content')[0].classList.add('msg-err');
            return;
        }
        if(this.state.complaint.caption.length < 1)
        {
            message.error('Please add a Title complaint');
            document.getElementsByClassName('ant-message-notice-content')[0].classList.add('msg-err');
            return;
        }
        if(this.state.complaint.complaintType < 1)
        {
            message.error('Please select complaint Type');
            document.getElementsByClassName('ant-message-notice-content')[0].classList.add('msg-err');
            return;
        }
        let complaint = this.state.complaint
        complaint.order = this.state.order._id;
        complaint.addedBy = this.props.user.id;
        this.showSpinner(true);
        let res = await postQuery('/complain', JSON.stringify(complaint));
        this.showSpinner(false);
        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            this.setState({complaint: {...this.state.complaint, _id: res.complaintId}})
        }
    }  

    async delivery ()
    {
        if(this.state.delivery.sellerDeliveryDate === null || this.state.delivery.sellerDeliveryDate.length < 1)
        {
            message.error('Please provide the date this purchase was delivered');
            return;
        }

        let delivery = this.state.delivery
        delivery.order = this.state.order._id;
        delivery.addedBy = this.state.order.orderedBy;
        delivery.sellerDeliveryNote = this.state.order.sellerDeliveryNote;
        delivery.service = this.state.order.service._id,
        delivery.dateAdded = new Date();
        delivery.craft = null;
        
        this.showSpinner(true);
        let res = await postQuery('/markDelivery', JSON.stringify(delivery));
        this.showSpinner(false);
        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            let order = this.state.order;
            order.sellerMarkedDelivery = true;
            this.setState({ order: order});
        }
    } 

    async getComplaint()  
    {
        this.showSpinner(true);       
        let res = await fetchData('/getComplaintByOrder?order=' +  this.state.order._id + '&complainer=' + this.props.user.id);
        this.showSpinner(false);                 
        if(res.code > 0 && res.complaint !== undefined && res.complaint !== null)
        {
            this.setState({ complaint: res.complaint});
        }
    }

    async getOrderDelivery()
    {
        this.showSpinner(true);       
        let res = await fetchData('/getAcpO?order=' +  this.state.order._id);
        this.showSpinner(false);                 
        if(res.code > 0 && res.rating !== undefined && res.rating !== null)
        {
            this.setState({delivery: res.rating});
        }
    }

    async componentDidMount()
    {
        message.config({
            top: 100,
            duration: 5
        });

        let el = this;
        setTimeout(async function()
        {
            if(!el.props.user || el.props.user.id.length < 1)
            {
                el.showMessage('You are not authorised to access this page', -1);
                el.props.go('HOME', 'landing');
            }
            else
            {   
                if(el.props.io !== undefined && el.props.io.hasOwnProperty('id') && el.props.io.id.length > 0)
                {
                    let chat = el.state.chat;
                    chat.me = el.props.io.id;
                    el.setState({chat: chat});
                }

                if(el.props.peers !== undefined && el.props.peers !== null && el.props.peers.length > 0)
                {
                    el.setPeers(el.props.peers);
                }

                if(el.props.peer !== undefined && el.props.peer.hasOwnProperty('peer') && el.props.peer.peer.length > 0)
                {
                    el.setPeer(el.props.peer);
                }
        
                if(el.props.disconnect !== undefined && el.props.disconnect.hasOwnProperty('peer') && el.props.disconnect.peer.length > 0)
                {
                    el.disconnect(el.props.disconnect);
                }
        
                if(el.props.msgRead !== undefined && el.props.msgRead.hasOwnProperty('reads') && el.props.msgRead.reads.length > 0)
                {
                    el.msgRead(el.props.msgRead);
                }
        
                if(el.props.idUpdate !== undefined && el.props.idUpdate.hasOwnProperty('receiverSid') && el.props.idUpdate.receiverSid.length > 0)
                {
                    el.updateId(el.props.idUpdate);
                }
        
                if(el.props.receive !== undefined && el.props.receive.hasOwnProperty('receiverSid') && el.props.receive.receiverSid.length > 0)
                {
                    el.receiveMsg(el.props.receive);
                }

               el.getMySales(el.props.user.id, 1);
            }
        }, 700);
    }

    getKeyByValue(object, value)
    {
        let objKeys = Object.keys(object);
        let status = objKeys.find(key => object[key] === value);
        if(status !== undefined)return status.replace('_', ' ').replace('_', ' ').replace('_', ' ');
        return 'N/A'
    }

    async getMySales(seller, page)
    {
        let el = this;
        if(!seller || seller.length < 1)
        {
            el.showMessage('An unknown error was encountered. Please try again later', -1);
            el.props.go('SERVICES', '');
        }
        else
        {
            this.showSpinner(true);
            let body = JSON.stringify({seller: seller, itemsPerPage: 10, searchText:"", page: page});
            let mySales = await postQuery('/mySales', body);
            this.showSpinner(false);
            if(mySales && mySales.length > 0)
            {
                let sls = el.state.mySales.concat(mySales);
                el.setState({mySales: sls});
                page+= 1;
                el.getMySales(el.props.user.id, page);
            }

            this.setState({loading: true});
            let cTypes = await fetchData('/getCTypesByTarget?target=2');
            this.setState({loading: false});          
            if(cTypes.length > 0)
            {
                this.setState({ cTypes: cTypes});
            }

        }
    }

    async getServicePackage(packageId)
    {
        let el = this;
        if(!packageId || packageId.length < 1)
        {
            el.showMessage('An unknown error was encountered. Please try again later', -1);
            el.cancelSummary();
        }
        else
        {
            this.showSpinner(true);
            let orderedPackage = await fetchData(`/getOrderedPackage?package=` + packageId);
            this.showSpinner(false);
            if (!orderedPackage || orderedPackage._id.length < 1)
            {
                el.showMessage('Order information could not be retrieved. Please try again later', -1);
                el.cancelSummary();
            }
            else
            {
                el.setState({orderedPackage: orderedPackage});
            }
        }
    }

    componentWillReceiveProps(nextProps)
    {
        if(nextProps.peers !== undefined && nextProps.peers.length > 0)
        {
            this.setPeers(nextProps.peers);
        }

        if(nextProps.peer !== undefined && nextProps.peer.hasOwnProperty('peer'))
        {
            this.setPeer(nextProps.peer);
        }

        if(nextProps.disconnect !== undefined && nextProps.disconnect.hasOwnProperty('peer') && nextProps.disconnect.peer.length > 0)
        {
            this.disconnect(nextProps.disconnect);
        }

        if(nextProps.msgRead !== undefined && nextProps.msgRead.hasOwnProperty('reads') && nextProps.msgRead.reads.length > 0)
        {
            this.msgRead(nextProps.msgRead);
        }

        if(nextProps.idUpdate !== undefined && nextProps.idUpdate.hasOwnProperty('receiverSid') && nextProps.idUpdate.receiverSid.length > 0)
        {
            this.updateId(nextProps.idUpdate);
        }

        if(nextProps.receive !== undefined && nextProps.receive.hasOwnProperty('receiverSid') && nextProps.receive.receiverSid.length > 0)
        {
            this.receiveMsg(nextProps.receive);
        }

    }

    resetService()
    {
        let service =
            {
                id: '',
                title: '',
                description:  '',
                addedBy: '',
                numberOfTimesViewed: 0,
                techStacks: [],
                details: [],
                serviceStatus: 0,
                keywords: [],
                creativeSubCategory: '',
                creativeCategory: '',
                creativeType: '',
                metadata:[],
                bannerImage: '',
                packages: [],
                secondImage: '',
                thirdImage: '',
                pdfResource: {name: '', path: ''}
            };

        this.setState({service: service});
    }

    showMessage(str, code)
    {
        if(code > 0)
        {
            message.success(str);
            // document.getElementsByClassName('ant-message-notice')[0].classList.add('msg-success');
        }
        else
        {
            message.error(str);
            // document.getElementsByClassName('ant-message-notice')[0].classList.add('msg-err');
        }
    }

    showSpinner(spinnerState)
    {
        this.setState({loading: spinnerState});
    }

    triggerSelect()
    {
        document.getElementById('file-select').click();
    }

    hideMessage()
    {
        let msg = document.getElementById('msg');
        let ms = document.getElementById('ms');
        setTimeout(function(){
            msg.style.display = 'none';
            ms.innerHTML = '';
        }, 6000);
    }

    componentWillUnmount()
    {

    }

    async gtMs()
    {
        let page = this.state.msgPage + 1;
        this.setState({msgPage: page});
        let body = JSON.stringify({room: this.state.order.orderRef, itemsPerPage: 50, searchText:"", page: page});
        let messages = await postQuery('/gtMs', body);
        if(messages !== undefined && messages.length > 0)
        {
            this.setState({messages: this.state.messages.concat(messages)});
            this.gtMs();
        }
    }

    setMsg(e)
    {
        let msg = e.target.value;
        let chat = this.state.chat;
        chat.msg = msg;
        this.setState({chat: chat});
    }

    setPeer(payload)
    {
        if(payload.peer === this.state.chat.peer || (payload.hasOwnProperty('auth') && payload.auth.length > 0 && payload.auth === this.state.order.orderedBy._id))
        {
            let chat = this.state.chat;
            chat.peer = payload.peer;
            let isConnected = payload.auth !== undefined && payload.auth.length > 0 && payload.auth === this.state.order.orderedBy._id;
            this.setState({chat: chat, isConnected: isConnected});
        }
    }

    setPeers(peers)
    {
        let el = this;
        if(peers !== undefined &&  peers.length > 0)
        {
            peers.forEach((s, i) =>
            {
                if(s.peer === el.state.chat.peer || (s.hasOwnProperty('auth') && s.auth.length > 0 && s.auth === el.state.order.orderedBy._id))
                {
                    let chat = el.state.chat;
                    chat.peer = s.peer;
                    let isConnected = s.auth !== undefined && s.auth.length > 0 && s.auth === el.state.order.orderedBy._id;
                    el.setState({chat: chat, isConnected: isConnected});
                }
            });
        }
    }

    disconnect(peer)
    {
        if(this.state.chat.peer === peer)
        {
            let peer = "";
            this.setState({chat: {...this.state.chat.peer, peer}});
        }
    }

    sendMsg()
    {
        if(this.state.chat.msg === undefined || this.state.chat.msg.length < 1)
        {
            this.showMessage('Please enter a message', -1);
            return;
        }
        let msg =
            {
                to: this.state.order.orderedBy._id,
                sender: this.props.user.id,
                msg: this.state.chat.msg,
                room: this.state.order.orderRef,
                sent: new Date(),
                received: null,
                read: false,
                senderSid: this.state.chat.me,
                receiverSid: this.state.chat.peer,
                id: this.state.messages.length + 1
            };

        let messages = this.state.messages;
        messages.push(msg);
        this.props.io.emit('msg', msg);
        let chatR = this.state.chat;
        chatR.msg = '';
        this.setState({messages: messages, chat: chatR});
    }

    receiveMsg(msg)
    {
        if(msg === undefined || msg.to.length < 1)
        {
            this.showMessage('An incoming message is corrupted and will not be passed', -1);
            return;
        }

        if(msg.to === this.props.user.id)
        {
            let messages = this.state.messages;
            msg.received = new Date();
            msg.id = this.state.messages.length + 1;

            if(this.state.activePanel !== undefined && (this.state.activePanel === '2' || this.state.activePanel === 2))
            {
                msg.read = true;
                this.props.io.emit('msgRead', {sender: this.props.user.id, to: this.state.order.orderedBy._id, room: this.state.order.orderRef, senderSid: this.state.chat.me, receiverSid: this.state.chat.peer, reads: [msg._id]});
            }
            messages.push(msg);
            this.setState({messages: messages});
        }
    }

    panelChanged(key)
    {
        let obj = this;
        this.setState({activePanel: key});
        if(key !== undefined && (key === '2' || key === 2))
        {
            let messages = this.state.messages;
            let reads = [];

            messages.forEach((m , i) =>
            {
                if(m.read === false && m.sender !==  obj.props.user.id && m.to === obj.props.user.id)
                {
                    m.read = true;
                    reads.push(m._id);
                }
            });

            if(reads.length > 0)
            {
                obj.props.io.emit('msgRead',
                    {
                        sender: obj.props.user.id,
                        to: obj.state.order.orderedBy._id,
                        room: obj.state.order.orderRef,
                        senderSid: obj.state.chat.me,
                        receiverSid: obj.state.chat.peer,
                        reads: reads
                    });
            }
            this.setState({messages: messages});
        }
    }

    msgRead(msg)
    {
        if((msg.to === this.props.user.id || msg.receiverSid === this.state.chat.me) && msg.room === this.state.order.orderRef )
        {
            let messages = this.state.messages;
            let reads = msg.reads;
            reads.forEach(m =>
            {
               messages.find(s => s._id === m).read = true;
            });

            this.setState({messages: messages});
        }
    }

    updateId(msg)
    {
        if((msg.sender === this.props.user.id || msg.senderSid === this.state.chat.me) && msg.room === this.state.order.orderRef )
        {
            let messages = this.state.messages;
            messages.find(s => ((!s._id || s._id === undefined) && s.id === msg.id))._id = msg._id;
            this.setState({messages: messages});
        }
    }

    async showOrder(order)
    {
        this.showSpinner(true);
        let orderDetails = document.getElementById('orderDetails');
        let orders = document.getElementById('orders');

        this.showSpinner(true);
        let orderedPackage = await fetchData(`/getOrderedPackage?sPackage=` + order.orderedServicePackage);
        if (!orderedPackage || orderedPackage._id.length < 1)
        {
            this.showSpinner(false);
            this.showMessage('Order information could not be retrieved. Please try again later', -1);
            this.cancelSummary();
        }
        else
        {
            this.setState({orderedPackage: orderedPackage, order: order, service: order.service, showOrder: true});
            this.props.io.emit('checkPeer', this.state.order.orderedBy._id);
            //get chat messages
            this.gtMs();
            orders.style.display = 'none';
            orderDetails.style.display = 'block';
            orderDetails.style.opacity = '1';
            this.showSpinner(false);            
            this.getComplaint();
        }

    }

    goTo(type, location)
    {
        if(typeof window !== 'undefined')
        {
            document.getElementById('welcomeBar').style.display = 'none';
            document.getElementById('appBar').style.display = '';
            this.props.go(type, location);
        }
    }

    showLogin()
    {
        if(typeof window !== 'undefined')
        {
            window.showLogin();
        }
    };

    cancelSummary()
    {
        let orderDetails = document.getElementById('orderDetails');
        let orders = document.getElementById('orders');
        let reset = {delivery: '', price: '', title: '', bannerImage: '', packageType: {name: ''}, description: '', selectedFeatures: []};
        orderDetails.style.opacity = '0';
        orders.style.display = '';
        this.setState({orderedPackage: reset, showOrder: false});

    };

    render()
    {
        const {sections, dispatchAction} = this.props;
        const smallScreen = (this.props.screen !== undefined && this.props.screen !== null && !this.props.screen.mql.matches);
        const {showOrder, orderedPackage, order, mySales, creaptive, tValue, creaptiveCut, vatValue, vat, disabled, chat, isConnected, complaint, delivery, messages} = this.state;
        let sr = orderedPackage;
        let s = this.state.service;
        const el = this;

        let hasComplained = complaint._id !== undefined && complaint._id !== null && complaint._id.length > 0;
        let orderDelivered = order.sellerMarkedDelivery;

        let payment = (order.orderPayments !== undefined && order.orderPayments.length > 0) ? order.orderPayments[0] :
            {
                order: '',
                coupon: '',
                flwRef: '',
                subTotal: 0,
                grossAmount: 0,
                vat: 0,
                netAmount: 0,
                creaptive: 0,
                amountPaid: 0,
                couponValue: '',
                datePaid: '',
                appFee: 0,
                paymentType: '',
                currency: ''
            };

        let hasPrevLocation = this.props.location.prev !== undefined && this.props.location.prev !== null && this.props.location.prev.pathname.length > 0;
        let prev = this.props.location.routesMap[this.props.location.prev.type];
        let ff = this.props.location.routesMap[this.props.location.type];

        return(
            <Row className="main-content" id="mainContent">
                <Col span={24} style={{paddingLeft: '8px'}}>
                    <span style={{color: 'rgba(0, 0, 0, 0.65)', paddingLeft: '8px'}}>
                        { hasPrevLocation && <NavLink className="appAnchor" to={this.props.location.prev.pathname}>{prev.display}</NavLink>}
                        { hasPrevLocation && <span>&nbsp;>&nbsp;</span>}
                        <NavLink className="appAnchor" exact to={this.props.location.pathname}>{ff.display}</NavLink>
                    </span>
                    <Card bodyStyle={{ padding: 0, border: '0 !important' }} className="xz">
                        <div className="card-container n-Bdr sci bt" style={{background: '#f0f2f5 !important'}}>
                            <Tabs className="access-menu-item nn ctb">
                                <TabPane tab="Services" key="1" className="access-menu-item tabs-background">
                                    <Row gutter={2} id='orders' style={{marginBottom: '20px', paddingLeft: '0', paddingRight: '0', paddingTop: '8px'}}>
                                        {mySales.length > 0 && mySales.map(b =>
                                            <Col key={b._id} xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '0', paddingRight: '8px', marginBottom: '10px', border: 'thin solid #e0e0e0 !important'}}>
                                                <Card bodyStyle={{ padding: 0 }} className="dd">
                                                    <Col span={24} className="ant-col-24" style={{background:`url(${b.service.bannerImage}) no-repeat center`,
                                                        WebkitBackgroundSize:'cover',MozBackgroundSize: 'cover',OBackgroundSize: 'cover',backgroundSize: 'cover',height: '120px'}}>
                                                    </Col>
                                                    <div className="ant-row bottom-border">
                                                        <h6>
                                                              <span className='oWrap' onClick={() => this.showOrder(b)}>
                                                                  {b.service.title}
                                                              </span>
                                                        </h6>
                                                    </div>
                                                    <div className="custom-card">
                                                        <div className="ant-col-24 summary">
                                                            <span>Ref: </span>
                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{b.orderRef}</span>
                                                        </div>
                                                        <div className="ant-col-24 summary">
                                                            <span>Date: </span>
                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{moment(b.dateOrdered).format('DD/MM/YYYY h:mm a')}</span>
                                                        </div>
                                                        <div className="ant-col-24 summary">
                                                            <span>Status: </span>
                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{this.getKeyByValue(orderStatusMap, b.status)}</span>
                                                        </div>
                                                        <div className="ant-col-24 summary" style={{borderTop: '1px solid #ddd'}}>
                                                            <span>Cost: </span>
                                                            <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{b.orderPayments[0].amountPaid}</span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Col>
                                        )}

                                        {mySales.length < 1 &&
                                        <Col span={24} style={{ paddingLeft: '0', paddingRight: '0', marginBottom: '10px'}}>
                                            <Card className="ant-card-body pfs list-it">
                                                <div className="custom-card">
                                                    <h3>
                                                        No sales made yet. consider adding more content to the presentation of your services and/or crafts so as to make them more attractive to buyers<br/>
                                                    </h3>
                                                </div>
                                            </Card>
                                        </Col>}
                                    </Row>
                                    <Row id='orderDetails' style={{paddingLeft: '2%', paddingRight: '2%', opacity: '0', paddingTop: '8px'}}>
                                        <Col xs={0} sm={1} md={4} lg={6}></Col>
                                        <Col  xs={24} sm={22} md={16} lg={12} style={{marginBottom: '20px', paddingLeft: '1%', paddingRight: '1%'}}>
                                            <Card bodyStyle={{ padding: 0, border: '0 !important' }} className="split xz">
                                                <button className="ant-modal-close focus-within" aria-label="Close" onClick={this.cancelSummary}>
                                                    <span className="ant-modal-close-x" title='cancel'></span>
                                                </button>
                                                <div className="card-container n-Bdr sci">
                                                    <Collapse accordion defaultActiveKey = {['1']} onChange={this.panelChanged}>
                                                        <Panel header="Summary" key="1">
                                                            <Row>
                                                                <Col span={24} className="s-wrapper s-wr">
                                                                    <div style={{ paddingTop: '12px !important' }} className="ant-col-24 pfs s-hdr">
                                                                        <div className="ant-row bottom-border">
                                                                            <h3>
                                                                                <NavLink className="appAnchor" to={`/service/${s._id}`}>
                                                                                    {s.title}
                                                                                </NavLink>
                                                                            </h3>
                                                                        </div>
                                                                        <Col id='orImg' span={24} className="imgBg ant-col-24" style={{background:`url(${order.service.bannerImage}) no-repeat center`}}>
                                                                        </Col>
                                                                        <div className="ant-col-24 summary">
                                                                            <span>Date Bought: </span>
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{moment(order.dateOrdered).format('DD/MM/YYYY h:mm a')}</span>
                                                                        </div>
                                                                        <div className="ant-col-24 summary">
                                                                            <span>Expected Delivery Date: </span>
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{moment(order.expectedDeliveryDate).format('DD/MM/YYYY')}</span>
                                                                        </div>
                                                                        <div className="ant-col-24 summary">
                                                                            <span>Date Delivered: </span>
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{(order.sellerDeliveryDate !== undefined && order.sellerDeliveryDate !== null) ? moment(order.sellerDeliveryDate).format('DD/MM/YYYY') : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="ant-col-24 summary">
                                                                            <span>Date Received: </span>
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{(order.actualDeliveryDate !== undefined && order.actualDeliveryDate !== null) ? moment(order.actualDeliveryDate).format('DD/MM/YYYY') : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="ant-col-24 summary">
                                                                            <span>Status: </span>
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{this.getKeyByValue(orderStatusMap, order.status)}</span>
                                                                        </div>
                                                                        <Col span={24}>
                                                                            <div className="ant-col-24 bottom-border margin-bottom-top">
                                                                                <span style={{color: '#0e0e0e'}}>Package:</span> &nbsp; <span style={{float: 'right'}}><h4>{sr.packageType.name}</h4></span>
                                                                            </div>
                                                                            <br/>
                                                                            <div className="ant-col-24 bottom-border margin-bottom-top">
                                                                                <h4>{sr.description}</h4>
                                                                            </div>
                                                                            <ul className="cr-sc-pack">
                                                                                {sr.selectedFeatures.map(f =>
                                                                                {
                                                                                    if(f.feature.featureType.toLowerCase() === 'checkbox')
                                                                                    {
                                                                                        return  <li key={f._id}>
                                                                                            {f.feature.title} &nbsp;
                                                                                            <span>
                                                                                                    <i className="anticon anticon-check cr-i-green"></i>
                                                                                                </span>
                                                                                        </li>
                                                                                    }
                                                                                    else if(f.feature.featureType.toLowerCase() === 'number')
                                                                                    {
                                                                                        return <li key={f._id}>
                                                                                            {f.feature.title}: &nbsp;
                                                                                            <span>
                                                                                                    {f.value}
                                                                                                </span>
                                                                                        </li>
                                                                                    }
                                                                                    else if(f.feature.featureType.toLowerCase() === 'dropdown')
                                                                                    {
                                                                                        return  <li key={f._id}>
                                                                                            {f.feature.title}: &nbsp;
                                                                                            <span>
                                                                                                    {f.feature.featureOptions.find(cn => (cn.value === parseInt(f.value))).name}
                                                                                                </span>
                                                                                        </li>
                                                                                    }
                                                                                })}
                                                                                <li  style={{marginBottom: '25px !important'}}>
                                                                                    Delivery (Days): &nbsp;
                                                                                    <span>
                                                                                        {sr.delivery}
                                                                                    </span>
                                                                                </li>
                                                                                <li style={{borderTop: 'thin solid #ddd'}}>
                                                                                    <div className='row'>
                                                                                        <div className="ant-col-24 summary">
                                                                                            <span>Subtotal: </span>
                                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{payment.subTotal}</span>
                                                                                        </div>
                                                                                        <div className="ant-col-24 summary">
                                                                                            <span>VAT ({vat}%): </span>
                                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{payment.vat}</span>
                                                                                        </div>
                                                                                        <div className="ant-col-24 summary">
                                                                                            <span>creaptive ({creaptive}%): </span>
                                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{payment.creaptive}</span>
                                                                                        </div>
                                                                                        <div className="ant-col-24 summary" style={{borderTop: '1px solid #ddd'}}>
                                                                                            <span>Total: </span>
                                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{payment.amountPaid}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </li>
                                                                            </ul>
                                                                        </Col>
                                                                        {order.orderedBy.geekNameUpper && order.orderedBy.geekNameUpper.length > 0?
                                                                            <div className="ant-col-24" style={{marginTop: '3px', marginBottom: '20px'}}>
                                                                                <span className="ant-avatar hj ssTera ant-avatar-circle">
                                                                                    <img alt="Profile image" src={order.orderedBy.profileImagePath}/>
                                                                                </span>
                                                                                 <div className="float-left" style={{paddingTop: '12px'}}>
                                                                                    <span>
                                                                                        <NavLink className="appAnchor" to={`/cre/${order.orderedBy.geekNameUpper}`}>
                                                                                            {order.orderedBy.geekName? order.orderedBy.geekName : order.orderedBy.firstName}
                                                                                        </NavLink>
                                                                                    </span>
                                                                                    <div>
                                                                                        <label style={{float: 'left', zIndex: '3', position: 'absolute', marginTop : '5px'}}>{isConnected === true? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> : <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            :
                                                                            ''
                                                                        }
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </Panel>
                                                        <Panel header= 'Message Buyer' key="2" id='msgs'>
                                                            {order.orderedBy.geekNameUpper && order.orderedBy.geekNameUpper.length > 0?
                                                                <div className="ant-col-24" style={{marginTop: '3px', marginBottom: '20px'}}>
                                                                    <span className="ant-avatar hj ssTera ant-avatar-circle">
                                                                        <img alt="Profile image" src={order.orderedBy.profileImagePath}/>
                                                                    </span>
                                                                        <div className="float-left" style={{paddingTop: '12px'}}>
                                                                        <span>
                                                                            <NavLink className="appAnchor" to={`/cre/${order.orderedBy.geekNameUpper}`}>
                                                                                {order.orderedBy.geekName? order.orderedBy.geekName : order.orderedBy.firstName}
                                                                            </NavLink>
                                                                        </span>
                                                                            <div>
                                                                                <label style={{float: 'left', zIndex: '3', position: 'absolute', marginTop : '5px'}}>{isConnected === true? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> : <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                                                            </div>
                                                                        </div>
                                                                </div>
                                                                :
                                                                ''
                                                            }

                                                            <Col className='ant-col-24 by-msgs' id='messages'>
                                                                <div className="col-sm-3 col-sm-offset-4 frame chat_cover" style={{bottom: '7px', background:`url(${chat_cover}) no-repeat center`}}>
                                                                <ul>
                                                                        {messages.map((z, i) => 
                                                                            {
                                                                                if(z.sender === el.props.user.id || z.senderSid === chat.me)
                                                                                {
                                                                                    if(messages[i-1] !== undefined && (messages[i-1].sender === el.props.user.id || messages[i-1].senderSid === chat.me))
                                                                                    {
                                                                                        return <li key={z._id? z._id: z.id} className = 'li_top_2px'>
                                                                                                    <div className="msj-rt macro">
                                                                                                        <div className="text text-r">
                                                                                                            <p dangerouslySetInnerHTML={{__html: z.msg}}>
                                                                                                            </p>
                                                                                                            <p>
                                                                                                                <small className={z.read === true? 'read' : 'unread'}>
                                                                                                                    {moment(z.sent).format('DD/MM/YYYY,h:mm a')}
                                                                                                                </small>
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </li> 
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        return <li key={z._id? z._id: z.id}>
                                                                                                    <div className="msj-rta macro">
                                                                                                        <div className="text text-r">
                                                                                                            <p dangerouslySetInnerHTML={{__html: z.msg}}>
                                                                                                            </p>
                                                                                                            <p>
                                                                                                                <small className={z.read === true? 'read' : 'unread'}>
                                                                                                                    {moment(z.sent).format('DD/MM/YYYY,h:mm a')}
                                                                                                                </small>
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </li> 
                                                                                    }
                                                                                }
                                                                                else
                                                                                {
                                                                                    if(messages[i-1] !== undefined && messages[i-1].sender === z.sender)
                                                                                    {
                                                                                        return <li className="ant-col-20" key={z._id? z._id: z.id}  className = {(messages[i+1] !== undefined && messages[i+1].sender !== z.sender)? 'li_top_2px li_bottom_10px' : 'li_top_2px'}>
                                                                                                <div className="msjr macr">
                                                                                                    <div className="text text-l">
                                                                                                        <p dangerouslySetInnerHTML={{__html: z.msg}}>
                                                                                                        </p>
                                                                                                        <p>
                                                                                                            <small>
                                                                                                                {moment(z.received).format('DD/MM/YYYY,h:mm a')}
                                                                                                            </small>
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </li> 
                                                                                    }
                                                                                    else{
                                                                                        return  <li className="ant-col-20" key={z._id? z._id: z.id} className = {(messages[i+1] !== undefined && messages[i+1].sender !== z.sender)? 'li_bottom_10px' : ''}>
                                                                                                    <div className="msj macro">
                                                                                                        <div className="text text-l">
                                                                                                            <p dangerouslySetInnerHTML={{__html: z.msg}}>
                                                                                                            </p>
                                                                                                            <p>
                                                                                                                <small>
                                                                                                                    {moment(z.received).format('DD/MM/YYYY,h:mm a')}
                                                                                                                </small>
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </li>
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                       
                                                                    </ul>
                                                                    <div className="ant-col-24 yy">
                                                                        <div className="ant-col-24 text text-r">
                                                                            <div style={{visibility: (chat.msg !== undefined && chat.msg !== null && chat.msg.length > 0)? 'hidden' : 'visible', marginBottom: '-27px', padding: '4px 11px'}} >Type a message </div>
                                                                            <ContentEditable  className="c-txt" html={chat.msg} disabled={false} onChange={this.setMsg} />
                                                                            <div className="ant-row snt c-snd">
                                                                                <div className='ant-col-12'>
                                                                                    <img onClick={this.triggerSelect} style={{width: '30px', float: 'left', cursor: 'pointer'}} src={attach_darker}/>
                                                                                    <input id='file-select' type='file' style={{display: 'none'}}  />
                                                                                </div>
                                                                                <div className='ant-col-12'>
                                                                                    <img onClick={this.sendMsg} className='rotate_45' style={{float: 'right', cursor: 'pointer'}} src={(chat.msg !== undefined && chat.msg !== null && chat.msg.length > 0)? send_active : send_ash}/>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Panel>
                                                        <Panel header="File a complaint" key="3">
                                                        <div className="ant-col-24" style={{marginBottom: '20px'}}>
                                                                <Row>
                                                                    <div className = 'ant-col-24 _10px'>                                                                      
                                                                        <h4>Are you having a hard time with the buyer OR<br/> 
                                                                        You want to call our attention to something we should be concerned with? Please let it out below.</h4>
                                                                        {hasComplained && <hr/>}
                                                                    </div> 
                                                                    <br/>
                                                                    <div className = 'ant-col-24'>                                                                      
                                                                        {!hasComplained &&  <input onChange={this.textChange} name="caption" type="text" className="ant-input aut-input ant-input-lg" placeholder="Title *" value={complaint.caption}/>}                                                                        
                                                                        {hasComplained && <div className='ant-col-24'>Title: <br/><h4>{complaint.caption}</h4></div>}
                                                                    </div> 
                                                                    <div className = 'ant-col-24 _10px'>                                                                      
                                                                    {!hasComplained && <Select name="complaintType"
                                                                                showSearch
                                                                                style={{width: '100%'}}
                                                                                placeholder="-- Select * --"
                                                                                optionFilterProp="children"
                                                                                value={(complaint.complaintType || complaint.complaintType.length > 0)? complaint.complaintType : '-- Select * --'}
                                                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                                                onChange={this.cTypeChanged}>
                                                                            {this.state.cTypes.map(c => <Option value={c._id} key={c._id}>{c.name}</Option>)}
                                                                        </Select>}
                                                                        {hasComplained && <span>Type: {complaint.complaintType.name}</span>}
                                                                    </div>
                                                                    <div className="ant-col-24 text text-r _10px">
                                                                        {!hasComplained && <div style={{visibility: (complaint.note !== undefined && complaint.note !== null && complaint.note.length > 0)? 'hidden' : 'visible', marginBottom: '-27px', padding: '4px 11px'}} >Let it out * </div>}
                                                                        {!hasComplained && <ContentEditable  className="c-txt" html={complaint.note} disabled={false} onChange={this.setCNote} />}
                                                                        {hasComplained && <div>Details: <br/><p className='txt_left' dangerouslySetInnerHTML={{__html: complaint.note}}></p></div>}
                                                                    </div>
                                                                </Row>
                                                                {!hasComplained && <Row gutter={2}>
                                                                    <Col span={12}>
                                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={this.complain}>
                                                                            Submit
                                                                        </button>
                                                                    </Col>
                                                                </Row>}          
                                                            </div>
                                                        </Panel>
                                                        <Panel header="Mark Order as delivered" key="4">
                                                        <div className="ant-col-24" style={{marginBottom: '20px'}}>
                                                                <Row>
                                                                    <div className = 'ant-col-24 _10px'>                                                                      
                                                                        <h4>If you are convinced you have delivered this order to the buyer's expectations, <br/>kindly indicate so below</h4>
                                                                        {orderDelivered && <hr/>}
                                                                    </div> 
                                                                    <br/>                                                                   
                                                                    {!orderDelivered &&  <div style={{marginTop: '20px'}} className='ant-col-24'>
                                                                            <DatePicker onChange={this.setDeliveryDate} value={delivery.sellerDeliveryDate} format="YYYY/MM/DD" placeholder='Date delivered *'
                                                                                dateRender={(current) => 
                                                                                {
                                                                                    return (
                                                                                    <div className="ant-calendar-date">
                                                                                        {current.date()}
                                                                                    </div>
                                                                                    );
                                                                                }}
                                                                            />
                                                                        </div>}  
                                                                        {orderDelivered &&  <div className='ant-col-24'><span style={{fontSize: '16px'}}>Delivered on: </span>&nbsp;<h4>{moment(order.sellerDeliveryDate).format('DD/MM/YYYY')}</h4></div>}                                                                       
                                                                    <div className="ant-col-24 text text-r _10px">
                                                                        {!orderDelivered && <div style={{visibility: (order.sellerDeliveryNote !== undefined && order.sellerDeliveryNote !== null && order.sellerDeliveryNote.length > 0)? 'hidden' : 'visible', marginBottom: '-30px', padding: '4px 11px'}} >Your experience with the buyer</div>}
                                                                        {!orderDelivered && <ContentEditable  className="c-txt" html={(order.sellerDeliveryNote !== undefined && order.sellerDeliveryNote !== null && order.sellerDeliveryNote.length > 0)? order.sellerDeliveryNote : ''} disabled={false} onChange={this.setDelieveryNote} />}
                                                                        {orderDelivered &&  <p className='txt_left' dangerouslySetInnerHTML={{__html: order.sellerDeliveryNote}}></p>}
                                                                    </div>
                                                                </Row>
                                                                {!orderDelivered && <Row gutter={2}>
                                                                    <Col span={12}>
                                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={this.delivery}>
                                                                            Submit
                                                                        </button>
                                                                    </Col>
                                                                </Row>} 
                                                            </div>    
                                                        </Panel>
                                                    </Collapse>
                                                </div>
                                            </Card>
                                        </Col>
                                        <Col xs={0} sm={1} md={4} lg={6}></Col>
                                    </Row>
                                </TabPane>
                                <TabPane tab="Handcrafts" key="2" className="access-menu-item">
                                    <Row gutter={2} style={{marginBottom: '20px', paddingLeft: '0', paddingRight: '0', paddingTop: '8px'}}>
                                        <Col span={24} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px', border: 'thin solid #e0e0e0 !important'}}>
                                            <Card className="dd">
                                                <h3>
                                                    Ordered Handcraft list<br/>
                                                </h3>
                                            </Card>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </Tabs>
                        </div>
                    </Card>
                </Col>
                <Spin size="large" spinning={this.state.loading} />
            </Row>
        );
    }
}

const mapDispatch = {go: goToPage, setUser, dispatchAction};
const mapState = ({sales, user, io, peers, peer, disconnect, msgRead, idUpdate, receive, location, sco, screen}) => ({sales, user, io, peers, peer, disconnect, msgRead, idUpdate, receive, location, sco, screen});

export default connect(mapState, mapDispatch)(sales);