/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import {Row, Col, Tabs, Card, Menu, Select, Form, Spin, message, Collapse, Checkbox, Switch, Button, Icon, Avatar, AutoComplete, Input} from 'antd';
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
let msSocket = null;
let orderStatusMap =
    {
        pending: 1,
        paid: 2,
        packaged: 3,
        inTransit: 4,
        delivered_pending_reception: 5,
        delivered_and_accepted: 6,
        delivered_but_rejected: 7,
        revoked: 7,
        cancelled: 7
    };

class buys extends React.Component
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
                creaptive: 7,
                creaptiveCut: 0,
                tValue: 0,
                vat: 5,
                socket: null,
                isConnected: false,
                vatValue: 0,
                myBuys: [],
                orderedPackage: {delivery: '', price: '', title: '', packageType: {name: ''}, description: '', selectedFeatures: []},
                buyer: '',
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
                        orderedBy: '',
                        orderPayments: [],
                        geek: {
                            _id: '',
                            geekName: '',
                            geekNameUpper: '',
                            profileImagePath: '',
                            professionalCaption: '',
                            location: ''
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
                    }
            };

        this.goTo = this.goTo.bind(this);
        this.setMsg = this.setMsg.bind(this);
        this.setPeer = this.setPeer.bind(this);
        this.sendMsg = this.sendMsg.bind(this);
        this.setPeers = this.setPeers.bind(this);
        this.showOrder = this.showOrder.bind(this);
        this.getMyBuys = this.getMyBuys.bind(this);
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

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    async componentDidMount()
    {
        let el = this;
        setTimeout(async function()
        {
            console.log(window.location.origin);
            let buyer = el.props.location.payload.slug || el.state.buyer;
            if(el.state.myBuys.length < 1 && (buyer === undefined || buyer === null  || buyer.length < 1))
            {
                el.showMessage('An unknown error was encountered. Please try again later', -1);
                el.props.go('HOME', 'landing');
            }
            else
            {
                if(el.state.myBuys.length < 1)
                {
                    el.getMyBuys(buyer);
                }
                else
                {
                    if(el.state.myBuys[0].orderedBy !== buyer)
                    {
                        el.getMyBuys(buyer);
                    }
                }

            }
        }, 700);
    }

    getKeyByValue(object, value)
    {
        let objKeys = Object.keys(object);
        return objKeys.find(key => object[key] === value);
    }

    async getMyBuys(buyer)
    {
        let el = this;
        if(!buyer || buyer.length < 1)
        {
            el.showMessage('An unknown error was encountered. Please try again later', -1);
            el.props.go('SERVICES', '');
        }
        else
        {
            this.showSpinner(true);
            let body = JSON.stringify({buyer: buyer, itemsPerPage: 10, searchText:"", page:1});
            let myBuys = await postQuery('/myBuys', body);
            this.showSpinner(false);
            el.setState({myBuys: (!myBuys || myBuys.length < 1)? [] : myBuys});
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
        if(typeof nextProps.sco === 'object' && nextProps.sco.hasOwnProperty('title') && nextProps.sco.title.length > 0)
        {
            this.setState({
                myBuys: nextProps.buys
            });
        }

        if(typeof nextProps.user === 'object' && typeof nextProps.user === 'object' && nextProps.user.hasOwnProperty('id') && nextProps.user.id.length > 0)
        {
            this.setState({
                user: nextProps.user
            });
        }

        if(nextProps.buyer !== undefined && nextProps.buyer !== null && nextProps.buyer.length > 0)
        {
            this.setState({
                buyer: nextProps.buyer
            });
        }

        if(nextProps.screen !== undefined && nextProps.screen !== null && nextProps.screen.mql !== undefined)
        {
            this.setState({
                screen: nextProps.screen
            });
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
            document.getElementsByClassName('ant-message-notice-content')[0].classList.add('msg-success');
        }
        else
        {
            message.error(str);
            document.getElementsByClassName('ant-message-notice-content')[0].classList.add('msg-err');
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

    setMsg(e)
    {
        let msg = e.target.value;
        let chat = this.state.chat;
        chat.msg = msg;
        this.setState({chat: chat});
    }

    setPeer(peer)
    {
        if(peer !== undefined && peer !== null && peer.length > 0 && peer !== this.state.socket.id)
        {
            let chat = this.state.chat;
            chat.peer = peer;
            this.setState({chat: chat, isConnected: true});
        }
    }

    setPeers(peers)
    {
        let el = this;
        if(peers !== undefined && peers !== null && peers.length > 0)
        {
            peers.forEach((s, i) =>
            {
                if( s !== el.state.socket.id)
                {
                    let chat = el.state.chat;
                    chat.peer = s;
                    el.setState({chat: chat, isConnected: true});
                }
            });
        }
    }

    disconnect(peer)
    {
        if(this.state.chat.peer === peer)
        {
            console.log('\ndisconnected:\n');
            console.log(peer);
            let peer = "";
            this.setState({chat: {...this.state.chat.peer, peer}});
            console.log('\nemptied\n');
            console.log(peer);
        }
    }

    sendMsg()
    {
        if(this.state.chat.msg === undefined || this.state.chat.msg.length < 1)
        {
            this.showMessage('Please enter a message', -1);
            return;
        }
        if(this.state.chat.peer === undefined || this.state.chat.peer.length < 1)
        {
            this.showMessage('Please ensure a peer is connected before sending a message', -1);
            return;
        }

        let msg =
            {
                to: this.state.order.geek._id,
                sender: this.state.user.id,
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
        this.state.socket.emit('msg', msg);
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

        if(msg.to === this.state.chat.me)
        {
            let messages = this.state.messages;
            msg.received = new Date();
            msg.id = this.state.messages.length + 1;
            let mSgs = document.getElementById('msgs');
            if(mSgs.classList.indexf('ant-collapse-item-active') > -1)
            {
                msg.read = true;
                this.state.socket.emit('msgRead', {sender: this.state.user.id, to: this.state.order.geek._id, room: this.state.order.orderRef, senderSid: this.state.chat.me, receiverSid: this.state.chat.peer, reads: [msg._id]});
            }
            messages.push(msg);
            this.setState({messages: messages});
        }
    }

    panelChanged(e)
    {
        let obj = this;
        console.log('\ne\n');
        console.log(e);
        let el = e.target;

        console.log('\nel.target\n');
        console.log(el.target);

        if(el.target.id !== undefined && el.target.id === 'msgs')
        {
            let messages = this.state.messages;
            let reads = [];

            messages.forEach((m , i) =>
            {
                if(m.read === false && m.sender !==  obj.state.user.id && m.to === obj.state.user.id)
                {
                    m.read = true;
                    reads.push(m._id);
                }
            });

            if(reads.length > 0)
            {
                obj.state.socket.emit('msgRead',
                    {
                        sender: obj.state.user.id,
                        to: obj.state.order.geek._id,
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
        if((msg.to === this.state.user.id || msg.receiverSid === this.state.chat.me) && msg.room === this.state.order.orderRef )
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

    async showOrder(order)
    {
        let el = this;
        el.showSpinner(true);
        let orderDetails = document.getElementById('orderDetails');
        let orders = document.getElementById('orders');

        el.showSpinner(true);
        let orderedPackage = await fetchData(`/getOrderedPackage?sPackage=` + order.orderedServicePackage);
        if (!orderedPackage || orderedPackage._id.length < 1)
        {
            el.showSpinner(false);
            el.showMessage('Order information could not be retrieved. Please try again later', -1);
            el.cancelSummary();
        }
        else
        {
            this.setState({orderedPackage: orderedPackage, order: order, service: order.service, showOrder: true});
            orders.style.display = 'none';

            if(el.state.user.isAuthenticated === true && el.state.user.id.length > 0 && el.state.order._id.length > 0 && el.state.order.geek._id.length > 0)
            {
                let endPoint = window.location.origin + '?au=' + el.state.user.id + '&o=' + el.state.order.orderRef + '&gk=' + el.state.order.geek._id;
                let socket = io(endPoint);
                socket.on('connect', () =>
                {
                    socket.emit('room', el.state.order.orderRef);
                    let chat = el.state.chat;
                    chat.me = socket.id;
                    el.setState({socket: socket, chat: chat});
                    el.state.socket.on('online', el.setPeer);
                    el.state.socket.on('disconnected', el.disconnect);
                    el.state.socket.on('receive', el.receiveMsg);
                    el.state.socket.on('msgRead', el.msgRead);
                    el.state.socket.on('peers', el.setPeers);
                });

                io.on('error', (e) =>
                {
                    console.log('\nSocket.io Error\n');
                    console.log(e)
                });
            }

            orderDetails.style.display = 'block';
            orderDetails.style.opacity = '1';
            el.showSpinner(false);
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
        // orderDetails.style.display = 'none';
        orders.style.display = '';
        this.setState({orderedPackage: reset, showOrder: false});

    };

    render()
    {
        const {sections, dispatchAction} = this.props;
        const smallScreen = (this.props.screen !== undefined && this.props.screen !== null && !this.props.screen.mql.matches);
        const {showOrder, orderedPackage, order, myBuys, creaptive, tValue, creaptiveCut, vatValue, vat, disabled, chat, isConnected, messages} = this.state;
        let sr = orderedPackage;
        let s = this.state.service;
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
                                        {myBuys.length > 0 && myBuys.map(b =>
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

                                        {myBuys.length < 1 &&
                                        <Col span={24} style={{ paddingLeft: '0', paddingRight: '0', marginBottom: '10px'}}>
                                            <Card className="ant-card-body pfs list-it">
                                                <div className="custom-card">
                                                    <h3>
                                                        Ordered Service list is empty <br/>
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
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{(order.actualDeliveryDate !== undefined && order.actualDeliveryDate !== null) ? moment(order.actualDeliveryDate).format('DD/MM/YYYY') : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="ant-col-24 summary">
                                                                            <span>Date Received: </span>
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{(order.dateReceived !== undefined && order.dateReceived !== null) ? moment(order.dateReceived).format('DD/MM/YYYY') : 'N/A'}</span>
                                                                        </div>
                                                                        <div className="ant-col-24 summary">
                                                                            <span>Status: </span>
                                                                            <span style={{float: 'right', fontWeight: 'bold'}}>{this.getKeyByValue(orderStatusMap, order.status)}</span>
                                                                        </div>
                                                                        <Col span={24}>
                                                                            <div className="ant-col-24 bottom-border margin-bottom-top">
                                                                                <span style={{color: '#0e0e0e'}}>Package:</span> &nbsp; <span><h3>{sr.packageType.name}</h3></span>
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
                                                                        <div className="ant-col-24" style={{marginTop: '30px'}}>
                                                                            <span className="ant-avatar hj ssTera ant-avatar-circle">
                                                                                <img alt="Profile image" src={order.geek.profileImagePath}/>
                                                                            </span>
                                                                            <div className="float-left" style={{paddingTop: '12px'}}>
                                                                                <span>
                                                                                    <NavLink className="appAnchor" to={`/cre/${order.geek.geekNameUpper}`}>
                                                                                        {order.geek.geekName}
                                                                                    </NavLink>
                                                                                </span>
                                                                                <div>
                                                                                    <label style={{float: 'left', zIndex: '3', position: 'absolute', marginTop : '5px'}}>{(order.geek.onlineStatus !== undefined && order.geek.onlineStatus !== null && order.geek.onlineStatus > 0)? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> : <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </Panel>
                                                        <Panel header= 'Message Seller' key="2" id='msgs'>
                                                            <div className="ant-col-24" style={{marginTop: '3px', marginBottom: '20px'}}>
                                                                <span className="ant-avatar hj ssTera ant-avatar-circle">
                                                                    <img alt="Profile image" src={order.geek.profileImagePath}/>
                                                                </span>
                                                                <div className="float-left" style={{paddingTop: '12px'}}>
                                                                    <span>
                                                                        <NavLink className="appAnchor" to={`/cre/${order.geek.geekNameUpper}`}>
                                                                            {order.geek.geekName}
                                                                        </NavLink>
                                                                    </span>
                                                                    <div>
                                                                        <label style={{float: 'left', zIndex: '3', position: 'absolute', marginTop : '5px'}}>{isConnected === true? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> : <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Col className='ant-col-24 by-msgs' id='messages'>
                                                                <div className="col-sm-3 col-sm-offset-4 frame chat_cover" style={{bottom: '7px', background:`url(${chat_cover}) no-repeat center`}}>
                                                                    <ul>
                                                                        {messages.map(z =>
                                                                            (z.sender === this.state.user.id || z.senderSid === chat.me)?
                                                                                <li key={z.id}>
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
                                                                                </li> :
                                                                                <li className="ant-col-20" key={z.id}>
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
                                                                            )}
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
                                                            <p>
                                                                Please let us know what situation you are facing with the seller or server
                                                            </p>
                                                        </Panel>
                                                        <Panel header="Accept Order as delivered" key="4">
                                                            <p>
                                                                Creaptive...Good life in Christ
                                                            </p>
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
const mapState = ({buys, user, location, sco, screen}) => ({buys, user, location, sco, screen});

export default connect(mapState, mapDispatch)(buys);