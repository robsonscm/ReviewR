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
    peopleList: {},
    currentPage: "",
    currentPerson: null,
    // Application Constructor
    initialize: function() {
        (window.device) ?
            document.addEventListener('deviceready', app.onDeviceReady.bind(app), false) :
            document.addEventListener('DOMContentLoaded', app.onDeviceReady.bind(app), false);
        // document.addEventListener('deviceready', app.onDeviceReady.bind(app), false);
    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        window.addEventListener('push', app.pageChanged);
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
        
        app.currentPage = document.querySelector(".content").id;
        app.setEventsModalPerson();
    
        // localStorage.clear();
        try {
            if (!rscmLib.getLocalStorage().people) {
                localStorage.clear();
                rscmLib.setLocalStorage({people:[]});
            }
        }catch (err){
            rscmLib.setLocalStorage({people:[]});
        }
        
        app.listPerson();
    },
    
    pageChanged: function(){
        //
        app.currentPage = document.querySelector(".content").id;
        // console.log(app.currentPage);
        switch(app.currentPage) {
            case 'page-people':
                // app.setEventsModalPerson();
                app.currentPerson = null;
                document.getElementById("add-person").addEventListener("touchstart", app.setEventsModalPerson);
                app.listPerson();
                console.log('You are on '.concat(app.currentPage));
                break;
            case 'page-gifts':
                // app.setEventsModalGift();
                document.getElementById("add-gift").addEventListener("touchstart", app.setEventsModalGift);
                app.listGifts();
                console.log('You are on '.concat(app.currentPage));
                break;
            default:
                console.log('Page 404!')
        }
    },
    
    setEventsModalPerson: function(){
        document.getElementById("btn-ok-person").addEventListener("touchstart", app.savePerson);
        document.getElementById("btn-close-person").addEventListener("touchstart", app.clickBtnClose);
        document.getElementById("btn-del-person").addEventListener("touchstart", app.deletePerson);
        document.getElementById("btn-del-person").style.display = "none";
    },
    
    setEventsModalGift: function () {
        document.getElementById("btn-ok-gift").addEventListener("touchstart", app.saveGift);
        document.getElementById("btn-close-gift").addEventListener("touchstart", app.clickBtnClose);
    },

    listPerson: function () {
        let ul = document.getElementById("contact-list");
        ul.innerHTML = "";
    
        app.peopleList = rscmLib.getLocalStorage() || {"people": []};
        console.log(app.peopleList);
        if (app.peopleList.people.length > 1){
            app.peopleList.people.sort(function (a,b) {
                return (moment(a.dob,"MMMM Do YYYY") > moment(b.dob,"MMMM Do YYYY")) ? 1 :
                       (moment(a.dob,"MMMM Do YYYY") < moment(b.dob,"MMMM Do YYYY")) ? -1 : 0;
            });
        }
    
        app.peopleList.people.forEach(function (person) {
            //
            // let dob = moment(person.dob).
            //
            let li = rscmLib.createNewDOM({type: "li"   , class: "table-view-cell media", "data-id":person.id});
            let s1 = rscmLib.createNewDOM({type: "span" , class: "name"});
            let a1 = rscmLib.createNewDOM({type: "a"    , class: "edit-person", innerHTML: person.fullName, href: "#personModal"});
            let a2 = rscmLib.createNewDOM({type: "a"    , class: "navigate-right pull-right", href: "gifts.html"});
            let s2 = rscmLib.createNewDOM({type: "span" , class: "dob", innerHTML: person.dob });
            //
            s1.appendChild(a1);
            a2.appendChild(s2);
            li.appendChild(s1);
            li.appendChild(a2);
            ul.appendChild(li);
            //
            a1.addEventListener("touchstart", app.editPerson);
        
            a2.addEventListener("touchstart", app.goGifts);
            //
        });
        (ul.innerHTML === "") ? ul.parentNode.style.display = "none" : ul.parentNode.style.display = "block";
    },
    
    savePerson: function (ev) {
        ev.preventDefault();
        //
        console.log(app.currentPerson);
        //
        if (!(document.getElementById("fullName").value || "") || (document.getElementById("fullName").value === null)) {
            document.getElementById("fullName").value = "*** Set a Name ***";
        }
        if (!(document.getElementById("dateBirth").value || "") || (document.getElementById("dateBirth").value === null)) {
            document.getElementById("dateBirth").value = "1900-01-01";
        }
        app.peopleList = rscmLib.getLocalStorage() || {"people":[]};
        if (app.currentPerson || ""){
            //
            let indexPerson = app.peopleList.people.findIndex(function (peep) {
                return peep.id == app.currentPerson;
            });
            if (indexPerson > -1) {
                app.peopleList.people[indexPerson].fullName = document.getElementById("fullName").value.initCap();
                app.peopleList.people[indexPerson].dob = moment(document.getElementById("dateBirth").value).format("MMMM Do YYYY");
                rscmLib.setLocalStorage(app.peopleList);
                app.peopleList = rscmLib.getLocalStorage();
                app.currentPerson = null;
            }
            //
        } else {
            //
            let person = {"id": Date.now(),
                "fullName": document.getElementById("fullName").value.initCap(),
                "dob": moment(document.getElementById("dateBirth").value).format("MMMM Do YYYY"),
                "ideas":[]};
            // console.log(app.peopleList);
            app.peopleList.people.push(person);
            rscmLib.setLocalStorage(app.peopleList);
            //
        }
        //
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.querySelector("#close-modal-person").dispatchEvent(myClick);
        //
        app.listPerson();
        //
        document.querySelector(".input-group").reset();
        document.getElementById("btn-ok-person").removeEventListener("touchstart", app.savePerson);
    },
    
    editPerson: function (ev) {
        //
        document.getElementById("add-person").addEventListener("touchstart", app.setEventsModalPerson);
        app.setEventsModalPerson();
        document.getElementById("btn-del-person").style.display = "block";
        //
        let personEdit = app.getPerson(ev.target.parentNode.parentNode.getAttribute("data-id"));
        document.getElementById("fullName").value = personEdit[0].fullName;
        document.getElementById("dateBirth").value = moment(personEdit[0].dob,"MMMM Do YYYY").format("YYYY-MM-DD");
        app.currentPerson = personEdit[0].id;
        //
    },
    
    deletePerson:  function () {
        console.log("deletePerson");
        let newList = app.peopleList.people.filter(function (person) {
            return person.id !== app.currentPerson;
        });
        console.log(newList);
        rscmLib.setLocalStorage({people: newList});
        app.peopleList = rscmLib.getLocalStorage();
        //
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.querySelector("#close-modal-person").dispatchEvent(myClick);
        //
        app.listPerson();
        //
        app.currentPerson = null;
        document.querySelector(".input-group").reset();
        document.getElementById("dateBirth").blur();
        document.getElementById("fullName").blur();
        document.getElementById("btn-del-person").removeEventListener("touchstart", app.deletePerson);
    },
    
    goGifts: function (ev) {
        //
        console.log(ev.target.nodeName);
        if (ev.target.nodeName === "SPAN") {
            app.currentPerson = ev.target.parentNode.parentNode.getAttribute("data-id");
            return;
        }
        app.currentPerson = ev.target.parentNode.getAttribute("data-id");
        //
    },
    
    listGifts: function () {
        //
        let person = app.getPerson(app.currentPerson);
        let ul = document.getElementById("gift-list");
        ul.innerHTML = "";
        //
        person[0].ideas.sort(function (a,b) {
            return (a.idea > b.idea) ? 1 : (a.idea < b.idea) ? -1 : 0;
        }).forEach(function (gift, index) {
            //
            let li = rscmLib.createNewDOM({type: "li"   , class: "table-view-cell media"});
            let s1 = rscmLib.createNewDOM({type: "span" , class: "pull-right icon icon-trash midline", "data-id":index});
            let dv = rscmLib.createNewDOM({type: "div"  , class: "media-body", innerHTML: gift.idea});
            let p1 = rscmLib.createNewDOM({type: "p"    , innerHTML: gift.at});
            let p2 = rscmLib.createNewDOM({type: "p"    });
            let p3 = rscmLib.createNewDOM({type: "p"    , innerHTML: gift.cost});
            let a1 = rscmLib.createNewDOM({type: "a"    , href: "http://".concat(gift.url), target: "_blank", innerHTML: gift.url});
            //
            p2.appendChild(a1);
            dv.appendChild(p1);
            dv.appendChild(p2);
            dv.appendChild(p3);
            li.appendChild(s1);
            li.appendChild(dv);
            ul.appendChild(li);
            //
            s1.addEventListener("touchend", app.deleteGift);
            //
        });
        document.getElementById("name-person").innerHTML = person[0].fullName;
        (ul.innerHTML === "") ? ul.parentNode.style.display = "none" : ul.parentNode.style.display = "block";
    },
    
    saveGift: function(ev){
        ev.preventDefault();
        //
        if (!(document.getElementById("ideaDesc").value || "") || (document.getElementById("ideaDesc").value === null)) {
            document.getElementById("ideaDesc").value = "*** Set the Idea Name ***";
        }
        let person = app.getPerson(app.currentPerson);
        let gift = {"idea": document.getElementById("ideaDesc").value.initCap(),
                    "at": document.getElementById("store").value.initCap(),
                    "cost": app.validatePrice(document.getElementById("cost").value),
                    "url": document.getElementById("url").value.toLowerCase()};
        for (var i=0, size=app.peopleList.people.length; i<size; i++){
            if (app.peopleList.people[i].id === person[0].id) {
                app.peopleList.people[i].ideas.push(gift);
                break;
            }
        }
        rscmLib.setLocalStorage(app.peopleList);
        //
        document.querySelector(".input-group").reset();
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        document.getElementById("close-modal-gift").dispatchEvent(myClick);
        //
        app.listGifts();
        //
        document.getElementById("btn-ok-gift").removeEventListener("touchstart", app.saveGift);
    },
    
    deleteGift: function (ev) {
        let person = app.getPerson(app.currentPerson);
        for (var i=0, size=app.peopleList.people.length; i<size; i++){
            if (app.peopleList.people[i].id === person[0].id) {
                app.peopleList.people[i].ideas = app.peopleList.people[i].ideas.filter(function (gift, index) {
                    return index.toString() !== ev.currentTarget.getAttribute("data-id");
                });
                break;
            }
        }
        rscmLib.setLocalStorage(app.peopleList);
        //
        app.listGifts();
        //
    },
    
    clickBtnClose: function (){
        let myClick = new CustomEvent('touchend', { bubbles: true, cancelable: true });
        try{
            document.getElementById("close-modal-person").dispatchEvent(myClick);
            document.getElementById("btn-close-person").removeEventListener("touchstart", app.clickBtnClose);
            document.querySelector(".input-group").reset();
            app.currentPerson = null;
        }catch (err){
            document.getElementById("close-modal-gift").dispatchEvent(myClick);
            document.getElementById("btn-close-gift").removeEventListener("touchstart", app.clickBtnClose);
            document.querySelector(".input-group").reset();
        }
    },
    
    getPerson: function (id) {
        // console.log(id);
        return app.peopleList.people.filter(function (person) {
            return person.id.toString() === id;
        });
    },
    
    validatePrice: function(value) {
        let textVal = value;
        textVal = textVal.replace(/,/g, "");
        if (!textVal.includes("$")){
            textVal = "$".concat(textVal);
        }
        if (!textVal.includes(".")){
            textVal += ".00";
        }
        let regex = /^(\$|)([1-9]\d{0,2}(\,\d{3})*|([1-9]\d*))(\.\d{2})?$/;
        let passed = textVal.match(regex);
        return (passed == null) ? "" // alert("Enter price only. For example: 523.36 or $523.36");
                                : textVal;
    }

};

app.initialize();