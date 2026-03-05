document.addEventListener("DOMContentLoaded", function () {
  const bookList = [];

  const RENDER_EVENT = "render-book";
  const STORAGE_KEY = "BOOKSHELF_APPS";

  const form = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  document
    .getElementById("bookFormIsComplete")
    .addEventListener("change", changeText);

  function changeText() {
    const checkbox = document.getElementById("bookFormIsComplete");
    const status = document.getElementById("bookStatusButton");

    status.innerText = checkbox.checked
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

    const bookObject = generateBookObject(
      generateID(),
      title,
      author,
      year,
      isComplete,
    );

    bookList.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    form.reset();
    changeText();
  }

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

  function makeBook(book) {
    const title = document.createElement("h3");
    title.innerText = book.title;
    title.setAttribute("data-testid", "bookItemTitle");

    const author = document.createElement("p");
    author.innerText = "Penulis: " + book.author;
    author.setAttribute("data-testid", "bookItemAuthor");

    const year = document.createElement("p");
    year.innerText = "Tahun: " + book.year;
    year.setAttribute("data-testid", "bookItemYear");

    const container = document.createElement("div");

    container.classList.add("listContainer");

    container.append(title, author, year);

    const buttonContainer = document.createElement("div");

    const toggleButton = document.createElement("button");

    toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");

    toggleButton.innerText = book.isComplete
      ? "Belum selesai dibaca"
      : "Selesai dibaca";

    toggleButton.addEventListener("click", function () {
      toggleBook(book.id);
    });

    const deleteButton = document.createElement("button");

    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");

    deleteButton.innerText = "Hapus Buku";

    deleteButton.addEventListener("click", function () {
      deleteBook(book.id);
    });

    buttonContainer.append(toggleButton, deleteButton);

    container.append(buttonContainer);

    container.setAttribute("data-bookid", book.id);
    container.setAttribute("data-testid", "bookItem");

    return container;
  }

  function toggleBook(bookId){
    const index = findBookIndex(bookId);
    if(index === -1) return;
    bookList[index].isComplete = !bookList[index].isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function deleteBook(bookId) {
    const index = findBookIndex(bookId);

    if (index === -1) return;

    bookList.splice(index, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
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

    const titles = document.querySelectorAll(".listContainer h3");

    for (const title of titles) {
      if (title.innerText.toLowerCase().includes(keyword)) {
        title.parentElement.style.display = "block";
      } else {
        title.parentElement.style.display = "none";
      }
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookList));
  }

  function loadData() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (data) {
      for (const book of data) {
        bookList.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  if (typeof Storage !== "undefined") {
    loadData();
  }
});
