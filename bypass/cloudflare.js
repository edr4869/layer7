const request = require('request'),
    privacypass = require('./privacypass'),
    cloudscraper = require('cloudscraper').defaults({
        agentOptions: {
            ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256'
        }
    }),
    X = require('../x'),
    {
        constants
    } = require('crypto');
var privacyPassSupport = true;

function useNewToken() {
    X.BypassHeader = privacypass(X._.address);
    console.log('[cloudflare-bypass ~ privacypass]: generated new token ::', X.BypassHeader);
}

module.exports = function(proxy, uagent, callback, force) {
    var cookie = "";
    if (['captcha'].indexOf(X._.firewall[1]) !== -1 || force && privacyPassSupport) {
        cloudscraper.get({
            url: X._.address,
            gzip: true,
            proxy: 'http://' + proxy,
            headers: {
                'Connection': 'Keep-Alive',
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': uagent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US;q=0.9'
            }
        }, (err, res) => {
            if (!res) {
                return false;
            }
            if (res.headers['cf-chl-bypass'] && res.headers['cf-chl-bypass'] == '1') {
                if (!res.headers['set-cookie']) {
                    return false;
                }
            } else {
                if (['captcha'].indexOf(X._.firewall[1]) !== -1) {
                    console.warn('[cloudflare-bypass]: The target is not supporting privacypass, now closing rip...');
                    process.exit(34);
                    return false;
                } else {
                    privacyPassSupport = false;
                }
            }

            cookie = res.request.headers.cookie;
            if (['captcha'].indexOf(X._.firewall[1]) !== -1 && privacyPassSupport || force && privacyPassSupport) {
                if (!X.BypassHeader) {
                    useNewToken();
                }
                cloudscraper.get({
                    url: X._.address,
                    gzip: true,
                    proxy: 'http://' + proxy,
                    headers: {
                        'Connection': 'Keep-Alive',
                        'Cache-Control': 'max-age=0',
                        'Upgrade-Insecure-Requests': 1,
                        'User-Agent': uagent,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'en-US;q=0.9',
                        'challenge-bypass-token': X.BypassHeader,
                        "Cookie": cookie
                    }
                }, (err, res) => {
                    if (err || !res) return false;
                    if (res.headers['set-cookie']) {
                        cookie += '; ' + res.headers['set-cookie'].shift().split(';').shift();
                        console.log(cookie);
                        cloudscraper.get({
                            url: X._.address,
                            proxy: 'http://' + proxy,
                            headers: {
                                'Connection': 'Keep-Alive',
                                'Cache-Control': 'max-age=0',
                                'Upgrade-Insecure-Requests': 1,
                                'User-Agent': uagent,
                                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                                'Accept-Encoding': 'gzip, deflate, br',
                                'Accept-Language': 'en-US;q=0.9',
                                "Cookie": cookie
                            }
                        }, (err, res, body) => {
                            if (res.statusCode == 403) {
                                console.warn('[cloudflare-bypass ~ privacypass]: Failed to bypass with privacypass');
                                return;
                            }
                            callback(cookie);
                        });
                    } else {
                        console.log(res.statusCode, res.headers);
                        if (res.headers['cf-chl-bypass-resp']) {
                            let respHeader = res.headers['cf-chl-bypass-resp'];
                            switch (respHeader) {
                                case '6':
                                    console.warn("[privacy-pass]: internal server connection error occurred");
                                    useNewToken();
                                    break;
                                case '5':
                                    console.warn(`[privacy-pass]: token verification failed for ${X._.address}`);
                                    break;
                                case '7':
                                    console.warn(`[privacy-pass]: server indicated a bad client request`);
                                    break;
                                case '8':
                                    console.warn(`[privacy-pass]: server sent unrecognised response code (${header.value})`);
                                    break;
                            }
                            return module.exports(proxy, uagent, callback, true);
                        }
                    }
                });
            } else {
                cloudscraper.get({
                    url: X._.address,
                    proxy: 'http://' + proxy,
                    headers: {
                        'Connection': 'Keep-Alive',
                        'Cache-Control': 'max-age=0',
                        'Upgrade-Insecure-Requests': 1,
                        'User-Agent': uagent,
                        'Accept-Language': 'en-US;q=0.9'
                    }
                }, (err, res) => {
                    if (err || !res || !res.request.headers.cookie) {
                        if (err) {
                            if (err.name == 'CaptchaError') {
                                return module.exports(proxy, uagent, callback, true);
                            }
                        }
                        return false;
                    }
                    callback(res.request.headers.cookie);
                });
            }
        });
    } else if (X._.firewall[1] == 'uam' && privacyPassSupport == false) {
        cloudscraper.get({
            url: X._.address,
            proxy: 'http://' + proxy,
            headers: {
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': uagent
            }
        }, (err, res, body) => {
            if (err) {
                if (err.name == 'CaptchaError') {
                    return module.exports(proxy, uagent, callback, true);
                }
                return false;
            }
            if (res && res.request.headers.cookie) {
                callback(res.request.headers.cookie);
            } else if (res && body && res.headers.server == 'cloudflare') {
                if (res && body && /Why do I have to complete a CAPTCHA/.test(body) && res.headers.server == 'cloudflare' && res.statusCode !== 200) {
                    return module.exports(proxy, uagent, callback, true);
                }
            } else {

            }
        });
    } else {
        cloudscraper.get({
            url: X._.address,
            gzip: true,
            proxy: 'http://' + proxy,
            headers: {
                'Connection': 'Keep-Alive',
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': 1,
                'User-Agent': uagent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US;q=0.9'
            }
        }, (err, res, body) => {
            if (err || !res || !body || !res.headers['set-cookie']) {
                if (res && body && /Why do I have to complete a CAPTCHA/.test(body) && res.headers.server == 'cloudflare' && res.statusCode !== 200) {
                    return module.exports(proxy, uagent, callback, true);
                }
                return false;
            }
            cookie = res.headers['set-cookie'].shift().split(';').shift();
            callback(cookie);
        });
    }
}