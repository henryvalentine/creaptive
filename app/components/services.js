/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import {Row, Col, Spin, Card, Rate, Slider, Button, Icon} from 'antd';
import Link, { NavLink } from 'redux-first-router-link';
import {connect} from "react-redux";
import {dispatchAction, goToPage, setUser} from "../actions";
import {fetchData, postQuery} from "../utils";
import {message} from "antd/lib/index";
import defaultImage from '../../images/defaultImage.png';
import ReactHtmlParser from "react-html-parser";
let appSection = {};


function onChange(value) {
    console.log('onChange: ', value);
  }
  
  function onAfterChange(value) {
    console.log('onAfterChange: ', value);
  }

class Services extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            serviceCategories: [],
            subcategories: [],
            services: [],
            section: '',
            currentView: '',
            parentView: '',
            page: 1,
            user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', iAmTheGeek: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {address1: '', address2: '', cityId: '', ll: 'Not available'}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false},
            screen: {},
            section: {_id: '', name: ''},
            headerHeight: 0,
            loading: false
        };
        
        this.init = this.init.bind(this);
        this.sortPrices = this.sortPrices.bind(this);
        this.showSpinner = this.showSpinner.bind(this);
        this.compileRatings = this.compileRatings.bind(this);
        this.getServicesBySubcategory = this.getServicesBySubcategory.bind(this);
        this.getServiceGroupsBySection = this.getServiceGroupsBySection.bind(this);
        this.getServiceSubcategoriesByCategory = this.getServiceSubcategoriesByCategory.bind(this);        
           
        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }
    
    async getServiceGroupsBySection(section)
    {
        this.showSpinner(true);
        let serviceCategories = await fetchData('/getCatrBySection?section=' + section);
        this.showSpinner(false);
        this.setState({serviceCategories: serviceCategories});        
    }

    async getServiceSubcategoriesByCategory(category)
    {        
        this.showSpinner(true);
        let subcategories = await fetchData('/getSctrsByCtr?ctr=' + category);
        this.showSpinner(false);
        this.setState({subcategories: subcategories});        
    }
    
    async getServicesBySubcategory(subcategory)
    {
        let body = JSON.stringify({itemsPerPage: 50, sctr: subcategory, searchText:"", page: this.state.page, sortField:"rating", sortOrder:"desc"});
        this.showSpinner(true);
        let services = await postQuery('/getSrvBySctr', body);
        this.showSpinner(false);
        let srvcs = this.state.services.concat(services);
        this.setState({services: srvcs});
        if(services && services.length > 0)
        {   
            let page = this.state.page + 1;
            this.setState({page: page});
            this.getServicesBySubcategory(subcategory);
        }   
        else{
            this.setState({page: 1});
        } 

    }

    async componentDidMount()
    {
        this.init(this.props)          
    }

    init(props)
    {
        this.setState({services: [], serviceCategories: [], subcategories: [], page: 1});
        let location = props.location.pathname;  
        let paths = location.split('/').filter(entry => /\S/.test(entry)); //split url and remove empty elemnts from array
        
        if(paths[paths.length-1] !== '/')
        {
            if(paths.length === 2)
            {
                this.setState({currentView: paths[0].replace('-', ' '), section: paths[0].toUpperCase()});
                this.getServiceGroupsBySection(paths[1]);
            }
            else
            {
                if(paths.length === 3)
                {
                    this.setState({currentView: paths[1].replace('-', ' '), section: paths[0].toUpperCase()});
                    this.getServiceSubcategoriesByCategory(paths[2]);
                }
                else
                {
                    if(paths.length > 3)
                    {
                        this.setState({parentView: paths[1].replace('-', ' '), currentView: paths[2].replace('-', ' '), section: paths[0].toUpperCase()});
                        this.getServicesBySubcategory(paths[3])
                    }
                }
            }
        }             
    }

    compileRatings(ratings)
    {
        if(ratings && ratings.length > 0)
        {
            let highestRating = ratings.sort(function(a, b){return b.rating - a.rating;})[0].rating;
            let numberOfHighestRaters = ratings.filter((c) => c.rating === highestRating);
            let rr = {h: highestRating, n: numberOfHighestRaters.length};
            return rr;
        }
        else{
            return {h: 0, n: 0};
        }
    }

    sortPrices(packages)
    {
        if(packages && packages.length > 0 && packages[0].price)
        {
            return packages.sort(function(a, b){return a.price - b.price;})[0].price;
        }
        else
        {
            return 0;
        }
    }
    
    showSpinner(spinnerState)
    {
        this.setState({loading: spinnerState});
    }

    componentWillReceiveProps(nextProps)
    {
        if(nextProps.location.pathname !== undefined && nextProps.location.pathname !== null  &&  nextProps.location.pathname !== this.props.location.pathname)
        {
            this.init(nextProps);           
        }
    }

    componentWillUnmount()
    {
        
    }

    render()
    {
        const smallScreen = (this.props.screen !== undefined && this.props.screen !== null && !this.props.screen.mql.matches);
        let obj = this;
        // let hasPrevLocation = this.props.location.prev !== undefined && this.props.location.prev !== null && this.props.location.prev.pathname.length > 0;
        // let prev = this.props.location.routesMap[this.props.location.prev.type];
        // let notSameAsSection = (this.props.section !== undefined && this.props.section !== null) && (this.props.section.name !== undefined && (this.props.section.name.toLowerCase() !== this.state.currentView.toLowerCase()));
        // //let ff = this.props.location.routesMap[this.props.location.type];

        return(

                <div className="main-content" id="mainContent">     
                    {/* <Row style={{paddingLeft: '2%', paddingRight: '2%'}}>
                        <Col span={24}>
                            <span style={{color: 'rgba(0, 0, 0, 0.65)', paddingLeft: '8px'}}>
                                <Link className="appAnchor" to='/'>Home</Link><span>&nbsp;>&nbsp;</span>
                               {notSameAsSection && <Link className="appAnchor" to={{ type: 'SERVICES', payload: { recx: this.props.section._id, display: this.props.section.name}}}>{this.props.section.name}</Link>}
                               {notSameAsSection && <span>&nbsp;>&nbsp;</span>}
                                {hasPrevLocation && <Link className="appAnchor" to={this.props.location.prev.pathname}>{this.props.location.prev.payload.display}</Link>}                                    
                                {this.state.parentView && <Link className="appAnchor" to={'/'}>{this.state.parentView}</Link>}
                                {this.state.parentView && <span>&nbsp;>&nbsp;</span>}
                                <span className='subcategory'>{this.state.currentView}</span>
                            </span>
                        </Col>
                    </Row> */}

                    <Row gutter={2} className="sr">    
                      <Col xs={0} sm={0} md={3} lg={3}>
                        <Slider defaultValue={30} onChange={onChange} onAfterChange={onAfterChange} />
                        <Slider range step={10} defaultValue={[20, 50]} onChange={onChange} onAfterChange={onAfterChange} />
                      </Col>         
                      <Col xs={24} sm={24} md={20} lg={20}>
                            {/* FOR CATEGORIES RENDERING */}
                        {this.state.serviceCategories.length > 0 && this.state.serviceCategories.map(function(s)
                        {
                            return <Col key={s._id} xs={24} sm={12} md={8} lg={5} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>                                       
                                <div className="ant-card-body mg">
                                    <div className='ant-col-24 pfs list-c'>
                                        <div className="custom-image ant-row">                                                
                                            <img alt='banner' width="100%" src={s.defaultImg? s.defaultImg : defaultImage} /> 
                                        </div>
                                        <div className="custom-card ant-row" style={{paddingRight: '5px'}}>
                                            <div className='ant-row'>                                           
                                                <div className="ant-col-24 padding-4">
                                                    <Link to={{ type: obj.state.section, payload: { recx1: s.name.replace(' ', '-'), recx: s._id}}} className='orap li-a' style={{cursor: "pointer", fontSize: '12px !important'}} title="View Service categories">
                                                        {s.name}                                          
                                                    </Link>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div>
                            </Col>                            
                        })}

                        {/* FOR SUBCATEGORIES RENDERING */}
                        {this.state.subcategories.length > 0 && this.state.subcategories.map(function(s)
                        {
                            return <Col key={s._id} xs={24} sm={12} md={8} lg={5} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>                                       
                                <div className="ant-card-body mg">
                                    <div className='ant-col-24 pfs list-c'>
                                        <div className="custom-image ant-row">                                                
                                            <img alt='banner' width="100%" src={s.defaultImg? s.defaultImg : defaultImage} /> 
                                        </div>
                                        <div className="custom-card ant-row" style={{paddingRight: '5px'}}>
                                            <div className='ant-row'>                                           
                                                <div className="ant-col-24 padding-4">
                                                    <Link to={{ type: obj.state.section, payload: { recx1: s.creativeCategory.name.replace(' ', '-'), recx2: s.name.replace(' ', '-'), recx: s._id}}} className='orap li-a' style={{cursor: "pointer", fontSize: '12px !important'}} title="View Service subcategories">
                                                        {s.name}                                          
                                                    </Link>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div>
                            </Col>                            
                        })}
                        
                        {/* FOR SERVICES RENDERING */}
                          {this.state.services.length > 0 && this.state.services.map(function(s)                           
                           {
                               if(s.ratings && s.ratings.length > 0)
                               {
                                    let y = obj.compileRatings(s.ratings);
                                    let pr = s.packages.sort(function(a, b){return a.price - b.price})[0];
                                    return <Col key={s._id} xs={24} sm={12} md={8} lg={5} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>                                       
                                    <div className="ant-card-body mg">
                                        <div className='ant-col-24 pfs list-it'>
                                        <div className="custom-image ant-row">                                                
                                            <img alt='banner' width="100%" src={s.bannerImage} />
                                            <div className='star padding-4'>
                                                <Rate disabled allowHalf value={y.h} /><span style={{color: '#fff'}}> ({y.n})</span>
                                            </div> 
                                        </div>
                                        <div className="custom-card ant-row" style={{paddingRight: '5px'}}>
                                            <div className='ant-row'>                                           
                                                <div className="ant-col-24 padding-4" >
                                                    <NavLink  className='orap li-a' style={{cursor: "pointer", fontSize: '12px !important'}} title="View service" to={`/service/${s._id}`}>
                                                        {s.title}                                          
                                                    </NavLink>
                                                </div>
                                                </div>                                      
                                                <div className='ant-row'>      
                                                    <div className="ant-col-24 i-mo padding-4">
                                                        <span className="ant-avatar hj li-s ant-avatar-circle">
                                                            <img alt="Profile image" src={s.addedBy.profileImagePath}/>
                                                        </span>
                                                        <div className="float-left" style={{paddingTop: '10px'}}>
                                                            <span>
                                                                <NavLink className="appAnchor n-a" to={`/cr/${s.addedBy.geekNameUpper}`}>
                                                                    {s.addedBy.geekName}
                                                                </NavLink>
                                                            </span>
                                                            {/* <small className= ' n-a' style={{fontSize: '12px', display: 'inline-block', width: '100%'}}>{s.addedBy.professionalCaption}</small> */}
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>
                                        </div>
                                        <div className='ant-col-24 pr-bg pr-l'>
                                            <div className='ant-col-8 padding-4'><small style={{fontSize: '14px', display: 'inline-block'}}>Base: </small></div><div className='ant-col-16'><h5 className='f-w'>&#8358;{pr && pr.price? pr.price.toLocaleString() : '0'}</h5></div>
                                        </div>
                                   </div>
                                </Col>
                               }
                               else{
                                   let pr = s.packages.sort(function(a, b){return a.price - b.price})[0];
                                return <Col key={s._id} xs={24} sm={12} md={8} lg={5} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                <div className="ant-card-body mg">
                                    <div className='ant-col-24 pfs list-it'>
                                        <div className="custom-image ant-row">                                        
                                            <img alt='banner' width="100%" src={s.bannerImage} />
                                            <div className='star padding-4'>
                                                <Rate disabled allowHalf value={0}/>
                                            </div>
                                        </div>
                                        <div className="custom-card ant-row" style={{paddingRight: '5px'}}>
                                            <div className='ant-row'>                                           
                                                <div className="ant-col-24 padding-4" >
                                                    <NavLink  className='orap li-a' style={{cursor: "pointer", fontSize: '12px !important'}} title="View service" to={`/service/${s._id}`}>
                                                        {s.title}                                          
                                                    </NavLink>
                                                </div>
                                                </div>                                      
                                                <div className='ant-row'>      
                                                    <div className="ant-col-24 i-mo padding-4">
                                                        <span className="ant-avatar hj li-s ant-avatar-circle">
                                                            <img alt="Profile image" src={s.addedBy.profileImagePath}/>
                                                        </span>
                                                        <div className="float-left" style={{paddingTop: '10px'}}>
                                                            <span>
                                                                <NavLink className="appAnchor n-a" to={`/cr/${s.addedBy.geekNameUpper}`}>
                                                                    {s.addedBy.geekName}
                                                                </NavLink>
                                                            </span>
                                                            {/* <small className= ' n-a' style={{fontSize: '12px', display: 'inline-block', width: '100%'}}>{s.addedBy.professionalCaption}</small> */}
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>
                                        </div>
                                        <div className='ant-col-24 pr-bg pr-l'>
                                            <div className='ant-col-8 padding-4'><small style={{fontSize: '14px', display: 'inline-block'}}>Base: </small></div><div className='ant-col-16'><h5 className='f-w'>&#8358;{pr && pr.price? pr.price.toLocaleString() : '0'}</h5></div>
                                        </div>
                                 </div>
                            </Col>
                               }
                            })}

                        {this.state.serviceCategories.length < 1 && this.state.services.length < 1 && this.state.subcategories.length < 1 &&
                        <Col xs={24} sm={12} md={8} lg={5} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                            <Card className="ant-card-body pfs list-it">
                                <div className="custom-card">
                                    <h3>
                                        list is empty <br/>
                                    </h3>
                                </div>
                            </Card>
                        </Col>}
                    
                      </Col>           
                     
                    </Row>
                    <Spin size="large" spinning={this.state.loading} />
            </div>

        );
    }
}

const mapDispatch = {go: goToPage, dispatchAction};
const mapState = ({sections, section, location, user, screen, peers, peer, disconnect}) => ({sections, section, location, user, screen, peers, peer, disconnect});

export default connect(mapState, mapDispatch)(Services);


