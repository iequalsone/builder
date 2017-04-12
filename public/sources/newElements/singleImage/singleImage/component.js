import React from 'react'
import vcCake from 'vc-cake'
const vcvAPI = vcCake.getService('api')
const cook = vcCake.getService('cook')

export default class SingleImageElement extends vcvAPI.elementComponent {
  static imageSizes = {
    thumbnail: {
      height: '150',
      width: '150'
    },
    medium: {
      height: '300',
      width: '300'
    },
    large: {
      height: '1024',
      width: '1024'
    }
  }

  static imgProps = {}

  constructor (props) {
    super(props)
    this.getCustomSizeImage = this.getCustomSizeImage.bind(this)
    this.insertImage = this.insertImage.bind(this)
    this.setCustomSizeState = this.setCustomSizeState.bind(this)
  }

  componentDidMount () {
    console.log(this.props.atts)
    SingleImageElement.imgProps[ 'data-img-src' ] = this.getImageUrl(this.props.atts.image, 'full')
    SingleImageElement.imgProps[ 'alt' ] = this.props.atts.image && this.props.atts.image.alt ? this.props.atts.image.alt : (typeof this.props.atts.image === 'string' ? 'Single Image' : '')
    SingleImageElement.imgProps[ 'title' ] = this.props.atts.image && this.props.atts.image.title ? this.props.atts.image.title : (typeof this.props.atts.image === 'string' ? 'Single Image' : '')

    console.log(typeof this.props.atts.image === 'string')
    console.log(SingleImageElement.imgProps)
    if (this.props.atts.size === 'full' && this.props.atts.shape !== 'round') {
      return true
    }
    if (this.props.atts.image && !this.props.atts.image.id) {
      if (this.props.atts.size) {
        if (this.props.atts.size.match(/\d*(x)\d*/)) {
          this.setCustomSizeState(this.props.atts.image, this.props.atts.size, this.props.atts.shape === 'round')
        } else if (this.props.atts.size === 'full') {
          this.checkImageSize(this.props.atts.image, this.setCustomSizeState, this.props.atts.shape === 'round')
        } else {
          this.setCustomSizeState(this.props.atts.image, this.checkRelatedSize(this.props.atts.size), this.props.atts.shape === 'round')
        }
      } else {
        this.checkImageSize(this.props.atts.image, this.setCustomSizeState, this.props.atts.shape === 'round')
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    SingleImageElement.imgProps[ 'data-img-src' ] = this.getImageUrl(nextProps.atts.image, 'full')
    SingleImageElement.imgProps[ 'alt' ] = nextProps.atts.image && nextProps.atts.image.alt ? nextProps.atts.image.alt : (typeof nextProps.atts.image === 'string' ? 'Single Image' : '')
    SingleImageElement.imgProps[ 'title' ] = nextProps.atts.image && nextProps.atts.image.title ? nextProps.atts.image.title : (typeof nextProps.atts.image === 'string' ? 'Single Image' : '')

    if (nextProps.atts.size === 'full' && nextProps.atts.shape !== 'round') {
      this.setState({
        imgSize: null
      })
      return true
    }
    if (nextProps.atts.image && !nextProps.atts.image.id) {
      if (nextProps.atts.size) {
        if (nextProps.atts.size.match(/\d*(x)\d*/)) {
          this.setCustomSizeState(nextProps.atts.image, nextProps.atts.size, nextProps.atts.shape === 'round')
        } else if (nextProps.atts.size === 'full') {
          this.checkImageSize(nextProps.atts.image, this.setCustomSizeState, nextProps.atts.shape === 'round')
        } else {
          this.setCustomSizeState(nextProps.atts.image, this.checkRelatedSize(nextProps.atts.size), nextProps.atts.shape === 'round')
        }
      } else {
        this.checkImageSize(nextProps.atts.image, this.setCustomSizeState, nextProps.atts.shape === 'round')
      }
    } else {
      this.setState({
        imgSize: null
      })
    }
  }

  checkImageSize (image, callback, isRound, size) {
    let img = new window.Image()
    img.onload = () => {
      let size = {
        width: img.width,
        height: img.height
      }
      callback(image, size, isRound)
    }
    img.src = this.getImageUrl(image, size)
  }

  getPublicImage (filename) {
    let { metaAssetsPath } = this.props.atts

    return metaAssetsPath + filename
  }

  getImageUrl (image, size) {
    let imageUrl
    // Move it to attribute
    if (size && image && image[ size ]) {
      imageUrl = image[ size ]
    } else {
      if (image && image.full) {
        imageUrl = image.full
      } else {
        imageUrl = this.getPublicImage(image)
      }
    }
    return imageUrl
  }

  parseSize (size, isRound) {
    if (typeof size === 'string') {
      size = size.replace(/\s/g, '').replace(/px/g, '').toLowerCase().split('x')
    } else if (typeof size === 'object') {
      size = [ size.width, size.height ]
    }

    if (isRound) {
      let smallestSize = size[ 0 ] >= size[ 1 ] ? size[ 1 ] : size[ 0 ]
      size = {
        width: smallestSize,
        height: smallestSize
      }
    } else {
      size = {
        width: size[ 0 ],
        height: size[ 1 ]
      }
    }
    return size
  }

  getCustomSizeImage (image, size, isRound) {
    let id = image.id
    size = this.parseSize(size, isRound)
    vcCake.getService('dataProcessor').appServerRequest({
      'vcv-action': 'elements:imageController:customSize:adminNonce',
      'vcv-image-id': id,
      'vcv-size': size.width + 'x' + size.height,
      'vcv-nonce': window.vcvNonce
    }).then((data) => {
      let imageData = JSON.parse(data)
      this.insertImage(imageData.img.imgUrl)
    })
  }

  insertImage (imgSrc) {
    let img = new window.Image()
    img.onload = () => {
      this.refs.imageContainer.innerHTML = ''
      this.refs.imageContainer.appendChild(img)
      vcCake.env('iframe').vcv.trigger('singleImageReady')
      if (this.props.atts.shape === 'round') {
        this.refs.imageContainer.classList.add('vce-single-image--border-round')
      } else {
        this.refs.imageContainer.classList.remove('vce-single-image--border-round')
      }
    }
    img.src = imgSrc
    img.setAttribute('data-img-src', SingleImageElement.imgProps[ 'data-img-src' ])
    img.setAttribute('alt', SingleImageElement.imgProps[ 'alt' ])
    img.setAttribute('title', SingleImageElement.imgProps[ 'title' ])
    img.className = 'vce-single-image'
  }

  checkRelatedSize (size) {
    let relatedSize = ''
    if (window.vcvImageSizes && window.vcvImageSizes[ size ]) {
      relatedSize = window.vcvImageSizes[ size ]
    } else if (SingleImageElement.imageSizes[ size ]) {
      relatedSize = SingleImageElement.imageSizes[ size ]
    }
    return relatedSize
  }

  setCustomSizeState (image, size, isRound) {
    let imgSrc = this.getImageUrl(image)
    let currentSize = this.parseSize(size, isRound)

    this.setState({
      imgSize: {
        width: currentSize.width + 'px',
        backgroundImage: currentSize.width ? 'url(' + imgSrc + ')' : ''
      }
    })
  }

  render () {
    let { id, atts, editor } = this.props
    let { image, shape, clickableOptions, customClass, size, alignment, metaCustomId } = atts
    let containerClasses = 'vce-single-image-container'
    let wrapperClasses = 'vce vce-single-image-wrapper'
    let classes = 'vce-single-image-inner'
    let customProps = {}
    let containerProps = {}
    let wrapperProps = {}
    let CustomTag = 'div'
    let originalSrc = this.getImageUrl(image, 'full')
    let customImageProps = SingleImageElement.imgProps
    let imgSrc = originalSrc

    size = size.replace(/\s/g, '').replace(/px/g, '').toLowerCase()

    if (image && image.id) {
      if (size && size.match(/\d*(x)\d*/)) {
        this.getCustomSizeImage(image, size, shape === 'round')
      } else if (shape === 'round') {
        this.checkImageSize(image, this.getCustomSizeImage, true, size)
      } else {
        imgSrc = this.getImageUrl(image, size)
      }
    }

    if (this.state && this.state.imgSize) {
      classes += ' vce-single-image--size-custom'
    }

    if (typeof customClass === 'string' && customClass) {
      containerClasses += ' ' + customClass
    }

    if (clickableOptions === 'url' && image.link && image.link.url) {
      CustomTag = 'a'
      let { url, title, targetBlank, relNofollow } = image.link
      customProps = {
        'href': url,
        'title': title,
        'target': targetBlank ? '_blank' : undefined,
        'rel': relNofollow ? 'nofollow' : undefined
      }
    } else if (clickableOptions === 'imageNewTab') {
      CustomTag = 'a'
      customProps = {
        'href': originalSrc,
        'target': '_blank'
      }
    } else if (clickableOptions === 'lightbox') {
      CustomTag = 'a'
      customProps = {
        'href': originalSrc,
        'data-lightbox': `lightbox-${id}`
      }
    } else if (clickableOptions === 'zoom') {
      classes += ' vce-single-image-zoom-container'
    }

    if (alignment) {
      containerClasses += ` vce-single-image--align-${alignment}`
    }

    if (shape === 'rounded') {
      classes += ' vce-single-image--border-rounded'
      wrapperClasses += ' vce-single-image--border-rounded'
    }

    if (shape === 'round') {
      classes += ' vce-single-image--border-round'
      wrapperClasses += ' vce-single-image--border-round'
    }

    customProps.key = `customProps:${id}-${imgSrc}-${clickableOptions}-${shape}-${size}`

    if (metaCustomId) {
      containerProps.id = metaCustomId
    }

    customProps.style = this.state ? this.state.imgSize : null

    let doAll = this.applyDO('all')

    return <div className={containerClasses} {...editor} {...containerProps}>
      <div className={wrapperClasses} {...wrapperProps} id={'el-' + id} {...doAll}>
        <CustomTag {...customProps} className={classes} ref='imageContainer'>
          <img className='vce-single-image' src={imgSrc} {...customImageProps} />
        </CustomTag>
      </div>
    </div>
  }
}
