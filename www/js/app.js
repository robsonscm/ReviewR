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
        (window.device) ?
            document.addEventListener('deviceready', app.onDeviceReady.bind(app), false) :
            document.addEventListener('DOMContentLoaded', app.onDeviceReady.bind(app), false);
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        window.addEventListener('push', app.pageChanged);
        if (window.device && window.device.platform.includes("iOS")) {
            console.log(window.device.platform);
            document.getElementById("main-bar").classList.add("ios-top");
        }
    },

    receivedEvent: function(id) {
        app.currentPage = document.querySelector(".content").id;
        app.setEventsModal();
    
        try {
            if (!rscmLib.getLocalStorage(app.key).reviews) {
                rscmLib.setLocalStorage({reviews:[]}, app.key);
            }
        }catch (err){
            rscmLib.setLocalStorage({reviews:[]}, app.key);
        }
        
        app.listReviews();
    },
    
    pageChanged: function(){
        app.currentPage = document.querySelector(".content").id;
        switch(app.currentPage) {
            case 'page-reviews':
                console.log('You are on '.concat(app.currentPage));
                document.getElementById("add-review").addEventListener("touchstart", app.setEventsModal);
                app.listReviews();
                break;
            default:
                console.log('Page 404!')
        }
    },
    
    setEventsModal: function(){
        document.getElementById("btn-ok-review").addEventListener("touchstart", app.saveReview);
        document.getElementById("btn-close-review").addEventListener("touchstart", app.clickBtnClose);
        document.getElementById("btn-photo-review").addEventListener("touchstart", app.takePicture);
        document.getElementById("btn-delete-review").addEventListener("touchstart", app.deleteReview);
        document.querySelectorAll("#rating .icon").forEach(function (item) {
            item.addEventListener("touchend", app.setStars);
        })
    },
    
    listReviews: function () {
        let ul = document.getElementById("review-list");
        ul.innerHTML = "";
    
        app.reviewList = rscmLib.getLocalStorage(app.key) || {"reviews": []};
        console.log(app.reviewList);
        app.reviewList.reviews.forEach(function (review) {
            let li = rscmLib.createNewDOM({type: "li"   , class: "table-view-cell media", "data-id":review.id});
            let a1 = rscmLib.createNewDOM({type: "a"    , class: "navigate-right", href: "#itemReview"});
            let im = rscmLib.createNewDOM({type: "img"  , class: "media-object pull-left", src: (review.img || "http://placehold.it/96x96")});
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
        if (app.reviewList || ""){
            console.log("edit");
            let indexReview = app.reviewList.reviews.findIndex(function (rev) {
                return rev.id == app.currentReview;
            });
            if (indexReview > -1) {
                app.reviewList.reviews[indexReview].name = document.getElementById("name").value.initCap();
                app.reviewList.reviews[indexReview].rating = stars;
                rscmLib.setLocalStorage(app.reviewList, ap.key);
                app.reviewList = rscmLib.getLocalStorage(app.key);
                app.currentReview = null;
            } else {
                app.reviewList.reviews.push({
                    "id": Date.now(),
                    "name": document.getElementById("name").value.initCap(),
                    "rating": stars,
                    "img": ""
                });
                rscmLib.setLocalStorage(app.reviewList, app.key);
            }
        }
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.querySelector("#close-modal-add").dispatchEvent(myClick);
        app.listReviews();
        document.querySelector(".input-group").reset();
        for (let i=0; i < stars; i++){
            document.querySelectorAll("#rating .icon")[i].classList.remove("icon-star-filled");
            document.querySelectorAll("#rating .icon")[i].classList.add("icon-star");
        }
        app.currentReview = 0;
        document.getElementById("btn-ok-review").removeEventListener("touchstart", app.saveReview);
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
        console.log(app.currentReview);
        rscmLib.setLocalStorage({reviews: newList}, app.key);
        app.reviewList = rscmLib.getLocalStorage(app.key);
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.querySelector("#close-modal-review").dispatchEvent(myClick);
        app.listReviews();
        app.currentReview = null;
        document.querySelector(".input-group").reset();
        document.getElementById("name").blur();
        document.getElementById("btn-delete-review").removeEventListener("touchstart", app.deleteReview);
    },
    
    showReview: function (ev) {
        let exit = false;
        let target = ev.target;
        // console.log(document.getElementById("review_name"));
        while (!exit) {
            if (target.getAttribute("data-id")){
                console.log(target);
                let review = app.getReview(target.getAttribute("data-id"));
                document.getElementById("review_name").innerHTML = review[0].name;
                let stars = (review[0].rating || 0) ? review[0].rating : 0;
                // console.log(stars);
                for (var i=0; i<5; i++) {
                    if (i < parseInt(stars)) {
                        document.querySelectorAll("#review-stars .icon")[i].classList.remove("icon-star");
                        document.querySelectorAll("#review-stars .icon")[i].classList.add("icon-star-filled");
                    } else {
                        document.querySelectorAll("#review-stars .icon")[i].classList.remove("icon-star-filled");
                        document.querySelectorAll("#review-stars .icon")[i].classList.add("icon-star");
                    }
                }
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
        document.getElementById("btn-close-review").removeEventListener("touchstart", app.clickBtnClose);
        document.querySelector(".input-group").reset();
        for (let i=0; i < 5; i++){
            document.querySelectorAll("#rating .icon")[i].classList.remove("icon-star-filled");
            document.querySelectorAll("#rating .icon")[i].classList.add("icon-star");
        }
        app.currentReview = 0;
    },
    
    takePicture: function () {
    
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
    }
    
};

app.initialize();


// setEventsModalGift: function () {
//     document.getElementById("btn-ok-gift").addEventListener("touchstart", app.saveGift);
//     document.getElementById("btn-close-gift").addEventListener("touchstart", app.clickBtnClose);
// },
//
// goGifts: function (ev) {
//     //
//     console.log(ev.target.nodeName);
//     if (ev.target.nodeName === "SPAN") {
//         app.currentPerson = ev.target.parentNode.parentNode.getAttribute("data-id");
//         return;
//     }
//     app.currentPerson = ev.target.parentNode.getAttribute("data-id");
//     //
// },
//
// listGifts: function () {
//     //
//     let person = app.getPerson(app.currentPerson);
//     let ul = document.getElementById("gift-list");
//     ul.innerHTML = "";
//     //
//     // person[0].ideas.sort(function (a,b) {
//     //     return (a.idea > b.idea) ? 1 : (a.idea < b.idea) ? -1 : 0;
//     // }).forEach(function (gift, index) {
//     //     //
//     //     let li = rscmLib.createNewDOM({type: "li"   , class: "table-view-cell media"});
//     //     let s1 = rscmLib.createNewDOM({type: "span" , class: "pull-right icon icon-trash midline", "data-id":index});
//     //     let dv = rscmLib.createNewDOM({type: "div"  , class: "media-body", innerHTML: gift.idea});
//     //     let p1 = rscmLib.createNewDOM({type: "p"    , innerHTML: gift.at});
//     //     let p2 = rscmLib.createNewDOM({type: "p"    });
//     //     let p3 = rscmLib.createNewDOM({type: "p"    , innerHTML: gift.cost});
//     //     let a1 = rscmLib.createNewDOM({type: "a"    , href: "http://".concat(gift.url), target: "_blank", innerHTML: gift.url});
//     //     //
//     //     p2.appendChild(a1);
//     //     dv.appendChild(p1);
//     //     dv.appendChild(p2);
//     //     dv.appendChild(p3);
//     //     li.appendChild(s1);
//     //     li.appendChild(dv);
//     //     ul.appendChild(li);
//     //     //
//     //     s1.addEventListener("touchend", app.deleteGift);
//     //     //
//     // });
//     document.getElementById("name-person").innerHTML = person[0].fullName;
//     (ul.innerHTML === "") ? ul.parentNode.style.display = "none" : ul.parentNode.style.display = "block";
// },
//
// saveGift: function(ev){
//     ev.preventDefault();
//     //
//     if (!(document.getElementById("ideaDesc").value || "") || (document.getElementById("ideaDesc").value === null)) {
//         document.getElementById("ideaDesc").value = "*** Set the Idea Name ***";
//     }
//     let person = app.getPerson(app.currentPerson);
//     let gift = {"idea": document.getElementById("ideaDesc").value.initCap(),
//         "at": document.getElementById("store").value.initCap(),
//         "cost": app.validatePrice(document.getElementById("cost").value),
//         "url": document.getElementById("url").value.toLowerCase()};
//     for (var i=0, size=app.peopleList.people.length; i<size; i++){
//         if (app.peopleList.people[i].id === person[0].id) {
//             app.peopleList.people[i].ideas.push(gift);
//             break;
//         }
//     }
//     rscmLib.setLocalStorage(app.peopleList);
//     //
//     document.querySelector(".input-group").reset();
//     let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
//     document.getElementById("close-modal-gift").dispatchEvent(myClick);
//     //
//     app.listGifts();
//     //
//     document.getElementById("btn-ok-gift").removeEventListener("touchstart", app.saveGift);
// },
//
// deleteGift: function (ev) {
//     let person = app.getPerson(app.currentPerson);
//     for (var i=0, size=app.peopleList.people.length; i<size; i++){
//         if (app.peopleList.people[i].id === person[0].id) {
//             app.peopleList.people[i].ideas = app.peopleList.people[i].ideas.filter(function (gift, index) {
//                 return index.toString() !== ev.currentTarget.getAttribute("data-id");
//             });
//             break;
//         }
//     }
//     rscmLib.setLocalStorage(app.peopleList);
//     //
//     app.listGifts();
//     //
// },
//
// validatePrice: function(value) {
//     let textVal = value;
//     textVal = textVal.replace(/,/g, "");
//     if (!textVal.includes("$")){
//         textVal = "$".concat(textVal);
//     }
//     if (!textVal.includes(".")){
//         textVal += ".00";
//     }
//     let regex = /^(\$|)([1-9]\d{0,2}(\,\d{3})*|([1-9]\d*))(\.\d{2})?$/;
//     let passed = textVal.match(regex);
//     return (passed == null) ? "" // alert("Enter price only. For example: 523.36 or $523.36");
//         : textVal;
// }

