!function(e){function t(n){if(a[n])return a[n].exports;var i=a[n]={exports:{},id:n,loaded:!1};return e[n].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var a={};return t.m=e,t.c=a,t.p=".",t(0)}({"./src/animate.js":function(e,t){"use strict";window.vcv.on("ready",function(e,t){"merge"!==e&&a.enableAnimate(e&&t?t:"")});var a={enableAnimate:function(e){window.Waypoint.destroyAll();var t=[],a=e?'[data-vcv-element="'+e+'"]':"[data-vce-animate]",n=document.querySelectorAll(a);n=[].slice.call(n),n.forEach(function(a){var n;if(!e||a.getAttribute("data-vce-animate")||(a=a.querySelector("[data-vce-animate]"))){var i=[],c=/^vce-o-animate--/;a.classList.forEach(function(e){e.search(c)!==-1&&i.push(e)}),(n=a.classList).remove.apply(n,i);var o=new window.Waypoint({element:a,handler:function(){var e=this;setTimeout(function(){var t=[];e.element.dataset.vceAnimate&&(t=e.element.dataset.vceAnimate.split(" ")),t.push("vce-o-animate--animated"),t.forEach(function(t){e.element.classList.add(t)}),e.destroy()},100)},offset:"bottom-in-view"});t.push(o)}})}}},"./src/animate.css":function(e,t){},0:function(e,t,a){a("./src/animate.js"),e.exports=a("./src/animate.css")}});