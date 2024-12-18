document.addEventListener("DOMContentLoaded", () => {
    // Variables
    let userState = null;

    // DOM Elements
    const logoutLink = document.getElementById("logout-link");
    const loader = document.getElementById("loader");
    const selectTemplate1Btn = document.getElementById("select-template1");
    const selectTemplate2Btn = document.getElementById("select-template2");

    // Load User State from LocalStorage
    try {
        const data = localStorage.getItem("dashboardData");
        if (data) {
            userState = JSON.parse(data);
            if (userState.statusCode === 500) {
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

    // Event Listeners
    logoutLink.addEventListener("click", handleLogout);
    selectTemplate1Btn.addEventListener("click", (e) => {
        e.preventDefault();
        handleTemplateSelection("template");
    });
    selectTemplate2Btn.addEventListener("click", (e) => {
        e.preventDefault();
        handleTemplateSelection("template1");
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
            base64_url: userState.base64_file,
            job_description: userState.job_description,
            template: template
        };

        fetch('https://x4n0kqckl9.execute-api.us-west-1.amazonaws.com/default/resume_ats_analyzer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json())
        .then(data => {
            // Handle API response
            console.log(data);
            // Hide loader
            loader.style.display = "none";
            // Add any further actions based on the API response here
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing your request.');
            // Hide loader
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