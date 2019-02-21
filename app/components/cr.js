/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import {Row, Col, Modal, Card, Icon, Avatar, Menu, Select, AutoComplete, Input, Form, Spin, message, Button} from 'antd';
const {Item} = Form;
const {SubMenu} = Menu;
const { Option, OptGroup } = Select;
import {goToPage, setUser, dispatchAction} from '../actions';
import { connect } from 'react-redux';
import { fetchData, postQuery, fetchExternal } from '../utils'
import sample from '../../images/sample.png';
import Link, { NavLink } from 'redux-first-router-link';
import RichTextEditor from 'react-rte';
import Cropper from 'cropperjs/dist/cropper';
import 'cropperjs/dist/cropper.css';
import ServiceAccordion from './serviceAccordion';

function renderOption(item, key, label)
{
    return (
        <Option key={item._id} text={item.name}>
            {item.name}
        </Option>
    );
}

const Ul = ({iAmTheGeek, list, skillSource, onSkillSelect, onToggleEditSkill, onDeleteSkill, onSkillChanged, onSelectExperienceChanged, onSaveSkill, onCancelEditToggle, skillClicked, skill, showAction, hideAction}) =>
    <div className="ant-row" style={{borderBottom: '1px solid #e0e0e0'}}>
            <Row>
                <Col span={20}>
                    <label style={{fontWeight: '700'}}>Professional Skill(s)</label>
                </Col>
                {(iAmTheGeek === true)?
                <Col span={4} id="aGroup_skill" style={{display: skillClicked && skillClicked === true? 'none' : 'block'}}>
                    <a style={{color: '#21ba45'}} onClick={() => onToggleEditSkill(null)}>
                        <i className="anticon anticon-plus" style={{fontSize: '17px', fontWeight: 'bold', position: 'absolute', color: '#21ba45'}}></i>
                        &nbsp; &nbsp;
                        Add
                    </a>
                </Col> : ''}
            </Row>
            <br/>

         <div className="ant-row inner-row" id="pl_skills">
         { list.map(item =>
             <Row className="ant-row skill-bubble" key={item.skill}style={{padding: '7px', float: 'left', marginRight: '17px', marginBottom: '10px'}}>
                 <Col span="24">
                     <a className="semi-bold">{item.name}</a>
                 </Col>
                 {(iAmTheGeek === true)?
                     <span className="actions">
                     <div className="ant-col-8">
                         <a title="Explore" aria-label="Close" className="ant-modal-close">
                             <i className="md-icon material-icons" style={{fontSize: '17px', fontWeight: 'bold'}}>
                                 visibility
                             </i>
                         </a>
                     </div>
                      <div className="ant-col-16">
                            <div className="ant-col-12">
                                <a title="Edit" aria-label="Close" className="ant-modal-close" onClick={() => onToggleEditSkill(item)}>
                                    <i className="anticon anticon-edit" style={{fontSize: '17px', fontWeight: 'bold'}}></i>
                                </a>
                            </div>
                            <div className="ant-col-12">
                                <a title="Remove" aria-label="Close" style={{pointer: 'cursor'}} className="ant-modal-close" onClick={() => onDeleteSkill(item)}>
                                    <i className="anticon anticon-delete" style={{fontSize: '17px', fontWeight: 'bold'}}></i>
                                </a>
                            </div>
                        </div>
                    </span>
                     : ''
                 }
             </Row>
         )}
        </div>

        <Row  id= 'ed_skills' style={{display: skillClicked && skillClicked === true? 'block' : 'none', marginBottom: '20'}}>
            <div className="ant-row">
                <div className="ant-col-24 row-no-btm">
                    <div className="ant-row ant-form-item">
                        <AutoComplete
                            className="ant-input ant-input-lg input-no-border"
                            size="large"
                            value={skill.name}
                            style={{ width: '100%', paddingLeft: '8px !important'}}
                            dataSource={skillSource.map(renderOption, '_id', 'name')}
                            onSearch={onSkillChanged}
                            onSelect={onSkillSelect}
                            optionLabelProp="text">
                            <Input placeholder="Skill" value={skill.name} className="ant-input ant-input-lg input-no-border" style={{ width: '100%', paddingLeft: '8px !important'}}/>
                        </AutoComplete>
                    </div>
                </div>
            </div>
            <div className="ant-row">
                <div className="ant-col-24 row-no-btm">
                    <div className="ant-row ant-form-item">
                        <Select name="skillLevel"
                                showSearch
                                style={{  width: '100%' }}
                                placeholder="Skill level"
                                optionFilterProp="children"
                                value={(skill.level || skill.level.length > 0)? skill.level : 'Skill level'}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                onChange={onSelectExperienceChanged}>
                            <Option value="Geek">Geek</Option>
                            <Option value="Experienced">Experienced</Option>
                            <Option value="Starter">Starter</Option>
                        </Select>
                    </div>
                </div>
            </div>
            <Row gutter={2}>
                <Col span={11}>
                    <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={() => onSaveSkill(skill)}>
                        Save
                    </button>
                </Col>
                <Col span={1}></Col>
                <Col span={12}>
                    <button className="cancel cancel-padding-2 ant-btn" style={{width: '100%'}} onClick={() => onCancelEditToggle('skills')}>
                        Cancel
                    </button>
                </Col>
            </Row>
        </Row>
        <br/>
    </div>;

