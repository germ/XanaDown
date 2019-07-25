import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CircleLoader } from 'react-spinners';

import { ApiConfig } from './config.json';
import './XanaDoc.css';

class XanaDoc extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			url: "",
			raw: ""
		};
	}

	componentDidMount() {
		//  Load the data from the server
		//  TODO: Fetch based off prop
		console.log(ApiConfig.Endpoint)
		fetch(ApiConfig.Endpoint+"?loc="+this.props.path )
			.then(response => response.json())
			.then(data => this.setState({raw: data.Doc}));
	}

	render() {
		return (
			 this.state.raw === "" ? (
					<CircleLoader color={"#FF00FF"} sizeUnit={"em"} size={4} className="spinner"/>
			) : (
					//<ReactMarkdown source={this.state.raw}/>
					<ReactMarkdown source={this.state.raw}/>
			)
		)
	}
}

export { XanaDoc } 
