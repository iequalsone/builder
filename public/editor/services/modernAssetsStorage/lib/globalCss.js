export default class GlobalCss {
  set data (value) {
    this._data = value
  }
  get data () {
    return this._data || ''
  }
}
