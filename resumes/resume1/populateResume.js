document.addEventListener('DOMContentLoaded', () => {
    // Retrieve resumeData from localStorage
    const resumeData = JSON.parse(localStorage.getItem('resumeData'));

    if (!resumeData) {
        alert("No resume data found. Please generate your resume from the dashboard.");
        window.location.href = "../../dashboard.html";
        return;
    }

    // Populate Full Name
    const fullNameElement = document.getElementById('fullName');
    if (fullNameElement) {
        fullNameElement.textContent = `${resumeData['First Name']} ${resumeData['Last Name']}`;
    }

    // Populate Title
    const titleElement = document.getElementById('title');
    if (titleElement) {
        titleElement.textContent = resumeData['Title'];
    }

    // Populate Contact Information
    const addressElement = document.getElementById('address');
    const phoneElement = document.getElementById('phone');
    const emailElement = document.getElementById('email');
    const linkedinElement = document.getElementById('linkedin');
    const githubElement = document.getElementById('github'); // Assuming you have a placeholder for GitHub

    if (addressElement) {
        addressElement.textContent = resumeData.Contact.Address;
    }
    if (phoneElement) {
        phoneElement.textContent = resumeData.Contact.Phone;
    }
    if (emailElement) {
        emailElement.textContent = resumeData.Contact.Email;
    }
    if (linkedinElement && resumeData.Links[0]) {
        linkedinElement.innerHTML = `<a href="${resumeData.Links[0]}" target="_blank">LinkedIn</a>`;
    }
    if (githubElement && resumeData.Links[1]) {
        githubElement.innerHTML = `<a href="${resumeData.Links[1]}" target="_blank">GitHub</a>`;
    }

    // Populate Professional Summary
    const summaryContainer = document.getElementById('summary');
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <div style="font-weight:bold;font-size:11pt;font-family:Times New Roman;color:#000000; margin-bottom:0.2in;">
                PROFESSIONAL SUMMARY
            </div>
            <span style="font-size:10pt;font-family:Times New Roman;color:#000000;">
                ${resumeData['Professional Summary']}
            </span>
        `;
    }

    // Populate Experience
    const experienceContainer = document.getElementById('experienceContainer');
    if (experienceContainer && resumeData.Experience) {
        experienceContainer.innerHTML = `
            ${resumeData.Experience.map(exp => `
                <div style="margin-top:0.2in;">
                    <div style="font-style:normal;font-weight:normal;font-size:10pt;">
                        ${exp.Dates}
                    </div>
                    <div style="font-style:normal;font-weight:bold;font-size:10pt;">
                        ${exp.Company}
                    </div>
                    <div style="font-style:italic;font-weight:bold;font-size:10pt;">
                        ${exp.Title}
                    </div>
                    <div style="margin-left:0.2in; font-size:10pt;">
                        ${exp.Details.split('. ').map(detail => `<div>• ${detail.trim()}</div>`).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    // Populate Other Experience
    const otherExperienceContainer = document.getElementById('otherExperienceContainer');
    if (otherExperienceContainer && resumeData['Other Experience']) {
        otherExperienceContainer.innerHTML = `
            ${resumeData['Other Experience'].map(exp => `
                <div style="margin-top:0.2in;">
                    <div style="font-style:normal;font-weight:normal;font-size:10pt;">
                        ${exp.Dates}
                    </div>
                    <div style="font-style:normal;font-weight:bold;font-size:10pt;">
                        ${exp.Company}
                    </div>
                    <div style="font-style:italic;font-weight:bold;font-size:10pt;">
                        ${exp.Title}
                    </div>
                    <div style="margin-left:0.2in; font-size:10pt;">
                        ${exp.Details.split('. ').map(detail => `<div>• ${detail.trim()}</div>`).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    // Populate Education
    const educationContainer = document.getElementById('educationContainer');
    if (educationContainer && resumeData.Education) {
        educationContainer.innerHTML = `
            ${resumeData.Education.map(edu => `
                <div style="margin-top:0.2in;">
                    <div style="font-style:normal;font-weight:normal;font-size:10pt;">
                        ${edu.Dates}
                    </div>
                    <div style="font-style:normal;font-weight:bold;font-size:10pt;">
                        ${edu.School}
                    </div>
                    <div style="font-style:italic;font-size:10pt;">
                        ${edu.Degree}
                    </div>
                    <div style="font-size:10pt;">
                        ${edu.Location}
                    </div>
                    ${edu.GPA ? `<div style="font-size:10pt;">GPA: ${edu.GPA}</div>` : ''}
                    ${edu.Honors ? `<div style="font-size:10pt;">Honors: ${edu.Honors}</div>` : ''}
                </div>
            `).join('')}
        `;
    }

    // Populate Skills & Certifications
    const skillsContainer = document.getElementById('skillsContainer');
    if (skillsContainer) {
        const allSkills = [...resumeData['Core Skills'], ...resumeData['Secondary Skills']];
        skillsContainer.innerHTML = `
            <div style="font-size:10pt; margin-top:0.2in;">
                <strong>Core Skills:</strong> ${resumeData['Core Skills'].join(', ')}
            </div>
            <div style="font-size:10pt; margin-top:0.1in;">
                <strong>Secondary Skills:</strong> ${resumeData['Secondary Skills'].join(', ')}
            </div>
            <div style="font-size:10pt; margin-top:0.2in;">
                <strong>Certifications:</strong> ${resumeData.Certificates.map(cert => `${cert.Name} (${cert.Year})`).join(', ')}
            </div>
        `;
    }

    // Populate Achievements
    const achievementsContainer = document.getElementById('achievementsContainer');
    if (achievementsContainer && resumeData.Achievements) {
        achievementsContainer.innerHTML = `
            ${resumeData.Achievements.map(ach => `
                <div style="margin-top:0.2in;">
                    <div style="font-weight:bold; font-size:10pt;">
                        ${ach.Achievement}
                    </div>
                    <div style="font-size:10pt;">
                        ${ach.Details}
                    </div>
                </div>
            `).join('')}
        `;
    }
});