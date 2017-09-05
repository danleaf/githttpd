
var currentBrowser;

var browserVersion;

var isAndroid;

var BrowserType = {

    RTC_BROWSER_CHROME: "rtc_browser.chrome",

    RTC_BROWSER_OPERA: "rtc_browser.opera",

    RTC_BROWSER_FIREFOX: "rtc_browser.firefox",

    RTC_BROWSER_IEXPLORER: "rtc_browser.iexplorer",

    RTC_BROWSER_SAFARI: "rtc_browser.safari",

    RTC_BROWSER_NWJS: "rtc_browser.nwjs",

    RTC_BROWSER_ELECTRON: "rtc_browser.electron",

    RTC_BROWSER_REACT_NATIVE: "rtc_browser.react-native",

    /**
     * Gets current browser type.
     * @returns {string}
     */
    getBrowserType: function () {
        return currentBrowser;
    },

    /**
     * Gets current browser name, split from the type.
     * @returns {string}
     */
    getBrowserName: function () {
        var browser = currentBrowser.split('rtc_browser.')[1];
        if (BrowserType.isAndroid()) {
            browser = 'android';
        }
        return browser;
    },

    /**
     * Checks if current browser is Chrome.
     * @returns {boolean}
     */
    isChrome: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_CHROME;
    },

    /**
     * Checks if current browser is Opera.
     * @returns {boolean}
     */
    isOpera: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_OPERA;
    },

    /**
     * Checks if current browser is Firefox.
     * @returns {boolean}
     */
    isFirefox: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_FIREFOX;
    },

    /**
     * Checks if current browser is Internet Explorer.
     * @returns {boolean}
     */
    isIExplorer: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_IEXPLORER;
    },

    /**
     * Checks if current browser is Safari.
     * @returns {boolean}
     */
    isSafari: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_SAFARI;
    },

    /**
     * Checks if current environment is NWJS.
     * @returns {boolean}
     */
    isNWJS: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_NWJS;
    },

    /**
     * Checks if current environment is Electron.
     * @returns {boolean}
     */
    isElectron: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_ELECTRON;
    },

    /**
     * Checks if current environment is React Native.
     * @returns {boolean}
     */
    isReactNative: function () {
        return currentBrowser === BrowserType.RTC_BROWSER_REACT_NATIVE;
    },

    /**
     * Checks if Temasys RTC plugin is used.
     * @returns {boolean}
     */
    isTemasysPluginUsed: function () {
        return BrowserType.isIExplorer() || BrowserType.isSafari();
    },

    /**
     * Checks if the current browser triggers 'onmute'/'onunmute' events when
     * user's connection is interrupted and the video stops playback.
     * @returns {*|boolean} 'true' if the event is supported or 'false'
     * otherwise.
     */
    isVideoMuteOnConnInterruptedSupported: function () {
        return BrowserType.isChrome();
    },

    /**
     * Returns Firefox version.
     * @returns {number|null}
     */
    getFirefoxVersion: function () {
        return BrowserType.isFirefox() ? browserVersion : null;
    },

    /**
     * Returns Chrome version.
     * @returns {number|null}
     */
    getChromeVersion: function () {
        return BrowserType.isChrome() ? browserVersion : null;
    },

    usesPlanB: function() {
        return BrowserType.isChrome() || BrowserType.isOpera() ||
            BrowserType.isTemasysPluginUsed();
    },

    usesUnifiedPlan: function() {
        return BrowserType.isFirefox();
    },

    /**
     * Whether the browser is running on an android device.
     * @returns {boolean}
     */
    isAndroid: function() {
        return isAndroid;
    },

    /**
     * Whether jitsi-meet supports simulcast on the current browser.
     * @returns {boolean}
     */
    supportsSimulcast: function() {
        // This mirrors what sdp-simulcast uses (which is used when deciding
        // whether to actually enable simulcast or not).
        // TODO: the logic should be in one single place.
        return !!window.chrome;
    }

    // Add version getters for other browsers when needed
};

// detectOpera() must be called before detectChrome() !!!
// otherwise Opera wil be detected as Chrome
function detectChrome() {
    if (navigator.webkitGetUserMedia) {
        currentBrowser = BrowserType.RTC_BROWSER_CHROME;
        var userAgent = navigator.userAgent.toLowerCase();
        // We can assume that user agent is chrome, because it's
        // enforced when 'ext' streaming method is set
        var ver = parseInt(userAgent.match(/chrome\/(\d+)\./)[1], 10);
        return ver;
    }
    return null;
}

function detectOpera() {
    var userAgent = navigator.userAgent;
    if (userAgent.match(/Opera|OPR/)) {
        currentBrowser = BrowserType.RTC_BROWSER_OPERA;
        var version = userAgent.match(/(Opera|OPR) ?\/?(\d+)\.?/)[2];
        return version;
    }
    return null;
}

function detectFirefox() {
    if (navigator.mozGetUserMedia) {
        currentBrowser = BrowserType.RTC_BROWSER_FIREFOX;
        var version = parseInt(
            navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);
        return version;
    }
    return null;
}

function detectSafari() {
    if ((/^((?!chrome).)*safari/i.test(navigator.userAgent))) {
        currentBrowser = BrowserType.RTC_BROWSER_SAFARI;
        // FIXME detect Safari version when needed
        return 1;
    }
    return null;
}

function detectIE() {
    var version;
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        version = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (!version && trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        version = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (!version && edge > 0) {
        // IE 12 => return version number
        version = parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    if (version) {
        currentBrowser = BrowserType.RTC_BROWSER_IEXPLORER;
    }
    return version;
}

/**
 * Detects Electron environment.
 */
function detectElectron (){
    var userAgent = navigator.userAgent;
    if (userAgent.match(/Electron/)) {
        currentBrowser = BrowserType.RTC_BROWSER_ELECTRON;
        var version = userAgent.match(/Electron\/([\d.]+)/)[1];
        return version;
    }
    return null;
}

function detectNWJS (){
    var userAgent = navigator.userAgent;
    if (userAgent.match(/JitsiMeetNW/)) {
        currentBrowser = BrowserType.RTC_BROWSER_NWJS;
        var version = userAgent.match(/JitsiMeetNW\/([\d.]+)/)[1];
        return version;
    }
    return null;
}

function detectReactNative() {
    var match
        = navigator.userAgent.match(/\b(react[ \t_-]*native)(?:\/(\S+))?/i);
    var version;
    // If we're remote debugging a React Native app, it may be treated as
    // Chrome. Check navigator.product as well and always return some version
    // even if we can't get the real one.
    if (match || navigator.product === 'ReactNative') {
        currentBrowser = BrowserType.RTC_BROWSER_REACT_NATIVE;
        var name;
        if (match && match.length > 2) {
            name = match[1];
            version = match[2];
        }
        if (!name) {
            name = 'react-native';
        }
        if (!version) {
            version = 'unknown';
        }
        console.info('This appears to be ' + name + ', ver: ' + version);
    } else {
        // We're not running in a React Native environment.
        version = null;
    }
    return version;
}

function detectBrowser() {
    var version;
    var detectors = [
        detectReactNative,
        detectElectron,
        detectNWJS,
        detectOpera,
        detectChrome,
        detectFirefox,
        detectIE,
        detectSafari
    ];
    // Try all browser detectors
    for (var i = 0; i < detectors.length; i++) {
        version = detectors[i]();
        if (version)
            return version;
    }
    currentBrowser = BrowserType.RTC_BROWSER_SAFARI;
    return 1;
}

browserVersion = detectBrowser();
isAndroid = navigator.userAgent.indexOf('Android') != -1;
