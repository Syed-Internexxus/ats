document.addEventListener('DOMContentLoaded', () => {
    // Scroll-triggered card stacking
    const productSection = document.querySelector('.product-section');
    const productCards = document.querySelectorAll('.product-card');
    const sectionTop = productSection ? productSection.offsetTop : null;

    // Variables for the Hero Section
    const uploadBox = document.getElementById('upload-box');
    const uploadButton = document.getElementById('upload-button');
    const resumeUploadInput = document.getElementById('resume-upload');
    const progressBar = document.getElementById('progress-bar');
    const steps = document.querySelectorAll('.step');
    let fileUploaded = false;
    let currentStep = 1;
    let base64File = ""; // Variable to hold base64 string of the uploaded file

    // Function to handle card stacking based on scroll position
    function handleScroll() {
        const scrollPosition = window.scrollY;
        const scrollIntoSection = scrollPosition - sectionTop;

        if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + productSection.offsetHeight)) {
            productCards.forEach((card, index) => {
                const stackPoint = 180 * index;
                if (scrollIntoSection > stackPoint && index < 3) {
                    card.style.position = 'sticky';
                    card.style.top = '0';
                    card.style.transform = `translateY(0) rotate(${index % 2 === 0 ? -2 : 2}deg)`;
                } else if (scrollIntoSection <= stackPoint) {
                    card.style.position = 'absolute';
                    card.style.top = `${180 * index}px`;
                    card.style.transform = `rotate(${index % 2 === 0 ? -2 : 2}deg)`;
                }
            });
        }
    }

    // Function to update progress bar steps
    function updateProgress(step) {
        steps.forEach((stepElement, index) => {
            if (index < step - 1) {
                stepElement.classList.add('completed');
                stepElement.classList.remove('active');
            } else if (index === step - 1) {
                stepElement.classList.add('active');
                stepElement.classList.remove('completed');
            } else {
                stepElement.classList.remove('active', 'completed');
            }
        });
    }

    // Function to handle file upload
    function handleFileUpload(file) {
        if (file) {
            fileUploaded = true;
            uploadButton.textContent = "Next";
            uploadBox.innerHTML = `<p>Uploaded: ${file.name}</p><button class="upload-button" id="next-button">Next</button>`;
            currentStep = 2;
            updateProgress(currentStep);

            // Convert the file to Base64
            const reader = new FileReader();
            reader.onload = () => {
                base64File = reader.result.split(',')[1]; // Get base64 content only
            };
            reader.readAsDataURL(file);

            // Proceed to the next step when "Next" is clicked
            document.getElementById('next-button').addEventListener('click', showJobDescriptionInput);
        }
    }

    // Function to show the job description input step
    function showJobDescriptionInput() {
        uploadBox.innerHTML = `
            <div class="description-box">
                <label for="job-description">Job Description</label>
                <textarea id="job-description" placeholder="Your Target Job description..."></textarea>
                <button class="upload-button" id="analyze-button">Analyze and Build</button>
            </div>
        `;  
        document.getElementById('analyze-button').addEventListener('click', () => {
            const jobDescription = document.getElementById('job-description').value;
            if (jobDescription) {
                analyzeResume(jobDescription);
            } else {
                alert("Please enter a job description.");
            }
        });
    }
    // Show loader
function showLoader() {
    document.getElementById('loader').style.display = 'flex';
  }
  
  // Hide loader
  function hideLoader() {
    document.getElementById('loader').style.display = 'none';
  }
  
  // Example usage in analyzeResume function
  async function analyzeResume(jobDescription) {
      showLoader(); // Show loader before sending request
  
      const url = "https://x4n0kqckl9.execute-api.us-west-1.amazonaws.com/default/resume_ats_analyzer";
      const payload = {
          base64_file: base64File,
          job_description: jobDescription
      };
  
      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });
  
          if (response.ok) {
              const apiResponse = await response.json();
              const bodyData = JSON.parse(apiResponse.body);
  
              // Hide the loader once response is received
              hideLoader();
  
              // Rest of the code to display analysis results
              document.getElementById('upload-box').style.display = 'none';
              document.getElementById('results-section').style.display = 'flex';
              document.querySelector('.hero').classList.add('full-width');
  
              document.getElementById('result-content').innerHTML = `
                  <h3>Compatibility Score: ${bodyData.score}%</h3>
                  <ul id="points-list">
                      ${bodyData.points.map(point => `<li>${point}</li>`).join('')}
                  </ul>
              `;
              document.getElementById('resume-embed').src = URL.createObjectURL(resumeUploadInput.files[0]);
          } else {
              hideLoader();
              alert("Failed to analyze resume. Please try again.");
          }
      } catch (error) {
          hideLoader();
          alert("An error occurred while analyzing the resume.");
      }
  }
  
    
    
    // Rebuild button functionality
    document.getElementById('rebuild-button').addEventListener('click', () => {
        alert("Rebuild functionality coming soon!");
    });
    
    
    // Rebuild button functionality
    document.getElementById('rebuild-button').addEventListener('click', () => {
        // Logic for rebuilding the resume can be implemented here
        alert("Rebuild functionality coming soon!");
    });
    
    

    // Drag-and-drop functionality
    function handleDragOver(e) {
        e.preventDefault();
        uploadBox.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadBox.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadBox.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }

    // Event listeners for drag-and-drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);

    // Event listener for the "Upload Resume" button
    uploadButton.addEventListener('click', () => {
        resumeUploadInput.click();
    });

    // Event listener for file selection via input
    resumeUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFileUpload(file);
    });

    // Throttled scroll event listener
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Add throttled scroll event listener
    if (productSection) {
        window.addEventListener('scroll', throttle(handleScroll, 10));
        handleScroll(); // Initialize positions
    }

    // Initial progress update
    updateProgress(currentStep);
});
