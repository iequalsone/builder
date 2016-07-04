import vcCake from 'vc-cake'
import React from 'react'
import ReactDOM from 'react-dom'
import BarContent from './lib/content'
import BarHeader from './lib/header'
import Resizer from '../../content/resizer/component/resizer'

vcCake.add('ui-layout-bar', (api) => {
  class LayoutBar extends React.Component {
    render () {
      return (
        <div className='vcv-layout-bar'>
          <BarHeader api={api} />
          <BarContent api={api} />
          <Resizer params={{
            resizeY: false,
            resizerTarget: '.vcv-layout-bar-content',
            resizerClasses: 'vcv-ui-resizer vcv-ui-resizer-x vcv-ui-resizer-tree-view-detached-x'
          }} />
          <Resizer params={{
            resizerTarget: '.vcv-layout-bar-content',
            resizerClasses: 'vcv-ui-resizer vcv-ui-resizer-tree-view-detached-xy'
          }} />
        </div>
      )
    }
  }
  module.exports = (LayoutBar)

  let layoutHeader = document.querySelector('#vcv-layout-header')
  ReactDOM.render(
    <LayoutBar />,
    layoutHeader
  )
})
