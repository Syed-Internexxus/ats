document.addEventListener("DOMContentLoaded", async () => {
    // Variables
    let userState = null;
    let selectedTemplate = null;

    // DOM Elements
    const logoutLink = document.getElementById("logout-link");
    const resumeSelection = document.getElementById("resume-selection");
    const profileFormSection = document.getElementById("profile-form-section");
    const selectResumeButtons = document.querySelectorAll(".select-resume-btn");
    const saveFinishButton = document.querySelector(".save-button");

    // Sidebar Navigation
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const formSections = document.querySelectorAll(".form-section");

    // Event Handlers
    logoutLink.addEventListener("click", handleLogout);

    selectResumeButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            const format = e.target.closest(".resume-option").dataset.format;
            selectedTemplate = format;
            userState = await fetchUserState(); // Fetch data from upload.js
            if (userState) {
                populateFormFields(userState);
                resumeSelection.style.display = "none";
                profileFormSection.style.display = "block";
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

    // Fetch Data from upload.js
    async function fetchUserState() {
        try {
            const response = await fetch("path-to-uploaded-user-state");
            if (!response.ok) throw new Error("Failed to fetch user data.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching user data:", error);
            return null;
        }
    }

    // Populate Form Fields
    function populateFormFields(data) {
        // Personal Details
        document.getElementById("first-name").value = data["First Name"] || "";
        document.getElementById("last-name").value = data["Last Name"] || "";

        // Professional Summary
        const summaryField = document.getElementById("summary");
        if (summaryField) summaryField.value = data["Professional Summary"] || "";

        // Education
        const educationSection = document.querySelector("#education");
        populateDynamicSection(
            educationSection,
            data.Education,
            "education-item",
            `
                <label>School:</label> <input type="text" value="{{School}}" />
                <label>Degree:</label> <input type="text" value="{{Degree}}" />
                <label>Location:</label> <input type="text" value="{{Location}}" />
                <label>Dates:</label> <input type="text" value="{{Dates}}" />
                <label>GPA:</label> <input type="text" value="{{GPA}}" />
                <label>Honors:</label> <input type="text" value="{{Honors}}" />
            `
        );

        // Work Experience
        const experienceSection = document.querySelector("#work-experience");
        populateDynamicSection(
            experienceSection,
            data.Experience,
            "experience-item",
            `
                <label>Company:</label> <input type="text" value="{{Company}}" />
                <label>Title:</label> <input type="text" value="{{Title}}" />
                <label>Location:</label> <input type="text" value="{{Location}}" />
                <label>Dates:</label> <input type="text" value="{{Dates}}" />
                <label>Details:</label>
                <textarea>{{Details}}</textarea>
            `,
            (item) => ({
                Details: item.Details?.join("\n"),
            })
        );

        // Core Skills
        const skillsField = document.getElementById("skills");
        if (skillsField) skillsField.value = data["Core Skills"] || "";

        // Certificates
        const certificatesSection = document.querySelector("#certificates");
        populateDynamicSection(
            certificatesSection,
            data.Certificates,
            "certificate-item",
            `
                <label>Name:</label> <input type="text" value="{{Name}}" />
                <label>Year:</label> <input type="text" value="{{Year}}" />
            `
        );

        // Links
        const linksSection = document.querySelector("#links");
        populateDynamicSection(
            linksSection,
            data.Links,
            "link-item",
            `
                <label>URL:</label> <input type="url" value="{{}}" />
            `
        );
    }

    // Populate Dynamic Section
    function populateDynamicSection(
        section,
        items = [],
        className,
        template,
        dataFormatter = (item) => item
    ) {
        section.innerHTML = ""; // Clear existing content
        items.forEach((item) => {
            const formattedItem = dataFormatter(item);
            const div = document.createElement("div");
            div.className = className;
            div.innerHTML = Object.keys(formattedItem).reduce(
                (html, key) =>
                    html.replace(new RegExp(`{{${key}}}`, "g"), formattedItem[key]),
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
        document
            .querySelector(`.sidebar-item[href="#${section.id}"]`)
            .classList.add("active");
    }

    // Logout
    function handleLogout() {
        alert("You have been logged out.");
        window.location.href = "index.html";
    }

    // Save and Finish
    async function handleSaveAndFinish() {
        const userData = gatherFormData();
        alert("Save and Finish functionality is under development!");
        console.log("Final User Data:", userData);
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
                    obj[input.placeholder || input.labels[0]?.innerText] =
                        input.value;
                    return obj;
                }, {})
            );
        });
    }
});
