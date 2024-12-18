document.addEventListener('DOMContentLoaded', () => {
    // Retrieve dashboardData from localStorage
    const dashboardData = JSON.parse(localStorage.getItem('dashboardData'));

    if (!dashboardData) {
        alert("No resume data found. Please generate your resume from the dashboard.");
        window.location.href = "../../dashboard.html";
        return;
    }

    // Populate Full Name
    document.getElementById('fullName').textContent = `${dashboardData['First Name']} ${dashboardData['Last Name']}`;

    // Populate Contact Information
    document.getElementById('address').textContent = dashboardData.Contact.Address;
    document.getElementById('phone').textContent = dashboardData.Contact.Phone;
    document.getElementById('email').textContent = dashboardData.Contact.Email;
    document.getElementById('linkedin').textContent = dashboardData.Links[0] || "";

    // Populate Professional Summary
    const summaryContainer = document.getElementById('summary');
    summaryContainer.innerHTML += `
        <span style="font-size:10pt;font-family:Times New Roman;color:#000000;">
            ${dashboardData['Professional Summary']}
        </span>
    `;

    // Populate Experience
    const experienceContainer = document.getElementById('experienceContainer');
    const allExperience = [...dashboardData.Experience, ...dashboardData['Other Experience']];

    allExperience.forEach(exp => {
        const expDiv = document.createElement('div');
        expDiv.className = 'experience-item';
        expDiv.style.marginTop = '0.2in';

        expDiv.innerHTML = `
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
                ${exp.Details.map(detail => `<div>• ${detail}</div>`).join('')}
            </div>
        `;
        experienceContainer.appendChild(expDiv);
    });

    // Populate Education
    const educationContainer = document.getElementById('educationContainer');
    dashboardData.Education.forEach(edu => {
        const eduDiv = document.createElement('div');
        eduDiv.className = 'education-item';
        eduDiv.style.marginTop = '0.2in';

        eduDiv.innerHTML = `
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
        `;
        educationContainer.appendChild(eduDiv);
    });

    // Populate Skills & Certifications
    const skillsContainer = document.getElementById('skillsContainer');
    const allSkills = [...dashboardData['Core Skills'], ...dashboardData['Secondary Skills']];

    skillsContainer.innerHTML += `
        <div style="font-size:10pt; margin-top:0.2in;">
            ${allSkills.join(' • ')}
        </div>
        <div style="font-size:10pt; margin-top:0.2in;">
            <strong>Certifications:</strong> ${dashboardData.Certificates.map(cert => `${cert.Name} (${cert.Year})`).join(' • ')}
        </div>
    `;

    // Populate Achievements
    const achievementsContainer = document.getElementById('achievementsContainer');
    dashboardData.Achievements.forEach(ach => {
        const achDiv = document.createElement('div');
        achDiv.className = 'achievement-item';
        achDiv.style.marginTop = '0.2in';

        achDiv.innerHTML = `
            <div style="font-weight:bold; font-size:10pt;">
                ${ach.Achievement}
            </div>
            <div style="font-size:10pt;">
                ${ach.Details}
            </div>
        `;
        achievementsContainer.appendChild(achDiv);
    });
});