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
        handleTemplateSelection("template");
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

        // Create the payload using userState
        const payload = {
            base64_url: userState.base64_file, // Accessing base64-encoded PDF
            job_description: userState.job_description, // Accessing job description
            template: template, // Selected template
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
            .then((responseData) => {
                console.log("API Response:", responseData);
                // Hide loader
                loader.style.display = "none";

                // Parse the body to get pdf_url
                const data = JSON.parse(responseData.body);
                const pdfUrl = data.pdf_url;

                // Trigger download of the PDF
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = 'resume.pdf'; // Suggested filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while processing your request.");
                // Hide loader
                loader.style.display = "none";
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
