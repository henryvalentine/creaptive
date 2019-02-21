/**
 * Created by Jack V on 1/31/2018.
 */
import React from 'react';
import {Row, Col} from 'antd';


export default class Section extends React.Component
{
    constructor(props)
    {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state =
        {
            open: false,
            closeClass: "section",
            openClassClass: "section open",
            name: this.props.name,
            level: this.props.level
        };

    }

    handleClick(e)
    {
        let targetName = this.props.name;
        let targetLevel = this.props.level;
        let el = this;
        if(this.state.open)
        {
            this.setState({
                open: false,
                class: el.props.closeClass
            });
        }else
        {
            this.setState({
                open: true,
                class:  el.props.openClassClass
            });
            this.props.triggerClose(targetName, targetLevel);
        }
    }

    componentWillMount()
    {

    }

    componentWillReceiveProps(nextProps)
    {
        let el = this;
        if(nextProps.activeTarget !== this.state.name && parseInt(nextProps.activeLevel) === parseInt(this.props.level))
        {
            this.setState({
                open: false,
                class: el.props.closeClass
            });
        }
        else
        {
            if(nextProps.activeTarget === this.state.name && parseInt(nextProps.activeLevel) === parseInt(this.props.level))
            {
                this.setState({
                    open: true,
                    class:  el.props.openClassClass
                });
            }
        }
    }


    componentWillUnmount()
    {
    }

    async componentDidMount()
    {
    }


    render()
    {
        return(
            <div id={this.props.name} className={this.state.class + ' ' + this.props.toggleDisabled} level = {this.props.level}>
                <button className={this.props.triggerButtonClass}>toggle</button>
                <div className={this.props.titleClass} onClick={this.handleClick}>{this.props.title}</div>
                <div className={this.props.articleWrapClass}>
                    <div className="article">
                        {this.props.children}
                    </div>
                </div>
            </div>
            )
    }
}