document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const resultsContainer = document.getElementById("search-results");

  // Function to fetch and filter pages
  async function fetchAndSearchPages(query) {
    try {
      const res = await fetch("data/pages.json");
      const pages = await res.json();
      return pages.filter(
        (page) =>
        page.title.toLowerCase().includes(query) ||
        (page.keywords || []).some((kw) => kw.toLowerCase().includes(query))
      );
    } catch (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
  }

  // Function to render search results
  function renderResults(results) {
    if (results.length > 0) {
      resultsContainer.innerHTML = results
        .map(
          (result) =>
          `<li><a href="template.html?page=${result.file}">${result.title}</a></li>`
        )
        .join("");
      showResults();
    } else {
      hideResults();
    }
  }

  // Function to show results with opacity animation
  function showResults() {
    resultsContainer.style.display = "block"; // Ensure it's visible
    setTimeout(() => {
      resultsContainer.style.opacity = "1";
    }, 10); // delay
  }

  // hide results
  function hideResults() {
    resultsContainer.style.opacity = "0";
    setTimeout(() => {
      resultsContainer.style.display = "none";
      resultsContainer.innerHTML = "";
    }, 300); 
  }

  // Main search function
  async function searchPages() {
    const query = searchBar.value.trim().toLowerCase();
    if (!query) {
      hideResults();
      return;
    }
    const results = await fetchAndSearchPages(query);
    renderResults(results);
  }

  // Add event listeners
  searchBar.addEventListener("input", searchPages);

  searchBar.addEventListener("blur", () => {
    setTimeout(() => {
      hideResults();
    }, 200);
  });

  resultsContainer.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
});
