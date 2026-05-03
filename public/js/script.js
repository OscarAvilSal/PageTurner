//DOM Elements
const signUpName = document.querySelector("#signUpUsername");
const signUpEmail = document.querySelector("#signUpEmail");
const signUpPassword = document.querySelector("#signUpPassword");
const signUpPassConfirm = document.querySelector("#signUpConfirmPassword");
const signUpForm = document.querySelector("#signUpForm");
const searchInput = document.querySelector("#searchBookInput");
const searchButton = document.querySelector("#searchBookButton");
const reviewTextarea = document.querySelector("#postBookReview");
const postButton = document.querySelector("#postButton");

// Event Listeners
signUpForm.addEventListener("submit", createUser);
searchButton.addEventListener("click", handleSearch);
postButton.addEventListener("click", handleSubmitReview);
reviewTextarea.addEventListener("input", validateSubmitButton);

async function createUser(e){
    e.preventDefault();
    let alert = document.querySelector("#signUpAlert");
    alert.style.display = "none";
    alert.style.color = "red";
    let username = signUpName.value;
    let password = signUpPassword.value;
    let passConfirm = signUpPassConfirm.value;

    if(password.length < 6){ //password too short
        alert.style.display="inline";
        alert.textContent = "Password must be 6 characters or more";
        return;
    }else if(password != passConfirm){ //passwords don't match
        alert.style.display="inline";
        alert.textContent = "Passwords do not match!";
        return;
    }

    try{ // check if username is taken
        const response = await fetch('/checkUsername', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });

        const data = await response.json();

        if(!data.available){
            alert.style.display="inline";
            alert.textContent = "Username is already taken!";
            return;
        }
    } catch (err) {
        alert.style.display="inline";
        alert.textContent = "Error checking username. Try again.";
        console.error(err);
    }

    //Input is validated -> create user
    try{
        const response = await fetch('/createUser', {method: 'POST', 
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                email: signUpEmail.value,
                password: password
            })
        })

        const createUserData = await response.json();

        if(createUserData.success){
            window.location.href = '/'; //redirect to home page
        }else{
            alert.style.display="inline";
            alert.textContent = "Error creating user. Try again.";
        }
    }catch (err) { 
        alert.style.display="inline";
        alert.textContent = "Error creating user. Try again.";
        console.error(err);
    }
    
}

async function handleSearch(){
    const bookTitle = document.querySelector("#searchBookInput").value.trim();
    const searchMessage = document.querySelector("#searchBookMessage");
    
    // Did user enter a title?
    if (!bookTitle) {
        searchMessage.textContent = "Please enter a book title";
        searchMessage.style.display = "block";
        return;
    }
    
    // Clear previous error messages
    searchMessage.style.display = "none";
    
    try {
        // Call OpenLibrary API
        const response = await fetch(
            `https://openlibrary.org/search.json?title=${encodeURIComponent(bookTitle)}`
        );
        
        const data = await response.json();
        
        // Check for results
        if (!data.docs || data.docs.length === 0) {
            searchMessage.textContent = "No books found. Try a different title.";
            searchMessage.style.display = "block";
            return;
        }
        
        // Display results
        displayResults(data.docs);
        
    } catch (error) {
        console.error("Search error:", error);
        searchMessage.textContent = "Error searching for books. Try again.";
        searchMessage.style.display = "block";
    }
}

