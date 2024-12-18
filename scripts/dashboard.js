document.addEventListener("DOMContentLoaded", () => {
    let userState = null;
    let selectedTemplate = null;
    let currentSectionIndex = 0;

    // DOM Elements
    const logoutLink = document.getElementById("logout-link");
    const resumeSelection = document.getElementById("resume-selection");
    const profileFormSection = document.getElementById("profile-form-section");
    const selectResumeButtons = document.querySelectorAll(".select-resume-btn");
    const saveFinishButton = document.querySelector(".save-button");
    const mainHeading = document.querySelector(".profile-form h1");

    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const formSections = document.querySelectorAll(".form-section");
    const nextButtons = document.querySelectorAll(".next-button");
    const skillsTagsContainer = document.querySelector(".skills-tags");
    const newSkillInput = document.getElementById("new-skill");

    // Load User Data from LocalStorage
    try {
        const data = localStorage.getItem("dashboardData");
        if (data) {
            userState = JSON.parse(data);
        } else {
            throw new Error("No user data found.");
        }
    } catch (error) {
        console.error("Failed to load user data:", error);
        alert("Unable to load user data. Redirecting to upload page.");
        window.location.href = "upload.html";
    }

    // Populate Form Fields
    function populateFormFields(data) {
        document.getElementById("first-name").value = data["First Name"] || "";
        document.getElementById("last-name").value = data["Last Name"] || "";
        document.getElementById("summary").value = data["Professional Summary"] || "";
        document.getElementById("personal-location").value = data["Location"] || "";

        populateDynamicSection(".additional-education-container", data.Education || [], getEducationHTML);
        populateDynamicSection(".additional-experience-container", data.Experience || [], getExperienceHTML);
        populateDynamicSection(".additional-link-container", data.Links || [], getLinkHTML);
        populateDynamicSection(".additional-certificate-container", data.Certificates || [], getCertificateHTML);
    }

    // Helper Functions for Generating HTML Templates
    function getEducationHTML(item = {}) {
        return `
            <div class="education-item">
                <div class="form-grid">
                    <div>
                        <label>Degree Title:</label>
                        <input type="text" value="${sanitizeInput(item.title || "")}" disabled />
                    </div>
                    <div>
                        <label>University:</label>
                        <input type="text" value="${sanitizeInput(item.university || "")}" disabled />
                    </div>
                </div>
                <div class="form-grid">
                    <div>
                        <label>Date of Issue:</label>
                        <input type="month" value="${sanitizeInput(item.start || "")}" disabled />
                    </div>
                    <div>
                        <label>Expiration Date:</label>
                        <input type="month" value="${sanitizeInput(item.end || "")}" disabled />
                    </div>
                </div>
                <div class="form-grid full-width">
                    <label>Description:</label>
                    <textarea disabled>${sanitizeInput(item.description || "")}</textarea>
                </div>
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>`;
    }

    function getExperienceHTML(item = {}) {
        return `
            <div class="experience-item">
                <div class="form-grid">
                    <div>
                        <label>Company:</label>
                        <input type="text" value="${sanitizeInput(item.company || "")}" disabled />
                    </div>
                    <div>
                        <label>Title:</label>
                        <input type="text" value="${sanitizeInput(item.title || "")}" disabled />
                    </div>
                </div>
                <div class="form-grid">
                    <div>
                        <label>Start:</label>
                        <input type="month" value="${sanitizeInput(item.start || "")}" disabled />
                    </div>
                    <div>
                        <label>End:</label>
                        <input type="month" value="${sanitizeInput(item.end || "")}" disabled />
                    </div>
                </div>
                <div class="form-grid full-width">
                    <label>Description:</label>
                    <textarea disabled>${sanitizeInput(item.description || "")}</textarea>
                </div>
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>`;
    }

    function getLinkHTML(item = {}) {
        return `
            <div class="link-form">
                <div class="form-grid">
                    <div>
                        <label>Link Type:</label>
                        <select disabled>
                            <option value="${sanitizeInput(item.type || "")}" selected>${sanitizeInput(item.type || "")}</option>
                            <option value="Portfolio">Portfolio</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="GitHub">GitHub</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label>Link URL:</label>
                        <input type="url" value="${sanitizeInput(item.url || "")}" disabled />
                    </div>
                </div>
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>`;
    }

    function getCertificateHTML(item = {}) {
        return `
            <div class="certificate-form">
                <div class="form-grid">
                    <div>
                        <label>Certificate Title:</label>
                        <input type="text" value="${sanitizeInput(item.title || "")}" disabled />
                    </div>
                    <div>
                        <label>Issuing Organization:</label>
                        <input type="text" value="${sanitizeInput(item.organization || "")}" disabled />
                    </div>
                </div>
                <div class="form-grid">
                    <div>
                        <label>Date of Issue:</label>
                        <input type="month" value="${sanitizeInput(item.issue || "")}" disabled />
                    </div>
                    <div>
                        <label>Expiration Date:</label>
                        <input type="month" value="${sanitizeInput(item.expiry || "")}" disabled />
                    </div>
                </div>
                <div class="form-grid full-width">
                    <label>Description:</label>
                    <textarea disabled>${sanitizeInput(item.description || "")}</textarea>
                </div>
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>`;
    }

    function sanitizeInput(value) {
        return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function populateDynamicSection(containerSelector, data, templateFunction) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = ""; // Clear existing content
        data.forEach((item) => {
            const html = templateFunction(item);
            const div = document.createElement("div");
            div.innerHTML = html;
            container.appendChild(div.firstChild);
        });
    }

    // Event Delegation for Dynamic Buttons
    document.body.addEventListener("click", (event) => {
        const target = event.target;

        if (target.classList.contains("add-education-btn")) {
            addSection(".additional-education-container", getEducationHTML());
        }
        if (target.classList.contains("add-experience-btn")) {
            addSection(".additional-experience-container", getExperienceHTML());
        }
        if (target.classList.contains("add-link-btn")) {
            addSection(".additional-link-container", getLinkHTML());
        }
        if (target.classList.contains("add-certificate-btn")) {
            addSection(".additional-certificate-container", getCertificateHTML());
        }
        if (target.classList.contains("delete-btn")) {
            target.closest(".education-item, .experience-item, .link-form, .certificate-form").remove();
        }
        if (target.classList.contains("save-btn")) {
            toggleEdit(target);
        }
    });

    function addSection(containerSelector, html) {
        const container = document.querySelector(containerSelector);
        const div = document.createElement("div");
        div.innerHTML = html;
        container.appendChild(div.firstChild);
    }

    function toggleEdit(button) {
        const parent = button.closest(".education-item, .experience-item, .link-form, .certificate-form");
        const inputs = parent.querySelectorAll("input, textarea, select");
        const isDisabled = inputs[0].disabled;

        inputs.forEach((input) => {
            input.disabled = !isDisabled;
        });
        button.textContent = isDisabled ? "Save" : "Edit";
    }

    // Navigation and Form Saving Logic...
    function showSection(index) {
        formSections.forEach((section, i) => {
            section.style.display = i === index ? "block" : "none";
        });
        sidebarItems.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });
        currentSectionIndex = index;
    }

    if (newSkillInput) {
        newSkillInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && newSkillInput.value.trim() !== "") {
                event.preventDefault();
                addSkillTag(newSkillInput.value.trim());
                newSkillInput.value = "";
            }
        });
    }

    function addSkillTag(skill) {
        const tag = document.createElement("span");
        tag.classList.add("skill-tag");
        tag.textContent = skill;

        const removeButton = document.createElement("button");
        removeButton.textContent = "×";
        removeButton.classList.add("remove-skill");
        removeButton.addEventListener("click", () => {
            skillsTagsContainer.removeChild(tag);
        });

        tag.appendChild(removeButton);
        skillsTagsContainer.appendChild(tag);
    }

    logoutLink.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
});
