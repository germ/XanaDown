import React from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import { XanaDoc } from './XanaDoc';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import "../node_modules/react-mosaic-component/react-mosaic-component.css";
import './App.css';

const ViewId = 'a' | 'b' | 'c' | 'new';

const TITLE_MAP: Record<ViewId, string> = {
	a: 'localhost:8080/doc',
	b: 'localhost:8080/doc',
	c: 'localhost:8080/doc',
  new: 'New Window',
};

class App extends React.Component {
	render() {
	return(
			<div className="App">
					<Mosaic
						renderTile={(id, path) => (
							<MosaicWindow path={path} createNode={() => 'new'} title={TITLE_MAP[id]}>
								<XanaDoc path={path} />
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
