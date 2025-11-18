"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCodeCard = void 0;
const render_1 = require("./render");
function renderCodeCard(card, options = {}) {
    const url = card.url ? /^[^:]+:\/\//.test(card.url) ? card.url : ('/' + card.url.replace(/^\.?\/?/, ''))
        : card.youTubeId ? `https://youtu.be/${card.youTubeId}` : undefined;
    const link = !!url;
    const div = (parent, cls, tag = "div", text = '') => {
        let d = document.createElement(tag);
        if (cls)
            d.className = cls;
        if (parent)
            parent.appendChild(d);
        if (text)
            d.appendChild(document.createTextNode(text + ''));
        return d;
    };
    const style = card.style || "card";
    let r = div(null, 'ui ' + style + ' ' + (card.color || '') + (link ? ' link' : ''), link ? "a" : "div");
    if (options.role) {
        r.setAttribute("role", options.role);
    }
    if (options.role === "option") {
        r.setAttribute("aria-selected", "true");
    }
    if (link) {
        const rAsLink = r;
        rAsLink.href = url;
        // pop out external links
        if (/^https?:\/\//.test(url)) {
            rAsLink.target = "_blank";
        }
    }
    if (!options.hideHeader && card.header) {
        let h = div(r, "ui content " + (card.responsive ? " tall desktop only" : ""));
        if (card.header)
            div(h, 'description', 'span', card.header);
    }
    const name = (options.shortName ? card.shortName : '') || card.name;
    let img = div(r, "ui image" + (card.responsive ? " tall landscape only" : ""));
    if (card.label) {
        let lbl = document.createElement("label");
        lbl.className = `ui ${card.labelClass ? card.labelClass : "orange right ribbon"} label`;
        lbl.textContent = card.label;
        img.appendChild(lbl);
    }
    if (card.blocksXml) {
        const svg = (0, render_1.render)(card.blocksXml);
        if (!svg) {
            pxt.error("failed to render blocks");
            pxt.debug(card.blocksXml);
        }
        else {
            let holder = div(img, '');
            holder.setAttribute('style', 'width:100%; min-height:10em');
            holder.appendChild(svg);
        }
    }
    if (card.typeScript) {
        let pre = document.createElement("pre");
        pre.appendChild(document.createTextNode(card.typeScript));
        img.appendChild(pre);
    }
    const imgUrl = card.imageUrl || (card.youTubeId ? `https://img.youtube.com/vi/${card.youTubeId}/0.jpg` : undefined);
    if (imgUrl) {
        let imageWrapper = document.createElement("div");
        imageWrapper.className = "ui imagewrapper";
        let image = document.createElement("div");
        image.className = "ui cardimage";
        image.style.backgroundImage = `url("${card.imageUrl}")`;
        image.title = name;
        image.setAttribute("role", "presentation");
        imageWrapper.appendChild(image);
        img.appendChild(imageWrapper);
    }
    if (card.cardType == "file") {
        let file = div(r, "ui fileimage");
        img.appendChild(file);
    }
    if (name || card.description) {
        let ct = div(r, "ui content");
        if (name) {
            r.setAttribute("aria-label", name);
            div(ct, 'header', 'div', name);
        }
        if (card.description) {
            const descr = div(ct, 'ui description');
            const regex = /((?:\.{1,3})|[\!\?…])/;
            const match = regex.exec(card.description);
            let shortenedDescription = card.description + ".";
            if (match) {
                const punctuation = match[1];
                shortenedDescription = card.description.split(punctuation)[0] + punctuation;
            }
            descr.appendChild(document.createTextNode(shortenedDescription));
        }
    }
    if (card.time) {
        let meta = div(r, "meta");
        if (card.time) {
            let m = div(meta, "date", "span");
            m.appendChild(document.createTextNode(pxt.Util.timeSince(card.time)));
        }
    }
    if (card.extracontent) {
        let extracontent = div(r, "extra content", "div");
        extracontent.appendChild(document.createTextNode(card.extracontent));
    }
    return r;
}
exports.renderCodeCard = renderCodeCard;
