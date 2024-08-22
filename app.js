document.addEventListener('DOMContentLoaded', function() {
    fetchAuthors();
});

function fetchAuthors() {
    fetch('http://localhost:3000/api/authors')
        .then(response => response.json())
        .then(authors => {
            const authorsList = document.getElementById('authors-list');
            const authorsSelect = document.getElementById('book-author');
            authorsList.innerHTML = '';
            authorsSelect.innerHTML = '<option value="">Select an author</option>';

            authors.forEach(author => {
                const li = document.createElement('li');
                li.textContent = author.name;
                authorsList.appendChild(li);

                const option = document.createElement('option');
                option.value = author._id; 
                option.textContent = author.name;
                authorsSelect.appendChild(option);

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.onclick = () => editAuthor(author._id, author.name);
                li.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteAuthor(author._id);
                li.appendChild(deleteButton)
            });

            document.getElementById('author-section').style.display = 'block';
            document.getElementById('book-section').style.display = 'none'; 
        })
        .catch(error => console.error('Error fetching authors:', error));

}

function fetchBooks() {
    fetch('http://localhost:3000/api/books')
    .then(response => response.json())
    .then(books => {
        const list = document.getElementById('books-list');
        list.innerHTML = '';
        books.forEach(book => {
            const li = document.createElement('li');
            const authorText = book.author ? ` by ${book.author.name}` : ' by unknown';
            li.textContent = `${book.title}${authorText}`;
            list.appendChild(li);

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editBook(book._id, book.title, book.author ? book.author._id : '');
            li.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteBook(book._id);
            li.appendChild(deleteButton);
        });
        document.getElementById('book-section').style.display = 'block';
        document.getElementById('author-section').style.display = 'none';
    })
    .catch(error => console.error('Error fetching books:', error));
}


function addAuthor() {
    const nameInput = document.getElementById('author-name');
    const name = nameInput.value;
    if (!name) return;

    fetch('http://localhost:3000/api/authors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    })
    .then(response => {
        if (response.ok) {
            fetchAuthors();
            nameInput.value = '';  
        }
        return response.json();
    })
    .then(result => {
        alert('Author added: ' + result.name);
    })
    .catch(error => console.error('Error adding author:', error));
}

function addBook() {
    const titleInput = document.getElementById('book-title');
    const title = titleInput.value;  
    const authorInput = document.getElementById('book-author');
    const author = authorInput.value;  

    if (!title || !author) {
        alert('Please enter both title and author');
        return;
    }

    fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, author })
    })
    .then(response => {
        if (response.ok) {
            fetchBooks();  
            titleInput.value = '';  
            authorInput.value = ''; 
            return response.json();
        } else {
            throw new Error('Failed to add book');
        }
    })
    .then(result => {
        alert('Book added: ' + result.title);  
    })
    .catch(error => {
        console.error('Error adding book:', error);
        alert(error.message);
    });
}

function deleteAuthor(authorId) {
    fetch(`http://localhost:3000/api/authors/${authorId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete author. Perhaps they have books assigned?');
        }
        return response.text();
    })
    .then(() => {
        alert('Author deleted successfully');
        fetchAuthors();
    })
    .catch(error => {
        console.error('Error deleting author:', error);
        alert(error.message);
    });
}

function editAuthor(authorId, name) {
    const newName = prompt("Edit author name:", name);
    if (!newName) return;

    fetch(`http://localhost:3000/api/authors/${authorId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
    })
    .then(response => {
        if (response.ok) {
            alert('Author updated successfully');
            fetchAuthors();
        }
    })
    .catch(error => console.error('Error updating author:', error));
}

function deleteBook(bookId) {
    fetch(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Book deleted successfully');
            fetchBooks();
        }
    })
    .catch(error => console.error('Error deleting book:', error));
}

function editBook(bookId, title, authorId) {
    document.getElementById('editBookTitle').value = title;

    const authorSelect = document.getElementById('editBookAuthor');
    authorSelect.innerHTML = ''; 

    fetch('http://localhost:3000/api/authors')
    .then(response => response.json())
    .then(authors => {
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author._id;
            option.textContent = author.name;
            option.selected = author._id === authorId;
            authorSelect.appendChild(option);
        });

        window.currentBookId = bookId;
        document.getElementById('editBookDialog').style.display = 'block';
    });
}

function submitEditBook() {
    const bookId = window.currentBookId;
    const title = document.getElementById('editBookTitle').value;
    const authorId = document.getElementById('editBookAuthor').value;

    fetch(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, author: authorId })
    })
    .then(response => {
        if (response.ok) {
            alert('Book updated successfully');
            fetchBooks();  
            document.getElementById('editBookDialog').style.display = 'none';
        } else {
            throw new Error('Failed to update book');
        }
    })
    .catch(error => {
        console.error('Error updating book:', error);
        alert(error.message);
    });
}

function closeEditBookDialog() {
    document.getElementById('editBookDialog').style.display = 'none';
}
