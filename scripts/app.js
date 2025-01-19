document.addEventListener("DOMContentLoaded", loadPage);

function dataset(object) {
  let objectString = JSON.stringify(object);
  localStorage.setItem("pagedata", objectString);
}

function openPage(url) {
  window.location.href = url;
}

function loadPage() {
  if (window.location.pathname === "/template.html") {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page") || "data/pages/pagestutorial.json";

    fetch(page)
      .then((response) => {
        if (!response.ok) throw new Error("Page not found.");
        return response.json();
      })
      .then((data) => {
        const jsonRelease = data["JSON release"] || "V1";

        // juicy data
        dataset(data);

        // document title
        document.title = data.metadata.title;

        // breadcrumbs
        const breadcrumbs = document.getElementById("breadcrumbs");
        if (breadcrumbs) {
          breadcrumbs.innerHTML = `<a href="index.html">Home</a> &gt; ${data.metadata.title}`;
        }

        // Render content
        const content = document.getElementById("content");
        if (content) {
          if (jsonRelease === "V1") {
            renderV1(data, content);
          } else if (jsonRelease === "V2") {
            renderV2(data, content);
          } else if (jsonRelease === "Crafted V2") {
            renderCraftedV2(data, content);
          } else {
            console.error("Unsupported JSON release version:", jsonRelease);
            content.innerHTML = `<p>Unsupported JSON release version: ${jsonRelease}</p>`;
          }
        }

        // experiments
        if (jsonRelease === "V2" && data.experiments) {
          applyExperiments(data.experiments, data, content);
        }

        // Debugging
        debugPageData(data);
      })
      .catch((error) => {
        console.error("Error loading page:", error);

        const content = document.getElementById("content");
        if (content) {
          content.innerHTML = `<p>Error loading page. Please check the JSON file.</p>`;
        }
      });
  }
}

function renderV1(data, content) {
  content.innerHTML = `
    <h1>${data.content.header}</h1>
    <p>${data.content.body}</p>
  `;
}

function renderV2(data, content) {
  let html = `<h1>${data.content.header}</h1>${data.content.body}`;

  // Add Table of Contents
  html = generateTOC(data.content) + html;

  // Add embedded stuff
  if (data.content.media) {
    html += renderEmbeddedMedia(data.content.media);
  }

  // Add galleries (doesn't work i think)
  if (data.content.gallery) {
    html += renderGallery(data.content.gallery);
  }

  if (data.content.tables) {
    html += `<h2>Tables</h2>`;
    data.content.tables.forEach((table) => {
      html += "<table><thead><tr>";
      table.headers.forEach((header) => {
        html += `<th>${header}</th>`;
      });
      html += "</tr></thead><tbody>";
      table.rows.forEach((row) => {
        html += "<tr>";
        row.forEach((cell) => {
          html += `<td>${cell}</td>`;
        });
        html += "</tr>";
      });
      html += "</tbody></table>";
    });
  }

  // fucking hell dude, my code editor suntax highlighting is broken, stupid bullshit 
  if (data.content.relatedLinks) {
    html += `<h3>Related Links</h3><ul>`;
    data.content.relatedLinks.forEach((link) => {
      html += `<li><a href="${link.url}" target="_blank">${link.title}</a></li>`;
    });
    html += `</ul>`;
  }

  content.innerHTML = html;
}

function renderCraftedV2(data, content) {
  let html = `<section class="crafted-container">`;

  if (data.content.intro) {
    html += `<div class="crafted-intro">
      <h1>${data.content.intro.title}</h1>
      <p>${data.content.intro.description}</p>
    </div>`;
  }

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      html += `
        <section class="crafted-section">
          <h2>${section.title}</h2>
          <p>${section.body}</p>
          ${section.media ? renderEmbeddedMedia(section.media) : ""}
        </section>`;
    });
  }

  if (data.content.cta) {
    html += `
      <div class="crafted-cta">
        <a href="${data.content.cta.link}" class="cta-button">${data.content.cta.text}</a>
      </div>`;
  }

  html += `</section>`;
  content.innerHTML = html;
}

