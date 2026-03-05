document.addEventListener("DOMContentLoaded", function () {

  const bookList = [];
  const RENDER_EVENT = "render_book";
  const SAVED_EVENT = "saved_book";
  const STORAGE_KEY = "BOOKSHELF_APPS";

  const form = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    searchBook();
  });

  document
    .getElementById("bookFormIsComplete")
    .addEventListener("change", changeText);

  function changeText() {
    const checkbox = document.getElementById("bookFormIsComplete");
    const statusText = document.getElementById("bookStatusButton");

    statusText.innerText = checkbox.checked
      ? "Selesai dibaca"
      : "Belum selesai dibaca";
  }

  function generateID() {
    return +new Date();
  }

  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year: Number(year),
      isComplete,
    };
  }

  function addBook() {

    const title = document.getElementById("bookFormTitle").value;
    const author = document.getElementById("bookFormAuthor").value;
    const year = document.getElementById("bookFormYear").value;
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    if (!title || !author || !year) {
      showModal("Lengkapi data buku terlebih dahulu!");
      return;
    }

    const bookObject = generateBookObject(
      generateID(),
      title,
      author,
      year,
      isComplete
    );

    bookList.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();

    showModal(
      isComplete
        ? `Data buku '${title}' ditambahkan ke rak 'Selesai dibaca'.`
        : `Data buku '${title}' ditambahkan ke rak 'Belum selesai dibaca'.`
    );

    form.reset();
    changeText();
  }

  function showModal(message) {
    document.getElementById("modalMessage").textContent = message;
    document.getElementById("resultModal").style.display = "block";
  }

  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("resultModal").style.display = "none";
  });

  document.addEventListener(RENDER_EVENT, function () {

    const incompleteList = document.getElementById("incompleteBookList");
    const completeList = document.getElementById("completeBookList");

    incompleteList.innerHTML = "";
    completeList.innerHTML = "";

    for (const book of bookList) {

      const bookElement = makeBook(book);

      if (book.isComplete) {
        completeList.append(bookElement);
      } else {
        incompleteList.append(bookElement);
      }
    }
  });

  function makeBook(bookObject) {

    const title = document.createElement("h3");
    title.innerText = bookObject.title;
    title.setAttribute("data-testid", "bookItemTitle");

    const author = document.createElement("p");
    author.innerText = `Penulis: ${bookObject.author}`;
    author.setAttribute("data-testid", "bookItemAuthor");

    const year = document.createElement("p");
    year.innerText = `Tahun: ${bookObject.year}`;
    year.setAttribute("data-testid", "bookItemYear");

    const container = document.createElement("div");
    container.classList.add("listContainer");

    const ctrl = document.createElement("div");
    ctrl.classList.add("ctrlButton");

    const toggleButton = document.createElement("button");
    toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");

    toggleButton.innerHTML = bookObject.isComplete
      ? `<i class="fas fa-redo"></i>`
      : `<i class="fas fa-check"></i>`;

    toggleButton.addEventListener("click", function () {
      toggleBook(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");

    deleteButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.innerHTML = `<i class="fas fa-edit"></i>`;
    editButton.setAttribute("data-testid", "bookItemEditButton");

    editButton.addEventListener("click", function () {
      editBook(bookObject.id);
    });

    ctrl.append(toggleButton, deleteButton, editButton);

    container.append(title, author, year, ctrl);

    container.setAttribute("data-bookid", bookObject.id);
    container.setAttribute("data-testid", "bookItem");

    return container;
  }

  function toggleBook(bookId) {

    const book = findBook(bookId);

    if (!book) return;

    book.isComplete = !book.isComplete;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();
  }

  function deleteBook(bookId) {

    const index = findBookIndex(bookId);

    if (index === -1) return;

    const title = bookList[index].title;

    bookList.splice(index, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();

    showModal(`Data buku "${title}" telah dihapus`);
  }

  function editBook(bookId) {

    const book = findBook(bookId);

    if (!book) return;

    const newTitle = prompt("Edit Judul Buku", book.title);
    const newAuthor = prompt("Edit Penulis", book.author);
    const newYear = prompt("Edit Tahun", book.year);

    if (!newTitle || !newAuthor || !newYear) return;

    book.title = newTitle;
    book.author = newAuthor;
    book.year = Number(newYear);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();

    showModal("Berhasil memperbarui data buku.");
  }

  function findBook(bookId) {
    for (const book of bookList) {
      if (book.id === bookId) {
        return book;
      }
    }
    return null;
  }

  function findBookIndex(bookId) {
    for (const index in bookList) {
      if (bookList[index].id === bookId) {
        return index;
      }
    }
    return -1;
  }

  function searchBook() {

    const keyword = document
      .getElementById("searchBookTitle")
      .value.toLowerCase()
      .trim();

    const titles = document.querySelectorAll(".listContainer > h3");

    let found = 0;

    for (const title of titles) {

      if (title.innerText.toLowerCase().includes(keyword)) {
        title.parentElement.style.display = "block";
        found++;
      } else {
        title.parentElement.style.display = "none";
      }
    }

    showModal(
      found > 0
        ? `Ditemukan ${found} buku yang cocok.`
        : "Tidak ditemukan buku yang dicari."
    );
  }

  function saveBookData() {

    if (isStorageExist()) {

      const parsed = JSON.stringify(bookList);
      localStorage.setItem(STORAGE_KEY, parsed);

      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function loadDataFromStorage() {

    const serialized = localStorage.getItem(STORAGE_KEY);

    if (serialized) {

      const data = JSON.parse(serialized);

      for (const book of data) {
        bookList.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function isStorageExist() {

    if (typeof Storage === undefined) {
      alert("Browser tidak mendukung local storage");
      return false;
    }

    return true;
  }

  document.addEventListener(SAVED_EVENT, function () {
    console.log("Data berhasil disimpan.");
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

});
