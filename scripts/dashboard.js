// JavaScript code for dashboard functionality

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
    const newSkillInput = document.getElementById("new-skill");

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

    // Populate Form Fields
    function populateData(userState) {
        document.getElementById("firstName").value = userState["First Name"] || "";
        document.getElementById("lastName").value = userState["Last Name"] || "";
        document.getElementById("title").value = userState["Title"] || "";
        document.getElementById("contact").value = userState["Contact"] || "";

        populateDynamicSection("#linksContainer", userState.Links || [], "link-form", `
            <div class="link-form">
                <input type="url" value="{{link}}" class="form-control" placeholder="Link" disabled />
                <button class="delete-btn">Delete</button>
            </div>
        `);

        populateDynamicSection("#educationContainer", userState.Education || [], "education-item", `
            <div class="education-item">
                <input type="text" value="{{School}}" placeholder="School" class="form-control" disabled />
                <input type="text" value="{{Degree}}" placeholder="Degree" class="form-control" disabled />
                <input type="text" value="{{Location}}" placeholder="Location" class="form-control" disabled />
                <input type="text" value="{{Dates}}" placeholder="Dates" class="form-control" disabled />
                <button class="delete-btn">Delete</button>
            </div>
        `);

        populateDynamicSection("#experienceContainer", userState.Experience || [], "experience-item", `
            <div class="experience-item">
                <input type="text" value="{{Company}}" placeholder="Company" class="form-control" disabled />
                <input type="text" value="{{Title}}" placeholder="Title" class="form-control" disabled />
                <textarea placeholder="Details" class="form-control" disabled>{{Details}}</textarea>
                <button class="delete-btn">Delete</button>
            </div>
        `);

        populateDynamicSection("#certificatesContainer", userState.Certificates || [], "certificate-form", `
            <div class="certificate-form">
                <input type="text" value="{{Name}}" placeholder="Certificate Name" class="form-control" disabled />
                <input type="text" value="{{Year}}" placeholder="Year" class="form-control" disabled />
                <button class="delete-btn">Delete</button>
            </div>
        `);
    }

    function populateDynamicSection(selector, items, className, template) {
        const container = document.querySelector(selector);
        container.innerHTML = "";
        items.forEach((item) => {
            const div = document.createElement("div");
            div.className = className;
            let content = template;
            for (const key in item) {
                content = content.replace(new RegExp(`{{${key}}}`, "g"), sanitizeInput(item[key] || ""));
            }
            div.innerHTML = content;
            container.appendChild(div);
        });
    }

    function sanitizeInput(str) {
        if (typeof str !== "string") return "";
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Resume Selection Logic
    selectResumeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const resumeOption = e.target.closest(".resume-option");
            if (!resumeOption) return;

            selectedTemplate = resumeOption.dataset.format;
            localStorage.setItem("selectedTemplate", selectedTemplate);

            if (userState) {
                populateData(userState);
                resumeSelection.style.display = "none";
                profileFormSection.style.display = "flex";

                mainHeading.textContent = "Let's make sure this is right, shall we?";
                showSection(0);
            } else {
                alert("Failed to load user data. Please try again.");
            }
        });
    });

    // Handle Save/Edit and Delete Events
    document.body.addEventListener("click", (event) => {
        const target = event.target;

        if (target.classList.contains("delete-btn")) {
            target.parentElement.remove();
        } else if (target.classList.contains("save-btn")) {
            const container = target.closest(".form-section");
            const inputs = container.querySelectorAll("input, textarea");
            const isDisabled = inputs[0].disabled;
            inputs.forEach((input) => (input.disabled = !isDisabled));
            target.textContent = isDisabled ? "Save" : "Edit";
        }
    });

    // Sidebar Navigation
    sidebarItems.forEach((item, index) => {
        item.addEventListener("click", () => showSection(index));
    });

    function showSection(index) {
        formSections.forEach((section, i) => {
            section.classList.toggle("active", i === index);
        });
        sidebarItems.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });
        currentSectionIndex = index;
    }

    // Save and Finish Functionality
    saveFinishButton.addEventListener("click", () => {
        const userData = gatherFormData();
        console.log("Final User Data:", userData);
        alert("Save and Finish functionality under development.");
    });

    function gatherFormData() {
        return {
            personalDetails: {
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                title: document.getElementById("title").value,
                contact: document.getElementById("contact").value,
            },
            links: gatherDynamicData(".link-form"),
            education: gatherDynamicData(".education-item"),
            experience: gatherDynamicData(".experience-item"),
            certificates: gatherDynamicData(".certificate-form"),
        };
    }

    function gatherDynamicData(selector) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map((el) => {
            const inputs = el.querySelectorAll("input, textarea");
            const data = {};
            inputs.forEach((input) => {
                data[input.placeholder] = input.value;
            });
            return data;
        });
    }

    // Initialize Form
    if (userState) {
        populateData(userState);
    }

    // Logout Functionality
    logoutLink.addEventListener("click", () => {
        localStorage.removeItem("dashboardData");
        alert("Logged out successfully.");
        window.location.href = "index.html";
    });
});