function renderEmbeddedMedia(media) {
  return media
    .map((item) => {
      if (item.type === "image") {
        return `<img src="${item.url}" alt="${item.alt}" style="max-width:100%; margin-top: 20px;"/>`;
      }
      if (item.type === "video") {
        return `<video controls style="max-width:100%; margin-top: 20px;">
                  <source src="${item.url}" type="video/mp4">
                </video>`;
      }
      if (item.type === "audio") {
        return `<audio controls style="margin-top: 20px;">
                  <source src="${item.url}" type="audio/mpeg">
                </audio>`;
      }
      return "";
    })
    .join("");
}

function generateTOC(content) {
  const headings = content.body.match(/<h[1-6]>.*?<\/h[1-6]>/g);
  if (!headings) return "";

  const tocItems = headings.map((heading) => {
    const level = heading.match(/<h([1-6])>/)[1];
    const text = heading.replace(/<\/?h[1-6]>/g, "");
    const id = text.toLowerCase().replace(/\s+/g, "-");
    return `<li><a href="#${id}">${text}</a></li>`;
  });

  return `<h2>Table of Contents</h2><ul>${tocItems.join("")}</ul>`;
}

function applyExperiments(experiments, data, content) {

  if (experiments.lazyLoadImages) {
    lazyLoadImages(content);
  }


  if (experiments.autoSaveScroll) {
    restoreScrollPosition(content);
    document.addEventListener("beforeunload", () => saveScrollPosition(content));
  }


  if (experiments.offlineSupport) {
    cachePage(data);
  }


  if (experiments.animateContent) {
    animateContent(content);
  }


  if (experiments.dynamicScripts && Array.isArray(experiments.dynamicScripts)) {
    loadScripts(experiments.dynamicScripts);
  }
}

function lazyLoadImages(content) {
  const images = content.querySelectorAll("img[data-src]");
  images.forEach((img) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  });
}

function saveScrollPosition(content) {
  localStorage.setItem("scrollPosition", content.scrollTop);
}

function restoreScrollPosition(content) {
  const scrollPosition = localStorage.getItem("scrollPosition");
  if (scrollPosition) {
    content.scrollTop = scrollPosition;
  }
}

function cachePage(data) {
  localStorage.setItem("cachedPage", JSON.stringify(data));
}

function loadCachedPage() {
  const cachedData = localStorage.getItem("cachedPage");
  return cachedData ? JSON.parse(cachedData) : null;
}

function animateContent(content) {
  content.style.opacity = 0;
  setTimeout(() => {
    content.style.transition = "opacity 0.5s";
    content.style.opacity = 1;
  }, 100);
}

function loadScripts(scripts) {
  scripts.forEach((script) => {
    const scriptTag = document.createElement("script");
    scriptTag.src = script.url;
    document.body.appendChild(scriptTag);
  });
}

function debugPageData(data) {
  console.log("Page Data Debugging:");
  console.log("Title:", data.metadata.title);
  console.log("Content Header:", data.content.header);
  console.log("Content Body:", data.content.body);

  const jsonRelease = data["JSON release"] || "V1";
  console.log("JSON Release Version:", jsonRelease);

  if (data.content.tables) {
    console.log("Tables:", data.content.tables);
  }
  if (data.content.relatedLinks) {
    console.log("Related Links:", data.content.relatedLinks);
  }

  if (data.experiments) {
    console.log("Experiments:", data.experiments);
  }
}

function loadRandomPage() {
  fetch('data/pages.json')
    .then(response => {
      if (!response.ok) throw new Error("Pages list not found.");
      return response.json();
    })
    .then(pages => {
      // Select a random page
      const randomIndex = Math.floor(Math.random() * pages.length);
      const randomPage = pages[randomIndex];
      
      openPage(`/template.html?page=${randomPage.file}`);
    })
    .catch(error => {
      console.error("Error loading pages list:", error);
    });
      }
