/* eslint-disable */
/**
 * browser-deeplink v0.1
 *
 * Author: Hampus Ohlsson, Nov 2014
 * GitHub: http://github.com/hampusohlsson/browser-deeplink
 *
 * MIT License
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('deeplink', factory(root));
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.deeplink = factory(root);
  }
})(window || this, function(root) {

  "use strict"
  /**
   * Cannot run without DOM or user-agent
   */
  if (!root.document || !root.navigator) {
    return;
  }

  /**
   * Set up scope variables and settings
   */
  let timeout;
  let settings = {};
  const defaults = {
    iOS: {},
    android: {},
    androidDisabled: false,
    fallback: true,
    fallbackToWeb: false,
    delay: 700,
    delta: 500,
  };
  let this_uri;

  /**
   * Merge defaults with user options
   * @private
   * @param {Object} defaults Default settings
   * @param {Object} options User options
   * @returns {Object} Merged values of defaults and options
   */
  const extend = function(defaults, options) {
    const extended = {};
    for (var key in defaults) {
      extended[key] = defaults[key];
    }
    for (var key in options) {
      extended[key] = options[key];
    }
    return extended;
  };

  /**
   * Generate the app store link for iOS / Apple app store
   *
   * @private
   * @returns {String} App store itms-apps:// link
   */
  const getStoreURLiOS = function() {
    const baseurl = 'itms-apps://itunes.apple.com/app/';
    const name = settings.iOS.appName;
    const id = settings.iOS.appId;
    return id && name ? `${baseurl + name}/id${id}?mt=8` : null;
  };

  /**
   * Generate the app store link for Google Play
   *
   * @private
   * @returns {String} Play store https:// link
   */
  const getStoreURLAndroid = function() {
    const baseurl = 'market://details?id=';
    const id = settings.android.appId;
    return id ? baseurl + id : null;
  };

  /**
   * Get app store link, depending on the current platform
   *
   * @private
   * @returns {String} url
   */
  const getStoreLink = function() {
    const linkmap = {
      ios: settings.iOS.storeUrl || getStoreURLiOS(),
      android: settings.android.storeUrl || getStoreURLAndroid(),
    };

    return linkmap[settings.platform];
  };

  /**
   * Get web fallback link, depending on the current platform
   * If none is set, default to current url
   *
   * @private
   * @returns {String} url
   */
  const getWebLink = function() {
    return settings.fallbackWebUrl || location.href;
  };

  /**
   * Check if the user-agent is Android
   *
   * @private
   * @returns {Boolean} true/false
   */
  const isAndroid = function() {
    return navigator.userAgent.match('Android');
  };

  /**
   * Check if the user-agent is iPad/iPhone/iPod
   *
   * @private
   * @returns {Boolean} true/false
   */
  const isIOS = function() {
    return (
      navigator.userAgent.match('iPad') ||
      navigator.userAgent.match('iPhone') ||
      navigator.userAgent.match('iPod')
    );
  };

  /**
   * Check if the user is on mobile
   *
   * @private
   * @returns {Boolean} true/false
   */
  const isMobile = function() {
    return isAndroid() || isIOS();
  };

  /**
   * Timeout function that tries to open the fallback link.
   * The fallback link is either the storeUrl for the platofrm
   * or the fallbackWebUrl for the current platform.
   * The time delta comparision is to prevent the app store
   * link from opening at a later point in time. E.g. if the
   * user has your app installed, opens it, and then returns
   * to their browser later on.
   *
   * @private
   * @param {Integer} Timestamp when trying to open deeplink
   * @returns {Function} Function to be executed by setTimeout
   */
  const openFallback = function(ts) {
    console.log('creating fallback function');
    return function() {console.log('opening fallback')
      const link = settings.fallbackToWeb ? getWebLink() : getStoreLink();
      // var wait = settings.delay + settings.delta;
      if (typeof link === 'string') {
        //window.location.href = link;
      }
    };
  };

  /**
   * The setup() function needs to be run before deeplinking can work,
   * as you have to provide the iOS and/or Android settings for your app.
   *
   * @public
   * @param {object} setup options
   */
  const setup = function(options) {
    settings = extend(defaults, options);

    if (isAndroid()) settings.platform = 'android';
    if (isIOS()) settings.platform = 'ios';
    if (typeof settings.platform === typeof undefined) {
      settings.platform = 'other';
    }
  };

  /**
   * Tries to open your app URI through a hidden iframe.
   *
   * @public
   * @param {String} Deeplink URI
   * @return {Boolean} true, if you're on a mobile device and the link was opened
   */
  const open = function(uri) {
    if (isAndroid() && settings.androidDisabled) {
      return;
    }

    if (settings.fallback || settings.fallbackToWeb) {
      setTimeout(openFallback(Date.now()), settings.delay);
    }

    if (isAndroid() && !navigator.userAgent.match(/Firefox/)) {
      var matches = uri.match(/([^:]+):\/\/(.+)$/i);
      uri = "intent://" + matches[2] + "#Intent;scheme=" + matches[1];
      uri += ";package=" + settings.android.appId;
      //uri += ";S.browser_fallback_url="+ settings.fallbackWebUrl;
      uri += ";end";
    }
console.log(uri)
    const iframe = document.createElement('iframe');
    iframe.onload = function() {
      console.log('iframe onload');
      iframe.parentNode.removeChild(iframe);
      window.location.href = uri;
    };

    this_uri = uri;

    iframe.src = uri;
    iframe.setAttribute('style', 'display:none;');
    document.body.appendChild(iframe);

    let a = document.getElementsByClassName('deep-link');
    a[0].href = uri
    a[0].click();

    return true;
  };

  const getURI = function() {
    return this_uri;
  }

  // Public API
  return {
    setup,
    open,
    getURI
  };
});
