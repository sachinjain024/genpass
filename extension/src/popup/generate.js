(function(window) {
  var GenetateController = {
    passCharacters: ('abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789').split(''),
    shuffledLowerCaseChars: 'ltzkrjpxyqgcihdmoabvuwnesf'.split(''),
    shuffledUpperCaseChars: 'ZUINFTBEJPRAGOMLDSVXHWKCYQ'.split(''),
    specialCharacters: '!@-#$.^&_:%?='.split(''),
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

    getHashValue: function(string) {
      var hash,
        that = this;

      hash = string.split('').reduce(function(sum, char) {
        return sum + ((that.passCharacters.indexOf(char) * 17) % 31);
      }, 0);

      return hash;
    },

    introduceSpecialCharacter: function(currentPassword, domain) {
      var hash1 = this.getHashValue(currentPassword),
        hash2 = this.getHashValue(domain),
        passAsArray = currentPassword.split(''),
        passLength = currentPassword.length;

      passAsArray[hash1 % passLength] = this.specialCharacters[hash1 % this.specialCharacters.length];
      passAsArray[hash2 % passLength] = this.specialCharacters[hash2 % this.specialCharacters.length];

      return passAsArray.join('');
    },

    /**
     * Replace given character with new Upper case character in consistent manner
     *
     * @param currentPassword
     * @param character
     * @returns String updatedPassword
     */
    introduceCase: function(currentPassword, character) {
      var passAsArray = currentPassword.split(''),
        indexInAlphabets = this.passCharacters.indexOf(character),
        targetIndex = indexInAlphabets % currentPassword.length,
        newCharacter;

      newCharacter = this.shuffledUpperCaseChars[indexInAlphabets % 26];

      if (targetIndex === -1) {
        targetIndex = 0;
      }

      passAsArray[targetIndex] = newCharacter;

      return passAsArray.join('');
    },

    trimStringToLength: function(string, length) {
      return string.substr(0, length);
    },

    generateConsistentPassword: function(url, master, length) {
      var md5Hash,
        finalPass,
        dummyElement = document.createElement('a');

      dummyElement.href = url;
      md5Hash = md5(dummyElement.host, master);

      // Trim password to desired length
      finalPass = this.trimStringToLength(md5Hash, length);

      // Introduce upper case characters
      finalPass = this.introduceCase(finalPass, dummyElement.host.charAt(0));
      finalPass = this.introduceCase(finalPass, master.charAt(0));

      console.log(finalPass);

      // Introduce special characters
      finalPass = this.introduceSpecialCharacter(finalPass, dummyElement.host);

      return finalPass;
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
