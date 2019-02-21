/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import fetch from 'isomorphic-fetch';
import { fetchData, postQuery } from '.././utils'
import {Row, Col, Button, Icon,  Table, Input, Select, Modal, Menu, Form, Checkbox} from 'antd';
const CheckboxGroup = Checkbox.Group;
const {Item} = Form;
const {Option} = Select;
import Link, { NavLink } from 'redux-first-router-link'
import mongoose from "mongoose";
import {dispatchAction, goToPage} from "../actions";
import {connect} from "react-redux";

const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};

export default class PricePackage extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            buttonText: 'Add Package',
            optionButtonText: 'Add',
            authenticated: false,
            headerHeight: 0,
            data: [],
            pagination:
            {
                current: 1,
                total: 0,
                pageSize: 10,
                sorter:
                {
                    field: "title",
                    order: "asc"
                }
            },
            loading: false,
            confirmLoading: false,
            modalConfirmLoading: false,
            title: 'New Price Package',
            modalTitle: 'New Price Package',
            creativeSubCategories: [],
            pricePackage:
                {
                    _id: '',
                    description: '',
                    creativeSubCategory: {_id: '', name: ''},
                    section: {_id: '', name: ''},
                    dateProfiled: '',
                    packageFeatures: []
                },
            packageTypes: [],
            sections: [],
            packageFeature: {_id: '', featureOptions: []},
            packageFeatures: [],
            searchText: "",
            visible: false,
            modalVisible: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.edit = this.edit.bind(this);
        this.Add = this.Add.bind(this);
        this.processPricePackage = this.processPricePackage.bind(this);
        this.exit = this.exit.bind(this);
        this.modalExit = this.modalExit.bind(this);
        this.textChange = this.textChange.bind(this);
        this.getItems = this.getItems.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);
        this.processPricePackageFeature = this.processPricePackageFeature.bind(this);
        this.editPricePackageOption = this.editPricePackageOption.bind(this);
        this.AddNewFeature = this.AddNewFeature.bind(this);
        this.resetPricePackage = this.resetPricePackage.bind(this);
        this.deleteFeature = this.deleteFeature.bind(this);

        if(typeof document !== 'undefined')
        {
            document.getElementById('appBar').style.display = '';
            document.getElementById('welcomeBar').style.display = 'none';
        }
    }

    componentWillMount()
    {
    }

    componentWillUnmount()
    {
    }

    async componentDidMount()
    {

        const {pagination} = this.state;

        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });

        let subCategories = await fetchData('/getAllCreativeSubCategories');

        if(subCategories.length > 0)
        {
            this.setState({creativeSubCategories: subCategories});
        }

        let packageFeatures = await fetchData('/getAllPackageFeatures');
        if(packageFeatures.length > 0)
        {
            this.setState({packageFeatures: packageFeatures});
        }

        let sections = await fetchData('/getAllCreativeSections');
        if(sections !== null)
        {
            this.setState({sections: sections});
        }
    }

    handleTableChange(pagination, filters, sorter)
    {
        const pager = this.state.pagination;
        pager.current = pagination.current;

        this.setState({
            pagination: pager
        });
        this.getItems({
            results: pager.pageSize,
            searchText: this.state.searchText,
            page: pager.current,
            sortField: pager.sorter.field,
            sortOrder: pager.sorter.order
        });
    }

    async getItems (params = {})
    {
        this.setState({ loading: true });
        let searchText = params.searchText;
        let results = params.results;
        let page = params.page;
        let sortField = params.sortField;
        let sortOrder = params.sortOrder;

        let query = `itemsPerPage=${results}&searchText=${searchText}&page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`;

        let res = await fetchData('/getPricePackageList?' + query);
        this.setState({loading: false});
        let items = [];
        if(res.items.length > 0)
        {
            const {pagination} = this.state;
            pagination.total = res.totalItems;
            res.items.forEach((c, i) =>{
                c.sectionName = c.section.name;
                c.creativeSubCategoryName = c.creativeSubCategory.name;
                items.push(c);
            });
            this.setState({
                data: items,
                pagination
            });
        }

        if(searchText && searchText.trim().length > 0)
        {
            const reg = new RegExp(searchText, 'gi');
            this.setState({
                filtered: !!searchText,
                data: this.state.data.map((record) =>
                {
                    const match = record.name.match(reg);
                    if (!match)
                    {
                        return null;
                    }
                    return {...record,
                        name: (<span> {record.name.split(reg).map((text, i) => ( i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
                        ))}
                        </span>
                    )};
                }).filter(record => !!record)
            });
        }
    }

    handleChange(value)
    {
        const {pagination} = this.state;
        pagination.pageSize = parseInt(value);

        this.setState({
            pagination: pagination
        });

        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });
    }

    onInputChange (e)
    {
        let searTerm = e.target.value.trim();
        this.setState({searchText: searTerm});
        const {pagination} = this.state;
        this.getItems({
            results: pagination.pageSize,
            searchText: searTerm,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });
    }

    onSearch()
    {
        const {pagination} = this.state;
        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });
    }

    async edit(data, row)
    {
        this.setState({visible: true, title: 'Update Price Package', buttonText: 'Update Package', pricePackage: data});
    }

    async deleteFeature(data, row)
    {
        let res = await fetchData('/removePackageFeature?packageId=' + this.state.pricePackage._id);
        if(res.code > 0)
        {
            let packageFeatures = this.setState.pricePackage.packageFeatures;
            packageFeatures.forEach((f, i) =>
            {
                if(c._id === data._id)
                {
                    packageFeatures.splice(i, 1);
                    this.setState({pricePackage: {...this.state.pricePackage, packageFeatures: packageFeatures}});
                }
            });
        }

    }

    editPricePackageOption(data, row)
    {
        this.setState({meta: data});
    }

    AddNewFeature()
    {
        this.setState({modalVisible: true, title: 'Add New Feature',  optionButtonText: 'Add'});
    }

    resetPricePackage()
    {
        let pricePackage =
        {
            _id: '',
            description: '',
            creativeSubCategory: {_id: '', name: ''},
            section: {_id: '', name: ''},
            dateProfiled: '',
            packageFeatures: []
        };

        this.setState({visible: true, title: 'Add Price Package',  buttonText: 'Add Package', pricePackage: pricePackage});
    }

    Add()
    {
        this.resetPricePackage();
        this.setState({visible: true, title: 'Add Price Package',  buttonText: 'Add Package'});
    }

    async processPricePackage()
    {
        if(this.state.pricePackage.creativeSubCategory.length < 1 || this.state.pricePackage.section.length < 1
            || this.state.pricePackage.packageFeatures.length < 1)
        {
            alert('Provide all required fields and try again');
            return;
        }

        let url = '';
        let payload = {};
        let features = [];
        this.state.pricePackage.packageFeatures.forEach((f, i) => {
            features.push(f._id);
        });
        if(!this.state.pricePackage._id || this.state.pricePackage._id.length < 1)
        {
            payload = {creativeSubCategory: this.state.pricePackage.creativeSubCategory._id, section: this.state.pricePackage.section._id, packageFeatures: features};
            url = '/addPricePackage';
        }
        else
        {
            payload = {_id: this.state.pricePackage._id, creativeSubCategory: this.state.pricePackage.creativeSubCategory._id, section: this.state.pricePackage.section._id, packageFeatures: features};
            url = '/editPricePackage';
        }

        const {pagination} = this.state;
        let params =
        {
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        };

        let res = await postQuery(url, JSON.stringify(payload));
        this.setState({confirmLoading: false});
        if(res.code > 0)
        {
            this.getItems(params);
            this.resetPricePackage();
        }
        alert(res.message);
    }

    async processPricePackageFeature(val)
    {
        if(!val || val.length < 1)
        {
            alert('Please Select an Existing Option or profile a new one');
            return;
        }

        let packageFeatures = this.state.pricePackage.packageFeatures;
        let filters = this.state.packageFeatures.filter((c) =>
        {
           return c._id === val;
        });

        if(filters.length < 1)
        {
            alert('An unknown error was encountered. Please refresh the page and try again');
            return;
        }

        let items = packageFeatures.filter((c) =>
        {
            return c._id === val;
        });

        if(items.length < 1)
        {
            packageFeatures.push(filters[0]);
            this.setState({pricePackage: {...this.state.pricePackage, packageFeatures: packageFeatures}});
        }
    }

    exit()
    {
        this.setState({
            visible: false
        });
    };

    modalExit()
    {
        this.setState({
            modalVisible: false
        });
    };

    textChange(e, prop, feature)
    {
        if(prop !== undefined && prop !== null && prop.length > 0 && feature !== undefined && feature !== null && feature.length > 0)
        {
            let stateObj = this.state[prop];
            stateObj[feature] = e.target.value;
            this.setState({[prop]: stateObj});
        }
        else{
            const {pricePackage} = this.state;
            pricePackage[e.target.name] = e.target.value;
            this.setState({pricePackage});
        }
    }

    selectionChanged(prop, feature, val, innerFeature)
    {
        let stateObj = this.state[prop];
        if(innerFeature !== undefined && innerFeature !== null && innerFeature.length > 0)
        {
            stateObj[feature][innerFeature] = val;
            this.setState({[prop]: stateObj});
        }
        else
        {
            this.setState({[prop]: {...this.state[prop], [feature]: val}});
        }
    }

    render()
    {
        const columns = [

        {
            title: 'Subcategory',
            dataIndex: 'creativeSubCategoryName',
            key: 'creativeSubCategoryName'
        }
         ,
        {
            title: 'Section',
            dataIndex: 'sectionName',
            key: 'sectionName'
        },
         {
             title: 'Action',
             dataIndex: '', key: 'x',
             render: (value, row, index) => <a onClick={() => this.edit(value, row)} href="#"><i className="material-icons">mode_edit</i></a>
         }
        ];

        const optionColumns = [
            {
                title: 'Title',
                dataIndex: 'title',
                key: 'title'
            },
            {
                title: 'Feature Type',
                dataIndex: 'featureType',
                key: 'featureType'
            },
            {
                title: 'Action',
                dataIndex: '', key: 'x',
                render: (value, row, index) => <a onClick={() => this.deleteFeature(value, row)} href="#"><i className="material-icons">delete</i></a>
            }
        ];
       
        const {packageFeature, buttonText, pricePackage, title, searchText, visible, confirmLoading} = this.state;
        return(
                <div  className="main-content" id="mainContent">
                    <div className="custom-filter-dropdown" style={{display: visible? 'none' : 'block'}}>
                        <Row style={{margin: '20px'}}>
                            <Col span="24">
                                <h4 style={{fontWeight: 'bold', fontSize: '18px'}}> Price Packages</h4>
                            </Col>
                        </Row>
                        <Row  gutter={2} style={{marginTop: '10px'}}>
                            <Col xs={8} sm={8} md={8} lg={8}>
                                <Select defaultValue="10" id="pageSize" onChange={this.handleChange} style={{ width: '60%'}}>
                                    <Option value="10">10</Option>
                                    <Option value="25">25</Option>
                                    <Option value="50">50</Option>
                                    <Option value="100">100</Option>
                                </Select>
                            </Col>
                            <Col xs={8} sm={8} md={8} lg={8}>
                                <Input className="ant-input-lg-2" style={{ width: '100%'}} placeholder="Search..." value={searchText} onChange={this.onInputChange} onPressEnter={this.onSearch}/>
                            </Col>
                            <Col xs={6} sm={6} md={6} lg={6}>
                                <i className="material-icons" title="Add New PricePackage" style={{float: 'right', marginRight: '-25px', color: '#07c', cursor: 'pointer'}} onClick={this.Add}>add</i>
                            </Col>
                        </Row>
                        <br/>
                        <Table columns={columns} rowKey={record => record._id} dataSource={this.state.data} pagination={this.state.pagination} loading={this.state.loading} onChange={this.handleTableChange} bordered/>
                    </div>
                    <div className="md-wrapper" style={{display: visible? 'block' : 'none'}}>
                        <div role="document" className="ant-modal" style={{width: '700px', marginLeft: '25%', marginRight: '25%', top: '30px !important'}}>
                            <div className="ant-modal-content">
                                <button aria-label="Close" className="ant-modal-close" onClick={this.exit}>
                                    <span className="ant-modal-close-x"></span>
                                </button>
                                <div className="ant-modal-header">
                                    <div className="ant-modal-title" id="rcDialogTitle0">
                                        {title}
                                    </div>
                                </div>
                                <div className="ant-modal-body">
                                    <Form>
                                        <div>
                                            <Item style={{marginBottom: '7px !important'}}>
                                                <Col span="11">
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}> SubCategory *</h3>
                                                    <Select name="creativeSubCategory"
                                                            style={{  width: '100%' }}
                                                            placeholder="-  SubCategory * -"
                                                            optionFilterProp="children"
                                                            value={(pricePackage.creativeSubCategory !== undefined && pricePackage.creativeSubCategory._id.length > 0)? pricePackage.creativeSubCategory._id : '-  Subcategory * -'}
                                                            onChange={(val) => this.selectionChanged('pricePackage', 'creativeSubCategory', val, '_id')}>
                                                        <Option value="">-  Subcategory * -</Option>
                                                        {this.state.creativeSubCategories.map(subCategory => <Option value={subCategory._id} key={subCategory._id}>{subCategory.name}</Option>)}
                                                    </Select>
                                                </Col>
                                                <Col span="1"></Col>
                                                <Col span="11">
                                                    <h3 style={{fontSize: '15px', fontWeight: '400'}}> Creative Section *</h3>
                                                    <Select name="creativeSection"
                                                            style={{  width: '100%' }}
                                                            placeholder="-  Creative Section * -"
                                                            optionFilterProp="children"
                                                            value={(pricePackage.section !== undefined && pricePackage.section._id.length > 0)? pricePackage.section._id : '-  Creative Section * -'}
                                                            onChange={(val) => this.selectionChanged('pricePackage', 'section', val, '_id')}>
                                                        <Option value="">-  Creative Section * -</Option>
                                                        {this.state.sections.map(section => <Option value={section._id} key={section._id}>{section.name}</Option>)}
                                                    </Select>
                                                </Col>
                                            </Item>
                                            <div style={{width: '100%'}}>
                                                <Item>
                                                    <Row style={{margin: '20px'}}>
                                                        <Col span="20">
                                                            <h4 style={{fontWeight: 'bold', fontSize: '13px'}}>Price Package Feature(s)</h4>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col span="20">
                                                            <Select name="feature" disabled={confirmLoading === true}
                                                                    style={{  width: '100%' }}
                                                                    placeholder="- Select package Feature * -"
                                                                    optionFilterProp="children"
                                                                    value={(packageFeature !== undefined && packageFeature._id.length > 0)? packageFeature._id : '- Select package Feature * -'}
                                                                    onChange={(val) => this.processPricePackageFeature(val)}>
                                                                <Option value="">- Select package Feature * -</Option>
                                                                {this.state.packageFeatures.map(packageFeature => <Option value={packageFeature._id} key={packageFeature._id}>{packageFeature.title}</Option>)}
                                                            </Select>
                                                        </Col>
                                                        {/*<Col span ='4'>*/}
                                                            {/*<i className="material-icons" title="Add New Feature" style={{float: 'right', marginLeft: '35px', color: '#008000', marginTop: '6px', cursor: 'pointer'}} onClick={this.AddNewFeature}>add</i>*/}
                                                        {/*</Col>*/}
                                                    </Row>
                                                    <br/>
                                                    <Row>
                                                        <Col span="24">
                                                            <Item>
                                                                <Table columns={optionColumns} rowKey={record => record._id} dataSource={this.state.pricePackage.packageFeatures} bordered/>
                                                            </Item>
                                                        </Col>
                                                    </Row>
                                                </Item>
                                            </div>
                                        </div>
                                    </Form>
                                </div>
                                <div className="ant-modal-footer">
                                    <button type="button" className={confirmLoading? "ant-btn login-button ant-btn-primary ant-btn-lg ant-btn-loading" : "ant-btn login-button ant-btn-primary ant-btn-lg"}  onClick={this.processPricePackage}>
                                        {confirmLoading && <i className="anticon anticon-spin anticon-loading"></i>}
                                        <span id="buttonText">{buttonText}</span>
                                    </button>
                                </div>
                            </div>
                            <div tabIndex="0" style={{width: '0px', height: '0px', overflow: 'hidden'}}>sentinel</div>
                        </div>
                    </div>
                </div>
            )
    }
}
