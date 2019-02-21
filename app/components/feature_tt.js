/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import fetch from 'isomorphic-fetch';
import { fetchData, postQuery } from '.././utils'
import {Row, Col, Button, Icon,  Table, Input, Select, Modal, Menu, Form} from 'antd';
const {Item} = Form;
const {Option} = Select;
import Link, { NavLink } from 'redux-first-router-link'

const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};

export default class CreativeOption extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            buttonText: 'Add',
            file: null,
            authenticated: false,
            headerHeight: 0,
            data: [],
            pagination:
            {
                current: 1,
                total: 0,
                pageSize: 10,
                sorter: {
                    field: "name",
                    order: "asc"
                }
            },
            loading: false,
            confirmLoading: false,
            title: 'New Package Feature',
            packageFeature:{_id: '', name: ''},
            searchText: "",
            visible: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.edit = this.edit.bind(this);
        this.Add = this.Add.bind(this);
        this.process = this.process.bind(this);
        this.exit = this.exit.bind(this);
        this.textChange = this.textChange.bind(this);
        this.getItems = this.getItems.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);

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
        let el = this;
        let query = `itemsPerPage=${results}&searchText=${searchText}&page=${page}&sortField=${sortField}&sortOrder=${sortOrder}`;

        let res = await fetchData('/getPackageFeatures?' + query);
        el.setState({loading: false});

        if(res.items.length > 0)
        {
            const {pagination} = el.state;
            pagination.total = res.totalItems;
            
            el.setState({
                data: res.items,
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

    edit(data, row)
    {
        this.setState({visible: true, title: 'Update Package Feature', buttonText: 'Update', packageFeature: data});
    }

    Add()
    {
        this.setState({visible: true, title: 'Add Package Feature',  buttonText: 'Add', packageFeature:{name: '', id: ''}});
    }

    async process()
    {
        if(!this.state.packageFeature.name || !this.state.packageFeature.creativeSection)
        {
            alert('Provide all required input and try again');
            return;
        }
        let url = '';
        if(!this.state.packageFeature._id || this.state.packageFeature._id.length < 1)
        {
            url = '/addPackageFeature';
        }
        else
        {
            url = '/editPackageFeature';
        }

        const {pagination} = this.state;
        let params = {
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        };

        this.setState({confirmLoading: true});
        let res = await postQuery(url, JSON.stringify({_id: this.state.packageFeature._id, name: this.state.packageFeature.name}));
        this.setState({confirmLoading: false});
        if(res.code > 0)
        {
            this.getItems(params);
            this.setState({visible: false});
        }
        alert(res.message);
    }

    exit()
    {
        this.setState({
            visible: false
        });
    };

    textChange(e)
    {
        const {option} = this.state;
        option[e.target.name] = e.target.value;
        this.setState({option});
    }

    selectionChanged(prop, feature, val, innerFeature)
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

    render()
    {
        const columns = [{
            title: 'Package Feature',
            dataIndex: 'name',
            key: 'name'
        },
         {
             title: 'Action',
             dataIndex: '', key: 'x',
             render: (value, row, index) => <a onClick={() => this.edit(value, row)} href="#"><i className="material-icons">mode_edit</i></a>
         }
        ];
        const {buttonText, option, title, searchText, visible, confirmLoading} = this.state;
        return(
            <div className="main-content" id="mainContent">
                <Row>
                    <Col xs={0} sm={1} md={4} lg={3}></Col>
                    <Col xs={24} sm={22} md={16} lg={18} style={{marginBottom: '20px'}}>
                        <Card id="sCrd" bodyStyle={{ padding: 0, border: '0 !important' }} className="split xz">
                            <div className="card-container n-Bdr">
                                {this.state.services.length > 0 && this.state.services.map(s =>
                                    <Col key={s._id} xs={24} sm={12} md={6} lg={5}>
                                        <Card className="ant-card-body pfs list-it">
                                            <div className="card-img-block" >
                                                <nav className="ed_nav">
                                                    <ul className="actionList">
                                                        <li style={{marginBottom: '3px'}}>
                                                            <NavLink style={{cursor: "pointer", fontSize: '14px !important'}} title="View service" className="appAnchor" to={`/service/${s._id}`}>
                                                                <i className="anticon anticon-eye-o iStack"></i>
                                                                &nbsp;
                                                                View
                                                            </NavLink>
                                                        </li>
                                                        <li style={{marginBottom: '3px'}}>
                                                            <a style={{cursor: "pointer", fontSize: '14px !important'}} title="Statistics">
                                                                <i className="anticon anticon-line-chart iStack"></i>
                                                                &nbsp;
                                                                Statistics
                                                            </a>
                                                        </li>
                                                        <li style={{marginBottom: '3px'}}>
                                                            <a style={{cursor: "pointer", fontSize: '14px !important'}} title="Ratings & reviews">
                                                                <i className="anticon anticon-star-o iStack"></i>
                                                                &nbsp;
                                                                Ratings
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
                            </div>
                        </Card>
                    </Col>
                    <Col xs={0} sm={1} md={4} lg={3}></Col>

                    {this.state.services.length < 1 &&
                    <Col space={24} style={{ paddingLeft: '8px', paddingRight: '8px', marginBottom: '10px'}}>
                        <Card bodyStyle={{ padding: 0 }} className="item-card pfs">
                            <div className="custom-card">
                                <h3>
                                    Service list is empty <br/>
                                </h3>
                            </div>
                        </Card>
                    </Col>}
                </Row>

                <Spin size="large" spinning={this.state.loading} />
            </div>
            )
    }
}