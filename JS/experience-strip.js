// Front page: a short Experience list (image, title, company, dates) built from Config/productions.txt.
// Each item opens the full card on the About page.
document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("experience-list");
    if (!list) return;

    try {
        const response = await fetch("/Config/productions.txt");
        if (!response.ok) throw new Error(response.statusText);
        const text = await response.text();
        // Same format as productions.js: drop comment lines, then split cards on "---"
        const lines = text.split("\n").map(line => line.trim()).filter(line => !line.startsWith("#"));
        const productions = lines.join("\n").split(/^---$/m).map(prod => prod.trim()).filter(prod => prod);

        productions.forEach((prod, index) => {
            const [title, company, time, thumbnail] = prod.split("\n").filter(line => line);
            if (!thumbnail) return;

            const item = document.createElement("a");
            item.className = "experience-item";
            item.href = `about.html#experience-${index + 1}`;

            if (thumbnail.toLowerCase() !== "none") {
                const img = document.createElement("img");
                img.src = thumbnail.split("||")[0].trim(); // first image only
                img.alt = "";
                img.loading = "lazy";
                item.appendChild(img);
            }

            const textDiv = document.createElement("div");
            textDiv.className = "experience-text";
            [["experience-title", title], ["experience-company", company], ["experience-time", time]].forEach(([cls, value]) => {
                const span = document.createElement("span");
                span.className = cls;
                span.textContent = value;
                textDiv.appendChild(span);
            });
            item.appendChild(textDiv);
            list.appendChild(item);
        });
    } catch (error) {
        console.error("Failed to load the experience list:", error);
    }
});
