"use strict";
/* global marked */

// the page to show comes from the address, like index.html?page=shark
// (only letters, numbers and dashes are allowed, so nothing weird can get in)
const pageName = (new URLSearchParams(window.location.search).get("page") || "home").toLowerCase().replace(/[^a-z0-9-]/g, "");

// "Diver Shark" -> "diver-shark", used for jumping to sections
function makeId(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\- ]/g, "")
        .replace(/\s/g, "-");
}

async function loadMarkdown(file) {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error(file + " not found");
    }
    return marked.parse(await response.text());
}

// pages link to each other like shark.md#diver-shark, turn that into ?page=shark#diver-shark
function fixLinks(element) {
    element.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href");
        const match = href.match(/^([\w-]+)\.md(#.*)?$/);
        if (match) {
            link.setAttribute("href", "?page=" + match[1] + (match[2] || ""));
            if (match[1] === pageName) {
                link.classList.add("current");
            }
        } else if (href.startsWith("http")) {
            link.target = "_blank";
        }
    });
}

function addIds(element) {
    const used = new Set();
    element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
        heading.id = makeId(heading.textContent);
        used.add(heading.id);
    });

    // a lot of things on the wiki are table rows and not headings,
    // so give each row an id from its first cell so links can jump to those too
    element.querySelectorAll("tr").forEach((row) => {
        const firstCell = row.querySelector("td");
        if (!firstCell) return;
        const temp = document.createElement("div");
        temp.innerHTML = firstCell.innerHTML.split("<br>")[0];
        const id = makeId(temp.textContent);
        if (id && !used.has(id)) {
            row.id = id;
            used.add(id);
        }
    });
}

// turns <div class="slideshow"> into the arrows + picture thing from the home tab in the game
function makeSlideshows(element) {
    element.querySelectorAll(".slideshow").forEach((box) => {
        const slides = [...box.querySelectorAll("p")];
        if (slides.length === 0) return;
        let current = 0;

        const dots = document.createElement("div");
        dots.className = "slideDots";
        const row = document.createElement("div");
        row.className = "slideRow";
        const left = document.createElement("button");
        left.className = "slideArrow";
        left.textContent = "◀";
        const right = document.createElement("button");
        right.className = "slideArrow";
        right.textContent = "▶";
        const picture = document.createElement("div");
        picture.className = "slidePicture";
        const text = document.createElement("p");
        text.className = "slideText";

        function show() {
            const slide = slides[current].cloneNode(true);
            const image = slide.querySelector("img");
            picture.innerHTML = "";
            if (image) {
                picture.append(image);
            }
            text.innerHTML = slide.innerHTML.trim();
            dots.innerHTML = slides.map((_slide, i) => (i === current ? "<span class='on'>•</span>" : "<span>•</span>")).join("");
        }

        left.addEventListener("click", () => {
            current = (current - 1 + slides.length) % slides.length;
            show();
        });
        right.addEventListener("click", () => {
            current = (current + 1) % slides.length;
            show();
        });

        row.append(left, picture, right);
        box.innerHTML = "";
        box.append(dots, row, text);
        show();
    });
}

async function showPage() {
    const content = document.getElementById("content");
    const sidebar = document.getElementById("sidebar");

    try {
        content.innerHTML = await loadMarkdown(pageName + ".md");
    } catch {
        content.innerHTML =
            "<h1>Page not found</h1><p>There's no page called <strong>" + pageName + "</strong>.</p><p><a href='?page=home'>Back to the home page</a></p>";
    }
    try {
        sidebar.innerHTML = await loadMarkdown("sidebar.md");
    } catch {
        sidebar.innerHTML = "";
    }

    fixLinks(content);
    fixLinks(sidebar);
    addIds(content);
    makeSlideshows(content);

    const heading = content.querySelector("h1");
    if (heading && pageName !== "home") {
        document.title = heading.textContent + " - Shark Game Wiki";
    }

    // the browser tries to jump to #section before the page is loaded, so do it again now
    if (window.location.hash) {
        const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (target) {
            target.scrollIntoView();
            target.classList.add("highlight");
        }
    }
}

showPage();
