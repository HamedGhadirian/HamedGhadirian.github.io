// Builds a grid of post thumbnails (Portfolio and Personal Works pages).
// The page says which posts to show on its container:
//   <div id="thumbnail-container" data-list="projects" data-folder="Projects">
// data-list = the file in Config/ (without .txt), data-folder = where the post folders are.

const thumbnailContainer = document.getElementById("thumbnail-container");
const LIST_FILE = `/Config/${thumbnailContainer.dataset.list}.txt`;
const POSTS_FOLDER = `/${thumbnailContainer.dataset.folder}`;

// Small icons shown on hover, in this order, when a post's media.txt has that kind of media
const OVERLAY_ICONS = [
    { key: "hasMultipleImages", className: "fa-solid fa-layer-group" },
    { key: "hasVideo", className: "fa-solid fa-video" },
    { key: "hasYouTube", className: "fa-brands fa-youtube" },
    { key: "hasSketchfab", className: "fa-solid fa-cube" },
];

// Function to create a thumbnail with overlay icons
function createThumbnail(artwork) {
    const thumbnailLink = document.createElement("a");
    thumbnailLink.href = artwork.galleryPageUrl;

    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.classList.add("thumbnail");

    const thumbnailImg = document.createElement("img");
    thumbnailImg.src = artwork.src;
    thumbnailImg.alt = artwork.alt;
    thumbnailImg.loading = "lazy";
    thumbnailImg.decoding = "async";

    const thumbnailTitle = document.createElement("div");
    thumbnailTitle.classList.add("thumbnail-title");
    thumbnailTitle.innerText = artwork.alt;

    OVERLAY_ICONS.filter(icon => artwork[icon.key]).forEach((icon, iconIndex) => {
        const iconElement = document.createElement("i");
        iconElement.className = `${icon.className} overlay-icon`;
        iconElement.style.left = `${10 + iconIndex * 30}px`;
        thumbnailDiv.appendChild(iconElement);
    });

    thumbnailDiv.appendChild(thumbnailImg);
    thumbnailDiv.appendChild(thumbnailTitle);
    thumbnailLink.appendChild(thumbnailDiv);

    return thumbnailLink;
}

// Read a post's description.txt and media.txt
function fetchProjectData(projectName) {
    const descriptionPath = `${POSTS_FOLDER}/${projectName}/description.txt`;
    const mediaPath = `${POSTS_FOLDER}/${projectName}/media.txt`;

    return Promise.all([
        fetch(descriptionPath).then(response => response.text()),
        fetch(mediaPath).then(response => response.text())
    ])
    .then(([descriptionText, mediaText]) => {
        const [title, description, tags, thumbnailUrl, htmlFileName] = descriptionText.split('---').map(line => line.trim());
        const galleryPageUrl = descriptionPath.replace('description.txt', htmlFileName);

        const mediaLines = mediaText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));

        // Find the banner image
        const bannerImageLine = mediaLines.find(line => line.endsWith('*'));
        const bannerImageUrl = bannerImageLine ? bannerImageLine.replace('*', '').trim() : null;

        return {
            src: thumbnailUrl,
            alt: title,
            galleryPageUrl,
            hasMultipleImages: mediaLines.filter(line => line.match(/\.(jpeg|jpg|gif|png|webp)$/)).length > 1,
            hasVideo: mediaLines.some(line => line.match(/\.(mp4|webm)$/)),
            hasYouTube: mediaLines.some(line => line.includes('youtube.com')),
            hasSketchfab: mediaLines.some(line => line.includes('sketchfab.com')),
            bannerImageUrl,
        };
    })
    .catch(error => console.error(`Error loading post "${projectName}":`, error));
}

// Read the list of post folders, top line first
function fetchProjects() {
    return fetch(LIST_FILE)
        .then(response => response.text())
        .then(text => text.split('\n').map(line => line.trim()).filter(line => line))
        .catch(error => console.error('Error loading post list:', error));
}

// Fetch posts and create thumbnails
fetchProjects().then(projects => {
    Promise.all(projects.map(fetchProjectData)).then(projectDataArray => {
        // Keep the order from the list file; skip a post whose files failed to load
        const fragment = document.createDocumentFragment();
        const artworks = projectDataArray.filter(Boolean);
        artworks.forEach(artwork => fragment.appendChild(createThumbnail(artwork)));

        // The first post with a banner image (a media line ending in *) sets the header background
        const banner = artworks.find(artwork => artwork.bannerImageUrl);
        if (banner) {
            document.querySelector('.top-container').style.backgroundImage = `url(${banner.bannerImageUrl})`;
        }

        thumbnailContainer.appendChild(fragment);
    }).catch(error => console.error('Error processing posts:', error));
});
