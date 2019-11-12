import React from 'react'
import { OptionalBlueprint } from 'react-mosaic-component/lib/util/OptionalBlueprint';
import { createDefaultToolbarButton } from 'react-mosaic-component'
import classNames from 'classnames'

export class SpanButton extends React.Component {
  copyToClipboard() {
    // todo: impl copy
  }

  render() {
    return ( 
      createDefaultToolbarButton(
        'Get Xanalink',
        classNames('xanlink-button', OptionalBlueprint.getIconClass('LINK')),
        this.copyToClipboard
      )
    )
  }
}

export class SourceButton extends React.Component {
  // Should this be done in window or break out to a new tab?
  showRaw() {
    // Check if current or has tree info
    console.log("Opening in new tab: ", this.props.src)
    window.open(this.props.src, "_blank")
  }

  render() {
    return ( 
      createDefaultToolbarButton(
        'View Source',
        classNames('src-button', OptionalBlueprint.getIconClass('CODE')),
        () => this.showRaw()
      )
    )
  }
}