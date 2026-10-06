(function () {
  const $ = (s) => document.querySelector(s);
  const results = $("#results");
  const message = $("#message");
  const form = $("#search-form");
  const input = $("#q");
  const countTag = $("#wishlist-count");

  let tab = "search";
  let wishlist = new Map();
  let lastResults = [];

  const esc = (s) => Object.assign(document.createElement("div"), { textContent: s || "" }).innerHTML;
  const show = (text, kind) => { message.className = `notification is-${kind}`; message.textContent = text; };
  const hide = () => message.className = "notification is-hidden";

  async function api(url, opts) {
    const resp = await fetch(url, opts);
    if (resp.status === 204) return null;
    let body = null;
    try { body = await resp.json(); } catch (e) {}
    if (!resp.ok) throw new Error((body && body.detail) || "Something went wrong.");
    return body;
  }

  function card(book) {
    const saved = wishlist.has(book.id);
    const col = document.createElement("div");
    col.className = "column is-12-mobile is-6-tablet is-4-desktop";
    const authors = book.authors?.length ? book.authors.join(", ") : "Unknown author";
    const thumb = book.thumbnail 
      ? `<img src="${esc(book.thumbnail)}" alt="Cover" loading="lazy">` 
      : `<span class="icon is-large has-text-grey-light"><i class="fa-solid fa-book fa-2x"></i></span>`;

    col.innerHTML = `
      <div class="card book-card">
        <div class="card-content">
          <div class="media">
            <div class="media-left"><figure class="thumb">${thumb}</figure></div>
            <div class="media-content">
              <p class="title is-5">${esc(book.title)}</p>
              <p class="subtitle is-6 has-text-grey">${esc(authors)}</p>
              <div class="rating"></div>
              <p class="is-size-7 has-text-grey">${book.rating ? esc(book.rating) + " / 5" : "No rating"}</p>
            </div>
          </div>
        </div>
        <footer class="card-footer">
          <a class="card-footer-item wish-btn ${saved ? "has-text-danger" : ""}">
            <i class="${saved ? "fa-solid" : "fa-regular"} fa-heart"></i>&nbsp;${saved ? "Remove" : "Add to wishlist"}
          </a>
        </footer>
      </div>`;

    raterJs({ element: col.querySelector(".rating"), max: 5, rating: Number(book.rating) || 0, readOnly: true, starSize: 20 });
    col.querySelector(".wish-btn").addEventListener("click", () => toggle(book));
    return col;
  }

  function render(books, emptyText) {
    results.innerHTML = "";
    if (!books.length) return show(emptyText, "info is-light");
    hide();
    books.forEach((b) => results.appendChild(card(b)));
  }

  async function toggle(book) {
    try {
      if (wishlist.has(book.id)) {
        await api(`/api/wishlist/${encodeURIComponent(book.id)}/`, { method: "DELETE" });
        wishlist.delete(book.id);
      } else {
        await api("/api/wishlist/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(book),
        });
        wishlist.set(book.id, book);
      }
      countTag.textContent = wishlist.size;
      refresh();
    } catch (e) {
      show(e.message, "danger is-light");
    }
  }

  function refresh() {
    if (tab === "wishlist") {
      render([...wishlist.values()], "Your wishlist is empty.");
    } else if (lastResults.length) {
      render(lastResults, "");
    }
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    setTab("search");
    $("#search-btn").classList.add("is-loading");
    try {
      lastResults = await api(`/api/books/?q=${encodeURIComponent(q)}`);
      render(lastResults, `No books found for "${q}".`);
    } catch (e) {
      results.innerHTML = "";
      show(e.message, "danger is-light");
    } finally {
      $("#search-btn").classList.remove("is-loading");
    }
  });

  function setTab(name) {
    tab = name;
    document.querySelectorAll("[data-tab]").forEach((li) => li.classList.toggle("is-active", li.dataset.tab === name));
    form.classList.toggle("is-hidden", name === "wishlist");
    refresh();
  }

  document.querySelectorAll("[data-tab]").forEach((li) => li.addEventListener("click", () => setTab(li.dataset.tab)));

  api("/api/wishlist").then((items) => {
    if (items) {
      wishlist = new Map(items.map((b) => [b.id, b]));
      countTag.textContent = wishlist.size;
    }
  }).catch((e) => show(e.message, "danger is-light"));
})();