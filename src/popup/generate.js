(function(window) {
  var GenetateController = {
    passCharacters: ('abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789').split(''),
    specialCharacters: '!@#$%^&*()_+-='.split(''),

    defaults: {
    },

    fieldSelectors: {
      passwordFieldSelector: '#generated-password-field'
    },

    updatePasswordField: function(password) {
      $(this.fieldSelectors.passwordFieldSelector).html(password);
    },

    shuffle: function(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    },

    generateRandomPassword: function(length) {
      var pass = '',
        allCharsLength = this.allCharacters.length;

      for (var i = 0; i < length; i++) {
        var randomNumber = Math.floor((Math.random()*10000) % allCharsLength);

        pass += this.allCharacters[randomNumber];
      }

      return pass;
    },

    trimStringToLength: function(string, length) {
      return string.substr(0, length);
    },

    generateConsistentPassword: function(url, master, length) {
      var md5Hash,
        dummyElement = document.createElement('a');

      dummyElement.href = url;
      md5Hash = md5(dummyElement.host, master);

      return this.trimStringToLength(md5Hash, length);
    },

    generatePassword: function(currentPageUrl) {
      var that = this;

      SettingsController.getSettings(function(settings) {
        var password;

        if (settings['generationType'] === PG.CONSTANTS.SETTINGS.CONSISTENT_GENERATION_TYPE) {
          password = that.generateConsistentPassword(currentPageUrl, settings['masterString'], settings['passwordLength']);
        } else {
          password = that.generateRandomPassword(settings['passwordLength'])
        }

        that.updatePasswordField(password);
      });
    },

    createPasswordDictionary: function() {
      var dict = Array.prototype.concat(this.passCharacters, this.specialCharacters);
      return this.shuffle(dict);
    },

    init: function() {
      var that = this;

      this.allCharacters = this.createPasswordDictionary();

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        that.generatePassword(tabs[0].url || 'about:blank')
      });
    }
  };

  GenetateController.init();

  window.GenetateController = GenetateController;
})(window);
