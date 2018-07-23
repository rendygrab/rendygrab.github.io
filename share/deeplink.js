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
    android: {
        appId: "com.grabtaxi.passenger"
    },
    androidDisabled: false,
    fallback: true,
    fallbackToWeb: true,
    fallbackWebUrl: 'https://www.grab.com',
    delay: 700,
  };

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
    return function() {
      const link = getWebLink();

      if (typeof link === 'string') {
        window.location.href = link;
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
    let timeout;
    if (isAndroid() && settings.androidDisabled) {
      return;
    }

    if (settings.cleared) {
      console.log("settings cleared called")
      //openFallback(Date.now());
    }

    if (settings.fallback || settings.fallbackToWeb) {
      console.log('timeout set');
      //timeout = setTimeout(openFallback(Date.now()), settings.delay);
    }

    console.log(uri)
    console.log(uri.match(/([^:]+):\/\/(.+)$/i))
    if (isAndroid() && !navigator.userAgent.match(/Firefox/)) {
      console.log('is android');
      if (!settings.cleared) {
        console.log('clearing timeout and clearing settings');
        clearTimeout(timeout);
        settings.cleared = true;
      }
      var matches = uri.match(/([^:]+):\/\/(.+)$/i);
      uri = "intent://" + matches[2] + "#Intent;scheme=" + matches[1];
      uri += ";package=" + settings.android.appId;
      uri += ";S.browser_fallback_url="+ settings.fallbackWebUrl;
      uri += ";end";
    }

    const iframe = document.createElement('iframe');
    iframe.onload = function() {
      iframe.parentNode.removeChild(iframe);
      window.location.href = uri;
    };

    iframe.src = uri;
    iframe.setAttribute('style', 'display:none;');
    document.body.appendChild(iframe);

    return true;
  };

  // Public API
  return {
    setup,
    open
  };
});