class Cr extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            headerHeight: 0,
            iAmTheGeek: false,
            loading: false,
            skill: {level: '', name: '', geekId: ''},
            skills: [],
            language : {name: '', proficiency: ''},
            countries: [],
            currentView: 'Service:1',
            qView: 'app',
            screen: {},
            previewVisible: false,
            previewImage: '',
            qViews: ['app', 'profile'],
            shouldUpdateCategories: false,
            returnServiceView: '',
            skillSource: [],
            graduationYears: [],
            skillClicked: false,
            education: {institution: '', degree: '', course: '', graduationYear: '', country: {_id: '', name: ''}},
            geekSpace: {services: [], crafts: []},
            geek: {id: '', phoneNumberConfirmed: false, isConnected: false,profileImagePath: '', geekName: '', firstName: '', lastName: '', languages: [], name: '', professionalCaption: '', academics:[], dateRegistered: '', summary: '', successfulDealsDelivered: 0, topSpecialties: [], onlineStatus: 0, iAmTheGeek: false, location: {country: 'Not available', ip: '', city: ''}},
            user: {email: '', firstName: '' ,lastName:  '', id: '', role: '', iAmTheGeek: false, name: '', userData: '', geekName: '', geekNameUpper: '', professionalCaption: '', location: {country: 'Not available', ip: '', city: ''}, languages: [], dateRegistered: '', academics: [], onlineStatus: 0, successfulDealsDelivered: 0, phoneNumberConfirmed: false},
            degrees: [{id: 1, name: 'B.ENG'}, {id: 2, name: 'B.TECH'}, {id: 3, name: 'B.A.'}, {id: 4, name: 'BArch'}, {id: 5, name: 'BFA'}, {id: 6, name: 'B.Sc.'}, {id: 7, name: 'M.A.'}, {id: 8, name: 'M.B.A.'}, {id: 9, name: 'Associate'}, {id: 10, name: 'MFA'}, {id: 11, name: 'M.Sc.'}, {id: 12, name: 'Certificate'}, {id: 13, name: 'J.D.'}, {id: 14, name: 'M.D.'}, {id: 15, name: 'Ph.D'}, {id: 16, name: 'LLB'}, {id: 17, name: 'LLM'}],
            services: [],
            file: {},
            crafts: [],
            cropVisible: false,
            service:
            {
                _id: '',
                title: '',
                description:  '',
                rteDescription: RichTextEditor.createEmptyValue(),
                addedBy: '',
                dateProfiled: '',
                lastModified: '',
                lastViewed: '',
                numberOfTimesViewed: 0,
                hasPackages: false,
                techStacks: [],
                requirements: [],
                details: [],
                serviceStatus: 0,
                keywords: [],
                creativeSubCategory: {_id: '', name: ''},
                creativeCategory: {_id: '', name: ''},
                creativeType: {_id: '', name: ''},
                categorySaved: false,
                requirementsSaved: false,
                assetsSaved: false,
                packagesSaved: false,
                metadata:[],
                bannerImage: '',
                packages: [],
                secondImage: '',
                thirdImage: '',
                pdfResource: {name: '', path: ''},
                videoResource: {name: '', path: ''}
            },
            serviceStatusMap:
            {
                basicsProvided: 1,
                categoryProvided: 2,
                assetsProvided: 3,
                packagesProvided: 4,
                published: 5,
                offline: 6
            },
            cropper: null,
            picImg: '',
            disabled: false
        };
        this.toggleEditSkill = this.toggleEditSkill.bind(this);
        this.onDeleteSkill = this.onDeleteSkill.bind(this);
        this.skillChanged = this.skillChanged.bind(this);
        this.selectExperienceChanged = this.selectExperienceChanged.bind(this);
        this.selectExperienceChanged = this.selectExperienceChanged.bind(this);
        this.saveSkill = this.saveSkill.bind(this);
        this.cancelEditToggle = this.cancelEditToggle.bind(this);
        this.cancelEditSkill = this.cancelEditSkill.bind(this);
        this.restoreToggle = this.restoreToggle.bind(this);
        this.cancelToggle = this.cancelToggle.bind(this);
        this.toggleField = this.toggleField.bind(this);
        this.selectChanged = this.selectChanged.bind(this);
        this.textChange = this.textChange.bind(this);
        this.hideMessage = this.hideMessage.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.handleSkillSearch = this.handleSkillSearch.bind(this);
        this.onSkillSelect = this.onSkillSelect.bind(this);
        this.saveGeekNames = this.saveGeekNames.bind(this);
        this.saveProfessionalCaption = this.saveProfessionalCaption.bind(this);
        this.languageChanged = this.languageChanged.bind(this);
        this.proficiencyChanged = this.proficiencyChanged.bind(this);
        this.saveLanguage = this.saveLanguage.bind(this);
        this.saveEducation = this.saveEducation.bind(this);
        this.nestedDataChanged = this.nestedDataChanged.bind(this);
        this.nestedSelectionChanged = this.nestedSelectionChanged.bind(this);
        this.hideAction = this.hideAction.bind(this);
        this.showAction = this.showAction.bind(this);
        this.changeView = this.changeView.bind(this);
        this.addAction = this.addAction.bind(this);
        this.closeAction = this.closeAction.bind(this);
        this.resetService = this.resetService.bind(this);
        this.handleTagAddition = this.handleTagAddition.bind(this);
        this.handleTagDelete = this.handleTagDelete.bind(this);
        this.rteTextChanged = this.rteTextChanged.bind(this);
        this.setBorder = this.setBorder.bind(this);
        this.updateState = this.updateState.bind(this);
        this.showSpinner = this.showSpinner.bind(this);
        this.editService = this.editService.bind(this);
        this.changeQView = this.changeQView.bind(this);
        this.updateView = this.updateView.bind(this);
        this.getGeekInfo = this.getGeekInfo.bind(this);
        this.uploadPic = this.uploadPic.bind(this);
        this.editPic = this.editPic.bind(this);
        this.viewPic = this.viewPic.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.togglePicSelection = this.togglePicSelection.bind(this);
        this.cropCancel = this.cropCancel.bind(this);
        this.acceptImg = this.acceptImg.bind(this);
        this.validateQ = this.validateQ.bind(this);

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    rtMouseEnter()
    {
        let el = document.getElementByClassNames('rtEditor')[0];
        el.style.borderBottom = "2px solid rgb(39, 174, 96) !important;";
    }

    rtMouseLeave()
    {
        let el = document.getElementByClassNames('rtEditor')[0];
        el.style.borderBottom = "1px solid #e0e0e0 !important";
    }

    handleSkillSearch(value)
    {
        this.setState({
            skillSource: value ? searchResult(value) : []
        });
    };

    componentDidMount()
    {
        message.config({
            top: 100,
            duration: 5
        });        

        let el = this;
        let geekName = this.props.location.payload.slug;
        if(geekName === undefined || geekName === null || geekName.length < 1)
        {
            el.showMessage('An unknown error was encountered. Please try again later', -1);
            el.props.go('CRE', 'cre');
        }
        else
         {
            setTimeout(async function()
            {         
                if(el.state.geek.id.length < 1)
                {
                    el.getGeekInfo(geekName);
                }
                else
                 {
                    if(el.state.geek.geekName !== geekName)
                    {
                        el.getGeekInfo(geekName);
                    }
                    else{
                        el.getOthers();
                    }
                }
            }, 700);
        }
    }

    setPeer(payload)
    {
        if((payload.hasOwnProperty('auth') && payload.auth.length > 0 && payload.auth === this.state.geek._id))
        {
            el.setState({geek: {...el.state.geek, isConnected: true}});
        }
    }

    setPeers(peers)
    {
        let el = this;
        if(peers !== undefined && peers !== null && peers.length > 0)
        {
            peers.forEach((s, i) =>
            {
                if((s.hasOwnProperty('auth') && s.auth.length > 0 && s.auth === el.state.geek._id))
                {
                    el.setState({geek: {...el.state.geek, isConnected: true}});
                }
            });
        }
    }

    async getGeekInfo(geekName)
    {
        let el = this;
        if(!geekName || geekName.length < 1)
        {
            el.showMessage('An unknown error was encountered. Please try again later', -1);
            el.props.go('CRE', 'cre');
        }
        else
        {
            let theGeek = await fetchData(`/getGeek?cre=` + geekName);
            if (!theGeek || theGeek.id.length < 1)
            {
                el.props.dispatchAction({ type: 'GEEK_MISS',  payload: {slug: theGeek}});
                el.showMessage('An unknown error was encountered. Please try again later', -1);
                el.props.go('CRE', 'cre');
            }
            else
            {
                el.setState({geek: theGeek});
                if(el.state.geek !== undefined && el.state.geek.id === el.props.user.id)
                {
                    el.setState({
                        iAmTheGeek: true, geek: {...el.state.geek, isConnected: true}
                    });
                }
                el.props.dispatchAction({ type: 'GEEK', payload: {slug: theGeek}});
                let body = JSON.stringify({geekId: theGeek.id, itemsPerPage: 50, searchText:"", page:1, sortField:"lastModified",sortOrder:"desc"});
                let res = await postQuery('/getGeekSpace', body);
                el.props.dispatchAction({ type: 'GEEK_SPACE', payload: {slug: res}});
                el.setState({geekSpace: res});                
                if(el.props.peers !== undefined && el.props.peers !== null && el.props.peers.length > 0)
                {
                    el.setPeers(el.props.peers);
                }

                if(el.props.peer !== undefined && el.props.peer.hasOwnProperty('peer') && el.props.peer.peer.length > 0)
                {
                    el.setPeer(el.props.peer);
                }

                el.getOthers();
            }
        }

    }

    async getOthers()
    {
        // if((this.state.geek.location.country || this.state.geek.location.country.length < 1) && this.state.iAmTheGeek === true)
        // {
        //     if(this.state.geek.location.ip && this.state.geek.location.ip.length > 0)
        //     {
        //         // let geekLocation = await fetchData(`/gl?ip=` + this.state.geek.location.ip);
        //         // let yrf = await fetchExternal(`http://api.ipinfodb.com/v3/ip-city/?key=3fd0b41eb8831956258c68830f27f6c7a751fb7df8c0a1a9b71815ecac0705ca`);
        //         // console.log('geekLocation\n');
        //         // console.log(geekLocation);
        //         // this.setState({location: {}});
        //
        //         // let xhr = new XMLHttpRequest();
        //         // xhr.onreadystatechange = function() {
        //         //     if (xhr.readyState == XMLHttpRequest.DONE) {
        //         //         console.log('xhr.responseText\n');
        //         //         console.log(xhr.responseText);
        //         //     }
        //         // };
        //         // xhr.open('GET', `http://api.ipinfodb.com/v3/ip-city/?key=3fd0b41eb8831956258c68830f27f6c7a751fb7df8c0a1a9b71815ecac0705ca`, true);
        //         // xhr.send(null);
        //
        //     }
        // }

        let skills = await fetchData(`/getAllSkills`);
        let countries = await fetchData('/getAllCountries');
        this.setState({skills: skills, countries: countries});
        let years = [];
        let elYear = new Date().getFullYear();
        for(let i = 1960; i <= elYear; i++)
        {
            years.push(i);
        }
        this.setState({graduationYears: years.sort(function(a, b){return b-a})});
    }

    componentWillReceiveProps(nextProps)
    {
        if(typeof nextProps.user === 'object' && typeof nextProps.user === 'object' && nextProps.user.hasOwnProperty('id') && nextProps.user.id.length > 0)
        {
            if(this.state.geek !== undefined && this.state.geek.id === nextProps.user.id)
            {
                this.setState({
                    iAmTheGeek: true, geek: {...this.state.geek, isConnected: true}
                });
            }
        }

        if(nextProps.peers !== undefined && nextProps.peers.length > 0)
        {
            this.setPeers(nextProps.peers);
        }

        if(nextProps.peer !== undefined && nextProps.peer.hasOwnProperty('peer'))
        {
            this.setPeer(nextProps.peer);
        }

    }

    handleTagDelete (i)
    {
        this.state.service.keywords.splice(i, 1);
    }

    onChange(value)
    {
        this.setState({value});
        if (this.props.onChange) {
            // Send the changes up to the parent component as an HTML string.
            // This is here to demonstrate using `.toString()` but in a real app it
            // would be better to avoid generating a string on each change.
            this.props.onChange(
                value.toString('html')
            );
        }
    };

    async handleTagAddition (tag)
    {
        let sections = this.props.sections;
        let section = sections.find(s => s.name.toLowerCase() === 'services');
        if(!section || section._id.length < 1)
        {
            this.showMessage('An unexpected error was encountered. Please refresh the page and try again', -1);
            return;
        }

        tag.creativeSection = section._id;
        tag.nameUpper = tag.name.toUpperCase().replace(' ', '');
        const keywords = [].concat(this.state.service.keywords, tag);
        this.setState({service: {...this.state.service, keywords} });

    }

    toggleEditSkill (skill)
    {
        if(skill === undefined || skill === null) skill = {level: '', name: '', geekId: ''};
        this.setState({skillClicked: true, skill: skill});
    }

    changeView(target)
    {
        this.setState({currentView: target.key});
        this.resetService();
        let trigger = document.getElementById('trigger');
        if(target.key.indexOf('Deliveries') < 0)
        {
            document.getElementById('pl_' + target.key).style.display = 'block';
            document.getElementById('ed_' + target.key.replace(':1', ':2')).style.display = 'none';
            if(trigger !== undefined && trigger !== null) trigger.style.display = 'block';
        }
    }

    updateView(target)
    {
        this.setState({currentView: target});
        this.resetService();
        let trigger = document.getElementById('trigger');
        document.getElementById('pl_' + target).style.display = 'block';
        document.getElementById('ed_' + target.replace(':1', ':2')).style.display = 'none';
        if(trigger !== undefined && trigger !== null) trigger.style.display = 'block';
    }

    changeQView(target)
    {
        this.setState({qView: target.key});
    }

    showAction(id)
    {
        document.getElementById(id).classList.remove('hide');
        document.getElementById(id).classList.add('mouse-enter');
        document.getElementById(id).classList.remove('mouse-leave');
    }

    hideAction(id)
    {
        document.getElementById(id).classList.remove('mouse-enter');
        document.getElementById(id).classList.add('mouse-leave');
    }

    addAction (currentView)
    {
        this.resetService();
        document.getElementById('pl_' + currentView).style.display = 'none';
        let view = currentView.replace(':1', ':2');
        this.setState({returnServiceView: view, shouldUpdateCategories: true, currentView: view});
        document.getElementById('pl_' + view).style.display = 'none';
        document.getElementById('ed_' + view).style.display = 'block';
        document.getElementById('trigger').style.display = 'none';
    }

    resetService()
    {
        let service =
            {
                _id: '',
                title: '',
                description:  '',
                rteDescription: RichTextEditor.createEmptyValue(),
                addedBy: '',
                dateProfiled: '',
                lastModified: '',
                lastViewed: '',
                numberOfTimesViewed: 0,
                hasPackages: false,
                techStacks: [],
                requirements: [],
                details: [],
                serviceStatus: 0,
                keywords: [],
                creativeSubCategory: {_id: '', name: ''},
                creativeCategory: {_id: '', name: ''},
                creativeType: {_id: '', name: ''},
                categorySaved: false,
                requirementsSaved: false,
                assetsSaved: false,
                packagesSaved: false,
                metadata:[],
                bannerImage: '',
                packages: [],
                secondImage: '',
                thirdImage: '',
                pdfResource: {name: '', path: ''},
                pdfResources: [],
                videoResources: []
            };

       this.setState({service: service, shouldUpdateCategories: false});
    }

    editService(service, returnServiceView)
    {
        this.resetService();
        let trigger = document.getElementById('trigger');
        service.rteDescription = RichTextEditor.createValueFromString(service.description, 'html');
        this.setState({service: service, returnServiceView: returnServiceView, shouldUpdateCategories: true, currentView: returnServiceView});
        document.getElementById('pl_Service:2').style.display = 'none';
        document.getElementById('pl_Service:1').style.display = 'none';
        document.getElementById('ed_' + returnServiceView).style.display = 'block';
        if(trigger !== undefined && trigger !== null) trigger.style.display = 'none';
    }

    validateQ()
    {
       let vl = this.state.geekSpace.services.filter(s => s.serviceStatus < this.state.serviceStatusMap.published);
       return vl.length <= 2;
    }

    closeAction (currentView)
    {
        document.getElementById('pl_' + currentView).style.display = 'block';
        document.getElementById('ed_' + currentView).style.display = 'none';
        let v = this.state.geekSpace.services.filter(s => s.serviceStatus < this.state.serviceStatusMap.published);
        if(v.length < 2)
        {
            document.getElementById('trigger').style.display = 'block';
        }
        this.resetService();
    }

    cancelEditSkill ()
    {
        this.setState({skillClicked: false});
    }
    onDeleteSkill (item)
    {
        this.state.geek.topSpecialties.forEach(function(s, i)
        {
            if(s.id === item.id)
            {
                this.state.geek.topSpecialties.splice(1, i);
            }
        });
    }

    skillChanged (query)
    {
        this.setState({skill: {...this.state.skill, name: query}});
        let skillHits = this.state.skills.filter((s) =>
        {
            if(s.name.toLowerCase().indexOf(query.toLowerCase()) > -1) return s;
        });

        this.setState({skillSource: skillHits});
    }

    onSkillSelect (value)
    {
        this.setState({skill: {...this.state.skill, name: value, skill: value.id}});
    }

    selectExperienceChanged (level)
    {
        this.setState({skill: {...this.state.skill, level: level}});
    }

    showMessage(str, code)
    {
        if(code > 0)
        {
            message.success(str);
            // document.getElementsByClassName('ant-message-notice-content')[0].classList.add('msg-success');
        }
        else
        {
            message.error(str);
            // document.getElementsByClassName('ant-message-notice-content')[0].classList.add('msg-err');
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

    async saveSkill()
    {
        if(this.state.skill.name.length < 1)
        {
            this.showMessage('Skill name is required', -1);
            return;
        }
        if(this.state.skill.level.length < 1)
        {
            this.showMessage('Skill level is required', -1);
            return;
        }

        let skill = this.state.skill;
        skill.geekId = this.state.geek.id;
        let res = {};
        this.showSpinner(true);
        if(skill.skill === undefined || skill.skill === null || skill.skill.length < 1)
        {
            res = await postQuery('/addUserSkill', JSON.stringify(skill));
        }
        else
        {
            res = await postQuery('/updateUserSkill', JSON.stringify(skill));
        }
        this.showSpinner(false);

        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            let geek = this.state.geek;
            geek.topSpecialties = res.specialties;
            this.setState({geek: geek, skill: {level: '', name: '', geekId: ''}, skills: res.skills, skillClicked: false});
        }
    }

    async saveGeekNames()
    {
        if(this.state.geek.firstName.length < 1 || this.state.geek.lastName.length < 1)
        {
            this.showMessage('Your Names are required', -1);
            return;
        }
        let geek = {geekId: this.state.geek.id, firstName: this.state.geek.firstName, lastName: this.state.geek.lastName};

        this.showSpinner(true);
        let res = await postQuery('/saveGeekNames', JSON.stringify(geek));
        this.showSpinner(false);
        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            this.cancelToggle('name');
        }
    }

    async saveProfessionalCaption()
    {
        if(this.state.geek.professionalCaption.length < 1)
        {
            this.showMessage('Your Professional Caption is required', -1);
            return;
        }
        let geek = {geekId: this.state.geek.id, professionalCaption: this.state.geek.professionalCaption};

        this.showSpinner(true);
        let res = await postQuery('/saveProfessionalCaption', JSON.stringify(geek));
        this.showSpinner(false);
        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            this.cancelToggle('professionalCaption');
        }
    }

    async saveLanguage()
    {
        if(this.state.language.proficiency.length < 1 || this.state.language.name.length < 1)
        {
            this.showMessage('Your Language details are required', -1);
            return;
        }
        let language = {geekId: this.state.geek.id, languageProficiency: this.state.language.proficiency, languageName: this.state.language.name};

        this.showSpinner(true);
        let res = await postQuery('/saveLanguage', JSON.stringify(language));
        this.showSpinner(false);
        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            let geek = this.state.geek;
            geek.languages = res.languages;
            this.setState({geek: geek, language : {name: '', proficiency: ''}});
            this.cancelToggle('language');
        }
    }

    async saveEducation()
    {
        if(this.state.education.degree.length < 1  || this.state.education.country.length < 1|| this.state.education.course.length < 1 || this.state.education.graduationYear.length < 1 || this.state.education.institution.length < 1)
        {
            this.showMessage('All Your Academic Qualification details are required', -1);
            return;
        }

        let education = {id: this.state.education._id, geek: this.state.geek.id, country: this.state.education.country,  degree: this.state.education.degree, course: this.state.education.course, graduationYear: this.state.education.graduationYear, institution: this.state.education.institution};

        let res = '';
        this.showSpinner(true);
        if(this.state.education._id === undefined || this.state.education._id === null || this.state.education._id.length < 1)
        {
            res = await postQuery('/addEducation', JSON.stringify(education));
        }
        else
        {
            res = await postQuery('/updateEducation', JSON.stringify(education));
        }
        this.showSpinner(false);
        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            let geek = this.state.geek;
            geek.academics = res.academics;
            this.setState( {geek: geek, education: {institution: '', degree: '', course: '', graduationYear: '', country: {_id: '', name: ''}}});
            this.cancelToggle('education');
        }
    }

    async saveSummary()
    {
        if(this.state.geek.summary.length < 1)
        {
            this.showMessage('Your Professional Summary is required', -1);
            return;
        }

        let geek = {geekId: this.state.geek.id, summary: this.state.geek.summary};
        this.showSpinner(true);
        let res = await postQuery('/saveSummary', JSON.stringify(geek));
        this.showSpinner(false);
        this.showMessage(res.message, res.code);
        if(res.code > 0)
        {
            this.cancelToggle('summary');
        }
    }

    languageChanged(e)
    {
        let val = e.target.value;
        let geek = this.state.geek;
        geek.language.name = val;
        this.setState({geek: geek});
    }

    proficiencyChanged (proficiency)
    {
        let geek = this.state.geek;
        geek.language.proficiency = proficiency;
        this.setState({geek: geek});
    }

    textChange(e)
    {
        let val = e.target.value;
        if(e.target.name === 'geekName')
        {
            val = e.target.value.replace(' ', '');
        }
        let geek = this.state.geek;
        geek[e.target.name] = val;
        this.setState({geek: geek});
    }

    nestedDataChanged(prop, feature, e, innerFeature)
    {
        if(innerFeature !== undefined && innerFeature !== null && innerFeature.length > 0)
        {
            let stateObj = this.state[prop];
            stateObj[feature][innerFeature] = e.target.value;
            this.setState({[prop]: stateObj});
        }
        else
        {
            this.setState({[prop]: {...this.state[prop], [feature]: e.target.value}});
        }

    }

    nestedSelectionChanged(prop, feature, val, innerFeature)
    {
        if(innerFeature !== undefined && innerFeature !== null && innerFeature.length > 0)
        {
            let stateObj = this.state[prop];
            stateObj[feature][innerFeature] = val;
            this.setState({[prop]: stateObj});
        }
        else
        {
            this.setState({[prop]: {...this.state[prop], [feature]: val}});
        }
    }

    updateState(prop, feature)
    {
        this.setState({[prop]: feature});
    }

    selectChanged(item)
    {

    }

    cancelEditToggle(item)
    {
        item.editClicked = false;
    }

    toggleField(ref, obj)
    {
        if(obj !== undefined && obj !== null)
        {
            this.setState({[ref]: obj});
        }
        document.getElementById('pl_' + ref).style.display = 'none';
        document.getElementById('ed_' + ref).style.display = 'block';
        let actionGroup = document.getElementById('aGroup_' + ref);
        if(actionGroup !== undefined && actionGroup !== null)
        {
            actionGroup.style.display = 'none';
        }
    }

    restoreToggle(ref)
    {
        document.getElementById('pl_' + ref).style.display = 'block';
        document.getElementById('ed_' + ref).style.display = 'none';
    }

    cancelToggle(ref)
    {
        document.getElementById('pl_' + ref).style.display = 'block';
        document.getElementById('ed_' + ref).style.display = 'none';
        let actionGroup = document.getElementById('aGroup_' + ref);
        if(actionGroup !== undefined && actionGroup !== null)
        {
            actionGroup.style.display = 'block';
        }
    }

    rteTextChanged(val)
    {
        document.getElementsByTagName('')
        this.setState({service: {...this.state.service, rteDescription: val}});
    }

    setBorder()
    {
        let rte = document.getElementsByClassName('rtEditor')[0];
        if(rte !== undefined && rte !== null)
        {
            rte.style.borderBottom = '1px solid rgb(39, 174, 96) !important';
        }
    }

    componentWillUnmount()
    {

    }

    togglePicSelection()
    {
        document.getElementById("profilePic").value = "";
        document.getElementById('profilePic').click();
    }

    editPic(e)
    {
        e.preventDefault();
        let el = this;
        let reader = new FileReader();
        let file = e.target.files[0];
        let img = new Image();
        let _URL = window.URL || window.webkitURL;
        img.src = _URL.createObjectURL(file);

        if(file.size > this.state.maxPicSize)
        {
            this.props.showMessage('Photo size should not exceed 1.5MB', -1);
            return;
        }
        img.onload = function ()
        {
            reader.onloadend = () =>
            {
                el.setState({
                    picImg: reader.result,
                    cropVisible: true,
                });

                if(el.state.cropper !==  undefined && el.state.cropper !== null)
                {
                    el.state.cropper.destroy();
                }

                let image = document.getElementById('image');
                let cropper = new Cropper(image,
                    {
                        viewMode: 3,
                        dragMode: 'move',
                        autoCropArea: 1,
                        aspectRatio: 1,
                        center: true,
                        rotatable: true,
                        restore: true,
                        modal: true,
                        guides: true,
                        highlight: false,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: false,
                    });

                el.setState({cropper: cropper, file: file});
            };
            reader.readAsDataURL(file);
        };

    }

    handleCancel() {this.setState({previewVisible: false, previewImage: ''})}
    cropCancel() {
        this.setState({cropVisible: false, picImg: '', disabled: false});
        document.getElementById("profilePic").value = "";
        this.state.cropper.destroy();
    }

    viewPic(url){
        this.setState({
            previewImage: url,
            previewVisible: true,
        });
    }

    uploadPic()
    {
        if (this.state.file && this.state.file.size && this.state.file.size > 0)
        {
            let el = this;
            el.setState({disabled: true});
            let xhr = new XMLHttpRequest();
            // Upload cropped image to server if the browser supports `HTMLCanvasElement.toBlob`
            this.state.cropper.getCroppedCanvas().toBlob((blob) =>
            {
                const formData = new FormData();
                formData.append('file', blob);

                xhr.open("POST", '/uploadPic?uploadPath=' + el.state.geek.geekNameUpper + '&geek=' + el.state.geek.id, true);
                xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
                xhr.onerror = function(e)
                {
                    el.setState({disabled: false});
                    el.props.showMessage('An unknown error was encountered. Please refresh the page and try again', -1);
                };
                xhr.onload = function()
                {
                    el.showSpinner(false);
                    let res = (JSON.parse(xhr.response));
                    if(res.code > 0)
                    {
                        let geek = el.state.geek;
                        geek.profileImagePath = res.filePath;
                        el.setState({geek: geek, disabled: false});
                        el.props.dispatchAction({ type: 'GEEK', payload: {slug: geek}});
                        let user = el.props.user;
                        user.profileImagePath = res.filePath;
                        el.setState({user: user});
                        el.props.dispatchAction({ type: 'USER', payload: user});
                        el.state.cropper.destroy();
                    }
                    else
                    {
                        el.setState({disabled: false});
                        el.showMessage(res.message, -1);
                    }
                };

                // formData.append('file', file);
                el.showSpinner(true);
                xhr.send(formData);

            });
        }
        else
        {
            this.showMessage('No files selected', -1);
        }
    };

    acceptImg()
    {
        this.state.cropper.crop();
        let geek = this.state.geek;
        geek.profileImagePath = this.state.cropper.getCroppedCanvas().toDataURL();
        this.setState({geek: geek, cropVisible: false});
        this.uploadPic();
    }

    render()
    {
         const {geekName, firstName, lastName, languages, name, professionalCaption, emailConfirmed, academics, dateRegistered, summary, successfulDealsDelivered, topSpecialties, onlineStatus, profileImagePath, isConnected, geekNameUpper} = this.state.geek;
         const {skill, skillClicked, skillSource, education, language, currentView, service, serviceStatusMap, returnServiceView, shouldUpdateCategories, qView, iAmTheGeek, previewVisible, cropVisible, picImg, disabled} = this.state;
         const {sections, dispatchAction} = this.props;
         const smallScreen = (this.props.screen !== undefined && this.props.screen !== null && !this.props.screen.mql.matches);

        let hasPrevLocation = this.props.location.prev !== undefined && this.props.location.prev !== null && this.props.location.prev.pathname.length > 0;
        let prev = this.props.location.routesMap[this.props.location.prev.type];
        let ff = this.props.location.routesMap[this.props.location.type];
        let v = [];
        if(this.state.geekSpace && this.state.geekSpace.services)
        {
            v = this.state.geekSpace.services.filter(s => s.serviceStatus < serviceStatusMap.published);
        }

        let vv = v.length >= 2;

        const ac = <nav className="ed_nav" style={{paddingLeft: '20px', paddingTop: '30px'}}>
            <ul className="actionList">
                {(!profileImagePath || profileImagePath.length < 1)? '' : <li style={{marginBottom: '3px'}}>
                    <a className="appAnchor" onClick={() => this.viewPic(profileImagePath)} style={{cursor: "pointer", fontSize: '14px !important'}} title="view image">
                        <i className="anticon anticon-eye-o iStack" style={{cursor: "pointer"}}></i>
                        &nbsp;
                        view
                    </a>
                </li>}

                {(iAmTheGeek === true)?  <li>
                    <a onClick={this.togglePicSelection} style={{cursor: "pointer", fontSize: '14px !important'}} title="change image">
                        <i className="anticon anticon-camera-o iStack" style={{cursor: "pointer"}}></i>
                        &nbsp;
                        change
                    </a>
                </li> : ''}
            </ul>
        </nav>;
        let srs = 0;
        let srs2 = 0;
        if(this.state.geekSpace.services !== undefined  && this.state.geekSpace.services !== null && this.state.geekSpace.services.length > 0)
        {
            let uu = this.state.geekSpace.services.filter(s => s.serviceStatus >= serviceStatusMap.published);
            srs = uu.length;

            let uu2 = this.state.geekSpace.services.filter(s => s.serviceStatus < serviceStatusMap.published);
            srs2 = uu2.length;
        }

        return(
            <Row className="main-content" id="mainContent">
                <Row id="msg" style={{width: '100%', margin: '1px', display: 'none'}}>
                    <label id="ms">
                        {this.state.message}
                    </label>
                    <br/><br/>
                </Row>
                <Row style={{paddingLeft: '15px', paddingRight: '8px', marginBottom: '5px'}}>
                    <Col span={24}>
                        <span style={{color: 'rgba(0, 0, 0, 0.65)', paddingLeft: '8px'}}>
                            { hasPrevLocation && <NavLink className="appAnchor" to={this.props.location.prev.pathname}>{prev.display}</NavLink>}
                            { hasPrevLocation && <span>&nbsp;>&nbsp;</span>}
                            <NavLink className="appAnchor" exact to={this.props.location.pathname}>{ff.display}</NavLink>
                        </span>
                    </Col>
                </Row>
                <Row style={{padding: '2%', marginBottom: '20px !important'}}>
                    <Col span={24} style={{marginBottom: '0 !important', display: smallScreen ? 'block' : 'none'}}>
                        <Row>
                            <Menu className="q-view" onClick={this.changeQView} selectedKeys={[qView]} mode="horizontal">
                                <Menu.Item key="profile" title="Profile">
                                    <Icon className="sectIcon" type="idcard"/>
                                </Menu.Item>
                                <Menu.Item key="app" title="Activities">
                                    <Icon className="sectIcon" type="appstore"/>
                                </Menu.Item>
                            </Menu>
                        </Row>
                    </Col>
                    <Col id="profile" xs={24} sm={24} md={smallScreen? 24 : 8} lg={smallScreen? 24 : 8} style={{marginBottom: '20px', display: (smallScreen && qView === 'profile')? 'block' : !smallScreen? 'block' : 'none'}}>
                        <Row style={{border: smallScreen? '0' : '1px solid #ddd', marginBottom:'30px'}}>
                            <Card bodyStyle={{ padding: 0 }}>
                                <div className="profileHeader" style={{backgroundColor: 'transparent !important'}}>
                                    <label style={{float: 'right', zIndex: '3', right: '20px', position: 'absolute', marginTop : '-1px'}}>{(isConnected !== undefined && isConnected !== null && isConnected > 0)? <span className="status-indicator"><i className="fa fa-circle"></i>Online</span> : <span style={{color: '#FF9800', fontSize: '16px'}}>Offline</span>}</label>
                                    <div style={{width: '100%', textAlign: 'center'}}>
                                        <div style={{marginTop: '20px', width: '100%'}}>
                                            {(!profileImagePath || profileImagePath.length < 1)?

                                                <span className="ant-avatar dfs divTera avatera ant-avatar-circle ant-avatar-icon">
                                                    {ac}
                                                   <i className="anticon anticon-user"></i>
                                                </span> :
                                                <span className="ant-avatar dfs divTera ant-avatar-circle ant-avatar-icon">
                                                    {ac}
                                                    <img id="pic"  alt="Profile image" src={profileImagePath}/>
                                                </span>
                                                }
                                            </div>
                                            <input id="profilePic"  onChange = {(e) => this.editPic(e)}  type="file" accept=".png, .jpg, .jpeg" style={{display: "none"}}/>
                                            <Modal className='ggt' visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                                <img alt="example" style={{ width: '100%' }} src={profileImagePath} />
                                            </Modal>
                                            <Modal className='ggt' visible={cropVisible} footer={null} onCancel={this.cropCancel}>
                                                <Row gutter={2}>
                                                    <Col span={24}>
                                                        <img id="image" alt="example" style={{ width: '70%', height: '70%' }} src={picImg} />
                                                    </Col>
                                                </Row>
                                                <br/>
                                                <Row gutter={2}>
                                                    <Col span={10}>
                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%', disabled: disabled}} onClick={this.acceptImg}>
                                                            Accept
                                                        </button>
                                                    </Col>
                                                    <Col span={4} style={{textAlign: 'center'}}>
                                                        <a onClick={this.togglePicSelection} style={{cursor: "pointer", fontSize: '14px !important'}} title="change image">
                                                            <i className="anticon anticon-camera" style={{color: '#303030', fontSize: '30px',cursor: "pointer"}}></i>
                                                        </a>
                                                    </Col>
                                                    <Col span={10}>
                                                        <button className="cancel cancel-padding-2 ant-btn" style={{width: '100%'}} onClick={this.cropCancel}>
                                                            Cancel
                                                        </button>
                                                    </Col>
                                                </Row>
                                            </Modal>
                                    </div>
                                </div>
                                <br/>
                                <div className="custom-card">
                                    <div style={{paddingLeft: '10px', paddingRight: '10px', paddingBottom: '2px'}}>
                                        <Row>
                                            <Row id="pl_name">
                                                <div className="ant-row custom-card" id="pl_name">
                                                    <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                        <div className="ant-row ant-form-item-x" style={{textAlign: 'center'}}>
                                                            <label style={{fontSize: '15px', fontWeight: 'bold'}}>{(geekName && geekName.length > 0 ) ? geekName : 'User Name not provided'}</label>
                                                        </div>
                                                    </div>
                                                    {(iAmTheGeek === true)? <div className="ant-col-1">
                                                        <button title="Edit" aria-label="Edit" className="ant-modal-close" onClick={() => this.toggleField('name')}>
                                                            <i className="anticon anticon-edit" style={{fontSize: '17px', fontWeight: 'bold'}}></i>
                                                        </button>
                                                    </div> : ''}
                                                </div>
                                            </Row>
                                            {(iAmTheGeek === true)? <div className="ant-row" id="ed_name" style={{display: 'none', marginBottom: '17px'}}>
                                                <div className="ant-row">
                                                    <div className="ant-col-24 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <input onChange={this.textChange} name="firstName" type="text" required className="ant-input ant-input-lg input-no-border" placeholder="First Name *" value={firstName}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ant-row">
                                                    <div className="ant-col-24 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <input onChange={this.textChange} name="lastName" type="text" required className="ant-input ant-input-lg input-no-border" placeholder="Last Name *" value={lastName}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Row gutter={2}>
                                                    <Col span={11}>
                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={() => this.saveGeekNames()}>
                                                            Save
                                                        </button>
                                                    </Col>
                                                    <Col span={1}></Col>
                                                    <Col span={12}>
                                                        <button className="cancel cancel-padding-2 ant-btn" style={{width: '100%'}} onClick={() => this.cancelToggle('name')}>
                                                            Cancel
                                                        </button>
                                                    </Col>
                                                </Row>
                                            </div> : ''}
                                        </Row>
                                        <Row style={{marginTop: '5px'}}>
                                            <div className="ant-row custom-card" id="pl_professionalCaption">
                                                <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                    <div className="ant-row ant-form-item-x" style={{textAlign: 'center', marginBottom: '10px !important'}}>
                                                        <label style={{fontSize: '15px'}}>{professionalCaption && professionalCaption? professionalCaption : 'Your Professional Caption'}</label>
                                                    </div>
                                                </div>
                                                {(iAmTheGeek === true)?  <div className="ant-col-1">
                                                    <button title="Edit" aria-label="Edit" className="ant-modal-close" onClick={() => this.toggleField('professionalCaption')}>
                                                        <i className="anticon anticon-edit" style={{fontSize: '17px', fontWeight: 'bold'}}></i>
                                                    </button>
                                                </div> : ''}
                                            </div>
                                            {(iAmTheGeek === true)? <div className="ant-row" id="ed_professionalCaption" style={{display: 'none', marginBottom: '17px'}}>
                                                <div className="ant-row">
                                                    <div className="ant-col-24 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <input onChange={this.textChange} name="professionalCaption" type="text" required className="ant-input ant-input-lg input-no-border" placeholder="Professional Caption (Eg. UI/UX Engineer) *" value={professionalCaption}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Row gutter={2}>
                                                    <Col span={11}>
                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={() => this.saveProfessionalCaption()}>
                                                            Save
                                                        </button>
                                                    </Col>
                                                    <Col span={1}></Col>
                                                    <Col span={12}>
                                                        <button className="cancel cancel-padding-2 ant-btn" style={{width: '100%'}} onClick={() => this.cancelToggle('professionalCaption')}>
                                                            Cancel
                                                        </button>
                                                    </Col>
                                                </Row>
                                            </div> : ''}
                                        </Row>
                                        <Row style={{borderBottom: '1px solid #e0e0e0', marginTop: '5px', marginBottom: '10px'}}>
                                            <div className="ant-row custom-card" id="pl_professionalCaption">
                                                <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                    <div className="ant-row ant-form-item-x" style={{textAlign: 'center', marginBottom: '10px !important'}}>
                                                        <i style={{fontSize: '14px', marginLeft: '-40px'}} className="material-icons">place</i><label style={{fontWeight: 'bold'}}>{this.state.geek.location.country} </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </Row>
                                        <br/>
                                        <Row>
                                            <Col xs={24} sm={24} md={24} lg={24} style={{marginTop: '10px'}}>
                                                Joined on:  <label style={{float: 'right', fontWeight: 'bold'}}>{dateRegistered}</label>
                                            </Col>
                                        </Row>
                                        <br/>
                                        <Row>
                                            <Col xs={24} sm={24} md={24} lg={24}>
                                                Deals completed:  <label style={{float: 'right', fontWeight: 'bold'}}>{successfulDealsDelivered}</label>
                                            </Col>
                                        </Row>
                                        <br/>
                                        <Row>
                                            <Col xs={24} sm={24} md={24} lg={24}>
                                                Account:  <label style={{float: 'right', fontWeight: 'bold'}}>{emailConfirmed !== undefined && emailConfirmed !== null && emailConfirmed === true? <span style={{color: '#21ba45', fontWeight: 'bold'}}>Verified</span> : <span style={{color: '#FF5722', fontWeight: 'bold'}}>Unverified</span>}</label>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Card>
                        </Row>
                        <Row style={{border: '1px solid #ddd'}}>
                            <Card bodyStyle={{ padding: 0 }}>
                                <div className="custom-card">
                                    <div style={{paddingLeft: '10px', paddingRight: '10px', paddingBottom: '2px'}}>
                                        <br/>
                                        <Row style={{borderBottom: '1px solid #e0e0e0'}}>
                                            <Row style={{marginBottom: '12px'}}>
                                                <Col span={20}>
                                                    <label style={{fontWeight: '700'}}> Language(s)</label>
                                                </Col>
                                                {(iAmTheGeek === true) ?  <Col span={4} id="aGroup_language">
                                                    <a style={{color: '#21ba45'}} onClick={() => this.toggleField('language')}>
                                                        <i className="anticon anticon-plus" style={{fontSize: '17px', fontWeight: 'bold', position: 'absolute', color: '#21ba45'}}></i>
                                                        &nbsp; &nbsp;
                                                        Add
                                                    </a>
                                                </Col> : ''}
                                            </Row>
                                            <Row id="pl_language">
                                                {languages.map(ln =>
                                                    <Row key={ln.name} style={{listStyle: 'none', padding: '2px', marginBottom: '10px'}}>
                                                        <Col span={20}>
                                                            <label  style={{fontSize: '15px'}}>{ln.name + ' (' + ln.proficiency + ')'}</label>
                                                        </Col>
                                                        {(iAmTheGeek === true)? <Col span={4}>
                                                            <button title="cancel" aria-label="Close" className="ant-modal-close" onClick={() => this.toggleField('language', ln)}>
                                                               <i className="anticon anticon-edit" style={{fontSize: '17px', fontWeight: 'bold'}}></i>
                                                            </button>
                                                        </Col> : ''}
                                                    </Row>
                                                )}

                                            </Row>
                                            <br/>
                                            {(iAmTheGeek === true)? <Row id="ed_language" style={{display: 'none', marginBottom: '22px'}}>
                                                <Row>
                                                    <Col span="24">
                                                        <input onChange={(e) => this.nestedDataChanged('language', 'name', e)} name="languageName" type="text" required className="ant-input ant-input-lg input-no-border" placeholder="Your language" value={language.name}/>
                                                    </Col>
                                                </Row>
                                                <br/>
                                                <Row>
                                                    <Col span="24">
                                                        <Select name="education"
                                                                showSearch
                                                                style={{width: '100%'}}
                                                                placeholder="Proficiency *"
                                                                optionFilterProp="children"
                                                                value={(language.proficiency || language.proficiency.length > 0)? language.proficiency : 'Proficiency *'}
                                                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                                onChange={(val) => this.nestedSelectionChanged('language', 'proficiency', val )}>
                                                            <Option value="Native/Bi-lingual">Native or Bi-lingual</Option>
                                                            <Option value="Fluent">Fluent</Option>
                                                            <Option value="Conversational">Conversational</Option>
                                                            <Option value="Basic">Basic</Option>
                                                        </Select>
                                                    </Col>
                                                </Row>
                                                <br/>
                                                <Row gutter={2}>
                                                    <Col span={11}>
                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={() => this.saveLanguage()}>
                                                            Save
                                                        </button>
                                                    </Col>
                                                    <Col span={1}></Col>
                                                    <Col span={12}>
                                                        <button className="cancel cancel-padding-2 ant-btn" style={{width: '100%'}} onClick={() => this.cancelToggle('language')}>
                                                            Cancel
                                                        </button>
                                                    </Col>
                                                </Row>
                                            </Row> : ''}
                                        </Row>
                                        <br/>
                                        <Row style={{borderBottom: '1px solid #e0e0e0'}}>
                                            <Row>
                                                <Col span={24}>
                                                    <label style={{fontWeight: '700'}}>Professional Summary (200 characters)</label>
                                                </Col>
                                            </Row>
                                            <br/>
                                            <div className="ant-row custom-card" id="pl_summary">
                                                <div className="ant-col-23 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                                    <div className="ant-row ant-form-item" style={{marginBottom: '10px !important'}}>
                                                        <p style={{wordWrap: 'break-word', fontSize: '15px'}}>{summary && summary.length > 0? summary : 'Your professional Summary'}</p>
                                                    </div>
                                                </div>
                                                {(iAmTheGeek === true)? <div className="ant-col-1">
                                                    <button title="cancel" aria-label="Close" className="ant-modal-close" onClick={() => this.toggleField('summary')}>
                                                        <i className="anticon anticon-edit" style={{fontSize: '17px', fontWeight: 'bold'}}></i>
                                                    </button>
                                                </div> : ''}
                                            </div>
                                            {(iAmTheGeek === true)? <div className="ant-row" id="ed_summary" style={{display: 'none', marginBottom: '20px'}}>
                                                <div className="ant-row">
                                                    <div className="ant-col-24 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <textarea style={{width: '100%', height: '140px', border: '#e0e0e0 1px solid'}} maxLength="200" minLength="150" onChange={this.textChange} name="summary" className="input-no-border" placeholder="Your professional Summary *" value={summary}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Row gutter={2}>
                                                    <Col span={11}>
                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={() => this.saveSummary()}>
                                                            Save
                                                        </button>
                                                    </Col>
                                                    <Col span={1}></Col>
                                                    <Col span={12}>
                                                        <button className="cancel cancel-padding-2 ant-btn" style={{width: '100%'}} onClick={() => this.cancelToggle('summary')}>
                                                            Cancel
                                                        </button>
                                                    </Col>
                                                </Row>
                                            </div> : ''}
                                        </Row>
                                        <br/>
                                        <Ul iAmTheGeek = {iAmTheGeek} list={topSpecialties} skillSource ={skillSource} onSkillSelect={this.onSkillSelect} onToggleEditSkill={this.toggleEditSkill} onDeleteSkill={this.onDeleteSkill} onSkillChanged={this.skillChanged} onSelectExperienceChanged={this.selectExperienceChanged} onSaveSkill={this.saveSkill} onCancelEditToggle={this.cancelEditSkill} skill = {skill} skillClicked = {skillClicked} showAction = {this.showAction} hideAction = {this.hideAction}/>
                                        <br/>
                                        <Row style={{borderBottom: '1px solid #e0e0e0'}}>
                                            <Row style={{marginBottom: '12px'}}>
                                                <Col span={20}>
                                                    <label style={{fontWeight: '700'}}> Academic Qualification(s)</label>
                                                </Col>
                                                {(iAmTheGeek === true)? <Col span={4} id="aGroup_education">
                                                    <a style={{color: '#21ba45'}} onClick={() => this.toggleField('education')}>
                                                        <i className="anticon anticon-plus" style={{fontSize: '17px', fontWeight: 'bold', position: 'absolute', color: '#21ba45'}}></i>
                                                        &nbsp; &nbsp;
                                                        Add
                                                    </a>
                                                </Col> : ''}
                                            </Row>
                                            <Row id="pl_education">
                                                {academics.map(ed =>
                                                    <Row key={ed.degree} style={{listStyle: 'none', padding: '2px', marginBottom: '10px'}}>
                                                        <Col span={20}>
                                                            <label style={{fontSize: '15px'}}>{ed.degree + ' (' + ed.course + ')'}</label><label>{': ' + ed.institution + ', ' + ed.country.name + ', ' + ed.graduationYear}</label>
                                                        </Col>
                                                        {(iAmTheGeek === true)? <Col span={4}>
                                                            <button title="cancel" aria-label="Close" className="ant-modal-close" onClick={() => this.toggleField('education', ed)}>
                                                                <i className="anticon anticon-edit" style={{fontSize: '17px', fontWeight: 'bold'}}></i>
                                                            </button>
                                                        </Col> : ''}
                                                    </Row>
                                                )}
                                            </Row>
                                            <br/>
                                            {(iAmTheGeek === true)? <Row id="ed_education" style={{display: 'none', marginBottom: '22px'}}>
                                                <div className="ant-row">
                                                    <div className="ant-col-24 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <input onChange={(e) => this.nestedDataChanged('education', 'institution', e)} name="educationSchoolName" type="text" required className="ant-input ant-input-lg input-no-border" placeholder="Institution *" value={education.institution}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ant-row">
                                                    <div className="ant-col-24 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <input onChange={(e) => this.nestedDataChanged('education', 'course', e)} name="course" type="text" required className="ant-input ant-input-lg input-no-border" placeholder="course *" value={education.course}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ant-row">
                                                    <div className="ant-col-10 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <Select name="education"
                                                                    showSearch
                                                                    style={{width: '100%'}}
                                                                    placeholder="Title *"
                                                                    optionFilterProp="children"
                                                                    value={(education.degree || education.degree.length > 0)? education.degree : 'Title *'}
                                                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                                    onChange={(val) => this.nestedSelectionChanged('education', 'degree', val)}>
                                                                {this.state.degrees.map(degree => <Option value={degree.name} key={degree.id}>{degree.name}</Option>)}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="ant-col-14 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <Select name="education"
                                                                    style={{width: '100%'}}
                                                                    placeholder="Year obtained *"
                                                                    optionFilterProp="children"
                                                                    value={(education.graduationYear || education.graduationYear.length > 0)? education.graduationYear : 'Year obtained *'}
                                                                    onChange={(val) => this.nestedSelectionChanged('education', 'graduationYear', val)}>
                                                                {this.state.graduationYears.map(year => <Option value={year} key={year}>{year}</Option>)}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ant-row">
                                                    <div className="ant-col-24 row-no-btm">
                                                        <div className="ant-row ant-form-item">
                                                            <Select name="education"
                                                                    showSearch
                                                                    style={{width: '100%'}}
                                                                    placeholder="Country *"
                                                                    optionFilterProp="children"
                                                                    value={(education.country !== undefined && education.country._id.length > 0)? education.country._id : 'Country *'}
                                                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                                    onChange={(val) => this.nestedSelectionChanged('education', 'country', val, '_id')}>
                                                                {this.state.countries.map(cn => <Option value={cn._id} key={cn._id}>{cn.name}</Option>)}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Row gutter={2}>
                                                    <Col span={11}>
                                                        <button className="join-us join-us-padding-2 ant-btn search-btn ant-btn-primary ant-btn-lg" style={{width: '100%'}} onClick={() => this.saveEducation()}>
                                                            Save
                                                        </button>
                                                    </Col>
                                                    <Col span={1}></Col>
                                                    <Col span={12}>
                                                        <button className="cancel cancel-padding-2 ant-btn" style={{width: '100%'}} onClick={() => this.cancelToggle('education')}>
                                                            Cancel
                                                        </button>
                                                    </Col>
                                                </Row>
                                            </Row> : ''}
                                        </Row>
                                        <br/>
                                    </div>
                                </div>
                            </Card>
                        </Row>
                    </Col>
                    <Col md={smallScreen? 0 : 1} lg={smallScreen? 0 : 1}></Col>
                    <Col key="app" xs={24} sm={24} md={smallScreen? 24 : 15} lg={smallScreen? 24 : 15} style={{marginBottom: '20px', paddingRight: smallScreen? '0' : '1%', display: (smallScreen && qView === 'app')? 'block' : !smallScreen? 'block' : 'none', border: '1px solid rgb(221, 221, 221)'}}>
                        <Card bodyStyle={{ padding: 0 }} className="split">
                            {(iAmTheGeek === true)?
                                <Menu className={smallScreen?'smallScreen' : "abilityMenu"} id="accessMenu" onClick={this.changeView} selectedKeys={[currentView]} mode="horizontal">
                                    <SubMenu title={<span className="access-menu-item">Services</span>}>
                                        <Menu.Item style={{fontSize: '15px !important'}} key="Service:1">Active Services</Menu.Item>
                                        <Menu.Item style={{fontSize: '15px !important'}} key="Service:2">Service Drafts</Menu.Item>
                                    </SubMenu>
                                    <SubMenu title={<span className="access-menu-item">Handcrafts</span>}>
                                        <Menu.Item style={{fontSize: '15px !important'}} key="Craft:1">Active Handcrafts</Menu.Item>
                                        <Menu.Item style={{fontSize: '15px !important'}} key="Craft:2">Handcraft Drafts</Menu.Item>
                                    </SubMenu>
                                    <Menu.Item key="Deliveries" className="access-menu-item" style={{fontSize: '15px !important'}}>
                                        Deliveries
                                    </Menu.Item>
                                </Menu>
                                :
                                <Menu className={smallScreen?'smallScreen' : "abilityMenu"} id="accessMenu" onClick={this.changeView} selectedKeys={[currentView]} mode="horizontal">
                                    <Menu.Item className="access-menu-item"  style={{fontSize: '15px !important'}} key="Service:1">
                                        Services
                                    </Menu.Item>
                                    <Menu.Item className="access-menu-item"  style={{fontSize: '15px !important'}} key="Craft:1">
                                        Handcrafts
                                    </Menu.Item>
                                    <Menu.Item key="Deliveries" className="access-menu-item" style={{fontSize: '15px !important'}}>
                                        Deliveries
                                    </Menu.Item>
                                </Menu>
                            }
                            <div className="ant-row" style={{display: currentView === 'Service:1'? 'block' : 'none'}}>
                                {/* {(iAmTheGeek === true)?
                                    <Row>
                                        <Col style={{paddingLeft: '25px'}}>
                                            <h3 style={{color: '#07c', fontWeight: 'bold', fontSize: '12px'}}>
                                                ::Active Services
                                            </h3>
                                        </Col>
                                    </Row>
                                    : ''} */}
                                    <Row>
                                        <Col style={{paddingLeft: '25px'}}>
                                        </Col>
                                    </Row>
                                <Row gutter={2} id="pl_Service:1">
                                    {this.state.geekSpace.services && this.state.geekSpace.services.map(s => s.serviceStatus >= serviceStatusMap.published &&
                                        <Col key={s._id} xs={24} sm={12} md={8} lg={8} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                            <Card className="ant-card-body pfs s-list">
                                                <div className="custom-image">
                                                    <nav className="ed_nav">
                                                        <ul className="actionList">
                                                            {iAmTheGeek === true?
                                                                <li style={{marginBottom: '3px'}}>
                                                                    <a style={{cursor: "pointer", fontSize: '14px !important'}} title="Statistics">
                                                                        <i className="anticon anticon-line-chart iStack"></i>
                                                                        &nbsp;
                                                                        Statistics
                                                                    </a>
                                                                </li>
                                                                :
                                                                ''}
                                                            <li style={{marginBottom: '3px'}}>
                                                                <a style={{cursor: "pointer", fontSize: '14px !important'}} title="Ratings & reviews">
                                                                    <i className="anticon anticon-star-o iStack"></i>
                                                                    &nbsp;
                                                                    Ratings
                                                                </a>
                                                            </li>
                                                            <li style={{marginBottom: '3px'}}>
                                                                <NavLink style={{cursor: "pointer", fontSize: '14px !important'}} title="View service" className="appAnchor" to={`/service/${s._id}`}>
                                                                    <i className="anticon anticon-eye-o iStack"></i>
                                                                    &nbsp;
                                                                    View
                                                                </NavLink>
                                                            </li>
                                                            {
                                                                (iAmTheGeek === true)? <li>
                                                                    <a onClick={() => this.editService(s, 'Service:2')} style={{cursor: "pointer", fontSize: '14px !important'}} title="Update service">
                                                                        <i className="anticon anticon-edit iStack"></i>
                                                                        &nbsp;
                                                                        Update
                                                                    </a>
                                                                </li>
                                                                    : ''
                                                            }
                                                        </ul>
                                                    </nav>
                                                    <img alt={s.title} width="100%" src={s.bannerImage} />
                                                </div>
                                                <div className="custom-card">
                                                    <h3>{s.title}</h3>
                                                </div>
                                            </Card>
                                        </Col>)}

                                    {srs < 1 &&
                                    <Col space={24} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }} className="item-card pfs">
                                            <div className="custom-card">
                                                <h3>
                                                    Service list is empty <br/>
                                                    {(iAmTheGeek === true)?
                                                        "Use the 'Add button' to profile a new service"
                                                        : ''}
                                                </h3>
                                            </div>
                                        </Card>
                                    </Col>}
                                </Row>


                            </div>
                            <div className="ant-row" style={{display: currentView === 'Service:2'? 'block' : 'none'}}>

                                {(iAmTheGeek === true)?
                                    <Row>
                                        <Col style={{paddingLeft: '25px'}} span={24}>
                                            <h3 style={{color: '#07c', fontWeight: 'bold', fontSize: '12px'}}>
                                                ::Service Drafts
                                            </h3>
                                        </Col>
                                    </Row>
                                    : ''}
                                <Row gutter={2} id="pl_Service:2">  
                                    {this.state.geekSpace.services && this.state.geekSpace.services.map(s => s.serviceStatus < serviceStatusMap.published &&
                                        <Col key={s._id} xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                            <Card className="ant-card-body pfs s-list">
                                                <div className="custom-image">
                                                    <nav className="ed_nav">
                                                        <ul className="actionList">
                                                            <li style={{marginBottom: '3px'}}>
                                                                <a onClick={() => this.editService(s, 'Service:2')} style={{cursor: "pointer", fontSize: '14px !important', marginBottom: '10px !important'}} title="Update service">
                                                                    <i className="anticon anticon-edit iStack"></i>
                                                                    &nbsp;
                                                                    Update
                                                                </a>
                                                            </li>
                                                            <li style={{marginBottom: '3px'}}>
                                                                <a style={{cursor: "pointer", fontSize: '14px !important'}} title="Delete service">
                                                                    <i className="anticon anticon-delete iStack"></i>
                                                                    &nbsp;
                                                                    Delete
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                    <img alt={s.title} width="100%" src={s.bannerImage} />
                                                </div>
                                                <div className="custom-card">
                                                    <h3>{s.title}</h3>
                                                </div>
                                            </Card>
                                        </Col>)}

                                    {srs2 < 1 &&
                                    <Col space={24} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }} className="item-card pfs">
                                            <div className="custom-card">
                                                <h3>
                                                    Service draft list is empty <br/>
                                                    {(iAmTheGeek === true)?
                                                        "Use the 'Add button' to profile a new service"
                                                        : ''}
                                                </h3>
                                            </div>
                                        </Card>
                                    </Col>}
                                </Row>
                                <Row className="ant-row" style={{display: 'none'}} id="ed_Service:2">
                                    <Col span={24}>
                                        <ServiceAccordion serviceStatusMap ={serviceStatusMap} showMessage ={this.showMessage}
                                                          showSpinner ={this.showSpinner} updateState = {this.updateState} sections={sections}
                                                          nestedSelectionChanged = {this.nestedSelectionChanged} RTE={RichTextEditor}
                                                          handleTagDelete = {this.handleTagDelete} handleTagAddition = {this.handleTagAddition}
                                                          geek={this.state.geek} service={service} rteTextChanged = {this.rteTextChanged}
                                                          closeAction ={this.closeAction} onMouseEnter={this.setBorder} dispatchAction={dispatchAction}
                                                          nestedDataChanged = {this.nestedDataChanged} returnServiceView={returnServiceView}
                                                          shouldUpdateCategories = {shouldUpdateCategories} smallScreen = {smallScreen} updateView = {this.updateView}
                                                          validateQ = {this.validateQ}/>
                                    </Col>
                                </Row>
                            </div>
                            <div className="ant-row" style={{display: currentView === 'Craft:1'? 'block' : 'none'}}>
                                {(iAmTheGeek === true)?
                                    <Row>
                                        <Col style={{paddingLeft: '25px'}} span={24}>
                                            <h3 style={{color: '#07c', fontWeight: 'bold', fontSize: '12px'}}>
                                                ::Active Handcrafts
                                            </h3>
                                        </Col>
                                    </Row>
                                    : ''}
                                <Row gutter={2}>
                                    <Col xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }}>
                                            <div className="custom-image">
                                                <img alt="example" width="100%" src={sample} />
                                            </div>
                                            <div className="custom-card">
                                                <h3>Europe Street beat</h3>
                                                <p>www.instagram.com</p>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }}>
                                            <div className="custom-image">
                                                <img alt="example" width="100%" src={sample} />
                                            </div>
                                            <div className="custom-card">
                                                <h3>Europe Street beat</h3>
                                                <p>www.instagram.com</p>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }}>
                                            <div className="custom-image">
                                                <img alt="example" width="100%" src={sample} />
                                            </div>
                                            <div className="custom-card">
                                                <h3>Europe Street beat</h3>
                                                <p>www.instagram.com</p>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }}>
                                            <div className="custom-image">
                                                <img alt="example" width="100%" src={sample} />
                                            </div>
                                            <div className="custom-card">
                                                <h3>Europe Street beat</h3>
                                                <p>www.instagram.com</p>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }}>
                                            <div className="custom-image">
                                                <img alt="example" width="100%" src={sample} />
                                            </div>
                                            <div className="custom-card">
                                                <h3>Europe Street beat</h3>
                                                <p>www.instagram.com</p>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} md={8} lg={6} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }}>
                                            <div className="custom-image">
                                                <img alt="example" width="100%" src={sample} />
                                            </div>
                                            <div className="custom-card">
                                                <h3>Europe Street beat</h3>
                                                <p>www.instagram.com</p>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                            <div id='Deliveries' className="ant-row" style={{display: currentView === 'Deliveries'? 'block' : 'none'}}>
                                <Row>
                                    <Col span={24} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                                        <Card bodyStyle={{ padding: 0 }}>
                                            <br/>
                                            ....Each Will also contain both delivery and geek ratings
                                            <br/>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>
                </Row>
                {(iAmTheGeek === true && vv === false)?
                    <button className="new-y" id="trigger" title={'Add ' + currentView} onClick={() => this.addAction(currentView)} style={{display: (currentView && currentView !== 'Deliveries' && qView !== 'profile')? 'block' : 'none'}}>
                        {/*<i className="material-icons">add</i>*/}
                        <i className="anticon anticon-plus"></i>
                    </button> : ''}
                <Spin size="large" spinning={this.state.loading} />
        </Row>
        );
    }
}

const mapDispatch = {go: goToPage, setUser, dispatchAction};
const mapState = ({sections, io, peers, peer, disconnect, location, user, geek, geekSpace, screen, categories}) => ({sections, io, peers, peer, disconnect, location, user, geek, geekSpace, screen, categories});

export default connect(mapState, mapDispatch)(Cr);