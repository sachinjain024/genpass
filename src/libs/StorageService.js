/**
 * Wrapper over Chrome Storage Service APIs.
 * TODO: Convert Storage Service into a Class and accept type of storage as param.
 * TODO: Move this into another repo so that people should re-use it.
 * TODO: Usage: var localStorageService = new StorageService({ DB: 'local' });
 */

var StorageService = {
  records: [],
  isRecordsFetched: false,
  DB: chrome.storage['sync']
};

StorageService.printRecords = function() {
  this.DB.get(null, function(o) {
    console.log(o);
  });
};

StorageService.clearDB = function() {
  this.DB.clear();
};

StorageService.getRecords = function(options) {
  var self = this;

  options = options || {};

  /* If records have been read from storage, return the cached values */
  if (this.isRecordsFetched && !options.forceFetch) {
    typeof options.callback === 'function' && options.callback(this.records);
    return;
  }

  // Clear the existing records
  this.records.length = 0;

  this.DB.get(null, function(superObject) {
    for (var key in superObject) {
      if (typeof superObject[key][StorageService.primaryKey] !== 'undefined') {
        self.records.push(superObject[key]);
      }
    }

    self.isRecordsFetched = true;

    typeof options.callback === 'function' && options.callback(self.records);
  });
};

StorageService.saveRecord = function(object, callback) {
  callback = callback || function() { console.log('Default Handler: Saving Object ', object) };
  this.DB.set(object, callback);
};

StorageService.getRecord = function(key, callback) {
  callback = callback || function() { console.log('Default handler called when record is fetched:', key) };
  StorageService.DB.get(key, callback);
};

StorageService.removeRecord = function(key, callback) {
  callback = callback || function() { console.log('Default handler called when record is removed:', key) };
  StorageService.DB.remove(key, callback);
};

StorageService.getCachedRecordIndex = function(keyToFind) {
  var recordKey,
    recordIndex;

  for (recordIndex = 0; recordIndex < StorageService.records.length; recordIndex++) {
    recordKey = StorageService.records[recordIndex].id;

    if (recordKey === keyToFind) {
      return recordIndex;
    }
  }

  return -1;
};

/**
 * StorageService.records are updated on every add/edit/delete operation
 * So that background rules can be updated which are executed when each request URL is intercepted
 * @param changes SuperObject with key as Object key which is changed with old and new values
 * @param namespace Storage type: 'sync' or 'local'
 */
StorageService.updateRecords = function(changes, namespace) {
  var changedObject,
    changedObjectIndex,
    objectExists,
    changedObjectKey;

  if (StorageService.DB === chrome.storage[namespace]) {
    for (changedObjectKey in changes) {
      if (!changes.hasOwnProperty(changedObjectKey)) {
        continue;
      }

      changedObject = changes[changedObjectKey];
      changedObjectIndex = StorageService.getCachedRecordIndex(changedObjectKey);
      objectExists = (changedObjectIndex !== -1);

      // Add/Edit Rule operation
      if (typeof changedObject.newValue !== 'undefined') {
        // Don't cache records when objects do not contain primaryKey
        if (typeof changedObject.newValue[StorageService.primaryKey] === 'undefined') {
          continue;
        }

        objectExists
          ? StorageService.records[changedObjectIndex] = changedObject.newValue    /* Update existing object (Edit) */
          : StorageService.records.push(changedObject.newValue);                   /* Create New Object */
      }

      // Delete Rule Operation
      if (typeof changedObject.oldValue !== 'undefined' && typeof changedObject.newValue === 'undefined' && objectExists) {
        StorageService.records.splice(changedObjectIndex, 1);
      }
    }
  }
};

chrome.storage.onChanged.addListener(StorageService.updateRecords);