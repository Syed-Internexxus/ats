document.addEventListener("DOMContentLoaded", () => {
    // Variables
    let userState = null;

    // DOM Elements
    const logoutLink = document.getElementById("logout-link");
    const resumeSelection = document.getElementById("resume-selection");
    const selectResumeButtons = document.querySelectorAll(".select-resume-btn");

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

    selectResumeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const resumeOption = e.target.closest(".resume-option");
            if (!resumeOption) return;

            const format = resumeOption.dataset.format; // e.g., 'resume1' or 'resume2'
            handleTemplateSelection(format);
        });
    });

    // Handle Template Selection
    function handleTemplateSelection(format) {
        if (!userState) {
            alert("No user data available. Please try again.");
            return;
        }

        const payload = {
            base64_url: userState.base64_file,
            job_description: userState.job_description,
            template: format === 'resume1' ? 'template' : 'template1'
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
            // Add any further actions based on the API response here
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing your request.');
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