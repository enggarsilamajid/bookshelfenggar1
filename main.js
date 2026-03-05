const STORAGE_KEY = "BOOKSHELF_APPS";
let books = [];
let currentFilter = "unread";
let editBookId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  renderBooks();

  const form = document.getElementById("bookForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("bookFormTitle").value;
    const author = document.getElementById("bookFormAuthor").value;
    const year = parseInt(document.getElementById("bookFormYear").value);
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    if (editBookId) {
      updateBook(editBookId, title, author, year, isComplete);
    } else {
      addBook(title, author, year, isComplete);
    }

    form.reset();
    editBookId = null;
  });

  document
    .getElementById("showUnread")
    .addEventListener("click", () => switchFilter("unread"));

  document
    .getElementById("showComplete")
    .addEventListener("click", () => switchFilter("complete"));
});

function loadBooks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    books = JSON.parse(stored);
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function generateId() {
  return +new Date();
}

function addBook(title, author, year, isComplete) {
  const book = {
    id: generateId(),
    title,
    author,
    year,
    isComplete,
  };

  books.push(book);

  saveBooks();
  renderBooks();
  showDialog("Buku berhasil ditambahkan!");
}

function updateBook(id, title, author, year, isComplete) {
  const book = books.find((b) => b.id === id);

  if (book) {
    book.title = title;
    book.author = author;
    book.year = year;
    book.isComplete = isComplete;

    saveBooks();
    renderBooks();
    showDialog("Buku berhasil diperbarui!");
  }
}

function deleteBook(id) {
  if (!confirm("Apakah anda yakin ingin menghapus buku ini?")) return;

  books = books.filter((book) => book.id !== id);

  saveBooks();
  renderBooks();
  showDialog("Buku berhasil dihapus!");
}

function toggleBookStatus(id) {
  const book = books.find((b) => b.id === id);

  if (book) {
    book.isComplete = !book.isComplete;

    saveBooks();
    renderBooks();
  }
}

function editBook(id) {
  const book = books.find((b) => b.id === id);

  if (!book) return;

  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;

  editBookId = id;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function switchFilter(filter) {
  currentFilter = filter;
  renderBooks();
}

function renderBooks() {
  const list = document.getElementById("bookList");
  list.innerHTML = "";

  const filteredBooks = books.filter((book) => {
    if (currentFilter === "unread") return !book.isComplete;
    return book.isComplete;
  });

  if (filteredBooks.length === 0) {
    list.innerHTML = "<p>Tidak ada buku.</p>";
    return;
  }

  filteredBooks.forEach((book) => {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book_item");

    bookElement.innerHTML = `
      <h3>${book.title}</h3>
      <p>Penulis: ${book.author}</p>
      <p>Tahun: ${book.year}</p>

      <div class="action">
        <button onclick="toggleBookStatus(${book.id})">
          ${
            book.isComplete
              ? "Belum selesai dibaca"
              : "Selesai dibaca"
          }
        </button>

        <button onclick="editBook(${book.id})">
          Edit
        </button>

        <button onclick="deleteBook(${book.id})">
          Hapus
        </button>
      </div>
    `;

    list.appendChild(bookElement);
  });
}

function showDialog(message) {
  alert(message);
}