import React from 'react'
import vcCake from 'vc-cake'

const vcvAPI = vcCake.getService('api')

export default class ColumnElement extends vcvAPI.elementComponent {
  getContent (doBoxModel, innerProps) {
    let rowProps = vcCake.getService('document').get(this.props.atts.parent)
    let content = this.props.children
    let contentContainer = ''

    if (rowProps.contentPosition === 'top') {
      contentContainer = (
        <div className='vce-col-inner' {...innerProps} {...doBoxModel}>
          {content}
        </div>
      )
    } else {
      contentContainer = (
        <div className='vce-col-inner' {...innerProps} {...doBoxModel}>
          <div className='vce-col-content'>
            {content}
          </div>
        </div>
      )
    }
    return contentContainer
  }

  render () {
    // import variables
    let { id, atts, editor, isBackend } = this.props
    let { size, customClass, metaCustomId, designOptionsAdvanced, lastInRow, firstInRow, hidden, disableStacking, sticky } = atts

    // import template js
    const classNames = require('classnames')
    let customColProps = {}
    let innerProps = {}
    let classes = [ 'vce-col' ]

    classes.push(this.getBackgroundClass(designOptionsAdvanced))

    if (hidden && isBackend) {
      classes.push('vce-wpbackend-element-hidden')
    }

    if (disableStacking) {
      classes.push('vce-col--xs-' + (size[ 'all' ] ? size[ 'all' ].replace('/', '-').replace('%', 'p').replace(',', '-').replace('.', '-') : 'auto'))

      if (lastInRow[ 'all' ]) {
        classes.push('vce-col--all-last')
      }

      if (firstInRow[ 'all' ]) {
        classes.push('vce-col--all-first')
      }
    } else {
      if (size[ 'all' ]) {
        if (size[ 'all' ] === 'hide') {
          classes.push('vce-col--all-hide')
        } else {
          classes.push('vce-col--md-' + (size[ 'all' ] ? size[ 'all' ].replace('/', '-').replace('%', 'p').replace(',', '-').replace('.', '-') : 'auto'))
          classes.push('vce-col--xs-1 vce-col--xs-last vce-col--xs-first vce-col--sm-last vce-col--sm-first')

          if (lastInRow[ 'all' ]) {
            classes.push('vce-col--md-last vce-col--lg-last vce-col--xl-last')
          }

          if (firstInRow[ 'all' ]) {
            classes.push('vce-col--md-first vce-col--lg-first vce-col--xl-first')
          }
        }
      } else { // Custom device column size
        Object.keys(size).forEach((device) => {
          let deviceSize = size[ device ]

          if (deviceSize === '') {
            deviceSize = 'auto'
          }

          if (device !== 'defaultSize') {
            classes.push(`vce-col--${device}-` + (deviceSize ? deviceSize.replace('/', '-').replace('%', 'p').replace(',', '-').replace('.', '-') : 'auto'))

            if (deviceSize !== 'hide') {
              classes.push(`vce-col--${device}-visible`)
            }

            if (lastInRow[ device ]) {
              classes.push(`vce-col--${device}-last`)
            }

            if (firstInRow[ device ]) {
              classes.push(`vce-col--${device}-first`)
            }
          }
        })
      }
    }

    if (typeof customClass === 'string' && customClass.length) {
      classes.push(customClass)
    }

    let className = classNames(classes)
    if (metaCustomId) {
      innerProps.id = metaCustomId
    }
    innerProps[ 'data-vce-element-content' ] = true

    let doBackground = this.applyDO('background border')
    let doBoxModel = this.applyDO('padding margin animation')

    let stickyAttributes = {}
    if (sticky && sticky.device) {
      stickyAttributes = this.getStickyAttributes(sticky)
    }

    customColProps[ 'data-vce-delete-attr' ] = 'style'
    innerProps[ 'data-vce-delete-attr' ] = 'style'

    innerProps = { ...innerProps, ...stickyAttributes }

    // import template
    return (<div className={className} {...customColProps} id={'el-' + id} {...editor} {...doBackground}>
      {this.getBackgroundTypeContent()}
      {this.getContainerDivider()}
      {this.getContent(doBoxModel, innerProps)}
    </div>)
  }
}
