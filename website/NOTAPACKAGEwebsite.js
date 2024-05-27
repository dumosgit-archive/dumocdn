/**
 * @type {Array}
 */
const response = await fetch("./packages.json").then(data => data.json());
const pageSize = 10;
let currentPage = 1;
let totalPages = Math.ceil(response.length / pageSize);

function displayPackages(pageNumber) {
    if (document.getElementById("searchinput").value === "") {
        const packagesContainer = document.querySelector("ul");
        packagesContainer.innerHTML = '';

        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = pageNumber * pageSize;

        for (let i = startIndex; i < endIndex && i < response.length; i++) {
            const pkg = response[i];
            const packageElement = document.createElement("li");
            const newlink = document.createElement("a");
            newlink.innerText = pkg;
            newlink.href = `${String(pkg).replace("/", ".")}.js`;
            packageElement.appendChild(newlink);
            packagesContainer.appendChild(packageElement);
        }
    } else {
        const packagesContainer = document.querySelector("ul");
        packagesContainer.innerHTML = '';
        const packages = response.filter((text) => text.includes(document.getElementById("searchinput").value));
        packages.map(pkg => {
            const packageElement = document.createElement("li");
            const newlink = document.createElement("a");
            newlink.innerText = pkg;
            newlink.href = `${String(pkg).replace("/", ".")}.js`;
            packageElement.appendChild(newlink);
            packagesContainer.appendChild(packageElement);
        });
    }
}

function updatePaginationButtons() {
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages) return;

    currentPage = pageNumber;
    displayPackages(currentPage);
    updatePaginationButtons();
}

document.getElementById("packagecount").innerText = `Its currently hosting ${response.length} packages!`;

document.getElementById("prev").addEventListener("click", () => {
    goToPage(currentPage - 1);
});

document.getElementById("next").addEventListener("click", () => {
    goToPage(currentPage + 1);
});

displayPackages(currentPage);
updatePaginationButtons();

document.getElementById("searchinput").addEventListener("focus", () => goToPage(currentPage));
document.getElementById("searchinput").addEventListener("input", () => goToPage(currentPage));
document.getElementById("searchinput").addEventListener("blur", () => goToPage(currentPage));

document.getElementById("search").addEventListener("click", () => goToPage(currentPage));