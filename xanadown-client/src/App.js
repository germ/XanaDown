import React from 'react';
import { Mosaic, MosaicWindow, ReplaceButton, ExpandButton, RemoveButton } 
    from 'react-mosaic-component';
import ConnectElements from 'react-connect-elements';
import { XanaDoc } from './XanaDoc';
import  Url  from 'url-parse';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import "../node_modules/react-mosaic-component/react-mosaic-component.css";
import './App.css';

const ViewId = 'a' | 'b' | 'c' | 'new';
const TITLE_MAP: Record<ViewId, string> = {
	a: "https://github.com/germ/germ.xan.git/current/index.md",
	b: "https://github.com/germ/germ.xan.git/current/index.md",
	c: "https://github.com/germ/germ.xan.git/current/index.md",
  new: 'New Window',
};

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      xans: {},     // List of all links in documents
      bridges: {}   // currently visible bridges
    }
  }

  addlink(newLink) {
    // Bail if already added
    if (newLink.from in this.state.xans) 
      return

    // Add to state
    var newXans = {...this.state.xans}
    newXans[newLink.from] = newLink
    this.setState({xans: newXans})
  }

  toggleLink(link) {
    // Exists, remove
    /*if (link in this.state.bridges) {
      var newBridges = {...this.state.bridges}
      delete newBridges[link]
      this.setState({bridges: newBridges})
      return
    }*/
    if (link in this.state.bridges)
      return      // Already opened

    var newBridges = {...this.state.bridges}
    console.log(link)
    //newBridges[]

    //Find source
    // 2) Check if ref doc is open
    //    3) Open document if needed
    // 4) Find link
    // 5) Add to drawable
  }

	render() {
	return(
		<div className="App">
			<Mosaic
	  		renderTile={(id, path) => (
          <MosaicWindow 
            path={path} 
            reateNode={() => 'new'} 
            title={Url(TITLE_MAP[id]).pathname.split('/').pop()}
            toolbarControls={React.Children.toArray([
            <ReplaceButton/>,<ExpandButton/>, <RemoveButton/>
          ])}
          >
            <div className={id}>
              <XanaDoc 
                  updateLink={(link) => this.addlink(link)} 
                  toggleLink={(link) => this.toggleLink(link)} 
                  path={TITLE_MAP[id]}
              />
            </div>
          </MosaicWindow>
          )}
          initialValue={{
            direction: 'row',
            first: 'a',
            second: {
              direction: 'column',
              first: 'b',
              second: 'c',
            },
          }}
          className={"mosaic-blueprint-theme bp3-dark"}
        />
        {Object.keys(this.state.bridges).map((link,info) => {
          console.log(link, info);
          return (""
            /*<ConnectElements 
              selector=".mosaic-root" elements={info}
              overlay={100} strokeWidth={5} color={"#FF0000"}
            />*/
          )})
        }
				</div>
			);
		}
}

export default App;
