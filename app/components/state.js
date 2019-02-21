/**
 * Created by Jack V on 9/20/2017.
 */
import React from 'react';
import fetch from 'isomorphic-fetch';
import {Row, Col, Button, Icon,  Table, Input, Select, Modal, Menu, Form} from 'antd';
const {Item} = Form;
const {Option} = Select;
import Link, { NavLink } from 'redux-first-router-link'

const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};

export default class State extends React.Component
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
            currentSection: 'entryForm',
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
            title: 'Add New User',
            country:{name: '', currency: '', currencyCode: '', countryCode: ''},
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
        this.uploadCountries = this.uploadCountries.bind(this);
        this.selectSection = this.selectSection.bind(this);
        this.triggerFileSelect = this.triggerFileSelect.bind(this);
        this.processFile = this.processFile.bind(this);

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

    componentDidMount()
    {
        const {pagination} = this.state;

        this.getItems({
            results: pagination.pageSize,
            searchText: this.state.searchText,
            page: pagination.current,
            sortField: pagination.sorter.field,
            sortOrder: pagination.sorter.order
        });

        // fetch("http://services.groupkt.com/state/get/NG/all",
        //     {
        //         method: "GET",
        //         headers: headers
        //     }).then(function(response)
        //     {
        //         return response.json();
        //     })
        //     .then(function(res)
        //     {
        //         console.log(res);
        //     });
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

    getItems (params = {})
    {
        this.setState({ loading: true });
        var searchText = params.searchText;
        var results = params.results;
        var page = params.page;
        var sortField = params.sortField;
        var sortOrder = params.sortOrder;
        let el = this;
        var body = JSON.stringify({
            query: `query{getCountries(data: {results: ${results},searchText:"${searchText}",page:${page},sortField:"${sortField}",sortOrder:"${sortOrder}"}){totalItems, items{id, name, currency, currencyCode, countryCode}}}`
        });

        fetch("/graphql",
            {
                method: "POST",
                headers: headers,
                body: body
        }).then(function(response)
        {
            return response.json();
        })
        .then(function(res)
        {
            el.setState({loading: false});

            if(res.data && res.data.getCountries && res.data.getCountries.items.length > 0)
            {
                const {pagination} = el.state;
                pagination.total = res.data.getCountries.totalItems;
                el.setState({
                    data: res.data.getCountries.items,
                    pagination
                });
            }
        });

        if(searchText && searchText.trim().length > 0)
        {
            const reg = new RegExp(searchText, 'gi');
            this.setState({
                filtered: !!searchText,
                data: this.state.data.map((record) =>
                {
                    const match = record.name.match(reg) || record.currency.match(reg) || record.currencyCode.match(reg) || record.countryCode.match(reg);
                    if (!match)
                    {
                        return null;
                    }
                    return {...record, name: (<span> {record.name.split(reg).map((text, i) => ( i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
                        ))}
            </span>
                    )
                    };
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

    triggerFileSelect()
    {
        document.getElementById('selectFile').click();
    };


    processFile(e)
    {
        let file = e.target.files[0];
        if (file && file.size > 0)
        {
           document.getElementById('fileName').value = file.name;
            this.setState({
                file: file
            });
        }
        else
        {
            alert('No files selected');
        }
    };

    uploadCountries()
    {
        if (this.state.file && this.state.file.size > 0)
        {
            let el = this;
            var xhr = new XMLHttpRequest();
            var formData = new FormData();
            xhr.open("POST", "/uploadCountries?uploadPath=bulk&sheetName=country-currency", true);
            xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
            xhr.onerror = function(e)
            {
                console.log(e);
            };
            xhr.onload = function()
            {
                var res = (JSON.parse(xhr.response));
                if(res.code > 0)
                {
                    el.setState({
                        file: null,
                        visible: false,
                        pagination:
                        {
                            current: 1
                        }
                    });
                    el.getItems({
                        results: pagination.pageSize,
                        searchText: el.searchText,
                        page: 1,
                        sortField: pagination.sorter.field,
                        sortOrder: pagination.sorter.order
                    });
                }
                alert(res.message);
            };
            formData.append('file', el.state.file);
            // formData.append('uploadPath', 'bulk');
            // formData.append('sheetName', 'country-currency');
            xhr.send(formData);
        }
        else
        {
            alert('No files selected');
        }
    };

    edit(data, row)
    {
        this.setState({visible: true, title: 'Update Country', buttonText: 'Update', country:{id: data.id, name: data.name, currency: data.currency, currencyCode: data.currencyCode, countryCode: data.countryCode}});
    }

    Add()
    {
        this.setState({visible: true, title: 'Process Country',  buttonText: 'Add', country:{name: '', currency: '', currencyCode: '', countryCode: ''}});
    }

    process()
    {
         if(this.state.currentSection === 'singleEntryForm')
         {
             var data = '';
             let action = '';
             if(!this.state.country.name || !this.state.country.currency || !this.state.country.currencyCode || !this.state.country.countryCode)
             {
                 alert('Provide all required input and try again');
                 return;
             }
             if(!this.state.country.id || this.state.country.id.length < 1)
             {

                 data = {
                     query : `mutation{addCountry(data: {id: "", name: "${this.state.country.name}", currency: "${this.state.country.currency}", currencyCode: "${this.state.country.currencyCode}", countryCode: "${this.state.country.countryCode}"}){id, name, currency, currencyCode, countryCode}}`
                 };
                 action = 'addCountry';
             }
             else
             {

                 data = {
                     query : `mutation{updateCountry(data: {id: "${this.state.country.id}", name: "${this.state.country.name}", currency: "${this.state.country.currency}", currencyCode: "${this.state.country.currencyCode}", countryCode: "${this.state.country.countryCode}"}){id, name, currency, currencyCode, countryCode}}`
                 };
                 action = 'updateCountry';
             }

             let el = this;
             el.setState({confirmLoading: true});
             const {pagination} = el.state;
             let params = {
                 results: pagination.pageSize,
                 searchText: el.state.searchText,
                 page: pagination.current,
                 sortField: pagination.sorter.field,
                 sortOrder: pagination.sorter.order
             };

             fetch("http://localhost:8025/graphql",
             {
                 method: "POST",
                 headers: headers,
                 body:  JSON.stringify(data)
             }).then(function(response)
             {
                 return response.json();
             })
             .then(function(res)
             {
                 el.setState({confirmLoading: false});
                 if(res.data[action]['id'] && res.data[action]['id'].length > 0)
                 {
                     el.getItems(params);
                     el.setState({visible: false});
                     alert('Country information was successfully processed.');
                 }
                 else{
                     alert('Country information could not be processed. Please try again later');
                 }
             });
         }
         else
         {
            this.uploadCountries();
         }
    }

    exit()
    {
        this.setState({
            visible: false
        });
    };

    textChange(e)
    {
        const {country} = this.state;
        country[e.target.name] = e.target.value;
        this.setState({country});
    }

    selectSection(e)
    {
        this.setState({
            currentSection: e.key
        });

        if(typeof window !== 'undefined')
        {
            if(e.key === 'singleEntryForm')
            {
                document.getElementById('singleEntryForm').style.display = 'block';
                document.getElementById('bulkUpload').style.display = 'none';
                document.getElementById('buttonText').style.display = 'block';
                document.getElementById('uploadIcon').style.display = 'none';
            }
            else
            {
                document.getElementById('bulkUpload').style.display = 'block';
                document.getElementById('singleEntryForm').style.display = 'none';
                document.getElementById('buttonText').style.display = 'none';
                document.getElementById('uploadIcon').style.display = 'block';
            }
        }

    }

    render()
    {
        const columns = [{
            title: 'name',
            dataIndex: 'name',
            key: 'name',
            // sorter: true
        },
        {
            title: 'countryCode',
            dataIndex: 'countryCode',
            key: 'countryCode'
        },
        {
            title: 'currency',
            dataIndex: 'currency',
            key: 'currency',
            // sorter: true
        }, {
            title: 'currencyCode',
            dataIndex: 'currencyCode',
            key: 'currencyCode',
            // sorter: true
        },
         {
             title: 'Action',
             dataIndex: '', key: 'x',
             render: (value, row, index) => <a onClick={() => this.edit(value, row)} href="#"><i className="material-icons">mode_edit</i></a>
         }

        ];
        const {buttonText, country, title, searchText, visible, confirmLoading} = this.state;
        return(
                <div  className="main-content" id="mainContent">
                    <div className="custom-filter-dropdown">
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
                                <i className="material-icons" style={{float: 'right', marginRight: '-25px', color: '#07c', cursor: 'pointer'}} onClick={this.Add}>add</i>
                            </Col>
                        </Row>
                        <br/>
                        <Table columns={columns} rowKey={record => record.countryCode} dataSource={this.state.data} pagination={this.state.pagination} loading={this.state.loading} onChange={this.handleTableChange} bordered/>
                    </div>
                    <div className="md-wrapper">
                        <Modal className="modal-width-330"
                               visible={visible}
                               title={title}
                               maskClosable={false}
                               onCancel={this.exit}
                               footer={[
                        <Button className="login-button" loading={confirmLoading} key="submit" type="primary" size="large"  onClick={this.process}>
                          <span id="buttonText">{buttonText}</span>
                          <i id="uploadIcon" className="material-icons" style={{display: 'none'}}>file_upload</i>
                        </Button>
                      ]}
                        >
                            <Menu id="accessMenu" onClick={this.selectSection} selectedKeys={[this.state.currentSection]} mode="horizontal">
                                <Menu.Item key="singleEntryForm" className="access-menu-item">
                                    Single Entry
                                </Menu.Item>
                                <Menu.Item key="bulkUpload" className="access-menu-item">
                                    Bulk Upload
                                </Menu.Item>
                            </Menu>
                            <br/>
                            <Form>
                                <div id="singleEntryForm">
                                    <Item>
                                        <input onChange={this.textChange} name="name" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Country Name" value={country.name}/>
                                    </Item>
                                    <Item>
                                        <input onChange={this.textChange} name="countryCode" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Country Code" value={country.countryCode}/>
                                    </Item>
                                    <Item>
                                        <input onChange={this.textChange} name="currency" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Currency" value={country.currency}/>
                                    </Item>
                                    <Item>
                                        <input onChange={this.textChange} name="currencyCode" type="text" className="ant-input ant-input-lg input-no-border" placeholder="Currency Code" value={country.currencyCode}/>
                                    </Item>
                                </div>
                                <div id="bulkUpload" style={{display: 'none', width: '100%', paddingBottom: '10px', marginTop: '-15px'}}>
                                    <br/>
                                    <div className="ant-col-24 row-no-btm" style={{marginBottom: '1px', paddingTop: '0px !important'}}>
                                        <div className="ant-row ant-form-item" style={{marginBottom: '10px !important'}}>
                                            <div className="ant-form-item-control-wrapper">
                                                <div className="ant-form-item-control ">
                                                    <span className="ant-input-affix-wrapper">
                                                        <span className="ant-input-prefix">
                                                           <i className="material-icons" style={{fontSize: '19px'}}>insert_drive_file</i>
                                                        </span>
                                                         <input id="selectFile" style={{display: 'none'}} className="ant-input ant-input-lg input-no-border" type="file" onChange={this.processFile} accept=".csv, .xls, .xlsx"/>
                                                        <input id="fileName" onClick={this.triggerFileSelect} className="ant-input ant-input-lg input-no-border" type="text" placeholder="Click to choose file"/>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br/>
                                </div>
                            </Form>
                        </Modal>
                    </div>
                </div>
            )
    }
}

//<Button type="primary" onClick={this.onSearch}>Search</Button>
//<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>

// this.getItems({
//     results: pagination.pageSize,
//     searchText: this.state.searchText,
//     page: pagination.current,
//     sortField: pagination.sorter.field,
//     sortOrder: pagination.sorter.order,
//     query : `query {getCountries(data:{
//             results: ${pagination.pageSize},
//             searchText: ${this.state.searchText},
//             page: ${pagination.current},
//             sortField: ${pagination.sorter.field},
//             sortOrder: ${pagination.sorter.order},
//             ){totalItems, items: {id name}}}`
// });