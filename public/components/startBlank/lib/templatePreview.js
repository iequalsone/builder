import vcCake from 'vc-cake'
import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

const sharedAssetsLibraryService = vcCake.getService('sharedAssetsLibrary')

export default class TemplatePreview extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      previewVisible: false,
      previewStyle: {}
    }
    const localizations = window.VCV_I18N && window.VCV_I18N()

    this.templateInfo = {
      'theme-default': {
        description: localizations ? localizations.themeDefaultDescription : 'Your WordPress theme defined layout for specific page, post, or custom post type.',
        img: 'theme-defined-preview.png'
      },
      'vc__blank': {
        description: localizations ? localizations.vcBlankDescription : 'Full width blank page without header, footer, or sidebar.',
        img: 'blank-preview.png'
      },
      'vc-theme__header-footer-layout': {
        description: localizations ? localizations.vcThemeHeaderFooterDescription : 'Default layout with custom header, content, and footer area.',
        img: 'header-footer-preview.png'
      },
      'vc-theme__header-footer-sidebar-layout': {
        description: localizations ? localizations.vcThemeHeaderFooterSidebarDescription : 'Default layout with custom header, content, footer and sidebar area on the right.',
        img: 'hfs-right-preview.png'
      },
      'vc-theme__header-footer-sidebar-left-layout': {
        description: localizations ? localizations.vcThemeHeaderFooterLeftSidebarDescription : 'Default layout with custom header, content, footer and sidebar area on the left.',
        img: 'hfs-left-preview.png'
      }
    }

    this.handleClick = this.handleClick.bind(this)
    this.showPreview = this.showPreview.bind(this)
    this.hidePreview = this.hidePreview.bind(this)
  }

  showPreview () {
    if (this.updatePreviewPosition()) {
      this.setState({
        previewVisible: true
      })
    }
  }

  hidePreview () {
    this.setState({
      previewVisible: false
    })
  }

  getClosest (el, selector) {
    let matchesFn;
    // find vendor prefix
    [ 'matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector' ].some(function (fn) {
      if (typeof document.body[ fn ] === 'function') {
        matchesFn = fn
        return true
      }
      return false
    })
    let parent
    // traverse parents
    while (el) {
      parent = el.parentElement
      if (parent && parent[ matchesFn ](selector)) {
        return parent
      }
      el = parent
    }
    return null
  }

  updatePreviewPosition () {
    let element = ReactDOM.findDOMNode(this)

    let container
    if (element.closest === undefined) {
      container = this.getClosest(element, '.vcv-ui-item-list')
    } else {
      container = element.closest('.vcv-ui-item-list')
    }
    let firstElement = container.querySelector('.vcv-ui-item-list-item')
    let trigger = element.querySelector('.vcv-start-blank-content')
    let preview = element.querySelector('.vcv-ui-item-preview-container')

    let triggerSizes = trigger.getBoundingClientRect()
    let firsElementSize = firstElement.getBoundingClientRect()
    let previewSizes = preview.getBoundingClientRect()
    let windowSize = {
      height: window.innerHeight,
      width: window.innerWidth
    }

    // default position
    let posX = triggerSizes.left + triggerSizes.width
    let posY = triggerSizes.top
    // position if no place to show on a right side
    if (posX + previewSizes.width > windowSize.width) {
      posX = triggerSizes.left - previewSizes.width
    }
    // position if no place to show on left side (move position down)
    if (posX < 0) {
      posX = triggerSizes.left
      posY = triggerSizes.top + triggerSizes.height
    }
    // position if no place to show on right side
    if (posX + previewSizes.width > windowSize.width) {
      posX = triggerSizes.left + triggerSizes.width - previewSizes.width
    }
    // position if no place from left and right
    if (posX < 0) {
      posX = firsElementSize.left
    }
    // don't show if window size is smaller than preview
    if (posX + previewSizes.width > windowSize.width) {
      return false
    }

    // position if no place to show on bottom
    if (posY + previewSizes.height > windowSize.height) {
      posY = triggerSizes.top + triggerSizes.height - previewSizes.height
      // position if preview is above element
      if (posX === triggerSizes.left || posX === firsElementSize.left) {
        posY = triggerSizes.top - previewSizes.height
      }
    }
    // don't show if window size is smaller than preview
    if (posY < 0) {
      return false
    }

    this.setState({
      previewStyle: {
        left: posX,
        top: posY
      }
    })
    return true
  }

  handleClick (e) {
    e && e.preventDefault()
    const { click, blank, templatesList, templateValue } = this.props
    if (!click) {
      return
    }
    if (blank) {
      click('theme', 'default')
    } else {
      click(templatesList.type, templateValue)
    }
  }

  render () {
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const addText = localizations ? localizations.add : 'Add'
    const availableInPremiumText = localizations ? localizations.availableInPremium : 'Available in Premium version.'

    const { name, templateName, active, disabled, icon } = this.props
    const { previewVisible, previewStyle } = this.state

    if (typeof this.templateInfo[ templateName ] === 'undefined') {
      return null
    }
    let description = this.templateInfo[ templateName ].description
    if (disabled) {
      description += ` ${availableInPremiumText}`
    }

    let preview = this.templateInfo[ templateName ].img

    let elementContentClasses = classNames({
      'vcv-start-blank-content': true
    })

    let previewClasses = classNames({
      'vcv-ui-item-preview-container': true,
      'vcv-ui-state--visible': previewVisible
    })

    let figure = (
      <figure className={previewClasses} style={previewStyle}>
        <img
          className='vcv-ui-item-preview-image'
          src={sharedAssetsLibraryService.getSourcePath(`images/templatePreview/${preview}`)}
          alt={name}
        />
        <figcaption className='vcv-ui-item-preview-caption'>
          <div className='vcv-ui-item-preview-text'>
            {description}
          </div>
        </figcaption>
      </figure>
    )

    let Icon = icon
    let iconProps = {
      classes: 'vcv-ui-start-layout-list-item-icon'
    }

    let itemClasses = classNames({
      'vcv-ui-item-list-item vcv-ui-start-layout-list-item': true,
      'vcv-ui-start-layout-list-item-active': active,
      'vcv-ui-start-layout-list-item-disabled': disabled
    })

    let iconHtml = icon ? (<Icon {...iconProps} />) : null

    return (
      <li className={itemClasses}>
        <span className='vcv-ui-item-element'
          title={`${addText} ${name}`}
          onClick={this.handleClick}
          onMouseEnter={this.showPreview}
          onMouseLeave={this.hidePreview}
        >
          <span className={elementContentClasses}>
            {iconHtml}
          </span>
          {figure}
        </span>
      </li>
    )
  }
}
