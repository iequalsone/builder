import {addStorage, getService} from 'vc-cake'
addStorage('settings', (storage) => {
  const modernAssetsStorage = getService('modernAssetsStorage')
  storage.state('globalCss').onChange((data) => {
    const globalAssetsStorage = modernAssetsStorage.getGlobalInstance()
    globalAssetsStorage.setGlobalCss(data)
  })
  storage.state('customCss').onChange((data) => {
    const globalAssetsStorage = modernAssetsStorage.getGlobalInstance()
    globalAssetsStorage.setCustomCss(data)
  })
})