(function(window) {
  var SettingsController = {
    defaults: {
      generationType: PG.CONSTANTS.SETTINGS.CONSISTENT_GENERATION_TYPE,
      masterString: PG.CONSTANTS.SETTINGS.DEFAULT_MASTER_STRING,
      passwordLength: PG.CONSTANTS.SETTINGS.DEFAULT_PASSWORD_LENGTH
    },

    fieldSelectors: {
      generationType: '.generation-type-setting',
      masterString: '#master-string-el',
      passwordLength: '#password-length-el'
    },

    addListeners: function() {
      var that = this;

      $(this.fieldSelectors.generationType + ' input').change(function(event) {
        that.set('generationType', event.target.getAttribute('data-value'));
      });

      $(this.fieldSelectors.masterString).change(function(event) {
        that.set('masterString', event.target.value);
      });

      $(this.fieldSelectors.passwordLength).change(function(event) {
        that.set('passwordLength', event.target.value);
      });
    },

    set: function(keyName, value) {
      var that = this;

      StorageService.getRecord(PG.CONSTANTS.SETTINGS.KEY_NAME_IN_STORAGE, function(result) {
        var settingsObject = result[PG.CONSTANTS.SETTINGS.KEY_NAME_IN_STORAGE] || {};
        settingsObject[keyName] = value;

        that.persistSettings(settingsObject);
      });
    },

    persistSettings: function(settingsObjects) {
      var objToSave = {};
      objToSave[PG.CONSTANTS.SETTINGS.KEY_NAME_IN_STORAGE] = settingsObjects;

      StorageService.saveRecord(objToSave);
    },

    updateFields: function(settingsObject) {
      $(this.fieldSelectors.generationType).find('label').removeClass('active');
      $(this.fieldSelectors.generationType + ' input[data-value=' + settingsObject['generationType'] + ']')
        .attr('checked', true)
        .parent('label').addClass('active');

      $(this.fieldSelectors.masterString).val(settingsObject['masterString']);
      $(this.fieldSelectors.passwordLength).val(settingsObject['passwordLength']);
    },

    init: function() {
      var that = this;

      StorageService.getRecord(PG.CONSTANTS.SETTINGS.KEY_NAME_IN_STORAGE, function(result) {
        var settingsObject = result[PG.CONSTANTS.SETTINGS.KEY_NAME_IN_STORAGE];
        var allSettings = Object.assign({}, that.defaults, settingsObject);

        Logger.log(allSettings);

        that.updateFields(allSettings);
        that.addListeners();
      });
    }
  };

  SettingsController.init();

  window.SettingsController = SettingsController;
})(window);
