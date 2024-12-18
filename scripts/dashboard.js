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
                profileFormSection.style.display = "block";

                // Update heading text
                mainHeading.textContent = "Let's make sure this is right, cool?";
            } else {
                alert("Failed to load user data. Please try again.");
            }
        });
    });

    saveFinishButton.addEventListener("click", handleSaveAndFinish);

    sidebarItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetSection = document.querySelector(item.getAttribute("href"));
            navigateToSection(targetSection);
        });
    });

    // Populate Form Fields
    function populateFormFields(data) {
        // Personal Details
        document.getElementById("first-name").value = data["First Name"] || "";
        document.getElementById("last-name").value = data["Last Name"] || "";
        document.getElementById("summary").value = data["Professional Summary"] || "";

        // Education
        populateDynamicSection("#education", data.Education, "education-item", `
            <label>School:</label> <input type="text" value="{{School}}" />
            <label>Degree:</label> <input type="text" value="{{Degree}}" />
            <label>Location:</label> <input type="text" value="{{Location}}" />
            <label>Dates:</label> <input type="text" value="{{Dates}}" />
            <label>GPA:</label> <input type="text" value="{{GPA}}" />
            <label>Honors:</label> <input type="text" value="{{Honors}}" />
        `);

        // Work Experience
        populateDynamicSection("#work-experience", data.Experience, "experience-item", `
            <label>Company:</label> <input type="text" value="{{Company}}" />
            <label>Title:</label> <input type="text" value="{{Title}}" />
            <label>Location:</label> <input type="text" value="{{Location}}" />
            <label>Dates:</label> <input type="text" value="{{Dates}}" />
            <label>Details:</label>
            <textarea>{{Details}}</textarea>
        `, (item) => ({ Details: item.Details?.join("\n") }));

        // Skills
        document.getElementById("skills").value = data["Core Skills"] || "";

        // Certificates
        populateDynamicSection("#certificates", data.Certificates, "certificate-item", `
            <label>Name:</label> <input type="text" value="{{Name}}" />
            <label>Year:</label> <input type="text" value="{{Year}}" />
        `);

        // Links
        populateDynamicSection("#links", data.Links, "link-item", `
            <label>URL:</label> <input type="url" value="{{}}" />
        `);
    }

    // Populate Dynamic Section
    function populateDynamicSection(selector, items = [], className, template, dataFormatter = (item) => item) {
        const section = document.querySelector(selector);
        section.innerHTML = ""; // Clear existing content
        items.forEach((item) => {
            const formattedItem = dataFormatter(item);
            const div = document.createElement("div");
            div.className = className;
            div.innerHTML = Object.keys(formattedItem).reduce(
                (html, key) => html.replace(new RegExp(`{{${key}}}`, "g"), formattedItem[key]),
                template
            );
            section.appendChild(div);
        });
    }

    // Navigation
    function navigateToSection(section) {
        formSections.forEach((sec) => (sec.style.display = "none"));
        section.style.display = "block";
        sidebarItems.forEach((item) => item.classList.remove("active"));
        document.querySelector(`.sidebar-item[href="#${section.id}"]`).classList.add("active");
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
            skills: document.getElementById("skills")?.value || "",
            certificates: gatherSectionData("#certificates .certificate-item"),
            links: gatherSectionData("#links .link-item", (link) => ({
                url: link.querySelector("input").value,
            })),
        };
    }

    function gatherSectionData(selector, customMapper = (el) => el) {
        return Array.from(document.querySelectorAll(selector)).map((el) => {
            const inputs = el.querySelectorAll("input, textarea");
            return customMapper(
                Array.from(inputs).reduce((obj, input) => {
                    obj[input.placeholder || input.labels[0]?.innerText] = input.value;
                    return obj;
                }, {})
            );
        });
    }
});
