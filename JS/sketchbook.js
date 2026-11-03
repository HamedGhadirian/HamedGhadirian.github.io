// Sketchbook page: a grid of small copies (Images/Sketchbook/thumbs); clicking one opens the full page.
// The list comes from Config/sketchbook.txt, which "Update images.bat" writes (newest first).

const thumbnailContainer = document.getElementById("thumbnail-container");
let pages = [];        // full-size image paths, in grid order
let currentPage = -1;  // index of the page open in the viewer, -1 when closed

// Each thumbnail is a real link to the full image, so middle-click and "open in new tab" still work
function createSketchbookThumbnail(src, index, imageSizes) {
    const thumbnailLink = document.createElement("a");
    thumbnailLink.href = src;
    thumbnailLink.classList.add("thumbnail");

    const thumbnailImg = document.createElement("img");
    thumbnailImg.src = src.replace("/Images/Sketchbook/", "/Images/Sketchbook/thumbs/");
    thumbnailImg.alt = `Sketchbook page ${index + 1}`;
    thumbnailImg.loading = "lazy";
    thumbnailImg.decoding = "async";

    // Known size = the grid keeps each page's space while it loads, so nothing jumps
    const size = imageSizes[src];
    if (size) {
        thumbnailImg.width = size[0];
        thumbnailImg.height = size[1];
    }

    thumbnailLink.appendChild(thumbnailImg);
    thumbnailLink.addEventListener("click", (event) => {
        event.preventDefault();
        openViewer(index);
    });
    return thumbnailLink;
}

// --- Full-size viewer ---

const viewer = document.createElement("div");
viewer.className = "modal-overlay";
viewer.innerHTML = `
    <button class="viewer-arrow viewer-prev" type="button" aria-label="Previous page"><i class="fa-solid fa-chevron-left"></i></button>
    <div class="modal-content"><img id="modal-image" src="" alt="" /></div>
    <button class="viewer-arrow viewer-next" type="button" aria-label="Next page"><i class="fa-solid fa-chevron-right"></i></button>`;
document.body.appendChild(viewer);
const viewerImg = viewer.querySelector("#modal-image");

function openViewer(index) {
    currentPage = (index + pages.length) % pages.length; // wraps around at both ends
    viewerImg.src = pages[currentPage];
    viewerImg.alt = `Sketchbook page ${currentPage + 1}`;
    viewer.style.display = "flex";
    document.body.style.overflow = "hidden"; // the grid behind stays still
}

function closeViewer() {
    currentPage = -1;
    viewer.style.display = "none";
    document.body.style.overflow = "";
}

// Click on the dark area or the image closes; the arrows step through pages
viewer.addEventListener("click", closeViewer);
viewer.querySelector(".viewer-prev").addEventListener("click", (event) => { event.stopPropagation(); openViewer(currentPage - 1); });
viewer.querySelector(".viewer-next").addEventListener("click", (event) => { event.stopPropagation(); openViewer(currentPage + 1); });

document.addEventListener("keydown", (event) => {
    if (currentPage === -1) return;
    if (event.key === "Escape") closeViewer();
    else if (event.key === "ArrowLeft") openViewer(currentPage - 1);
    else if (event.key === "ArrowRight") openViewer(currentPage + 1);
});

// --- Build the grid ---

Promise.all([
    fetch("/Config/sketchbook.txt").then(response => response.text()),
    fetch("/Images/sizes.json").then(response => (response.ok ? response.json() : {})).catch(() => ({})),
]).then(([listText, imageSizes]) => {
    pages = listText.split("\n").map(line => line.trim()).filter(line => line);

    const fragment = document.createDocumentFragment();
    pages.forEach((src, index) => fragment.appendChild(createSketchbookThumbnail(src, index, imageSizes)));
    thumbnailContainer.appendChild(fragment);
}).catch(error => console.error("Error loading sketchbook:", error));
