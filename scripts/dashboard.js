document.addEventListener("DOMContentLoaded", () => {
    // Variables
    let userState = null;

    // DOM Elements
    const logoutLink = document.getElementById("logout-link");
    const loader = document.getElementById("loader");
    const template1Button = document.getElementById("template1");
    const template2Button = document.getElementById("template");

    // Ensure necessary elements exist
    if (!logoutLink || !loader || !template1Button || !template2Button) {
        console.error("Some required DOM elements are missing.");
        return;
    }

    // Load User State from LocalStorage
    try {
        const data = localStorage.getItem("dashboardData");
        if (data) {
            userState = JSON.parse(data);

            // Check for session expiration
            if (userState?.statusCode === 500) {
                localStorage.removeItem("dashboardData");
                alert("Session expired. Redirecting to upload page.");
                window.location.href = "upload.html";
                return;
            }
        } else {
            throw new Error("No user data found.");
        }
    } catch (error) {
        console.error("Failed to load user data:", error);
        alert("Unable to load user data. Redirecting to upload page.");
        window.location.href = "upload.html";
        return;
    }

    // Event Listener for Logout
    logoutLink.addEventListener("click", handleLogout);

    // Add Event Listeners for Template Buttons
    template1Button.addEventListener("click", (e) => {
        e.preventDefault();
        handleTemplateSelection("template1");
    });

    template2Button.addEventListener("click", (e) => {
        e.preventDefault();
        handleTemplateSelection("template");
    });

    // Handle Template Selection
    function handleTemplateSelection(template) {
        if (!userState) {
            alert("No user data available. Please try again.");
            return;
        }

        // Show loader
        loader.style.display = "block";

        const payload = {
            base64_url: data.base64_file,
            job_description: data.job_description,
            template: template,
        };

        fetch("https://x4n0kqckl9.execute-api.us-west-1.amazonaws.com/default/resume_ats_analyzer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("API Response:", data);
                // Process the response as needed
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while processing your request.");
            })
            .finally(() => {
                // Always hide the loader
                loader.style.display = "none";
            });
    }

    // Logout Function
    function handleLogout() {
        // Clear all user-related data from localStorage
        localStorage.removeItem("dashboardData");
        localStorage.removeItem("resumeData");

        // Inform the user and redirect to the homepage
        alert("You have been logged out.");
        window.location.href = "index.html";
    }
});
