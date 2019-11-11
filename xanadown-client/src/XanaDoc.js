import React from 'react';
import ReactMarkdown, { uriTransformer } from 'react-markdown';
import { CircleLoader } from 'react-spinners';
import { ApiConfig } from './config.json';
import  Url  from 'url-parse';
import './XanaDoc.css';

class XanaDoc extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			url: "",
      raw: "",
      isNewest: "",
      newURL: "",
      name: "",
      xans: {}
		};
  }
  
  updateDoc() {
		//  Load the data from the server
		//  TODO: Fetch based off prop
		fetch(ApiConfig.Endpoint+"?loc="+this.props.path )
			.then(response => response.json())
			.then(data => {
        this.setState({
          url: this.props.path,
          raw: data.Doc,
          isNewest: data.IsLatest,
          newURL: data.LatestUrl,
          xans: []
      })})
  }

  parseXan(props) {
    // Check if special handling is needed
    if (props.href.search("span:") === -1 && props.href.search("tran:") === -1) {
      return (
      <a href={uriTransformer(props.href)} target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>)
    }

    var prot = props.href.slice(0, 5)
    var link = Url(uriTransformer(props.href.slice(5)));

    // Turn into span names
    console.log(link.toString())
    var fName = "src-" + btoa(link)
    var tName = "dst-" + btoa(link)

    // Add to the store so parent can link everything
    var newXans = {...this.state.xans}
    newXans[link] = {from: fName, to: tName, type: prot}
    if (!(link in this.state.xans)) {
      this.setState({ xans: newXans })
    }
    return (
      <button 
        className={"link-button "+fName} 
        onClick={() => this.props.toggleLink(newXans)}
      >
        {props.children}
      </button>
    )
  }

	componentDidUpdate() {
    //if (this.props.path !== this.state.url) 
      //this.updateDoc();
  }

  componentDidMount() {
    this.updateDoc();
  }

	render() {
		return (
			 this.state.raw === "" ? (
					<CircleLoader color={"#FF00FF"} sizeUnit={"em"} size={4} className="spinner"/>
			) : (
          //<ReactMarkdown source={this.state.raw}/>
            <ReactMarkdown 
              source={this.state.raw}
              linkTarget={"_blank"}   // Open external links in a new tab
              transformLinkUri={null}
              renderers={{"link": props => this.parseXan(props)}}
            />
			)
		)
	}
}

export { XanaDoc } 