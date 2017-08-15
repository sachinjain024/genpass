(function(window) {
  var GenetateController = {
    passCharacters: ('abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789').split(''),
    specialCharacters: '!@#$%^&*()_+-='.split(''),
    NumberOfBannerImages: 18,

    defaults: {
    },

    fieldSelectors: {
      passwordFieldSelector: '#generated-password-field',
      regenerate: '.regenerate-password'
    },

    updatePasswordField: function(password) {
      $(this.fieldSelectors.passwordFieldSelector).html(password);
      $(this.fieldSelectors.passwordFieldSelector).attr('data-password', password);
    },

    addEventListeners: function() {
      var that = this;

      $(this.fieldSelectors.regenerate).click(function() {
        that.generatePassword(that.currentPageUrl);
      });
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

    getRandomNumber: function(upperBound) {
      upperBound = upperBound || 100;
      return Math.floor((Math.random()*10000) % upperBound);
    },

    generateRandomPassword: function(length) {
      var pass = '',
        allCharsLength = this.allCharacters.length;

      for (var i = 0; i < length; i++) {
        var randomNumber = this.getRandomNumber(allCharsLength);
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
        that.updatePasswordDescription(settings);
      });
    },

    createPasswordDictionary: function() {
      var dict = Array.prototype.concat(this.passCharacters, this.specialCharacters);
      return this.shuffle(dict);
    },

    initClipboard: function() {
      var clipboard = new Clipboard('#generated-password-field', {
        text: function(copyTarget) {
          return copyTarget.getAttribute('data-password');
        }
      });

      clipboard.on('success', function(e) {
        $('.copy-message').html('Copied!!');
      });

      clipboard.on('error', function(e) {
        $('.copy-message').html('Unable to copy. Please copy manually!');
      });
    },

    updateBanner: function() {
      var randomNumber = this.getRandomNumber(this.NumberOfBannerImages);
      var imageUrl = '/resources/images/banners/' + randomNumber + '.jpg';

      $('#banner-image').attr('src', imageUrl);
    },

    updatePasswordDescription: function(settings) {
      var description;

      if (settings['generationType'] === PG.CONSTANTS.SETTINGS.CONSISTENT_GENERATION_TYPE) {
        description = 'This is consistent password based on current domain and master string.'
      } else {
        description = 'This is totally randomized password of ' + settings['passwordLength'] + ' length.'
      }

      $('#password-description').html(description);
    },

    init: function() {
      var that = this;

      this.allCharacters = this.createPasswordDictionary();
      this.initClipboard();
      this.addEventListeners();
      this.updateBanner();

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        that.currentPageUrl = tabs[0].url || 'about:blank';
        that.generatePassword(that.currentPageUrl)
      });
    }
  };

  GenetateController.init();

  window.GenetateController = GenetateController;
})(window);
