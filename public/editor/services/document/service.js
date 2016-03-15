var vcCake = require('vc-cake');
var Immutable = require('immutable');
var documentData = Immutable.Map({});

var dataStore = {
  cloneIndex: 0.1,
  createKey: function() {
    var i, random;
    var uuid = '';

    for (i = 0; i < 8; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
        .toString(16);
    }
    return uuid;
  },
  getChildren: function(id) {
    return documentData
      .valueSeq()
      .filter((el)=> {return el.get('parent') === id;})
      .sortBy((el) => {return el.get('order');});
  },
  getLastOrderIndex: function(id) {
    var lastObj =  this.getChildren(id).last();
    return lastObj ? lastObj.get('order') + 1 : 0;
  },
  moveUp: function() {

  },
  moveDownAfter: function(id, step) {
    var element = documentData.get(id);
    var keys = documentData.valueSeq().filter((el) => {
      return el.get('id') !== element.get('id') &&
        el.get('parent') === element.get('parent') &&
        el.get('order') >= element.get('order');
    }).map((el) => {return el.get('id');}).toJS();
    documentData = documentData.updateIn(keys, el => el.set('order', el.get('order') + step));
  }
};

var api = {
  create: function(data) {
    var id = dataStore.createKey();
    var obj = Immutable.Map(data).mergeDeep({
      id: id,
      parent: data.parent || false,
      order: dataStore.getLastOrderIndex(data.parent || false)
    });
    documentData = documentData.set(id, obj);
    return obj.toJS();
  },
  delete: function(id) {
    documentData = documentData.delete(id);
    dataStore.getChildren(id).forEach((el) => {this.delete(el.get('id'));}, this);
    return id;
  },
  update: function(id, data) {
    var obj = documentData.get(id).mergeDeep(data);
    documentData = documentData.set(id, obj);
    return obj.toJS();
  },
  get: function(id) {
    return documentData.get(id).toJS();
  },
  children: function(id) {
    return dataStore.getChildren(id).toJS();
  },
  resort: function(parentId, items) {
    parentId = dataStore.filterId(parentId);
    items.forEach(function(id){
      var item = documentData.get(id);
      if(item) {
        var order = items.indexOf(item.get('id'));
        item  = item.withMutations(function(map) {
          map
            .set('parent', parentId)
            .set('order', order);
        });
        documentData = documentData.set(id, item);
      }
    }, this);
  },
  moveBefore: function(id, before) {
    var obj = documentData.get(id);
    var beforeObj = documentData(before);
    obj = obj.withMutations(function(map){

    });
  },
  moveAfter: function(id, after) {
    console.log('after');
  },
  prependTo: function(id, parent) {
    console.log('prepend');
  },
  clone: function(id, parent) {
    var obj = documentData.get(id);
    var cloneId = dataStore.createKey();
    var clone = obj.withMutations(function(map) {
      map.set('id', cloneId);
      if('undefined' !== typeof parent) {
        map.set('parent', parent);
      } else {
        dataStore.cloneIndex  += 0.1;
        map.set('order', map.get('order') + dataStore.cloneIndex);
      }
    });
    documentData = documentData.set(cloneId, clone);
    dataStore.getChildren(obj.get('id')).forEach(el => {this.clone(el.get('id'), cloneId);}, this);
    return clone.toJS();
  },
  all: function() {
    return documentData.toJS();
  },
  reset: function(data) {
    documentData = Immutable.fromJS(data);
  }
};

vcCake.addService('document', api);
