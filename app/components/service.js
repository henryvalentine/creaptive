/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import {Row, Col, Tabs, Card, Menu, Select, Form, Spin, message, Modal, Input} from 'antd';
const {Item} = Form;
const {SubMenu} = Menu;
const TabPane = Tabs.TabPane;
const { Option, OptGroup } = Select;
import {goToPage, setUser, dispatchAction} from '../actions';
import { connect } from 'react-redux';
import { fetchData, postQuery } from '../utils';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import Link, { NavLink } from 'redux-first-router-link';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {logo2} from "./appImg";

class Service extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            headerHeight: 0,
            loading: false,
            language : {name: '', proficiency: ''},
            qView: 'app',
            slideNumber: 0,
            previewVisible: false,
            creaptive: 7,
            creaptiveCut: 0,
            tValue: 0,
            vat: 5,
            vatValue: 0,
            divWidth: '',
            showSummary: false,
            disabled: false,
            screen: {},
            serviceSummary: {delivery: '', price: '', title: '', bannerImage: '', packageType: {name: ''}, description: '', selectedFeatures: []},
            sId: '',
            geekLocation: {country: 'Not available', ip: '', city: ''},
            user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', iAmTheGeek: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false},
            geek: {id: '', phoneNumberConfirmed: false, profileImagePath: '', geekName: '', firstName: '', lastName: '', languages: [], name: '', professionalCaption: '', academics:[], dateRegistered: '', summary: '', successfulDealsDelivered: 0, topSpecialties: [], onlineStatus: 0, iAmTheGeek: false, location: {country: 'Not available', ip: '', city: ''}},
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
            }
        };

        this.hideMessage = this.hideMessage.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.buy = this.buy.bind(this);
        this.getGeek = this.getGeek.bind(this);
        this.pWRave = this.pWRave.bind(this);
        this.showLogin = this.showLogin.bind(this);
        this.showSummary = this.showSummary.bind(this);
        this.cancelSummary = this.cancelSummary.bind(this);
        this.goTo = this.goTo.bind(this);
        this.handleCancel  = this.handleCancel.bind(this);
        this.ExplodeCarousel  = this.ExplodeCarousel.bind(this);

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    ExplodeCarousel(slideNumber)
    {
        this.setState({previewVisible: true, slideNumber: slideNumber});
    }

    async getGeek(geekName)
    {
        if (!geekName || geekName === undefined || geekName === 'undefined' || geekName.length < 1)
        {
            return;
        }

        this.showSpinner(true);
        let res = await fetchData('/getSeller?cre=' + geekName);
        this.showSpinner(false);
        if (!res || res.code < 1 || !res.geek || res.geek.id.length < 1)
        {
            this.showMessage('An unknown error was encountered. Please try again later', -1);
            this.props.go('SERVICES', '');
        }
        else
        {
            this.setState({geek: res.geek});
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
            let service = el.props.location.payload.slug || el.state.sId;
            if(el.state.service._id.length < 1 && (service === undefined || service === null  || service.length < 1))
            {
                el.showMessage('An unknown error was encountered. Please try again later', -1);
                el.props.go('HOME', 'landing');
            }
            else
             {
                if(el.state.service._id.length < 1)
                {
                    el.getServiceInfo(service);
                }
                else
                {
                    if(el.state.service._id !== service)
                    {
                        el.getServiceInfo(service);
                    }
                }
            }
        }, 700);
    }

    async getServiceInfo(serviceId)
    {
        let sElement = document.getElementById('summary');
        this.setState({divWidth: sElement.style.width + '%'});

        let el = this;
        if(!serviceId || serviceId.length < 1)
        {
            el.showMessage('An unknown error was encountered. Please try again later', -1);
            el.props.go('SERVICES', '');
        }
        else
        {
            this.showSpinner(true);
            let service = await fetchData(`/getServiceInfo?service=` + serviceId);
            this.showSpinner(false);
            if (!service || service._id.length < 1)
            {
                el.showMessage('Service information could not be retrieved. Please try again later', -1);
                el.props.go('SERVICES', '');
            }
            else
            {
                el.setState({service: service});
                this.getGeek(service.addedBy.geekNameUpper);
            }
        }
    }

    componentWillReceiveProps(nextProps)
    {
        if(typeof nextProps.sco === 'object' && nextProps.sco.hasOwnProperty('title') && nextProps.sco.title.length > 0)
        {
            this.setState({
                service: nextProps.sco
            });
            this.getGeek(nextProps.sco.addedBy.geekNameUpper);
        }

        if(typeof nextProps.user === 'object' && typeof nextProps.user === 'object' && nextProps.user.hasOwnProperty('id') && nextProps.user.id.length > 0)
        {
            this.setState({
                user: nextProps.user
            });
        }

        if(nextProps.sId !== undefined && nextProps.sId !== null && nextProps.sId.length > 0)
        {
            this.setState({
                sId: nextProps.sId
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

    handleCancel()
    {
        this.setState({previewVisible: false});
    }

    showSummary(pPackage)
    {
        let el = this;
        el.state.vatValue = (pPackage.price * el.state.vat)/100;
        let f1 = (pPackage.price * el.state.creaptive)/100;
        el.state.creaptiveCut = f1 >= 5000? 5000 : f1;
        el.state.tValue = pPackage.price + el.state.creaptiveCut + el.state.vatValue;

        let bnImg = document.getElementById('srcImg');
        bnImg.style.background = `url(${el.state.service.bannerImage}) no-repeat center`;
        bnImg.style.webkitBackgroundSize = `cover`;
        bnImg.style.mozBackgroundSize = `cover`;
        bnImg.style.oBackgroundSize = `cover`;
        bnImg.style.backgroundSize = `cover`;
        bnImg.style.height = `230px`;
        el.showSpinner(true);
        let buy = document.getElementById('buy');
        let summary = document.getElementById('summary');
        el.setState({serviceSummary: pPackage, showSummary: true});

        setTimeout(async function()
        {
            el.showSpinner(false);
            summary.style.width = '0px';
            summary.style.display = 'none';
            buy.style.opacity = '1';
            buy.style.width = el.state.divWidth;

        }, 400);
    }

    async buy()
    {

        if(this.state.geek.id === this.state.user.id)
        {
            this.showMessage('You cannot buy your own service', -1);
            return;
        }

        if(this.state.tValue === undefined || this.state.tValue === null || this.state.tValue < 1)
        {
            this.showMessage('An error was encountered on the page. Please refresh the page and try again.', -1);
            return;
        }
        let pPackage = this.state.serviceSummary;
        if(this.state.user && this.state.user.id.length > 0 && this.state.user.isAuthenticated)
        {
            this.showSpinner(true);
            let res = await fetchData('/trFg?client=' + this.state.user.id);
            this.showSpinner(false);
            if(res.code < 1 || res.rRef.length < 1)
            {
                this.showMessage(res.message, -1);
            }
            else
            {
               this.pWRave(pPackage, this.state.user, res.rRef)
            }
        }
        else
        {
            this.showLogin();
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

    pWRave(pPackage, user, tr)
    {
        let el = this;
        let today = new Date();
        let deliveryDate = new Date(today.setDate(today.getDate() + pPackage.delivery));

        let x = getpaidSetup({
        PBFPubKey: 'FLWPUBK-18345d535fc8365b30590a8f943d67cb-X',
        customer_email: user.email,
        amount: el.state.tValue,
        customer_phone: user.phoneNumber,
        currency: "NGN",
        payment_method: "card",
        txref: tr,
        onclose: function() {},
        callback: async function(response)
        {
            if (response.tx.chargeResponseCode === "00" || response.tx.chargeResponseCode === "0")
            {
                x.close();
                let txRef = response.tx.txRef;
                let order =
                    {
                        orderedBy: el.state.user.id,
                        geek: el.state.geek.id,
                        service: el.state.service._id,
                        orderPayment: null,
                        craft: null,
                        dateOrdered: '',
                        orderRef: tr,
                        lastModified: '',
                        expectedDeliveryDate: deliveryDate,
                        actualDeliveryDate: '',
                        status: '',
                        orderedServicePackage: pPackage._id,
                        dateShipped: '',
                        dateReceived: '',
                        providedResources: [],
                        payment:
                        {
                            order: null,
                            coupon: null,
                            flwRef: txRef,
                            subTotal: pPackage.price,
                            grossAmount: el.state.tValue,
                            creaptive: el.state.creaptiveCut,
                            vat: el.state.vatValue,
                            netAmount: el.state.tValue, //same as tValue if no coupon or discount available
                            amountPaid: el.state.tValue,
                            couponValue: '',
                            datePaid: '',
                            appFee: '',
                            currency: '',
                            amountSettledForTransaction: '',
                            paymentType: 'CARD'
                        }
                    };

                el.setState({disabled: true});
                el.showSpinner(true);
                let r= await postQuery('/prs', JSON.stringify(order));
                el.showSpinner(false);
                el.setState({disabled: false});
                el.showMessage(r.message, r.code);
                if(r.code > 0)
                {
                     //redirect to my orders
                     // el.goTo('SERVICES', 'services');
                    el.cancelSummary();
                }
            }
            else
            {
                el.showMessage('Payment could not be processed. Please try again', -1);
            }
         }
    });
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
        let buy = document.getElementById('buy');
        let summary = document.getElementById('summary');
        let reset = {delivery: '', price: '', title: '', bannerImage: '', packageType: {name: ''}, description: '', selectedFeatures: []};
        buy.style.width = '0px';
        buy.style.opacity = '0';
        summary.style.display = '';
        summary.style.width = this.state.divWidth;
        this.setState({serviceSummary: reset, showSummary: false});

    };

    render()
    {
         const {sections, dispatchAction} = this.props;
         const {geekName, firstName, lastName, languages, name, professionalCaption, emailConfirmed, academics, dateRegistered, summary, successfulDealsDelivered, topSpecialties, onlineStatus, profileImagePath, geekNameUpper} = this.state.geek;
         const smallScreen = (this.props.screen !== undefined && this.props.screen !== null && !this.props.screen.mql.matches);
         const {showSummary, serviceSummary, creaptive, tValue, creaptiveCut, vatValue, vat, disabled, previewVisible, slideNumber, crSel, divWidth} = this.state;
         let sr = serviceSummary;
         let s = this.state.service;

        let hasPrevLocation = this.props.location.prev !== undefined && this.props.location.prev !== null && this.props.location.prev.pathname.length > 0;
        let prev = this.props.location.routesMap[this.props.location.prev.type];
        let ff = this.props.location.routesMap[this.props.location.type];

        let iAmTheGeek = false;
        if(this.state.geek.id === this.state.user.id)
        {
            iAmTheGeek = true;
        }

        const ac = <nav className="ed_nav" style={{paddingLeft: '20px', paddingTop: '30px'}}>
            <ul className="actionList">
                {(!profileImagePath || profileImagePath.length < 1)? '' : <li style={{marginBottom: '3px'}}>
                    <a className="appAnchor" onClick={() => this.viewPic(profileImagePath)} style={{cursor: "pointer", fontSize: '14px !important'}} title="view image">
                        <i className="anticon anticon-eye-o iStack" style={{cursor: "pointer"}}></i>
                        &nbsp;
                        view
                    </a>
                </li>} : ''}
            </ul>
        </nav>;

        return(
            <Row className="main-content" id="mainContent">
                <Row id="msg" style={{width: '100%', margin: '1px', display: 'none'}}>
                    <label id="ms">
                        {this.state.message}
                    </label>
                    <br/><br/>
                </Row>
                <Row style={{paddingLeft: '2%', paddingRight: '2%'}}>
                    <Col span={24}>
                       <span style={{color: 'rgba(0, 0, 0, 0.65)', paddingLeft: '8px'}}>
                            { hasPrevLocation && <NavLink className="appAnchor" to={this.props.location.prev.pathname}>{prev.display}</NavLink>}
                           { hasPrevLocation && <span>&nbsp;>&nbsp;</span>}
                           <NavLink className="appAnchor" exact to={this.props.location.pathname}>{ff.display}</NavLink>
                        </span>
                    </Col>
                </Row>
                <Row style={{paddingLeft: '2%', paddingRight: '2%'}}>
                    <Col xs={0} sm={1} md={4} lg={6}></Col>
                    <Col id='summary' xs={24} sm={22} md={16} lg={12} className='service-gc service-tc'>
                        <Card className="split xz service-gc">
                            <div className="card-container n-Bdr sci">
                                <Tabs className="access-menu-item nn">
                                    <TabPane tab="Summary" key="1" className="access-menu-item tabs-background">
                                        <div className='ant-row' style={{marginBottom: '10px'}}>
                                            <Col key={s._id} span={24} className="s-wrapper s-wr">
                                                <Card bodyStyle={{ paddingTop: '12px !important' }} className="item-card pfs s-hdr">
                                                    <div className="ant-row">
                                                        <h1>
                                                            {s.title}
                                                        </h1>
                                                    </div>
                                                    <br/>
                                                    <div className="ant-row">
                                                        <span className="ant-avatar hj ssTera ant-avatar-circle">
                                                            <img alt="Profile image" src={s.addedBy.profileImagePath}/>
                                                        </span>
                                                        <div className="float-left" style={{paddingTop: '12px'}}>
                                                            <span>
                                                                <NavLink className="appAnchor" to={`/cr/${s.addedBy.geekNameUpper}`}>
                                                                    {s.addedBy.geekName}
                                                                </NavLink>
                                                            </span>
                                                            <div>
                                                                <span className="seller-level">{s.addedBy.professionalCaption}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Col>
                                        </div>                                      
                                        <Row id="crDiv">
                                            <Col span={24} className={`s-wrapper-2 s-wr ${smallScreen ? '' : 's-hdr c-ht'}`}>
                                                <Card className="item-card pfs">
                                                    <Row>
                                                        <Col span={24} id='crSel' >
                                                            <Carousel selectedItem = {slideNumber} showArrows={true} showStatus={false} showThumbs={false} useKeyboardArrows={true} showIndicators={true}>
                                                                <div style={{cursor: 'pointer'}} onClick={() => this.ExplodeCarousel(0)}><img src={s.bannerImage}/></div>
                                                                <div style={{cursor: 'pointer'}} onClick={() => this.ExplodeCarousel(1)}><img src={s.secondImage}/></div>
                                                                <div style={{cursor: 'pointer'}} onClick={() => this.ExplodeCarousel(2)}><img src={s.thirdImage}/></div>
                                                            </Carousel>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Col>
                                            <Modal className='ggt ex-c' visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                                <Row>
                                                    <Col span={24}>
                                                        <Carousel showArrows={true} selectedItem = {slideNumber} showStatus={false} showThumbs={false} useKeyboardArrows={true} showIndicators={true}>
                                                            <div><img src={s.bannerImage}/></div>
                                                            <div><img src={s.secondImage}/></div>
                                                            <div><img src={s.thirdImage}/></div>
                                                        </Carousel>
                                                    </Col>
                                                </Row>
                                            </Modal>
                                        </Row>                                   
                                        <Row>
                                            <Col span={24} className="s-wrapper s-wr">
                                                <header>
                                                    <h3 className="f-der">Description</h3>
                                                </header>
                                                <Card className="item-card pfs s-hdr">
                                                    <Row gutter={16}>
                                                        <Col xs={24} sm={22} md={18} lg={16}  className="s-main-desc">
                                                            {ReactHtmlParser(s.description)}
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    <TabPane tab="Packages" key="2" className="access-menu-item">
                                        <div className={`ant-row ${smallScreen ? 'sc-pack' : 's-packs'}`}>
                                            <Col className={`ant-row ${smallScreen ? 's-wrapper-2 s-wr' : 's-wrapper s-wr'}`}>
                                                <Card bodyStyle={{ paddingTop: '12px !important' }} className={`ant-row ${smallScreen ? 'item-card pfs' : 'item-card pfs s-hdr'}`}>
                                                    <Tabs type="card">
                                                        {
                                                            this.state.service.packages.map(r =>
                                                                {
                                                                    return <TabPane tab={r.packageType.name}  key={r.packageType._id}>
                                                                        <div className="ant-Row">
                                                                            <Col xs={24} sm={22} md={12} lg={16}>
                                                                                <div className="ant-col-24 bottom-border margin-bottom-top">
                                                                                    <h4>{r.description}</h4>
                                                                                </div>
                                                                                <ul className="cr-sc-pack">
                                                                                    {r.selectedFeatures.map(f =>
                                                                                    {
                                                                                        if(f.feature.featureType.toLowerCase() === 'checkbox')
                                                                                        {
                                                                                            return  <li key={f._id}>
                                                                                                {f.feature.title} &nbsp;
                                                                                                <span>
                                                                                                    <i className="anticon anticon-check cr-i-green"></i>
                                                                                                </span>
                                                                                            </li>
                                                                                        }else if(f.feature.featureType.toLowerCase() === 'number')
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
                                                                                            {r.delivery}
                                                                                        </span>
                                                                                    </li>
                                                                                    {(iAmTheGeek === true) ? '' : <li>
                                                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{marginTop: '20px', width: '100%'}} onClick={() => this.showSummary(r)}>
                                                                                            Buy @ &#8358;{r.price}
                                                                                        </button>
                                                                                    </li>}

                                                                                </ul>
                                                                            </Col>
                                                                        </div>
                                                                    </TabPane>

                                                                }
                                                            )}
                                                    </Tabs>
                                                </Card>
                                            </Col>
                                        </div>
                                    </TabPane>
                                    <TabPane tab="Seller" key="3">
                                        <div className={`ant-row ${smallScreen ? 'sc-pack' : 's-packs'}`}>
                                            <Col className={`ant-row ${smallScreen ? 's-wrapper-2 s-wr' : 's-wrapper s-wr'}`}>
                                                <Card bodyStyle={{ paddingTop: '12px !important' }} className={`ant-row ${smallScreen ? 'item-card pfs' : 'item-card pfs s-hdr'}`}>
                                                    <Col id="profile" span={24} style={{marginBottom: '20px'}}>
                                                        <Row>
                                                            <Card bodyStyle={{ padding: 0 }}>
                                                                <div className="profileHeader" style={{backgroundColor: 'transparent !important'}}>
                                                                    <label style={{float: 'right', zIndex: '3', right: '20px', position: 'absolute', marginTop : '-1px'}}>{(onlineStatus !== undefined && onlineStatus !== null && onlineStatus > 0)? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> : <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                                                    <div style={{width: '100%', textAlign: 'center'}}>
                                                                        <div style={{marginTop: '20px', width: '100%'}}>
                                                                            {(!profileImagePath || profileImagePath.length < 1)?
                                                                                <span className="ant-avatar dfs divTera avatera ant-avatar-circle ant-avatar-icon">
                                                                                   <i className="anticon anticon-user"></i>
                                                                                </span> :
                                                                                <span className="ant-avatar dfs divTera ant-avatar-circle ant-avatar-icon">
                                                                                    <img alt="Profile image" src={profileImagePath}/>
                                                                                </span>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <br/>
                                                                <div className="ant-col-24">
                                                                    <div style={{paddingLeft: '10px', paddingRight: '10px', paddingBottom: '2px'}}>
                                                                        <Row>
                                                                            <Row id="pl_name">
                                                                                <div className="ant-row custom-card" id="pl_name">
                                                                                    <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                                                        <div className="ant-row ant-form-item-x" style={{textAlign: 'center'}}>
                                                                                            <NavLink style={{fontSize: '15px', fontWeight: 'bold'}} className="appAnchor" to={`/cre/${s.addedBy.geekNameUpper}`}>
                                                                                                {(geekName && geekName.length > 0 ) ? geekName : 'User Name not provided'}
                                                                                            </NavLink>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </Row>
                                                                        </Row>
                                                                        {professionalCaption && professionalCaption?
                                                                            <Row style={{marginTop: '5px'}}>
                                                                                <div className="ant-row custom-card" id="pl_professionalCaption">
                                                                                    <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                                                        <div className="ant-row ant-form-item-x" style={{textAlign: 'center', marginBottom: '10px !important'}}>
                                                                                            <label style={{fontSize: '15px'}}>{professionalCaption}</label>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </Row>
                                                                            : ''}

                                                                        <Row style={{borderBottom: '1px solid #e0e0e0', marginTop: '5px', marginBottom: '10px'}}>
                                                                            <div className="ant-row custom-card" id="pl_professionalCaption">
                                                                                <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                                                    <div className="ant-row ant-form-item-x" style={{textAlign: 'center', marginBottom: '10px !important'}}>
                                                                                        <i style={{fontSize: '14px', marginLeft: '-40px'}} className="anticon anticon-environment"></i><label style={{fontWeight: 'bold'}}>{this.state.geek.location.country} </label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </Row>
                                                                        <br/>
                                                                        <Row>
                                                                            <Col span={smallScreen ? 24 : 12} style={{marginTop: '10px'}}>
                                                                                Joined on:  <label style={{float: 'right', fontWeight: 'bold'}}>{dateRegistered}</label>
                                                                            </Col>
                                                                        </Row>
                                                                        <br/>
                                                                        <Row style={{borderBottom: '1px solid #e0e0e0'}}>
                                                                            <Col span={smallScreen ? 24 : 12}>
                                                                                Deals completed:  <label style={{float: 'right', fontWeight: 'bold'}}>{successfulDealsDelivered}</label>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </Row>
                                                        <Row>
                                                            <Card bodyStyle={{ padding: 0 }}>
                                                                <div className="custom-card">
                                                                    <div style={{paddingLeft: '10px', paddingRight: '10px', paddingBottom: '2px'}}>
                                                                        <br/>
                                                                        <Row style={{borderBottom: '1px solid #e0e0e0'}}>
                                                                            <Row style={{marginBottom: '12px'}}>
                                                                                <Col span={20}>
                                                                                    <label style={{fontWeight: '700'}}> Language(s)</label>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row id="pl_language">
                                                                                {languages.map(ln =>
                                                                                    <Row key={ln.name} style={{listStyle: 'none', padding: '2px', marginBottom: '10px'}}>
                                                                                        <Col span={20}>
                                                                                            <label  style={{fontSize: '15px'}}>{ln.name + ' (' + ln.proficiency + ')'}</label>
                                                                                        </Col>
                                                                                    </Row>
                                                                                )}

                                                                            </Row>
                                                                        </Row>
                                                                        <br/>
                                                                        <Row style={{borderBottom: '1px solid #e0e0e0'}}>
                                                                            <div className="ant-row custom-card" id="pl_summary">
                                                                                <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                                                    <div className="ant-row ant-form-item" style={{marginBottom: '10px !important'}}>
                                                                                        <p style={{wordWrap: 'break-word', fontSize: '15px'}}>{summary && summary.length > 0? summary : 'Your professional Summary'}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </Row>
                                                                        <br/>
                                                                        <Row style={{borderBottom: '1px solid #e0e0e0'}}>
                                                                            <Row id="pl_education">
                                                                                {academics.map(ed =>
                                                                                    <Row key={ed.degree} style={{listStyle: 'none', padding: '2px', marginBottom: '10px'}}>
                                                                                        <Col span={20}>
                                                                                            <label style={{fontSize: '15px'}}>{ed.degree + ' (' + ed.course + ')'}</label><label>{': ' + ed.institution + ', ' + ed.country.name + ', ' + ed.graduationYear}</label>
                                                                                        </Col>
                                                                                    </Row>
                                                                                )}
                                                                            </Row>
                                                                            <br/>
                                                                        </Row>
                                                                        <br/>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </Row>
                                                    </Col>
                                                </Card>
                                            </Col>
                                        </div>
                                    </TabPane>
                                    <TabPane tab="Reviews" key="4" className="access-menu-item">
                                        <p>Reviews here</p>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </Card>
                    </Col>
                    <Col id='buy' xs={24} sm={22} md={16} lg={12} style={{marginBottom: '20px', paddingLeft: '1%', opacity: '0', paddingRight: '1%', width: '0px', WebkitTransition: '0.3s width', MozTransition: '0.3s width', OTransition: '0.3s width',transition: '0.3s width'}}>
                        <div style={{ padding: 0, border: '0 !important' }} className="split xz">
                            <div className="card-container n-Bdr sci">
                                <div className={`ant-row ${smallScreen ? 'sc-pack s-wrapper-2 s-wr' : 's-packs s-wrapper s-wr'}`}>
                                    <Row>
                                        <Col key={s._id} span={24} className="s-wrapper s-wr">
                                            <div style={{ paddingTop: '12px !important' }} className="ant-col-24 pfs s-hdr">
                                                <button className="ant-modal-close focus-within" aria-label="Close" onClick={this.cancelSummary}>
                                                    <span className="ant-modal-close-x" title='cancel'></span>
                                                </button>
                                                <div className="ant-row bottom-border">
                                                    <h1>
                                                        {s.title}
                                                    </h1>
                                                </div>
                                                <Col span={24} className="imgBg ant-col-24">
                                                    <div id='srcImg' className="ant-col-24"></div>
                                                </Col>
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
                                                            }else if(f.feature.featureType.toLowerCase() === 'number')
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
                                                                    <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{sr.price}</span>
                                                                </div>
                                                                <div className="ant-col-24 summary">
                                                                    <span>VAT ({vat}%): </span>
                                                                    <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{vatValue}</span>
                                                                </div>
                                                                <div className="ant-col-24 summary">
                                                                    <span>creaptive ({creaptive}%): </span>
                                                                    <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{creaptiveCut}</span>
                                                                </div>
                                                                <div className="ant-col-24 summary" style={{borderTop: '1px solid #ddd'}}>
                                                                    <span>Total: </span>
                                                                    <span style={{float: 'right', fontWeight: 'bold'}}>&#8358;{tValue}</span>
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{marginTop: '20px', width: '100%'}} disabled={disabled} onClick={() => this.buy()}>
                                                                Continue
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </Col>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={0} sm={1} md={4} lg={6}></Col>
                </Row>
                <Spin size="large" spinning={this.state.loading} />
        </Row>
        );
    }
}

const mapDispatch = {go: goToPage, setUser, dispatchAction};
const mapState = ({sections, location, user, serviceNull, sco, sId, screen}) => ({sections, location, user, serviceNull, sco, sId, screen});

export default connect(mapState, mapDispatch)(Service);