import type * as recordTypes from "../types/recordTypes";
import type * as axiosType from "axios/index";

(() => {

  /*
   * Utility functions
   */

  const axios: axiosType.AxiosStatic = window.exports.axios;

  /*
   * Originally inspired by David Walsh
   * (https://davidwalsh.name/javascript-debounce-function)
   */

  const debounce = (func: Function, waitMillis: number) => {
    let timeout: number;

    return function executedFunction(...args: any[]) {
      const later = () => {
        window.clearTimeout(timeout);
        func(...args);
      };

      window.clearTimeout(timeout);
      timeout = window.setTimeout(later, waitMillis);
    };
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /*
   * Search functions
   */

  const urlPrefix = document.getElementsByTagName("main")[0].getAttribute("data-url-prefix");

  const searchStrEle = document.getElementById("filters--searchStr") as HTMLInputElement;
  const searchResultsEle = document.getElementById("container--searchResults") as HTMLDivElement;

  const renderItemColumnEle = (item: recordTypes.ItemSearchResult): HTMLDivElement => {

    const columnEle = document.createElement("div");
    columnEle.className = "column is-one-quarter-desktop is-one-third-tablet is-half-mobile";

    const itemURL = urlPrefix + "/item/" + item.itemKey;

    const imageURL = urlPrefix + "/images-items/" + (item.itemImage === "" ? "recycling.png" : escapeHtml(item.itemImage));

    columnEle.innerHTML =
      "<a href=\"" + itemURL + "\">" +
      "<div class=\"card\">" +
      ("<div class=\"card-image\">" +
        "<figure class=\"image is-1by1\">" +
        "<img src=\"" + imageURL + "\" alt=\"" + escapeHtml(item.itemName) + "\" alt=\"\" loading=\"lazy\" />" +
        "</figure>" +
        "</div>") +
      ("<div class=\"card-content\">" +
        "<p class=\"title is-5\">" + escapeHtml(item.itemName) + "</p>" +
        "</div>") +
      "</div>" +
      "</div>" +
      "</a>";

    return columnEle;
  };

  const getSearchResults = () => {

    searchResultsEle.innerHTML = "<div class=\"has-text-centered\">" +
      "<i class=\"fas fa-spinner fa-pulse\" aria-hidden=\"true\"></i><br />" +
      "Loading search results..." +
      "</div>";

    axios.post(urlPrefix + "/doSearch", {
      searchStr: searchStrEle.value
    })
      .then((response: axiosType.AxiosResponse<{ items: recordTypes.ItemSearchResult[] }>) => {

        if (response.data.items.length === 0) {

          searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">" +
            "Your search returned no results." +
            "</div>" +
            "</div>";

          return;
        }

        const columnsEle = document.createElement("div");
        columnsEle.className = "columns is-mobile is-multiline";

        for (const item of response.data.items) {
          const columnEle = renderItemColumnEle(item);
          columnsEle.appendChild(columnEle);
        }

        searchResultsEle.innerHTML = "";
        searchResultsEle.appendChild(columnsEle);
      })
      .catch((_err) => {

        searchResultsEle.innerHTML = "<div class=\"message is-danger\">" +
          "<div class=\"message-body\">" +
          "An error occurred while searching.  Please try again." +
          "</div>" +
          "</div>";
      });
  };

  /*
   * Set up the search
   */

  const getSearchResults_debounce = debounce(getSearchResults, 250);

  searchStrEle.addEventListener("keyup", getSearchResults_debounce);

  if (searchStrEle.value === "") {
    searchStrEle.focus();
  } else {
    getSearchResults();
  }
})();
