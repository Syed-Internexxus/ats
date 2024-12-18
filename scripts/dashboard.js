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

        section.innerHTML = ""; // Clear existing content
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
            section.appendChild(div);
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
            <div class="education-form">
                <label>School:</label>
                <input type="text" value="{{School}}" disabled />
                
                <label>Degree:</label>
                <input type="text" value="{{Degree}}" disabled />
                
                <label>Location:</label>
                <input type="text" value="{{Location}}" disabled />
                
                <label>Dates:</label>
                <input type="text" value="{{Dates}}" disabled />
                
                <label>GPA:</label>
                <input type="text" value="{{GPA}}" disabled />
                
                <label>Honors:</label>
                <input type="text" value="{{Honors}}" disabled />
                
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>
        `);

        // Work Experience Section
        const allExperience = [...(data.Experience || []), ...(data["Other Experience"] || [])];
        populateDynamicSection("#work-experience", allExperience, "experience-item", `
            <div class="work-form">
                <label>Company:</label>
                <input type="text" value="{{Company}}" disabled />
                
                <label>Title:</label>
                <input type="text" value="{{Title}}" disabled />
                
                <label>Location:</label>
                <input type="text" value="{{Location}}" disabled />
                
                <label>Dates:</label>
                <input type="text" value="{{Dates}}" disabled />
                
                <label>Details:</label>
                <textarea disabled>{{Details}}</textarea>
                
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
        populateDynamicSection("#certificates", data.Certificates || [], "certificate-item", `
            <div class="certificate-form">
                <label>Name:</label>
                <input type="text" value="{{Name}}" disabled />
                
                <label>Year:</label>
                <input type="text" value="{{Year}}" disabled />
                
                <div class="form-actions">
                    <button class="delete-btn">Delete</button>
                    <button class="save-btn">Edit</button>
                </div>
            </div>
        `);

        // Links Section
        populateDynamicSection("#links", data.Links || [], "link-item", `
            <div class="link-form">
                <label>URL:</label>
                <input type="url" value="{{url}}" disabled />
                
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
            certificates: gatherSectionData(".certificate-item"),
            links: gatherSectionData(".link-item", (link) => ({
                url: link.querySelector("input").value,
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
            const inputs = el.querySelectorAll("input, textarea, select");
            return customMapper(
                Array.from(inputs).reduce((obj, input) => {
                    const label = input.labels[0]?.innerText || input.placeholder || input.getAttribute("aria-label") || "";
                    obj[label] = input.value;
                    return obj;
                }, {})
            );
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
            const parentEntry = target.closest(".education-entry, .work-entry, .link-entry, .certificate-entry");
            if (parentEntry) {
                parentEntry.remove();
            }
        }

        // Toggle Save/Edit on each section
        if (target.classList.contains("save-btn")) {
            const parentEntry = target.closest(".education-entry, .work-entry, .link-entry, .certificate-entry");
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
        const educationContainer = document.getElementById("education");
        if (!educationContainer) return;

        const newForm = document.createElement("div");
        newForm.classList.add("education-entry");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>School Name</label>
                    <input type="text" placeholder="Stanford University" value="${sanitizeInput(edu["School"] || "")}">
                </div>
                <div>
                    <label>Degree</label>
                    <input type="text" placeholder="ex. Bachelors of Science in Biology" value="${sanitizeInput(edu["Degree"] || "")}">
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Start</label>
                    <input type="month" value="${sanitizeInput(edu["Dates"]?.split(" to ")[0] || "")}">
                </div>
                <div>
                    <label>End</label>
                    <input type="month" value="${sanitizeInput(edu["Dates"]?.split(" to ")[1] || "")}">
                </div>
                <div>
                    <label>GPA</label>
                    <input type="text" placeholder="ex. 4.0" value="${sanitizeInput(edu["GPA"] || "")}">
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Details</label>
                <textarea placeholder="Include relevant coursework, honors, achievements, research, etc.">${sanitizeInput(edu["Details"] || "")}</textarea>
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
        const experienceContainer = document.getElementById("work-experience");
        if (!experienceContainer) return;

        const newForm = document.createElement("div");
        newForm.classList.add("work-entry");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Company Name</label>
                    <input type="text" placeholder="Stripe" value="${sanitizeInput(exp["Company"] || "")}">
                </div>
                <div>
                    <label>Title</label>
                    <input type="text" placeholder="ex. Software Engineer" value="${sanitizeInput(exp["Title"] || "")}">
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Start</label>
                    <input type="month" value="${sanitizeInput(exp["Dates"]?.split(" to ")[0] || "")}">
                </div>
                <div>
                    <label>End</label>
                    <input type="month" value="${sanitizeInput(exp["Dates"]?.split(" to ")[1] || "")}">
                </div>
                <div>
                    <label>Location</label>
                    <input type="text" class="location-input" placeholder="San Francisco, CA" value="${sanitizeInput(exp["Location"] || "")}">
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Description of Responsibilities</label>
                <textarea placeholder="Include relevant responsibilities, achievements, contributions, research, etc.">${sanitizeInput(exp["Details"] || "")}</textarea>
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
        const linkContainer = document.getElementById("links");
        if (!linkContainer) return;

        const newForm = document.createElement("div");
        newForm.classList.add("link-entry");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Link Type</label>
                    <select>
                        <option value="" disabled>Select an option...</option>
                        <option value="Portfolio" ${link.type === "Portfolio" ? "selected" : ""}>Portfolio</option>
                        <option value="LinkedIn" ${link.type === "LinkedIn" ? "selected" : ""}>LinkedIn</option>
                        <option value="GitHub" ${link.type === "GitHub" ? "selected" : ""}>GitHub</option>
                        <option value="Other" ${link.type === "Other" ? "selected" : ""}>Other</option>
                    </select>
                </div>
                <div>
                    <label>Link URL</label>
                    <input type="url" placeholder="ex. www.mylink.com" value="${sanitizeInput(link.url || "")}">
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
        const certificateContainer = document.getElementById("certificates");
        if (!certificateContainer) return;

        const newForm = document.createElement("div");
        newForm.classList.add("certificate-entry");
        newForm.innerHTML = `
            <div class="form-grid">
                <div>
                    <label>Certificate Title</label>
                    <input type="text" placeholder="Ex. AWS Certified Solutions Architect" value="${sanitizeInput(cert["Certificate Title"] || "")}">
                </div>
                <div>
                    <label>Issuing Organization</label>
                    <input type="text" placeholder="Ex. Amazon Web Services" value="${sanitizeInput(cert["Issuing Organization"] || "")}">
                </div>
            </div>
            <div class="form-grid">
                <div>
                    <label>Date of Issue</label>
                    <input type="month" value="${sanitizeInput(cert["Date of Issue"] || "")}">
                </div>
                <div>
                    <label>Expiration Date</label>
                    <input type="month" placeholder="Leave blank if no expiry" value="${sanitizeInput(cert["Expiration Date"] || "")}">
                </div>
            </div>
            <div class="form-grid full-width">
                <label>Description (optional)</label>
                <textarea placeholder="Add any details about the achievement or certificate.">${sanitizeInput(cert["Description"] || "")}</textarea>
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
            const parentEntry = target.closest(".education-entry, .work-entry, .link-entry, .certificate-entry");
            if (parentEntry) {
                parentEntry.remove();
            }
        }

        // Toggle Save/Edit on each section
        if (target.classList.contains("save-btn")) {
            const parentEntry = target.closest(".education-entry, .work-entry, .link-entry, .certificate-entry");
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
