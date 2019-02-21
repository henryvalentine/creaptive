/**
 * Created by Jack V on 9/12/2017.
 */
import React from 'react';
import {Layout, Icon, Avatar, Menu, Select} from 'antd';
const {SubMenu} = Menu;
const { Option} = Select;
import Link, { NavLink } from 'redux-first-router-link';
import {dispatchAction, goToPage, setUser} from '../actions';
import { connect } from 'react-redux'
import logo from '../../images/mobile/cre-wh-bb2.png';
import creMobile from '../../images/mobile/cre-ico-wh.png'

 class SideMenu extends React.Component{
    constructor(props)
    {
        super(props);
        this.state = 
        {
            user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', iAmTheGeek: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false},
            sCategories: [],
            section: {_id: '', name: ''}
        }

        this.selectSection = this.selectSection.bind(this);
    }

    async selectSection(targetSection)
    {
        let section = this.props.sections.find(s => s._id === targetSection);
        if(section && section._id.length > 0)
        {
            if(this.props.section._id !== section._id)
            {
                this.setState({section: section});
                this.props.dispatchAction({ type: 'SECTION', payload: section});
                if(section.name.toLowerCase().includes('services'))
                {
                    this.props.go('SERVICES', 'services');
                }
                else{
                    if(section.name.toLowerCase().includes('crafts'))
                    {
                        this.props.go('CRAFTS', 'services');
                    }
                }
            } 
        }                    
    }

     componentWillReceiveProps(nextProps)
     {
         this.setState({section: nextProps.section});
     }

    render(){
        return(
            <div id="sideNav" style={{left: "-256px"}} className="sideNav md-paper md-paper--5 md-drawer md-drawer--left md-drawer--fixed md-drawer--active md-transition--decceleration md-background--card" >
                <div className="sideMenuHeader">
                    <div style={{width: '100%', textAlign: 'center'}}>
                        <div style={{paddingLeft: '10px', paddingRight: '10px', paddingBottom: '0px', paddingTop: '10px'}}>
                            {(!this.props.user.profileImagePath || this.props.user.profileImagePath.length < 1)?
                                <Avatar style={{ backgroundColor: '#87d068' }} icon="user"/>
                                :
                                <span className="ant-avatar ssTera ant-avatar-circle">
                                    <img alt="Profile image" src={this.props.user.profileImagePath}/>
                                </span>
                            }
                        </div>
                        <div style={{paddingLeft: '10px', paddingRight: '10px', paddingBottom: '2px'}}>
                            <p style={{color: 'rgb(255, 255, 255)'}}>
                                <label className="name-anchor">{(this.props.user.geekName && this.props.user.geekName.length > 0 ) ? <NavLink className="appAnchor" to={`/cr/${this.props.user.geekName}`}>{this.props.user.geekName}</NavLink> : 'User Name not provided'}</label>                               
                                <label style={{fontSize: '14px', color: '#fff'}}>{this.state.user.professionalCaption && this.state.user.professionalCaption? this.state.user.professionalCaption : 'Your Professional Caption'}</label>
                                <br/>
                                <i style={{fontSize: '14px', marginLeft: '-40px', color: '#fff'}} className="anticon anticon-environment"></i>
                                <label style={{fontWeight: 'normal', color: '#fff'}}>
                                    {(this.state.user.location !== undefined && this.state.user.location !== null && this.state.user.location.country !== undefined && this.state.user.location.country.length > 0)? this.state.user.location.country : 'N/A'}
                                </label>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="md-divider-border md-divider-border--bottom">
                    <Select name="section" className='section-cmb'
                            style={{width: '100%'}}
                            placeholder="select section"
                            optionFilterProp="children"
                            value={(this.state.section !== undefined)? this.state.section._id : 'select section'}
                            onChange={this.selectSection}>
                        {this.props.sections && this.props.sections.map(s => <Option value={s._id} key={s._id}>{s.name}</Option>)}
                    </Select>
                </div>                  

                <Menu id="sdAdmin" mode="inline">    
                   {this.props.categories && this.props.categories.map(c => 
                    <SubMenu key={c._id} title={<span><Icon type= {c.iconType} theme="outlined"/>{c.name}</span>}>
                        {c.subCategories.map(s => 
                            <Menu.Item key={s._id}>{s.name}</Menu.Item>
                        )}
                    </SubMenu>
                   )}  
                </Menu>
            </div>
        );
    }
}

const mapDispatch = {go: goToPage, setUser, dispatchAction};
const mapState = ({ location, user, section, sections, categories}) => ({location, user, section, sections, categories});

export default connect(mapState, mapDispatch)(SideMenu);


// onClick={() => this.selectSection('COUNTRY', 'country')}