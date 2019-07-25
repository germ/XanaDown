import React from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { XanaDoc } from './XanaDoc';
import  Url  from 'url-parse';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import "../node_modules/react-mosaic-component/react-mosaic-component.css";
import './App.css';

const ViewId = 'a' | 'b' | 'c' | 'new';
const TITLE_MAP: Record<ViewId, string> = {
	a: "https://github.com/pseudoku/GiGi.git/history/2019-04-27/16-16-08-7e4247bb1e/README.md",
	b: "https://github.com/pseudoku/GiGi.git/history/2019-04-27/16-16-08-7e4247bb1e/README.md",
	c: "https://github.com/pseudoku/GiGi.git/history/2019-04-27/16-16-08-7e4247bb1e/README.md",
  new: 'New Window',
};

class App extends React.Component {
	render() {
	console.log()
	return(
			<div className="App">
					<Mosaic
						renderTile={(id, path) => (
							<MosaicWindow path={path} createNode={() => 'new'} title={Url(TITLE_MAP[id]).pathname.split('/').pop()}>
								<XanaDoc path={TITLE_MAP[id]} />
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
				</div>
			);
		}
}

export default App;
