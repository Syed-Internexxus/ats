document.addEventListener('DOMContentLoaded', () => {
    // Get resume data from localStorage
    const resumeData = JSON.parse(localStorage.getItem('resumeData'));

    // Populate Name
    document.getElementById('fullName').textContent = 
        `${resumeData['First Name']} ${resumeData['Last Name']}`;

    // Populate Contact Info
    document.getElementById('address').textContent = resumeData.Contact.Address;
    document.getElementById('phone').textContent = resumeData.Contact.Phone;
    document.getElementById('email').textContent = resumeData.Contact.Email;
    document.getElementById('linkedin').textContent = resumeData.Links[0];

    // Populate Experience
    const experienceContainer = document.getElementById('experienceContainer');
    const allExperience = [...resumeData.Experience, ...resumeData['Other Experience']];
    
    allExperience.forEach(exp => {
        const expDiv = document.createElement('div');
        expDiv.className = 'experience-item';
        expDiv.innerHTML = `
            <div style="margin-top:0.2in;">
                <span style="font-style:normal;font-weight:normal;font-size:10pt;">${exp.Dates}</span>
                <span style="font-style:normal;font-weight:bold;font-size:10pt;">${exp.Company}</span>
                <div style="font-style:italic;font-weight:bold;font-size:10pt;">${exp.Title}</div>
                <div style="margin-left:0.2in;">
                    ${exp.Details.map(detail => `
                        <div style="font-size:10pt;">• ${detail}</div>
                    `).join('')}
                </div>
            </div>
        `;
        experienceContainer.appendChild(expDiv);
    });

    // Populate Education
    const educationContainer = document.getElementById('educationContainer');
    resumeData.Education.forEach(edu => {
        const eduDiv = document.createElement('div');
        eduDiv.className = 'education-item';
        eduDiv.innerHTML = `
            <div style="margin-top:0.2in;">
                <span style="font-style:normal;font-weight:normal;font-size:10pt;">${edu.Dates}</span>
                <span style="font-style:normal;font-weight:bold;font-size:10pt;">${edu.School}</span>
                <div style="font-style:italic;font-size:10pt;">${edu.Degree}</div>
                <div style="font-size:10pt;">${edu.Location}</div>
            </div>
        `;
        educationContainer.appendChild(eduDiv);
    });

    // Populate Skills
    const skillsContainer = document.getElementById('skillsContainer');
    const allSkills = [...resumeData['Core Skills'], ...resumeData['Secondary Skills']];
    
    skillsContainer.innerHTML = `
        <div style="margin-top:0.2in;font-size:10pt;">
            ${allSkills.join(' • ')}
        </div>
        <div style="margin-top:0.2in;font-size:10pt;">
            <strong>Certifications:</strong> ${resumeData.Certificates.map(cert => 
                `${cert.Name} (${cert.Year})`).join(' • ')}
        </div>
    `;
});