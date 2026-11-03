// Function to create a production card
// description is a list of lines: each becomes a paragraph, and "Link: Label | url" becomes a link
function createProductionCard(title, company, time, thumbnail, description) {
    const card = document.createElement("div");
    card.classList.add("production-subpanel");

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("production-details");

    const titleElem = document.createElement("h2");
    titleElem.textContent = title;

    const companyElem = document.createElement("p");
    companyElem.textContent = company;
    companyElem.style.fontWeight = "bold"; // Inline style for bold text

    const timeElem = document.createElement("p");
    timeElem.textContent = time;
    timeElem.style.fontStyle = "italic"; // Inline style for italic text

    // Append text elements to the detailsDiv
    detailsDiv.appendChild(titleElem);
    detailsDiv.appendChild(companyElem);
    detailsDiv.appendChild(timeElem);

    // Create a new div for the description
    const descDiv = document.createElement("div");
    descDiv.classList.add("production-description");
    let linkRow = null; // Link lines in a row share one paragraph
    description.forEach(line => {
        const link = line.match(/^Link:\s*(.+?)\s*\|\s*(\S+)$/i);
        const descElem = link && linkRow ? linkRow : document.createElement("p");
        linkRow = link ? descElem : null;
        if (link) {
            descElem.classList.add("link-row");
            const anchor = document.createElement("a");
            anchor.className = "link-button";
            anchor.textContent = link[1];
            anchor.href = link[2];
            if (link[2].startsWith("http")) {
                anchor.target = "_blank";
                anchor.rel = "noopener";
            }
            descElem.appendChild(anchor);
        } else {
            descElem.textContent = line;
        }
        if (!descElem.parentNode) descDiv.appendChild(descElem);
    });

    // Create a container for the details and description
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("production-content");
    contentContainer.appendChild(detailsDiv);
    contentContainer.appendChild(descDiv);

    // "none" as the thumbnail means a card without an image; "a || b" stacks several images
    if (thumbnail.toLowerCase() !== "none") {
        const imagesDiv = document.createElement("div");
        imagesDiv.classList.add("production-images");
        thumbnail.split("||").map(url => url.trim()).forEach(url => {
            const img = document.createElement("img");
            img.src = url;
            img.alt = title;
            img.loading = "lazy";
            imagesDiv.appendChild(img);
        });
        card.appendChild(imagesDiv);
    } else {
        card.classList.add("no-image");
    }
    card.appendChild(contentContainer);

    return card;
}

// Fetch and append production cards on DOM content load
document.addEventListener("DOMContentLoaded", async () => {
    const productionsContainer = document.querySelector(".productions-subpanels");
    if (!productionsContainer) {
        console.error('Productions container not found');
        return;
    }

    try {
        const response = await fetch('/Config/productions.txt');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const text = await response.text();
        // Drop comment lines first, so a commented-out "---" can't split a card
        const lines = text.split('\n').map(line => line.trim()).filter(line => !line.startsWith('#'));
        const productions = lines.join('\n').split(/^---$/m).map(prod => prod.trim()).filter(prod => prod);

        const fragment = document.createDocumentFragment();

        productions.forEach((prod, index) => {
            const fields = prod.split('\n').filter(line => line);
            if (fields.length >= 5) {
                const card = createProductionCard(fields[0], fields[1], fields[2], fields[3], fields.slice(4));
                card.id = `experience-${index + 1}`; // the front page links here
                fragment.appendChild(card);
            } else {
                console.error(`Invalid production data format at index ${index}:`, fields);
            }
        });

        productionsContainer.appendChild(fragment);

        // The cards arrive after the page loads, so jump to "#experience-N" by hand
        const target = location.hash && document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ block: "start" });
    } catch (error) {
        console.error('Failed to load productions:', error);
    }
});