function displayResults(books) {
    const resultsList = document.querySelector("#resultsList");
    const resultsSection = document.querySelector("#resultsSection");
    
    // Clear previous results
    resultsList.innerHTML = "";
    
    // Show results section
    resultsSection.style.display = "block";
    
    // Loop through each book result
    books.forEach((book, index) => {
        // Extract data (with fallbacks for missing data)
        const title = book.title || "Unknown Title";
        const author = book.author_name ? book.author_name[0] : "Unknown Author";
        const isbn = book.isbn ? book.isbn[0] : "";
        const coverId = book.cover_i || null;
        
        // Generate cover image URL (or placeholder if no cover)
        const coverUrl = coverId 
            ? `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`
            : "https://imgs.search.brave.com/l_J0L3Q3XkhjABpmmDQoVRPaKs3NhqSzNQhYcZFsZA4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTA4LzQwMC9zbWFs/bC9zdGFjay1vZi1i/b29rcy1pc29sYXRl/ZC1vbi13aGl0ZS1i/YWNrZ3JvdW5kLXBu/Zy5wbmc";
        
        // Create a clickable result item
        const resultItem = document.createElement("div");
        resultItem.style.cssText = "border: 1px solid #ddd; padding: 10px; margin: 5px 0; cursor: pointer; display: flex; gap: 10px;";
        
        resultItem.innerHTML = `
            <img src="${coverUrl}" alt="${title}" style="width: 50px; height: auto;">
            <div>
                <strong>${title}</strong><br>
                <em>${author}</em><br>
                <small>ISBN: ${isbn || "N/A"}</small>
            </div>
        `;
        
        // Select book when user clicks result
        resultItem.addEventListener("click", () => {
            selectBook(title, author, isbn, coverId);
        });
        
        resultsList.appendChild(resultItem);
        
        // Only show first 10 results
        if (index >= 9) return;
    });
}

// Select a book from results
function selectBook(title, author, isbn, coverId) {
    const coverUrl = coverId
    // use the image from api or the default image
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : "https://imgs.search.brave.com/l_J0L3Q3XkhjABpmmDQoVRPaKs3NhqSzNQhYcZFsZA4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDgv/NTA4LzQwMC9zbWFs/bC9zdGFjay1vZi1i/b29rcy1pc29sYXRl/ZC1vbi13aGl0ZS1i/YWNrZ3JvdW5kLXBu/Zy5wbmc";
    
    // Store in hidden fields for backend
    document.querySelector("#selectedBookTitle").value = title;
    document.querySelector("#selectedBookAuthor").value = author;
    document.querySelector("#selectedBookISBN").value = isbn;
    document.querySelector("#selectedCoverURL").value = coverUrl;
    
    // Display to user
    document.querySelector("#selectedTitle").textContent = title;
    document.querySelector("#selectedAuthor").textContent = author;
    document.querySelector("#selectedISBN").textContent = isbn;
    document.querySelector("#selectedCoverImage").src = coverUrl;
    
    // Show sections
    document.querySelector("#selectedBookSection").style.display = "block";
    document.querySelector("#reviewSection").style.display = "block";
    document.querySelector("#resultsSection").style.display = "none";
    
    validateSubmitButton();
}

// Validate if submit button should be enabled
function validateSubmitButton() {
    const reviewText = document.querySelector("#postBookReview").value.trim();
    const selectedTitle = document.querySelector("#selectedBookTitle").value;
    const postButton = document.querySelector("#postButton");
    
    if (selectedTitle && reviewText) {
        postButton.disabled = false;
    } else {
        postButton.disabled = true;
    }
}

// Submit review to backend
async function handleSubmitReview() {
    const reviewText = document.querySelector("#postBookReview").value.trim();
    const title = document.querySelector("#selectedBookTitle").value;
    const author = document.querySelector("#selectedBookAuthor").value;
    const isbn = document.querySelector("#selectedBookISBN").value;
    const bookCoverUrl = document.querySelector("#selectedCoverURL").value;
    
    if (!reviewText || !title) {
        alert("Please complete all fields");
        return;
    }
    
    try {
        const response = await fetch("/savePost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                author: author,
                isbn: isbn,
                book_cover: bookCoverUrl,
                book_review: reviewText
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log("Review posted successfully!");
            window.location.href = "/";
        } else {
            alert("Error posting review: " + (result.error || "Unknown error"));
        }
        
    } catch (error) {
        console.error("Submit error:", error);
        alert("Error posting review. Try again.");
    }
}