/**
 * Created by Jack V on 9/11/2017.
 */
import React from 'react';
import { Icon, Button, Input, AutoComplete } from 'antd';
const {Option} = AutoComplete;

function onSelect(value) {
    console.log('onSelect', value);
}

function getRandomInt(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1)) + min; // eslint-disable-line no-mixed-operators
}

function searchResult(query) {
    return (new Array(getRandomInt(5))).join('.').split('.')
        .map((item, idx) => ({
            query,
            category: `${query}${idx}`,
            count: getRandomInt(200, 100)
        }));
}

function renderOption(item) {
    return (
        <Option key={item.category} text={item.category}>
    {item.query} 在
    <a
    href={`https://s.taobao.com/search?q=${item.query}`}
    target="_blank"
    rel="noopener noreferrer"
        >
        {item.category}
</a>
    区块中
    <span className="global-search-item-count">约 {item.count} 个结果</span>
    </Option>
);
}

export default class NavSearch extends React.Component {
   constructor(props)
   {
       super(props);
       this.state =
        {
           dataSource: []
       };
       this.handleSearch = this.handleSearch.bind(this);
   }

    handleSearch(value){
        this.setState({
            dataSource: value ? searchResult(value) : []
        });
    };

    render() {
        const { dataSource } = this.state;
        return (
            <div className="global-search-wrapper">
                <AutoComplete
                    className="global-search"
                    size="large"
                    style={{ width: '100%' }}
                    dataSource={dataSource.map(renderOption)}
                    onSelect={onSelect}
                    onSearch={this.handleSearch}
                    optionLabelProp="text">
                        <Input id={this.props.id} onBlur={this.props.searchBoxExited ? this.props.searchBoxExited : null} placeholder="Start searching..."
                    suffix={(
                        <Button id="searchBtn" className="search-btn" size="large" type="primary">
                            <i className="anticon anticon-search"></i>
                        </Button>
                )}
                />
                </AutoComplete>
        </div>
    );
    }
};