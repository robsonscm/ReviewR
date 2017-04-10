/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
"use strict";
var app = {
    reviewList: {},
    currentReview: null,
    key: "straviewr",

    initialize: function() {
        (rscmLib.getMobileOperatingSystem() !== "unknown") ?
            document.addEventListener('deviceready', app.onDeviceReady.bind(app), false) :
            document.addEventListener('DOMContentLoaded', app.onDeviceReady.bind(app), false);
    },

    onDeviceReady: function() {
        document.getElementById("add-review").addEventListener("touchstart", app.setEventsModal);
        try {
            if (!rscmLib.getLocalStorage(app.key).reviews) {
                rscmLib.setLocalStorage({reviews:[]}, app.key);
            }
        }catch (err){
            rscmLib.setLocalStorage({reviews:[]}, app.key);
        }
        app.refreshIOS();
        app.setEventsModal();
        app.listReviews();
    },

    setEventsModal: function(){
        document.getElementById("btn-photo-review").style.display = "block";
        if (document.getElementById("newImage") || "") {
            document.getElementById("review-form").removeChild(document.getElementById("newImage").parentNode);
        }
        document.getElementById("btn-ok-review").addEventListener("touchstart", app.saveReview);
        document.getElementById("btn-close-review").addEventListener("touchstart", app.clickBtnClose);
        document.getElementById("btn-photo-review").addEventListener("touchstart", app.takePicture);
        document.getElementById("btn-delete-review").addEventListener("touchstart", app.deleteReview);
        document.querySelectorAll("#rating .icon").forEach(function (item) {
            item.addEventListener("touchend", app.setStars);
        });
        app.refreshIOS();
    },
    
    listReviews: function () {
        let ul = document.getElementById("review-list");
        ul.innerHTML = "";
        app.reviewList = rscmLib.getLocalStorage(app.key) || {"reviews": []};
        app.reviewList.reviews.forEach(function (review) {
            let li = rscmLib.createNewDOM({type: "li"   , class: "table-view-cell media", "data-id":review.id});
            let a1 = rscmLib.createNewDOM({type: "a"    , class: "navigate-right", href: "#itemReview"});
            let im = rscmLib.createNewDOM({type: "img"  , class: "media-object pull-left img-list", src: (review.img || "http://placehold.it/96x96")});
            let d1 = rscmLib.createNewDOM({type: "div"  , class: "media-body", innerHTML: review.name});
            let p1 = rscmLib.createNewDOM({type: "p"    });
            let s1 = rscmLib.createNewDOM({type: "span" , class: "icon ".concat((review.rating >= 1) ? "icon-star-filled" : "icon-star")});
            let s2 = rscmLib.createNewDOM({type: "span" , class: "icon ".concat((review.rating >= 2) ? "icon-star-filled" : "icon-star")});
            let s3 = rscmLib.createNewDOM({type: "span" , class: "icon ".concat((review.rating >= 3) ? "icon-star-filled" : "icon-star")});
            let s4 = rscmLib.createNewDOM({type: "span" , class: "icon ".concat((review.rating >= 4) ? "icon-star-filled" : "icon-star")});
            let s5 = rscmLib.createNewDOM({type: "span" , class: "icon ".concat((review.rating >= 5) ? "icon-star-filled" : "icon-star")});
            p1.appendChild(s1);
            p1.appendChild(s2);
            p1.appendChild(s3);
            p1.appendChild(s4);
            p1.appendChild(s5);
            d1.appendChild(p1);
            a1.appendChild(im);
            a1.appendChild(d1);
            li.appendChild(a1);
            ul.appendChild(li);
            a1.addEventListener("touchstart", app.showReview);
        });
        (ul.innerHTML === "") ? ul.parentNode.style.display = "none" : ul.parentNode.style.display = "block";
    },
    
    saveReview: function (ev) {
        ev.preventDefault();
        app.reviewList = rscmLib.getLocalStorage(app.key) || {"reviews":[]};
        let stars = 0;
        try {
            stars = document.querySelectorAll("#rating .icon-star-filled").length;
        } catch (err) {
            stars = 0;
        }
        app.reviewList.reviews.push({
            "id": Date.now(),
            "name": document.getElementById("name").value.initCap(),
            "rating": stars,
            "img": (document.getElementById("newImage")) ? document.getElementById("newImage").getAttribute("src") : ""
        });
        rscmLib.setLocalStorage(app.reviewList, app.key);
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.querySelector("#close-modal-add").dispatchEvent(myClick);
        app.listReviews();
        document.querySelector(".input-group").reset();
        for (let i=0; i < stars; i++){
            document.querySelectorAll("#rating .icon")[i].classList.remove("icon-star-filled");
            document.querySelectorAll("#rating .icon")[i].classList.add("icon-star");
        }
        app.currentReview = 0;
    },
    
    editReview: function (ev) {
        document.getElementById("add-review").addEventListener("touchstart", app.setEventsModal);
        app.setEventsModal();
        let review = app.getReview(ev.target.parentNode.getAttribute("data-id"));
        document.getElementById("name").value = review[0].name;
        let stars = (review[0].rating || 0) ? review[0].rating : 0;
        for (let i=1; i < stars+1; i++){
            document.querySelectorAll("#rating .icon-star")[i].classList.remove("icon-star");
            document.querySelectorAll("#rating .icon-star")[i].classList.add("icon-star-filled");
        }
        app.currentReview = review[0].id;
    },
    
    deleteReview:  function () {
        let newList = app.reviewList.reviews.filter(function (rev) {
            return rev.id !== app.currentReview;
        });
        rscmLib.setLocalStorage({reviews: newList}, app.key);
        app.reviewList = rscmLib.getLocalStorage(app.key);
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.querySelector("#close-modal-review").dispatchEvent(myClick);
        app.listReviews();
        app.currentReview = null;
        document.querySelector(".input-group").reset();
        document.getElementById("name").blur();
    },
    
    showReview: function (ev) {
        let exit = false;
        let target = ev.target;
        while (!exit) {
            if (target.getAttribute("data-id")){
                let review = app.getReview(target.getAttribute("data-id"));
                document.getElementById("review_name").innerHTML = review[0].name;
                let stars = (review[0].rating || 0) ? review[0].rating : 0;
                for (var i=0; i<5; i++) {
                    if (i < parseInt(stars)) {
                        document.querySelectorAll("#review-stars .icon")[i].classList.remove("icon-star");
                        document.querySelectorAll("#review-stars .icon")[i].classList.add("icon-star-filled");
                    } else {
                        document.querySelectorAll("#review-stars .icon")[i].classList.remove("icon-star-filled");
                        document.querySelectorAll("#review-stars .icon")[i].classList.add("icon-star");
                    }
                }
                document.querySelector("#review-img img").setAttribute("src", review[0].img);
                app.currentReview = review[0].id;
                exit = true;
    
            } else {
                target = target.parentNode;
            }
        }
        app.setEventsModal();
    },

    getReview: function (id) {
        return app.reviewList.reviews.filter(function (rev) {
            return rev.id.toString() === id;
        });
    },

    clickBtnClose: function (){
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.getElementById("close-modal-add").dispatchEvent(myClick);
        document.querySelector(".input-group").reset();
        for (let i=0; i < 5; i++){
            document.querySelectorAll("#rating .icon")[i].classList.remove("icon-star-filled");
            document.querySelectorAll("#rating .icon")[i].classList.add("icon-star");
        }
        app.currentReview = 0;
    },
    
    takePicture: function () {
        var options = {
            quality: 80,
            // destinationType: Camera.DestinationType.FILE_URI,
            // destinationType: Camera.DestinationType.NATIVE_URI,
            destinationType: Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.PNG,
            mediaType: Camera.MediaType.PICTURE,
            pictureSourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            targetWidth: 300,
            targetHeight: 300
        };
        
        function onSuccess(imageURI) {
            // imageURI.substr(imageURI.lastIndexOf('/') + 1);
            let im = rscmLib.createNewDOM({type:"img", src:"data:image/jpeg;base64," + imageURI, id:"newImage"});
            let li = rscmLib.createNewDOM({type:"li", class:"table-view-cell", id:"li-img"});
            li.appendChild(im);
            document.getElementById("review-form").appendChild(li);
            document.getElementById("btn-photo-review").style.display = "none";

            // resolveLocalFileSystemURL(imageURI, function(fileEntry) {
            //     fileEntry.file(function(file) {
            //         var reader = new FileReader();
            //         reader.onloadend = function(event) {
            //             console.log(event.target.result.byteLength);
            //         };
            //         console.log('Reading file: ' + JSON.stringify(file));
            //         reader.readAsArrayBuffer(file);
            //         let im = rscmLib.createNewDOM({type:"img", src:file.name, id:"newImage"});
            //         let li = rscmLib.createNewDOM({type:"li", class:"table-view-cell"});
            //         li.appendChild(im);
            //         document.getElementById("review-form").appendChild(li);
            //         document.getElementById("btn-photo-review").style.display = "none";
            //     });
            // });
        }
        
        function onFail(message) {
            alert('Failed because: ' + message);
        }
    
        navigator.camera.getPicture( onSuccess, onFail, options);
        
    },
    
    setStars: function (ev) {
        if (document.querySelectorAll("#rating .icon-star-filled").length === 1 &&
            parseInt(ev.target.getAttribute("data-id")) === 1){
            ev.target.classList.remove("icon-star-filled");
            ev.target.classList.add("icon-star");
        } else {
            for (var i=0; i<5; i++){
                if (i < parseInt(ev.target.getAttribute("data-id"))) {
                    document.querySelectorAll("#rating .icon")[i].classList.remove("icon-star");
                    document.querySelectorAll("#rating .icon")[i].classList.add("icon-star-filled");
                } else {
                    document.querySelectorAll("#rating .icon")[i].classList.remove("icon-star-filled");
                    document.querySelectorAll("#rating .icon")[i].classList.add("icon-star");
                }
            }
        }
    },
    
    refreshIOS: function () {
        if (rscmLib.getMobileOperatingSystem() === "iOS") {
            document.querySelectorAll(".bar.bar-nav").forEach(function (bar) {
                bar.classList.add("ios-top");
            });
            document.querySelectorAll(".content").forEach(function (cont) {
                cont.classList.add("ios-top");
            });
        }
    }
    
    
};

app.initialize();
