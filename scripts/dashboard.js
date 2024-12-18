document.addEventListener("DOMContentLoaded", () => {
    // Variables
    let userState = null;
    let selectedTemplate = null;

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
        if (!section || !items) return;

        section.innerHTML = ""; // Clear existing content
        items.forEach((item) => {
            const formattedItem = dataFormatter(item);
            const div = document.createElement("div");
            div.className = className;

            // Replace placeholders in the template with actual data
            let content = template;
            for (const key in formattedItem) {
                const value = formattedItem[key] || ""; // Avoid undefined values
                content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
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
        const summaryInput = document.getElementById("summary");
        if (summaryInput) {
            summaryInput.value = data["Professional Summary"] || "";
        }

        // Education Section
        populateDynamicSection("#education", data.Education, "education-item", `
            <div class="education-form">
                <label>School:</label> <input type="text" value="{{School}}" />
                <label>Degree:</label> <input type="text" value="{{Degree}}" />
                <label>Location:</label> <input type="text" value="{{Location}}" />
                <label>Dates:</label> <input type="text" value="{{Dates}}" />
                <label>GPA:</label> <input type="text" value="{{GPA}}" />
                <label>Honors:</label> <input type="text" value="{{Honors}}" />
            </div>
        `);

        // Work Experience Section
        const allExperience = [...(data.Experience || []), ...(data["Other Experience"] || [])];
        populateDynamicSection("#work-experience", allExperience, "experience-item", `
            <div class="work-form">
                <label>Company:</label> <input type="text" value="{{Company}}" />
                <label>Title:</label> <input type="text" value="{{Title}}" />
                <label>Location:</label> <input type="text" value="{{Location}}" />
                <label>Dates:</label> <input type="text" value="{{Dates}}" />
                <label>Details:</label>
                <textarea>{{Details}}</textarea>
            </div>
        `, (item) => ({
            ...item,
            Details: item.Details ? item.Details.join("\n") : "",
        }));

        // Skills Section
        document.getElementById("new-skill").value = data["Core Skills"] || "";

        // Certificates Section
        populateDynamicSection("#certificates", data.Certificates, "certificate-item", `
            <div class="certificate-form">
                <label>Name:</label> <input type="text" value="{{Name}}" />
                <label>Year:</label> <input type="text" value="{{Year}}" />
            </div>
        `);

        // Links Section
        populateDynamicSection("#links", data.Links, "link-item", `
            <div class="link-form">
                <label>URL:</label> <input type="url" value="{{url}}" />
            </div>
        `);
    }

    // Event Handlers
    logoutLink.addEventListener("click", handleLogout);

    selectResumeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const format = e.target.closest(".resume-option").dataset.format;
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
                const firstSection = formSections[0];
                navigateToSection(firstSection);
            } else {
                alert("Failed to load user data. Please try again.");
            }
        });
    });

    saveFinishButton.addEventListener("click", handleSaveAndFinish);

    sidebarItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetSelector = item.getAttribute("href");
            const targetSection = document.querySelector(targetSelector);
            if (targetSection) {
                navigateToSection(targetSection);
            }
        });
    });

    nextButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const currentSection = formSections[index];
            const nextSection = formSections[index + 1];
            if (nextSection) {
                navigateToSection(nextSection);
            }
        });
    });

    // Navigation
    function navigateToSection(section) {
        if (!section) return;

        formSections.forEach((sec) => {
            sec.classList.remove("active");
            sec.style.display = "none"; // Hide all sections
        });

        section.classList.add("active");
        section.style.display = "block"; // Show the selected section

        sidebarItems.forEach((item) => item.classList.remove("active"));
        const activeSidebarItem = document.querySelector(`.sidebar-item[href="#${section.id}"]`);
        if (activeSidebarItem) {
            activeSidebarItem.classList.add("active");
        }
    }

    // Logout
    function handleLogout() {
        localStorage.removeItem("dashboardData"); // Clear stored user data
        localStorage.removeItem("selectedTemplate"); // Clear selected template
        alert("You have been logged out.");
        window.location.href = "index.html";
    }

    // Save and Finish
    async function handleSaveAndFinish() {
        const userData = gatherFormData();
        console.log("Final User Data:", userData);

        // You can implement functionality to generate and download the final resume here
        alert("Save and Finish functionality is under development!");
    }

    // Gather Data
    function gatherFormData() {
        return {
            personalDetails: {
                firstName: document.getElementById("first-name").value,
                lastName: document.getElementById("last-name").value,
                professionalSummary: document.getElementById("summary")?.value || "",
            },
            education: gatherSectionData("#education .education-item"),
            workExperience: gatherSectionData("#work-experience .experience-item"),
            skills: document.getElementById("new-skill")?.value || "",
            certificates: gatherSectionData("#certificates .certificate-item"),
            links: gatherSectionData("#links .link-item", (link) => ({
                url: link.querySelector("input").value,
            })),
        };
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
});
