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
    const newBookTitle = document.getElementById("bookFormTitle").value;
    const newBookAuthor = document.getElementById("bookFormAuthor").value;
    const newBookYear = document.getElementById("bookFormYear").value;
    const newBookCompleted =
      document.getElementById("bookFormIsComplete").checked;

    if (!newBookTitle || !newBookAuthor || !newBookYear) {
      // If any field is empty, display the error message
      const modalMessage = `Lengkapi data buku terlebih dahulu!`;
      document.getElementById("modalMessage").textContent = modalMessage;
      document.getElementById("resultModal").style.display = "block";
      return; // Stop further execution if there are missing fields
    }

    const generateId = generateID();
    const bookObject = generateBookObject(
      generateId,
      newBookTitle,
      newBookAuthor,
      newBookYear,
      newBookCompleted
    );

    // Add the book object to the book list
    bookList.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBookData();

    // Display success message in the modal
    const modalMessage = bookObject.isComplete
      ? `Data buku '${newBookTitle}' ditambahkan ke rak 'Selesai dibaca'.`
      : `Data buku '${newBookTitle}' ditambahkan ke rak 'Belum selesai dibaca'.`;

    document.getElementById("modalMessage").textContent = modalMessage;
    document.getElementById("resultModal").style.display = "block";
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
    const completedBookList = document.getElementById("completeBookList");

    // Clear previous list contents
    notCompletedBookList.innerHTML = "";
    completedBookList.innerHTML = "";

    // Filter books into completed and incomplete
    const completeBooks = bookList.filter((book) => book.isComplete);
    const incompleteBooks = bookList.filter((book) => !book.isComplete);

    // Function to create the empty list message
    function createEmptyListMessage() {
      const emptyContainer = document.createElement("div");
      const emptyPic = document.createElement("i");
      const emptyList = document.createElement("p");

      emptyPic.setAttribute("class", "fas fa-folder-open");
      emptyPic.setAttribute("id", "emptyPicture");
      emptyList.textContent = "Tidak ada buku pada rak ini.";

      emptyContainer.append(emptyPic, emptyList);
      emptyContainer.setAttribute("id", "emptyContainer");
      return emptyContainer;
    }

    // Handle completed books
    if (completeBooks.length === 0) {
      completedBookList.append(createEmptyListMessage());
    } else {
      for (const bookItem of completeBooks) {
        const bookElement = makeBook(bookItem);
        completedBookList.append(bookElement);
      }
    }

    // Handle incomplete books
    if (incompleteBooks.length === 0) {
      notCompletedBookList.append(createEmptyListMessage());
    } else {
      for (const bookItem of incompleteBooks) {
        const bookElement = makeBook(bookItem);
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

    function createControlButton(
      text,
      className,
      clickHandler,
      testId,
      innerIcon
    ) {
      const button = document.createElement("button");
      button.classList.add(className);
      button.innerText = text;
      button.innerHTML = innerIcon;
      button.addEventListener("click", clickHandler);
      button.setAttribute("data-testid", testId);
      return button;
    }

    if (bookObject.isComplete) {
      const bookIsCompleteButton = createControlButton(
        "",
        "move-to-notCompleted",
        () => moveToNotCompleted(bookObject.id),
        "bookItemIsCompleteButton",
        `<i class="fas fa-redo"></i>`
      );
      const removeButton = createControlButton(
        "",
        "delete-book",
        () => deleteBook(bookObject.id),
        "bookItemDeleteButton",
        `<i class="fas fa-trash"></i>`
      );
      const editButton = createControlButton(
        "",
        "edit-book",
        () => editBook(bookObject.id),
        "bookItemEditButton",
        `<i class="fas fa-edit"></i>`
      );

      const ctrlButton = document.createElement("div");
      ctrlButton.classList.add("ctrlButton");
      ctrlButton.append(bookIsCompleteButton, removeButton, editButton);

      bookItem.append(ctrlButton);
    } else {
      const bookIsCompleteButton = createControlButton(
        "",
        "move-to-completed",
        () => moveToCompleted(bookObject.id),
        "bookItemIsCompleteButton",
        `<i class="fas fa-check"></i>`
      );
      const removeButton = createControlButton(
        "",
        "delete-book",
        () => deleteBook(bookObject.id),
        "bookItemDeleteButton",
        `<i class="fas fa-trash"></i>`
      );
      const editButton = createControlButton(
        "",
        "edit-book",
        () => editBook(bookObject.id),
        "bookItemEditButton",
        `<i class="fas fa-edit"></i>`
      );

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

      const modalMessage = `Buku "${bookTarget.title}" telah selesai dibaca`;

      document.getElementById("modalMessage").textContent = modalMessage;
      document.getElementById("resultModal").style.display = "block";
      saveBookData();
    }

    function moveToNotCompleted(bookId) {
      const bookTarget = findBook(bookId);

      if (bookTarget == null) return;

      bookTarget.isComplete = false;
      document.dispatchEvent(new Event(RENDER_EVENT));

      const modalMessage = `Buku "${bookTarget.title}" akan dibaca ulang`;

      document.getElementById("modalMessage").textContent = modalMessage;
      document.getElementById("resultModal").style.display = "block";
      saveBookData();
    }

    function deleteBook(bookId) {
      // Temukan buku berdasarkan bookId
      const bookTarget = findBook(bookId);

      if (bookTarget == null) return; // Jika buku tidak ditemukan, keluar dari fungsi

      const modalConfirmMessage = `Yakin ingin hapus data buku "${bookTarget.title}"?`;

      // Menampilkan pesan konfirmasi di modal
      document.getElementById("modalConfirmMessage").textContent =
        modalConfirmMessage;
      const confirmModal = document.getElementById("confirmModal");
      confirmModal.style.display = "block";

      // Fungsi untuk mengonfirmasi penghapusan buku
      const confirmDelete = function () {
        // Mencari index buku berdasarkan bookId
        const bookIndex = findBookIndex(bookId);
        if (bookIndex === -1) return; // Jika buku tidak ditemukan, keluar dari fungsi

        const bookTitle = bookList[bookIndex].title;

        // Hapus buku hanya pada index yang ditemukan
        bookList.splice(bookIndex, 1); // Menghapus satu buku pada index yang tepat

        // Panggil event untuk me-render ulang tampilan
        document.dispatchEvent(new Event(RENDER_EVENT));

        // Tampilkan pemberitahuan bahwa buku berhasil dihapus
        const modalMessage = `Data buku "${bookTarget.title}" telah dihapus`;

        document.getElementById("modalMessage").textContent = modalMessage;
        document.getElementById("resultModal").style.display = "block";

        // Simpan data buku yang telah diperbarui
        saveBookData();

        // Menutup modal setelah penghapusan
        confirmModal.style.display = "none";
      };

      // Menambahkan event listener hanya sekali
      const confirmDeleteButton = document.getElementById("confirmDelete");
      confirmDeleteButton.addEventListener("click", confirmDelete);

      // Menambahkan event listener untuk membatalkan penghapusan
      const cancelDeleteButton = document.getElementById("cancelDelete");
      cancelDeleteButton.addEventListener("click", function cancelDelete() {
        confirmDeleteButton.removeEventListener("click", confirmDelete);
        confirmModal.style.display = "none"; // Menutup modal jika dibatalkan
      });
    }

    function editBook(bookId) {
      const bookContainer = document.querySelector(
        `.listContainer[data-bookid="${bookId}"]`
      );
      if (!bookContainer) return;

      const bookTarget = findBook(bookId);
      if (!bookTarget) return;

      const titleElement = bookContainer.querySelector(
        '[data-testid="bookItemTitle"]'
      );
      const authorElement = bookContainer.querySelector(
        '[data-testid="bookItemAuthor"]'
      );
      const yearElement = bookContainer.querySelector(
        '[data-testid="bookItemYear"]'
      );

      const form = document.createElement("form");
      form.classList.add("edit-form");
      form.innerHTML = `
          <div class="edit-book-data">
            <label for="title">Judul:</label>
            <input type="text" id="title" value="${bookTarget.title}" required>
          </div>
          <div class="edit-book-data">
            <label for="author">Penulis:</label>
            <input type="text" id="author" value="${bookTarget.author}" required>
          </div>
          <div class="edit-book-data">
            <label for="year">Tahun:</label>
            <input type="number" id="year" min="1970" max="2024" value="${bookTarget.year}" required>
          </div>
          <div class="ctrlButton">
            <button type="submit"><i class="fas fa-save"></i></button>
            <button type="button" id="cancelEdit"><i class="fas fa-undo"></i></button>
          </div>
      `;

      const ctrlButtonContainer = bookContainer.querySelector(".ctrlButton");
      ctrlButtonContainer.innerHTML = "";
      ctrlButtonContainer.appendChild(form);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const bookItemTitle = form.querySelector("#title").value;
        const bookItemAuthor = form.querySelector("#author").value;
        const bookItemYear = Number(form.querySelector("#year").value);

        titleElement.innerText = bookItemTitle;
        authorElement.innerText = "Penulis: " + bookItemAuthor;
        yearElement.innerText = "Tahun: " + bookItemYear;

        const bookTarget = findBook(bookId);
        if (bookTarget) {
          bookTarget.title = bookItemTitle;
          bookTarget.author = bookItemAuthor;
          bookTarget.year = bookItemYear;
        }

        ctrlButtonContainer.innerHTML = "";
        const isComplete = bookTarget.isComplete;
        renderControlButtons(ctrlButtonContainer, bookId, isComplete);

        const modalMessage = `Berhasil memperbarui data buku.`;

        document.getElementById("modalMessage").textContent = modalMessage;
        document.getElementById("resultModal").style.display = "block";
        saveBookData();
      });

      document
        .getElementById("cancelEdit")
        .addEventListener("click", function () {
          ctrlButtonContainer.innerHTML = "";
          renderControlButtons(
            ctrlButtonContainer,
            bookId,
            bookTarget.isComplete
          );
        });
    }

    function renderControlButtons(container, bookId, isComplete) {
      container.innerHTML = "";

      const buttonInner = isComplete
        ? `<i class="fas fa-redo"></i>`
        : `<i class="fas fa-check"></i>`;
      const toggleButton = createControlButton(
        "",
        "bookItemIsCompleteButton",
        () => {
          if (isComplete) {
            moveToNotCompleted(bookId);
          } else {
            moveToCompleted(bookId);
          }
        },
        "bookItemIsCompleteButton",
        buttonInner
      );

      const removeButton = createControlButton(
        "",
        "delete-book",
        () => deleteBook(bookId),
        "bookItemDeleteButton",
        `<i class="fas fa-trash"></i>`
      );

      const editButton = createControlButton(
        "",
        "edit-book",
        () => editBook(bookId),
        "bookItemEditButton",
        `<i class="fas fa-edit"></i>`
      );

      container.append(toggleButton, removeButton, editButton);
    }

    function findBook(bookId) {
      for (const bookItem of bookList) {
        if (bookItem.id === bookId) {
          return bookItem;
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

    console.log(typeof bookObject.year);
    return bookItem;
  }

  // function createEmptySearchMessage() {
  //   const emptyContainer = document.createElement("div");
  //   const emptyPic = document.createElement("i");
  //   const emptyList = document.createElement("p");

  //   emptyPic.setAttribute("class", "fas fa-folder-open");
  //   emptyPic.setAttribute("id", "emptyPicture");
  //   emptyList.textContent = "Buku yang dicari tidak ditemukan di rak ini.";

  //   emptyContainer.append(emptyPic, emptyList);
  //   emptyContainer.setAttribute("id", "emptySearch");
  //   return emptyContainer;
  // }

  document
    .getElementById("searchSubmit")
    .addEventListener("click", function (ev) {
      ev.preventDefault();
      const searchBook = document
        .getElementById("searchBookTitle")
        .value.toLowerCase()
        .trim(); // Ensure whitespace is trimmed

      // Skip search if input is empty
      if (searchBook === "") {
        // Show all books and remove "no results" message
        const bookSearchListByTitle = document.querySelectorAll(
          ".listContainer > h3"
        );
        for (let searchResult of bookSearchListByTitle) {
          searchResult.parentElement.style.display = "block";
        }
        const existingMessage = document.getElementById("emptySearch");
        if (existingMessage) {
          existingMessage.remove();
        }
        return;
      }

      const bookSearchListByTitle = document.querySelectorAll(
        ".listContainer > h3"
      );
      let foundCount = 0;

      // Iterate over the book titles
      for (let searchResult of bookSearchListByTitle) {
        if (searchResult.innerText.toLowerCase().includes(searchBook)) {
          searchResult.parentElement.style.display = "block";
          foundCount++;
        } else {
          searchResult.parentElement.style.display = "none";
        }
      }

      // Show the modal message based on search results
      const modalMessage =
        foundCount > 0
          ? `Ditemukan ${foundCount} buku yang cocok.`
          : "Tidak ditemukan buku yang dicari.";
      document.getElementById("modalMessage").textContent = modalMessage;
      document.getElementById("resultModal").style.display = "block";
    });

  // Menutup modal jika tombol close ditekan
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("resultModal").style.display = "none";
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
