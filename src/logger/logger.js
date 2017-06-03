var Logger = {
  enabled: true,
  ns: 'iCashback: ',

  log: function(msg) {
    this.enabled && console.log.apply(console, [this.ns].concat(Array.prototype.slice.call(arguments)));
  },

  error: function(msg) {
    this.enabled && console.error.apply(console, [this.ns].concat(Array.prototype.slice.call(arguments)));
  }
};
