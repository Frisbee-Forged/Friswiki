// before reading this i must inform you with some stuff, firstly this file is not just the themes script, its responsible for the whole settings.json parameters, secondly the retro theme was a leftover i forgot to remove from frisbee, even though its named that IT IS NOT RETRO MODE, ITS A BLUE DARK MODE!1!!1
// notes here might be vague so lol

// Fetch settings from settings.json
fetch("/data/settings.json")
  .then((response) => response.json())
  .then((settings) => {
    const themes = settings.themes || ["light"]; 
    const defaultTheme = settings.defaultTheme || "light";
    const savedTheme = localStorage.getItem("theme") || defaultTheme;
    if (themes.includes(savedTheme)) {
      document.body.className = savedTheme;
    } else {
      document.body.className = defaultTheme;
    }
    
    const downloadbtn = document.getElementById("download")
    if (settings.pagedownload == true) {
      downloadbtn.style.display = "inline-block"
    } else {
      downloadbtn.style.display = "none"
    }
    
    //const navigation = document.getElementById("navigation")
    //if (settings.Navigation == true) {
    //  navigation.style.display = "block"
    //} else {
    //  navigation.style.display = "none"
    //}
    // Populate (lol) the theme selector dropdown
    const themeSelector = document.getElementById("theme-selector");
    if (themeSelector) {
      themes.forEach((theme) => {
        const option = document.createElement("option");
        option.value = theme;
        option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
        if (theme === savedTheme) {
          option.selected = true;
        }
        themeSelector.appendChild(option);
      });

      themeSelector.addEventListener("change", (e) => {
        const selectedTheme = e.target.value;
        if (themes.includes(selectedTheme)) {
          changeTheme(selectedTheme);
        } else {
          console.warn("Invalid theme selected");
        }
      });
    }
  })
  .catch((error) => {
    console.error("Error loading settings.json:", error);
  });

function changeTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("theme", theme);
}

function downloadFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function pageDownload() {
  let page = JSON.parse(localStorage.getItem("pagedata"));

  if (!page) {
    console.error("No pagedata found in localStorage.");
    return;
  }

  const pageString = JSON.stringify(page, null, 2); // Convert the
  downloadFile("page.json", pageString, "application/json");
}


