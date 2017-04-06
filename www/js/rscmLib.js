"use strict";
/***********************************************************************************************************************
 File       : rscmLib.js
 Author     : Robson Miranda
 Description: Library with main functions used often:
             - fetchJSON
                --> Handle JSON Files using Fetch or XMLHttpRequest. Return JSON Object
             - createNewDOM
                --> Create New DOM Elements. Return a HTML element.
             - setLocalStorage
                --> Add/Update a key inside LocalStorage
             - getLocalStorage
                --> Returns the value from certain LocalStorage's key
 Version    : 0.0.1
 Created    : Feb 11, 2017
 Updated    :
 **********************************************************************************************************************/
//
let rscmLib = (function () {
    //
    let localStorageKey = "stra0165";
    //
    String.prototype.initCap = function () {
        return this.toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
            return m.toUpperCase();
        });
    }
    //
    return {
        fetchJSON: function (url, options) {
            return new Promise(function (resolve, reject) {
                //
                // var url = "//griffis.edumedia.ca/test.json";
                // starting a URL with "//" means use http or https, whichever the HTML page used.
                //
                //check if the browser supports fetch
                try{
                    //use fetch
                    fetch(url, options)
                        .then(function(response){
                            resolve(response.json());
                        })
                        .catch(function(err){
                            //failed to get the data
                            reject("Fetch failed to get the url: ".concat(err));
                        });
                }catch(e){
                    //use XMLHttpRequest
                    //xhrReq.open(method, url, async, user, password);
                    //
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", url, true);
                    xhr.addEventListener("load", function(ev){
                        resolve(JSON.parse(xhr.responseText));
                    });
                    xhr.addEventListener("error", function(ev){
                        reject("XMLHttpRequest failed to get the url: ".concat(ev));
                    });
                    xhr.send(null);
                };
                //
            });
        },
        createNewDOM: function (newDOM) {
            //
            let keys = Object.keys(newDOM).filter(function (attr) {return (attr != "type"); });
            let element = document.createElement(newDOM.type);
            keys.forEach(function (key) {
                !(key == "innerHTML") ? element.setAttribute(key, newDOM[key]) : element.innerHTML = newDOM.innerHTML;
            });
            //
            return element;
            //
        }
        ,
        setLocalStorage: function (data, key) {
            localStorage.setItem((key || localStorageKey), JSON.stringify(data));
        },
        getLocalStorage: function (key) {
            return JSON.parse(localStorage.getItem((key || localStorageKey)));
        },
        setTouchAction: function (region, target, gesture, action) {
            //
            let touch = new ZingTouch.Region(region);
            touch.bind(target, gesture, action);
            //
            return {touch:touch, target:target};
        }
};
    //
})();
