// Do your work here...
// Do your work here...
document.addEventListener("DOMContentLoaded", function () {
  const inputNewBook = document.getElementById("bookForm");
  inputNewBook.addEventListener("submit", function (ev) {
    ev.preventDefault();
    addBook();
  });
  const bookList = [];
  const RENDER_EVENT = "render_book";
  const SAVED_EVENT = "saved_book";
  const STORAGE_KEY = "BOOKSHELF_APPS";

  function changeText() {
    const newStatusBook = document.getElementById("bookFormIsComplete");
    if (newStatusBook.checked) {
      let bookIsComplete = document.getElementById("bookStatusButton");
      bookIsComplete.innerText = "Selesai dibaca";
    } else {
      let bookNotComplete = document.getElementById("bookStatusButton");
      bookNotComplete.innerText = "Belum selesai dibaca";
    }
  }

  document
    .getElementById("bookFormIsComplete")
    .addEventListener("change", changeText);

  function addBook() {
    const newBootkTitle = document.getElementById("bookFormTitle").value;
    const newBookAuthor = document.getElementById("bookFormAuthor").value;
    const newBookYear = document.getElementById("bookFormYear").value;
    const newBookCompleted =
      document.getElementById("bookFormIsComplete").checked;

    const generateId = generateID();
    const bookObject = generateBookObject(
      generateId,
      newBootkTitle,
      newBookAuthor,
      newBookYear,
      newBookCompleted
    );
    bookList.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();
  }

  function generateID() {
    return +new Date();
  }

  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year: parseInt(year),
      isComplete,
    };
  }

  document.addEventListener(RENDER_EVENT, function () {
    const notCompletedBookList = document.getElementById("incompleteBookList");
    notCompletedBookList.innerHTML = "";
    const completedBookList = document.getElementById("completeBookList");
    completedBookList.innerHTML = "";

    for (const bookItem of bookList) {
      const bookElement = makeBook(bookItem);
      if (bookItem.isComplete == true) {
        completedBookList.append(bookElement);
      } else {
        notCompletedBookList.append(bookElement);
      }
    }
  });

  function makeBook(bookObject) {
    const bookItemTitle = document.createElement("h3");
    const bookItemAuthor = document.createElement("p");
    const bookItemYear = document.createElement("p");
    bookItemTitle.innerText = bookObject.title;
    bookItemAuthor.innerText = `Penulis: ${bookObject.author}`;
    bookItemYear.innerText = `Tahun: ${bookObject.year}`;

    bookItemTitle.setAttribute("data-testid", "bookItemTitle");
    bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");
    bookItemYear.setAttribute("data-testid", "bookItemYear");

    const bookItem = document.createElement("div");
    bookItem.classList.add("listContainer");
    bookItem.append(bookItemTitle, bookItemAuthor, bookItemYear);

    if (bookObject.isComplete == true) {
      const bookIsCompleteButton = document.createElement("button");
      bookIsCompleteButton.classList.add("move-to-notCompleted");
      bookIsCompleteButton.innerText = "Baca Ulang";
      bookIsCompleteButton.addEventListener("click", function () {
        moveToNotCompleted(bookObject.id);
      });

      const removeButton = document.createElement("button");
      removeButton.classList.add("delete-book");
      removeButton.innerText = "Hapus Buku";
      removeButton.addEventListener("click", function () {
        deleteBook(bookObject.id);
      });

      const editButton = document.createElement("button");
      editButton.classList.add("edit-book");
      editButton.innerText = "Edit Buku";
      editButton.addEventListener("click", function () {
        editBook(bookObject.id);
      });

      bookIsCompleteButton.setAttribute(
        "data-testid",
        "bookItemIsCompleteButton"
      );
      removeButton.setAttribute("data-testid", "bookItemDeleteButton");
      editButton.setAttribute("data-testid", "bookItemEditButton");

      const ctrlButton = document.createElement("div");
      ctrlButton.classList.add("ctrlButton");
      ctrlButton.append(bookIsCompleteButton, removeButton, editButton);

      bookItem.append(ctrlButton);
    } else {
      const bookIsCompleteButton = document.createElement("button");
      bookIsCompleteButton.classList.add("move-to-completed");
      bookIsCompleteButton.innerText = "Selesai Dibaca";
      bookIsCompleteButton.addEventListener("click", function () {
        moveToCompleted(bookObject.id);
      });

      const removeButton = document.createElement("button");
      removeButton.classList.add("delete-book");
      removeButton.innerText = "Hapus Buku";
      removeButton.addEventListener("click", function () {
        deleteBook(bookObject.id);
      });

      const editButton = document.createElement("button");
      editButton.classList.add("edit-book");
      editButton.innerText = "Edit Buku";
      editButton.addEventListener("click", function () {
        editBook(bookObject.id);
      });

      bookIsCompleteButton.setAttribute(
        "data-testid",
        "bookItemIsCompleteButton"
      );
      removeButton.setAttribute("data-testid", "bookItemDeleteButton");
      editButton.setAttribute("data-testid", "bookItemEditButton");

      const ctrlButton = document.createElement("div");
      ctrlButton.classList.add("ctrlButton");
      ctrlButton.append(bookIsCompleteButton, removeButton, editButton);

      bookItem.append(ctrlButton);
    }

    bookItem.setAttribute("data-bookid", `${bookObject.id}`);
    bookItem.setAttribute("data-testid", "bookItem");

    function moveToCompleted(bookId) {
      const bookTarget = findBook(bookId);

      if (bookTarget == null) return;

      bookTarget.isComplete = true;
      document.dispatchEvent(new Event(RENDER_EVENT));
      window.alert(`Buku "${bookObject.title}" telah selesai dibaca`);
      saveBookData();
    }

    function moveToNotCompleted(bookId) {
      const bookTarget = findBook(bookId);

      if (bookTarget == null) return;

      bookTarget.isComplete = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
      window.alert(`Buku "${bookObject.title}" akan dibaca ulang`);
      saveBookData();
    }

    function findBook(bookId) {
      for (const bookItem of bookList) {
        if (bookItem.id === bookId) {
          return bookItem;
        }
      }
      return null;
    }

    function deleteBook(bookId) {
      const bookTarget = findBookIndex(bookId);

      if (bookTarget === -1) return;

      bookList.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      window.alert(`Data buku "${bookObject.title}" berhasil dihapus`);
      saveBookData();
    }

    function findBookIndex(bookId) {
      for (const index in bookList) {
        if (bookList[index].id === bookId) {
          return index;
        }
      }
      return -1;
    }

    console.log(typeof bookObject.year);
    return bookItem;
  }

  document
    .getElementById("searchSubmit")
    .addEventListener("click", function (ev) {
      ev.preventDefault();
      const searchBook = document
        .getElementById("searchBookTitle")
        .value.toLowerCase();
      const bookSearchListByTitle = document.querySelectorAll(
        ".listContainer > h3"
      );
      for (searchResult of bookSearchListByTitle) {
        if (searchResult.innerText.toLowerCase().includes(searchBook)) {
          searchResult.parentElement.style.display = "block";
        } else {
          searchResult.parentElement.style.display = "none";
        }
      }
    });

  function saveBookData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(bookList);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert("Browser kamu tidak mendukung local storage");
      return false;
    }
    return true;
  }

  document.addEventListener(SAVED_EVENT, function () {
    console.log("Berhasil perbarui data");
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  function loadDataFromStorage() {
    const serializeData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializeData);

    if (data !== null) {
      for (const book of data) {
        bookList.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  const notCompletedDisplay = document.getElementById("notCompletedRead");
  const completedDisplay = document.getElementById("completedRead");

  const changeToCompleteButton = document.getElementById(
    "changeToCompleteButton"
  );
  changeToCompleteButton.addEventListener("click", function () {
    if (notCompletedDisplay.style.display != "none") {
      notCompletedDisplay.style.display = "none";
      completedDisplay.style.display = "block";
    }
  });

  const changeToNotCompleteButton = document.getElementById(
    "changeToNotCompleteButton"
  );
  changeToNotCompleteButton.addEventListener("click", function () {
    if (completedDisplay.style.display != "none") {
      completedDisplay.style.display = "none";
      notCompletedDisplay.style.display = "block";
    }
  });
});
