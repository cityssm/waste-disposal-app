"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var axios = window.exports.axios;
    var debounce = function (func, waitMillis) {
        var timeout;
        return function executedFunction() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var later = function () {
                window.clearTimeout(timeout);
                func.apply(void 0, args);
            };
            window.clearTimeout(timeout);
            timeout = window.setTimeout(later, waitMillis);
        };
    };
    var escapeHtml = function (unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };
    var urlPrefix = escapeHtml(document.getElementsByTagName("main")[0].getAttribute("data-url-prefix"));
    var searchStrEle = document.getElementById("filters--searchStr");
    var searchResultsEle = document.getElementById("container--searchResults");
    var renderItemColumnEle = function (item) {
        var columnEle = document.createElement("div");
        columnEle.className = "column is-one-quarter-desktop is-one-third-tablet is-half-mobile";
        var itemURL = urlPrefix + "/item/" + item.itemKey;
        var imageURL = urlPrefix + "/images-items/" + (item.itemImage === "" ? "recycling.png" : escapeHtml(item.itemImage));
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
    var getSearchResults = function () {
        searchResultsEle.innerHTML = "<div class=\"has-text-centered\">" +
            "<i class=\"fas fa-spinner fa-pulse\" aria-hidden=\"true\"></i><br />" +
            "Loading search results..." +
            "</div>";
        axios.post(urlPrefix + "/doSearch", {
            searchStr: searchStrEle.value
        })
            .then(function (response) {
            if (response.data.items.length === 0) {
                searchResultsEle.innerHTML = "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">" +
                    "Your search returned no results." +
                    "</div>" +
                    "</div>";
                return;
            }
            var columnsEle = document.createElement("div");
            columnsEle.className = "columns is-mobile is-multiline";
            for (var _i = 0, _a = response.data.items; _i < _a.length; _i++) {
                var item = _a[_i];
                var columnEle = renderItemColumnEle(item);
                columnsEle.appendChild(columnEle);
            }
            searchResultsEle.innerHTML = "";
            searchResultsEle.appendChild(columnsEle);
        })
            .catch(function (_err) {
            searchResultsEle.innerHTML = "<div class=\"message is-danger\">" +
                "<div class=\"message-body\">" +
                "An error occurred while searching.  Please try again." +
                "</div>" +
                "</div>";
        });
    };
    var getSearchResults_debounce = debounce(getSearchResults, 250);
    searchStrEle.addEventListener("keyup", getSearchResults_debounce);
    if (searchStrEle.value === "") {
        searchStrEle.focus();
    }
    else {
        getSearchResults();
    }
})();
