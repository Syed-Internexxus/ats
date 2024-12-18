document.addEventListener("DOMContentLoaded", () => {
    // Variables
    let userState = null;

    // DOM Elements
    const logoutLink = document.getElementById("logout-link");
    const loader = document.getElementById("loader");
    const selectTemplate1Btn = document.getElementById("select-template1");
    const selectTemplate2Btn = document.getElementById("select-template2");

    // Ensure all necessary elements exist
    if (!logoutLink || !loader || !selectTemplate1Btn || !selectTemplate2Btn) {
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

    // Event Listeners
    logoutLink.addEventListener("click", handleLogout);
    selectTemplate1Btn.addEventListener("click", (e) => handleTemplateSelection(e, "template"));
    selectTemplate2Btn.addEventListener("click", (e) => handleTemplateSelection(e, "template1"));

    // Handle Template Selection
    function handleTemplateSelection(event, template) {
        event.preventDefault();

        if (!userState) {
            alert("No user data available. Please try again.");
            return;
        }

        // Show loader
        loader.style.display = "block";

        const payload = {
            base64_url: userState.base64_file,
            job_description: userState.job_description,
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
