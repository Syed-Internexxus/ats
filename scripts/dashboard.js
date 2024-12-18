document.addEventListener("DOMContentLoaded", () => {
    // Variables
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

    // Sidebar Navigation
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const formSections = document.querySelectorAll(".form-section");

    // Next Buttons
    const nextButtons = document.querySelectorAll(".next-button");

    // Skills Tags Container
    const skillsTagsContainer = document.querySelector(".skills-tags");

    if (!skillsTagsContainer) {
        console.error("Element with class 'skills-tags' not found. Please ensure it exists in the HTML.");
    }

    // Define newSkillInput in the outer scope to avoid ReferenceError
    const newSkillInput = document.getElementById("new-skill");
    if (newSkillInput) {
        newSkillInput.value = ""; // Clear any existing value
    } else {
        console.error("Element with id 'new-skill' not found. Please ensure it exists in the HTML.");
    }

    // Load User State from LocalStorage
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

    // Define populateDynamicSection
    function populateDynamicSection(selector, items = [], className, template, dataFormatter = (item) => item) {
        const section = document.querySelector(selector);
        if (!section || !items.length) return;

        // Determine if selector targets the main section or the additional container
        const isCertificates = selector === "#certificates";
        const isLinks = selector === "#links";

        // Choose the correct container based on the section
        let container;
        if (isCertificates) {
            // Initial entry is already present; append to additional container
            container = section.querySelector(".additional-certificate-container");
        } else if (isLinks) {
            // Initial entry is already present; append to additional container
            container = section.querySelector(".additional-link-container");
        } else {
            // Default container
            container = section;
        }

        if (!container) {
            console.error(`Container for dynamic entries not found in ${selector}.`);
            return;
        }

        items.forEach((item) => {
            const formattedItem = dataFormatter(item);
            const div = document.createElement("div");
            div.className = className;

            // Replace placeholders in the template with actual data
            let content = template;
            for (const key in formattedItem) {
                const value = formattedItem[key] || ""; // Avoid undefined values
                content = content.replace(new RegExp(`{{${key}}}`, "g"), sanitizeInput(value));
            }

            div.innerHTML = content;
            container.appendChild(div);
        });
    }

    // Populate Form Fields
    function populateFormFields(data) {
        console.log("Populating form fields with data:", data);

        // Personal Details
        document.getElementById("first-name").value = data["First Name"] || "";
        document.getElementById("last-name").value = data["Last Name"] || "";

        // Professional Summary (if exists)
        const summaryInput = document.getElementById("summary");
        if (summaryInput) {
            summaryInput.value = data["Professional Summary"] || "";
        }

        // Personal Location (Unique ID)
        const personalLocation = document.getElementById("personal-location");
        if (personalLocation) {
            personalLocation.value = data["Location"] || "";
        }

        // Education Section
        populateDynamicSection("#education", data.Education || [], "education-item", `
            <div class="education-item">
                <div class="form-grid">
                    <div>
                        <label>Certificate Title:</label>
                        <input type="text" value="{{Certificate Title}}" disabled />
                    </div>
                    <div>
                        <label>Issuing Organization:</label>
                        <input type="text" value="{{Issuing Organization}}" disabled />
                    </div>
                </div>
                <div class="form-grid">
                    <div>
                        <label>Date of Issue:</label>
                        <input type="month" value="{{Date of Issue}}" disabled />
                    </div>
                    <div>
                        <label>Expiration Date:</label>
                        <input type="month" value="{{Expiration Date}}" disabled />
                    </div>
                </div>
                <div class="form-grid full-width">
                    <label>Description:</label>
                    <textarea disabled>{{Description}}</textarea>
                </div>
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>
        `);

        // Work Experience Section
        const allExperience = [...(data.Experience || []), ...(data["Other Experience"] || [])];
        populateDynamicSection("#work-experience", allExperience, "experience-item", `
            <div class="experience-item">
                <div class="form-grid">
                    <div>
                        <label>Company:</label>
                        <input type="text" value="{{Company}}" disabled />
                    </div>
                    <div>
                        <label>Title:</label>
                        <input type="text" value="{{Title}}" disabled />
                    </div>
                </div>
                <div class="form-grid">
                    <div>
                        <label>Start:</label>
                        <input type="month" value="{{Start}}" disabled />
                    </div>
                    <div>
                        <label>End:</label>
                        <input type="month" value="{{End}}" disabled />
                    </div>
                    <div>
                        <label>Location:</label>
                        <input type="text" value="{{Location}}" disabled />
                    </div>
                </div>
                <div class="form-grid full-width">
                    <label>Description of Responsibilities:</label>
                    <textarea disabled>{{Details}}</textarea>
                </div>                    
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>
        `, (item) => ({
            ...item,
            Details: item.Details ? item.Details.join("\n") : "",
        }));

        // Certificates Section
        populateDynamicSection("#certificates", data.Certificates || [], "certificate-form", `
            <div class="certificate-form">
                <div class="form-grid">
                    <div>
                        <label>Certificate Title:</label>
                        <input type="text" value="{{Certificate Title}}" disabled />
                    </div>
                    <div>
                        <label>Issuing Organization:</label>
                        <input type="text" value="{{Issuing Organization}}" disabled />
                    </div>
                </div>
                <div class="form-grid">
                    <div>
                        <label>Date of Issue:</label>
                        <input type="month" value="{{Date of Issue}}" disabled />
                    </div>
                    <div>
                        <label>Expiration Date:</label>
                        <input type="month" value="{{Expiration Date}}" disabled />
                    </div>
                </div>
                <div class="form-grid full-width">
                    <label>Description:</label>
                    <textarea disabled>{{Description}}</textarea>
                </div>
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>
        `);

        // Links Section
        populateDynamicSection("#links", data.Links || [], "link-form", `
            <div class="link-form">
                <div class="form-grid">
                    <div>
                        <label>Link Type:</label>
                        <select disabled>
                            <option value="{{Link Type}}" selected>{{Link Type}}</option>
                        </select>
                    </div>
                    <div>
                        <label>Link URL:</label>
                        <input type="url" value="{{Link URL}}" disabled />
                    </div>
                </div>
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>
        `);
    }

    // Event Handlers
    logoutLink.addEventListener("click", handleLogout);

    selectResumeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const resumeOption = e.target.closest(".resume-option");
            if (!resumeOption) return;

            const format = resumeOption.dataset.format;
            selectedTemplate = format;

            // Store selected template in localStorage
            localStorage.setItem("selectedTemplate", selectedTemplate);

            if (userState) {
                populateFormFields(userState);
                resumeSelection.style.display = "none";
                profileFormSection.style.display = "flex"; // Changed to flex for layout consistency

                // Update heading text
                mainHeading.textContent = "Let's make sure this is right, cool?";

                // Initialize the first form section as active
                showSection(0);
            } else {
                alert("Failed to load user data. Please try again.");
            }
        });
    });

    saveFinishButton.addEventListener("click", handleSaveAndFinish);

    sidebarItems.forEach((item, index) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            showSection(index);
        });
    });

    nextButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            if (index < formSections.length - 1) {
                showSection(index + 1);
            }
        });
    });

    // Navigation Function
    function showSection(index) {
        formSections.forEach((section, i) => {
            section.classList.toggle("active", i === index);
            section.style.display = i === index ? "block" : "none";
        });
        sidebarItems.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });
        currentSectionIndex = index;
    }

    // Logout Function
    function handleLogout() {
        localStorage.removeItem("dashboardData"); // Clear stored user data
        localStorage.removeItem("selectedTemplate"); // Clear selected template
        alert("You have been logged out.");
        window.location.href = "index.html";
    }

    // Save and Finish Function
    async function handleSaveAndFinish() {
        const userData = gatherFormData();
        console.log("Final User Data:", userData);

        // TODO: Implement functionality to generate and download the final resume here
        alert("Save and Finish functionality is under development!");
    }

    // Gather Form Data
    function gatherFormData() {
        return {
            personalDetails: {
                firstName: document.getElementById("first-name").value,
                lastName: document.getElementById("last-name").value,
                professionalSummary: document.getElementById("summary")?.value || "",
                location: document.getElementById("personal-location")?.value || "",
            },
            education: gatherSectionData(".education-item"),
            workExperience: gatherSectionData(".experience-item"),
            skills: gatherSkills(),
            certificates: gatherSectionData(".certificate-form", (cert) => ({
                "Certificate Title": cert.querySelector('input[type="text"]:nth-child(1)').value,
                "Issuing Organization": cert.querySelector('input[type="text"]:nth-child(2)').value,
                "Date of Issue": cert.querySelector('input[type="month"]:nth-child(3)').value,
                "Expiration Date": cert.querySelector('input[type="month"]:nth-child(4)').value,
                "Description": cert.querySelector('textarea').value,
            })),
            links: gatherSectionData(".link-form", (link) => ({
                "Link Type": link.querySelector('select').value,
                "Link URL": link.querySelector('input[type="url"]').value,
            })),
        };
    }

    function gatherSkills() {
        const skills = [];
        const skillTags = document.querySelectorAll(".skills-tags span");
        skillTags.forEach(tag => {
            skills.push(tag.textContent.replace("×", "").trim());
        });
        return skills;
    }

    function gatherSectionData(selector, customMapper = (el) => el) {
        return Array.from(document.querySelectorAll(selector)).map((el) => {
            return customMapper(el);
        });
    }

    // Skills Section Event Listeners
    if (newSkillInput) {
        newSkillInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && newSkillInput.value.trim() !== "") {
                event.preventDefault();
                addSkillTag(newSkillInput.value.trim());
                newSkillInput.value = "";
            }
        });
    }

    // Function to Add a Skill Tag
    function addSkillTag(skill) {
        if (!skillsTagsContainer) {
            console.error("skillsTagsContainer is not initialized.");
            return;
        }

        const tag = document.createElement("span");
        tag.classList.add("skill-tag");
        tag.textContent = skill;

        const removeButton = document.createElement("button");
        removeButton.textContent = "×";
        removeButton.classList.add("remove-skill");
        Object.assign(removeButton.style, {
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            marginLeft: "8px"
        });
        removeButton.addEventListener("click", () => {
            skillsTagsContainer.removeChild(tag);
        });

        tag.appendChild(removeButton);
        skillsTagsContainer.appendChild(tag);
    }

    // Document Body Click Event Listener for Dynamic Elements
    document.body.addEventListener("click", async (event) => {
        const target = event.target;

        // Add new education entry
        if (target.classList.contains("add-education-btn")) {
            addEducationSection();
        }

        // Add new work experience entry
        if (target.classList.contains("add-experience-btn")) {
            addExperienceSection();
        }

        // Add new link entry
        if (target.classList.contains("add-link-btn")) {
            addLinkSection();
        }

        // Add new certificate entry
        if (target.classList.contains("add-certificate-btn")) {
            addCertificateSection();
        }

        // Delete entry
        if (target.classList.contains("delete-btn")) {
            const parentEntry = target.closest(".education-item, .experience-item, .certificate-form, .link-form");
            if (parentEntry) {
                parentEntry.remove();
            }
        }

        // Toggle Save/Edit on each section
        if (target.classList.contains("save-btn")) {
            const parentEntry = target.closest(".education-item, .experience-item, .certificate-form, .link-form");
            if (parentEntry) {
                const inputs = parentEntry.querySelectorAll("input, textarea, select");
                const isDisabled = Array.from(inputs).some(input => input.disabled);

                if (isDisabled) {
                    // Currently in 'view' mode -> Switch to 'edit' mode
                    inputs.forEach((input) => {
                        input.removeAttribute("disabled");
                    });
                    target.textContent = "Save";
                } else {
                    // Currently in 'edit' mode -> Switch to 'view' mode
                    inputs.forEach((input) => {
                        input.setAttribute("disabled", true);
                    });
                    target.textContent = "Edit";
                }
            }
        }
    });

    // Function to Add Education Section
    function addEducationSection(edu = {}) {
        const educationContainer = document.querySelector(".additional-education-container");
        if (!educationContainer) {
            console.error("Additional education container not found.");
            return;
        }

        const newForm = document.createElement("div");
        newForm.classList.add("education-item");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Degree Title:</label>
                    <input type="text" value="${sanitizeInput(edu["Degree Title"] || "")}" disabled />
                </div>
                <div>
                    <label>University:</label>
                    <input type="text" value="${sanitizeInput(edu["University"] || "")}" disabled />
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Date of Issue:</label>
                    <input type="month" value="${sanitizeInput(edu["Date of Issue"] || "")}" disabled />
                </div>
                <div>
                    <label>Expiration Date:</label>
                    <input type="month" value="${sanitizeInput(edu["Expiration Date"] || "")}" disabled />
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Description:</label>
                <textarea disabled>${sanitizeInput(edu["Description"] || "")}</textarea>
            </div>
            <div class="form-actions">
                <button class="delete-btn">Delete</button>
                <button class="save-btn">Edit</button>
            </div>
        `;
        educationContainer.appendChild(newForm);
    }

    // Function to Add Experience Section
    function addExperienceSection(exp = {}) {
        const experienceContainer = document.querySelector(".additional-experience-container");
        if (!experienceContainer) {
            console.error("Additional experience container not found.");
            return;
        }

        const newForm = document.createElement("div");
        newForm.classList.add("experience-item");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Company:</label>
                    <input type="text" value="${sanitizeInput(exp["Company"] || "")}" disabled />
                </div>
                <div>
                    <label>Title:</label>
                    <input type="text" value="${sanitizeInput(exp["Title"] || "")}" disabled />
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Start:</label>
                    <input type="month" value="${sanitizeInput(exp["Start"] || "")}" disabled />
                </div>
                <div>
                    <label>End:</label>
                    <input type="month" value="${sanitizeInput(exp["End"] || "")}" disabled />
                </div>
                <div>
                    <label>Location:</label>
                    <input type="text" value="${sanitizeInput(exp["Location"] || "")}" disabled />
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Description of Responsibilities:</label>
                <textarea disabled>${sanitizeInput(exp["Description"] || "")}</textarea>
            </div>
            <div class="form-actions">
                <button class="delete-btn">Delete</button>
                <button class="save-btn">Edit</button>
            </div>
        `;
        experienceContainer.appendChild(newForm);
    }

    // Function to Add Link Section
    function addLinkSection(link = {}) {
        const linkContainer = document.querySelector(".additional-link-container");
        if (!linkContainer) {
            console.error("Additional link container not found.");
            return;
        }

        const newForm = document.createElement("div");
        newForm.classList.add("link-form");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Link Type:</label>
                    <select disabled>
                        <option value="" disabled>Select an option...</option>
                        <option value="Portfolio" ${link["Link Type"] === "Portfolio" ? "selected" : ""}>Portfolio</option>
                        <option value="LinkedIn" ${link["Link Type"] === "LinkedIn" ? "selected" : ""}>LinkedIn</option>
                        <option value="GitHub" ${link["Link Type"] === "GitHub" ? "selected" : ""}>GitHub</option>
                        <option value="Other" ${link["Link Type"] === "Other" ? "selected" : ""}>Other</option>
                    </select>
                </div>
                <div>
                    <label>Link URL:</label>
                    <input type="url" value="${sanitizeInput(link["Link URL"] || "")}" disabled />
                </div>
            </div>
            <div class="form-actions">
                <button class="delete-btn">Delete</button>
                <button class="save-btn">Edit</button>
            </div>
        `;
        linkContainer.appendChild(newForm);
    }

    // Function to Add Certificate Section
    function addCertificateSection(cert = {}) {
        const certificateContainer = document.querySelector(".additional-certificate-container");
        if (!certificateContainer) {
            console.error("Additional certificate container not found.");
            return;
        }

        const newForm = document.createElement("div");
        newForm.classList.add("certificate-form");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Certificate Title:</label>
                    <input type="text" value="${sanitizeInput(cert["Certificate Title"] || "")}" disabled />
                </div>
                <div>
                    <label>Issuing Organization:</label>
                    <input type="text" value="${sanitizeInput(cert["Issuing Organization"] || "")}" disabled />
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Date of Issue:</label>
                    <input type="month" value="${sanitizeInput(cert["Date of Issue"] || "")}" disabled />
                </div>
                <div>
                    <label>Expiration Date:</label>
                    <input type="month" value="${sanitizeInput(cert["Expiration Date"] || "")}" disabled />
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Description:</label>
                <textarea disabled>${sanitizeInput(cert["Description"] || "")}</textarea>
            </div>
            <div class="form-actions">
                <button class="delete-btn">Delete</button>
                <button class="save-btn">Edit</button>
            </div>
        `;
        certificateContainer.appendChild(newForm);
    }

    // Function to Sanitize Input to Prevent XSS
    function sanitizeInput(str) {
        if (typeof str !== "string") return "";
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Event delegation for dynamic elements
    document.body.addEventListener("click", (event) => {
        const target = event.target;

        if (target.classList.contains("add-education-btn")) {
            addEducationSection();
        }

        if (target.classList.contains("add-experience-btn")) {
            addExperienceSection();
        }

        if (target.classList.contains("add-link-btn")) {
            addLinkSection();
        }

        if (target.classList.contains("add-certificate-btn")) {
            addCertificateSection();
        }

        if (target.classList.contains("delete-btn")) {
            const parentEntry = target.closest(".education-item, .experience-item, .certificate-form, .link-form");
            if (parentEntry) {
                parentEntry.remove();
            }
        }

        if (target.classList.contains("save-btn")) {
            const parentEntry = target.closest(".education-item, .experience-item, .certificate-form, .link-form");
            if (parentEntry) {
                const inputs = parentEntry.querySelectorAll("input, textarea, select");
                const isDisabled = inputs[0].disabled;

                if (isDisabled) {
                    inputs.forEach((input) => input.disabled = false);
                    target.textContent = "Save";
                } else {
                    inputs.forEach((input) => input.disabled = true);
                    target.textContent = "Edit";
                }
            }
        }
    });

    // Function to Show Specific Section
    function showSection(index) {
        formSections.forEach((section, i) => {
            section.classList.toggle("active", i === index);
            section.style.display = i === index ? "block" : "none";
        });
        sidebarItems.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });
        currentSectionIndex = index;
    }

    // Initialize Skills Tags Container
    if (!skillsTagsContainer) {
        console.error("Element with class 'skills-tags' not found. Please ensure it exists in the HTML.");
    }

    // Skills Section Event Listeners
    if (newSkillInput) {
        newSkillInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && newSkillInput.value.trim() !== "") {
                event.preventDefault();
                addSkillTag(newSkillInput.value.trim());
                newSkillInput.value = "";
            }
        });
    }

});
