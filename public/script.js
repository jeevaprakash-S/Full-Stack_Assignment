const API_URL = "/contacts";

let contacts = [];
let editingId = null;


// Load contacts when website opens

document.addEventListener("DOMContentLoaded", () => {
    loadContacts();
});


// Get all contacts

async function loadContacts() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        contacts = result.data;

        displayContacts(contacts);

        updateStats();

    } catch (error) {

        document.getElementById("contactsContainer").innerHTML = `
            <div class="empty">
                Unable to load contacts.
            </div>
        `;

        console.error(error);
    }
}


// Display contacts

function displayContacts(data) {

    const container = document.getElementById("contactsContainer");

    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <h3>No contacts found</h3>
                <p>Click "+ Add Contact" to create your first contact.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = data.map(contact => {

        const initial = contact.name
            .charAt(0)
            .toUpperCase();

        return `
            <div class="contact-card">

                <div class="contact-top">

                    <div class="contact-info">

                        <div class="avatar">
                            ${initial}
                        </div>

                        <div>
                            <h3>${escapeHTML(contact.name)}</h3>
                            <small>${escapeHTML(contact.contactId)}</small>
                        </div>

                    </div>

                </div>


                <div class="contact-details">

                    <div>📱 ${escapeHTML(contact.phone)}</div>

                    <div>✉️ ${escapeHTML(contact.email)}</div>

                </div>


                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editContact('${contact._id}')"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteContact('${contact._id}')"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


// Update statistics

function updateStats() {

    document.getElementById("totalContacts").textContent =
        contacts.length;

    document.getElementById("phoneContacts").textContent =
        contacts.filter(contact => contact.phone).length;

    document.getElementById("emailContacts").textContent =
        contacts.filter(contact => contact.email).length;
}


// Open modal

function openModal() {

    editingId = null;

    document.getElementById("modalTitle").textContent =
        "Add Contact";

    document.getElementById("contactForm").reset();

    document.getElementById("contactMongoId").value = "";

    document.getElementById("formMessage").innerHTML = "";

    document.getElementById("contactModal").classList.add("active");
}


// Close modal

function closeModal() {

    document
        .getElementById("contactModal")
        .classList.remove("active");
}


// Submit form

document
    .getElementById("contactForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const contactId =
            document.getElementById("contactId").value.trim();

        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const email =
            document.getElementById("email").value.trim();


        // Frontend validation

        if (!/^[0-9]{10}$/.test(phone)) {

            showFormMessage(
                "Phone number must contain exactly 10 digits.",
                "error"
            );

            return;
        }


        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

            showFormMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        const contact = {
            contactId,
            name,
            phone,
            email
        };


        try {

            let response;

            if (editingId) {

                response = await fetch(
                    `${API_URL}/${editingId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(contact)
                    }
                );

            } else {

                response = await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(contact)
                    }
                );
            }


            const result = await response.json();


            if (!response.ok) {

                let message = result.message || "Something went wrong.";

                if (result.errors) {
                    message = Object.values(result.errors).join("<br>");
                }

                showFormMessage(message, "error");

                return;
            }


            closeModal();

            await loadContacts();


        } catch (error) {

            showFormMessage(
                "Unable to connect to server.",
                "error"
            );

        }

    });


// Edit contact

function editContact(id) {

    const contact = contacts.find(
        contact => contact._id === id
    );

    if (!contact) return;


    editingId = id;


    document.getElementById("modalTitle").textContent =
        "Edit Contact";


    document.getElementById("contactMongoId").value =
        contact._id;

    document.getElementById("contactId").value =
        contact.contactId;

    document.getElementById("name").value =
        contact.name;

    document.getElementById("phone").value =
        contact.phone;

    document.getElementById("email").value =
        contact.email;


    document.getElementById("formMessage").innerHTML = "";


    document
        .getElementById("contactModal")
        .classList.add("active");
}


// Delete contact

async function deleteContact(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this contact?"
    );

    if (!confirmed) return;


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(result.message);

            return;
        }


        await loadContacts();


    } catch (error) {

        alert("Unable to delete contact.");

    }
}


// Search

function searchContacts() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    const filtered = contacts.filter(contact =>

        contact.name.toLowerCase().includes(search) ||

        contact.email.toLowerCase().includes(search) ||

        contact.phone.includes(search) ||

        contact.contactId.toLowerCase().includes(search)

    );


    displayContacts(filtered);
}


// Form message

function showFormMessage(message, type) {

    document.getElementById("formMessage").innerHTML = `
        <div class="${type}-message">
            ${message}
        </div>
    `;
}


// Prevent HTML injection

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}