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

            // Check if statuscode is 500
            if (userState.statuscode === 500) {
                localStorage.removeItem("dashboardData");
                alert("Session expired. Redirecting to upload page.");
                window.location.href = "upload.html";
            }
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
        document.getElementById("summary").value = data["Professional Summary"] || "";

        // Contact Details
        if (data.Contact) {
            document.getElementById("phone").value = data.Contact.Phone || "";
            document.getElementById("email").value = data.Contact.Email || "";
            document.getElementById("personal-location").value = data.Contact.Address || "";
        }

        // Links Section
        populateLinks(data.Links || []);

        // Education Section
        populateEducation(data.Education || []);

        // Experience Section
        const allExperience = [...(data.Experience || []), ...(data["Other Experience"] || [])];
        populateExperience(allExperience);

        // Skills Section
        populateSkills([...data["Core Skills"] || [], ...data["Secondary Skills"] || []]);

        // Certificates Section
        populateCertificates(data.Certificates || []);

        // Achievements Section (if applicable)
        populateAchievements(data.Achievements || []);
    }

    // Function to populate Links
    function populateLinks(links) {
        // Populate existing link fields
        if (links[0]) {
            document.querySelector("#links input[type='url']").value = sanitizeInput(links[0] || "");
        }

        // Add additional link entries
        for (let i = 1; i < links.length; i++) {
            addLinkSection({ "Link URL": links[i] });
        }
    }

    // Function to populate Education
    function populateEducation(educationList) {
        // Populate existing education fields
        if (educationList[0]) {
            const edu = educationList[0];
            document.querySelector("#education input[name='degree-title']").value = sanitizeInput(edu.Degree || "");
            document.querySelector("#education input[name='school']").value = sanitizeInput(edu.School || "");
            document.querySelector("#education input[name='dates']").value = sanitizeInput(edu.Dates || "");
            document.querySelector("#education input[name='location']").value = sanitizeInput(edu.Location || "");
            document.querySelector("#education textarea[name='description']").value = sanitizeInput(edu.Honors || "");
        }

        // Add additional education entries
        for (let i = 1; i < educationList.length; i++) {
            addEducationSection(educationList[i]);
        }
    }

    // Function to populate Experience
    function populateExperience(experienceList) {
        // Populate existing experience fields
        if (experienceList[0]) {
            const exp = experienceList[0];
            document.querySelector("#work-experience input[name='company']").value = sanitizeInput(exp.Company || "");
            document.querySelector("#work-experience input[name='title']").value = sanitizeInput(exp.Title || "");
            document.querySelector("#work-experience input[name='dates']").value = sanitizeInput(exp.Dates || "");
            document.querySelector("#work-experience input[name='location']").value = sanitizeInput(exp.Location || "");
            document.querySelector("#work-experience textarea[name='details']").value = sanitizeInput(exp.Details?.join("\n") || "");
        }

        // Add additional experience entries
        for (let i = 1; i < experienceList.length; i++) {
            addExperienceSection(experienceList[i]);
        }
    }

    // Function to populate Skills
    function populateSkills(skills) {
        skills.forEach(skill => {
            addSkillTag(skill);
        });
    }

    // Function to populate Certificates
    function populateCertificates(certificates) {
        // Populate existing certificate fields
        if (certificates[0]) {
            const cert = certificates[0];
            document.querySelector("#certificates input[name='certificate-name']").value = sanitizeInput(cert.Name || "");
            document.querySelector("#certificates input[name='year']").value = sanitizeInput(cert.Year || "");
        }

        // Add additional certificate entries
        for (let i = 1; i < certificates.length; i++) {
            addCertificateSection(certificates[i]);
        }
    }

    // Function to populate Achievements (if you have a section for it)
    function populateAchievements(achievements) {
        // Implement similar to certificates or experience sections
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
        // Clear all user-related data
        localStorage.removeItem("dashboardData");
        localStorage.removeItem("selectedTemplate");

        // Inform the user and redirect to index.html
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
                    <input type="text" name="degree-title" value="${sanitizeInput(edu.Degree || "")}" disabled />
                </div>
                <div>
                    <label>School:</label>
                    <input type="text" name="school" value="${sanitizeInput(edu.School || "")}" disabled />
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Dates:</label>
                    <input type="text" name="dates" value="${sanitizeInput(edu.Dates || "")}" disabled />
                </div>
                <div>
                    <label>Location:</label>
                    <input type="text" name="location" value="${sanitizeInput(edu.Location || "")}" disabled />
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Honors:</label>
                <textarea name="description" disabled>${sanitizeInput(edu.Honors || "")}</textarea>
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

        const details = exp.Details ? exp.Details.join("\n") : "";

        const newForm = document.createElement("div");
        newForm.classList.add("experience-item");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Company:</label>
                    <input type="text" name="company" value="${sanitizeInput(exp.Company || "")}" disabled />
                </div>
                <div>
                    <label>Title:</label>
                    <input type="text" name="title" value="${sanitizeInput(exp.Title || "")}" disabled />
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Dates:</label>
                    <input type="text" name="dates" value="${sanitizeInput(exp.Dates || "")}" disabled />
                </div>
                <div>
                    <label>Location:</label>
                    <input type="text" name="location" value="${sanitizeInput(exp.Location || "")}" disabled />
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Details:</label>
                <textarea name="details" disabled>${sanitizeInput(details)}</textarea>
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
                    <label>Link URL:</label>
                    <input type="url" value="${sanitizeInput(link || "")}" disabled />
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
                    <label>Certificate Name:</label>
                    <input type="text" name="certificate-name" value="${sanitizeInput(cert.Name || "")}" disabled />
                </div>
                <div>
                    <label>Year:</label>
                    <input type="text" name="year" value="${sanitizeInput(cert.Year || "")}" disabled />
                </div>
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
