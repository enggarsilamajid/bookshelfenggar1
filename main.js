const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener("DOMContentLoaded", function () {

  const bookForm = document.getElementById("bookForm");

  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const changeToCompleteButton = document.getElementById("changeToCompleteButton");
  const changeToNotCompleteButton = document.getElementById("changeToNotCompleteButton");

  changeToCompleteButton.addEventListener("click", function () {
    document.querySelector(".notCompletedRead").style.display = "none";
    document.querySelector(".completedRead").style.display = "block";
  });

  changeToNotCompleteButton.addEventListener("click", function () {
    document.querySelector(".completedRead").style.display = "none";
    document.querySelector(".notCompletedRead").style.display = "block";
  });

  const closeModal = document.getElementById("closeModal");

    closeModal.addEventListener("click", function () {
    document.getElementById("resultModal").style.display = "none";
  });

});

function addBook() {

  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const bookObject = generateBookObject(title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));

  // tampilkan dialog
  const modal = document.getElementById("resultModal");
  const modalMessage = document.getElementById("modalMessage");

  modalMessage.innerText = `Buku "${title}" berhasil ditambahkan`;
  modal.style.display = "block";

  // reset form
  document.getElementById("bookForm").reset();
}

function generateBookObject(title, author, year, isComplete) {

  return {
    id: +new Date(),
    title,
    author,
    year,
    isComplete
  };
}

document.addEventListener(RENDER_EVENT, function () {

  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const book of books) {

    const bookElement = makeBook(book);

    if (!book.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {

  const title = document.createElement("h3");
  title.innerText = bookObject.title;

  const author = document.createElement("p");
  author.innerText = "Penulis: " + bookObject.author;

  const year = document.createElement("p");
  year.innerText = "Tahun: " + bookObject.year;

  const container = document.createElement("div");
  container.classList.add("listContainer");

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("ctrlButton");

  const toggleButton = document.createElement("button");

  if (bookObject.isComplete) {
    toggleButton.innerText = "Baca Lagi";
    toggleButton.addEventListener("click", function () {
      bookObject.isComplete = false;
      document.dispatchEvent(new Event(RENDER_EVENT));
    });
  } else {
    toggleButton.innerText = "Selesai Dibaca";
    toggleButton.addEventListener("click", function () {
      bookObject.isComplete = true;
      document.dispatchEvent(new Event(RENDER_EVENT));
    });
  }

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Hapus";

  deleteButton.addEventListener("click", function () {

    const index = books.findIndex(b => b.id === bookObject.id);

    books.splice(index, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  buttonContainer.append(toggleButton, deleteButton);

  container.append(title, author, year, buttonContainer);

  return container;
}