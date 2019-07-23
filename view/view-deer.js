/**
 * @module DEER Data Encoding and Exhibition for RERUM (DEER)
 * @author Patrick Cuba <cubap@slu.edu>
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 * @version 0.7

 * This code should serve as a basis for developers wishing to
 * use TinyThings as a RERUM proxy for an application for data entry,
 * especially within the Eventities model.
 * @see tiny.rerum.io
 */

// Identify an alternate config location or only overwrite some items below.
import { default as DEER } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-0.7/deer-config.js'

// Overwrite or add certain values to the configuration to customize.

// new template
import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-0.8/deer-utils.js'

function getRanges(obj) {
    return obj.structures.map(range=>{
        let time = range.items[0].id.split("t=").pop()
        let start = parseFloat(time.split(",")[0])
        let end = parseFloat(time.split(",")[1])
        let title = range.label.en[0]
        let summary = range.summary.en[0]
        
        return {
            title: title,
            summary: summary,
            time: { start: start, end: end },
            color: range['tl:backgroundColour']
        }
    }).sort((a,b)=>a.time.start-b.time.start)
}

DEER.TEMPLATES.listen = (obj) => `<audio id="player"
    controls preload 
    ontimeupdate="updateTimer()"
    src="${obj.items[0].items[0].items[0].body.id}"></audio>`

DEER.TEMPLATES.program = (obj) => `<h2>${obj.label.en}</h2><nav><ul>`+getRanges(obj).reduce((a,item)=>a+=`<li class="navigation" onclick="player.currentTime=${item.time.start}" salon-start="${item.time.start}" salon-end="${item.time.end}"><cite>${item.summary}</cite><br>${item.title}</li>`,``)+`</ul></nav>`

// TODO: use passback to attach this after DOM attachment
window.updateTimer = () => {
    Array.from(document.getElementsByClassName("navigation")).forEach(i=>{
        let start = i.getAttribute("salon-start")
        let end = i.getAttribute("salon-end")
        if((player.currentTime > start) && (player.currentTime < end)) {
            i.classList.add("active")
        } else {
            i.classList.remove("active")
        }           
    })
    Array.from(document.getElementsByClassName("slideshow")).forEach(i=>{
        let start = i.getAttribute("salon-start")
        let end = i.getAttribute("salon-end")
        if((player.currentTime > start) && (player.currentTime < end)) {
            i.classList.add("active")
        } else {
            i.classList.remove("active")
        }           
    })
}

DEER.TEMPLATES.navibar = (obj) => `<div style="width:100%;" class="navibar">${getRanges(obj).reduce((a,item)=>a+=`<a onclick="player.currentTime=${item.time.start}" style="background-color:${item.color};width:${100*(item.time.end-item.time.start)/obj.items[0].duration}%;" title="${item.summary}, ${item.title}">${item.summary}</a>`,``)}</div>`

DEER.TEMPLATES.slideshow = (obj) => {
    let annotations = obj.items[0].items[1].items.sort((a,b)=>parseFloat(a.target.split("t=").pop())-parseFloat(b.target.split("t=").pop()))
    let renderTweet = a=>`<div class="slideshow" salon-start="${parseFloat(a.target.split("t=").pop())}" salon-end="${parseFloat(a.target.split("t=").pop().split(",")[1])}">${a.body.value}</div>`
    let renderImage = a=>`<img class="slideshow" src="${a.body.id}" salon-start="${parseFloat(a.target.split("t=").pop())}" salon-end="${parseFloat(a.target.split("t=").pop().split(",")[1])}">`
    let tmpl = ``
    annotations.forEach(a=>tmpl+=a.body.value?renderTweet(a):renderImage(a))
    return tmpl
}

// sandbox repository URLS
DEER.URLS = {
    BASE_ID: "http://devstore.rerum.io/v1",
    CREATE: "http://tinydev.rerum.io/app/create",
    UPDATE: "http://tinydev.rerum.io/app/update",
    QUERY: "http://tinydev.rerum.io/app/query",
    SINCE: "http://devstore.rerum.io/v1/since"
}
// Render is probably needed by all items, but can be removed.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as renderer, initializeDeerViews } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-0.7/deer-render.js'

// Record is only needed for saving or updating items.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { default as record, initializeDeerForms } from 'https://centerfordigitalhumanities.github.io/deer/releases/alpha-0.7/deer-record.js'

// fire up the element detection as needed
try {
    initializeDeerViews(DEER) 
    initializeDeerForms(DEER)
} catch (err) {
    // silently fail if render or record is not loaded
}