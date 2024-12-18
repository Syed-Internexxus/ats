// Firebase Config for user state management
const firebaseConfig = {
  apiKey: "AIzaSyDvPjN4aeHU2H0UtHfOHWdLy4clx5uGR-k",
  authDomain: "internexxus-products-65a8b.firebaseapp.com",
  projectId: "internexxus-products-65a8b",
  storageBucket: "internexxus-products-65a8b.appspot.com",
  messagingSenderId: "788630683314",
  appId: "1:788630683314:web:ff6a2da1fdfee098e713ab",
  measurementId: "G-B0JLMBTZWZ"
};

// Initialize Firebase
import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js").then(
  ({ initializeApp }) => {
      const app = initializeApp(firebaseConfig);
      import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js").then(
          ({ getAuth, signOut, onAuthStateChanged }) => {
              const auth = getAuth(app);

              /* --------------------- Element Selectors ---------------------- */
              const uploadInput = document.getElementById("resume-upload");
              const uploadLabel = document.querySelector(".upload-label");
              const uploadText = document.querySelector(".upload-text");
              const uploadInstructions = document.querySelector(".upload-instructions");
              const nextButton = document.getElementById("next-button");
              const backButton = document.getElementById("back-button");
              const submitButton = document.getElementById("submit-button");
              const logoutLink = document.getElementById("logout-link");
              const jobDescription = document.getElementById("job-description");
              const progressBarSteps = document.querySelectorAll(".progress-step");
              const loader = document.getElementById("loader");

              // Sections
              const uploadSection = document.getElementById("upload-resume-section");
              const jobDescSection = document.getElementById("job-description-section");

              // Variables to hold user data
              let uploadedFile = null;
              let base64File = null;

              /* --------------------- User State Check ---------------------- */
              onAuthStateChanged(auth, (user) => {
                  if (!user) {
                      window.location.href = "index.html"; // Redirect to login if user is not logged in
                  }
              });

              /* --------------------- Logout Functionality ---------------------- */
              logoutLink.addEventListener("click", async (e) => {
                  e.preventDefault();
                  await signOut(auth);
                  window.location.href = "index.html"; // Redirect to login page
              });

              /* -------------------- PDF File Upload Handling ------------------- */
              uploadInput.addEventListener("change", async (e) => {
                  const file = e.target.files[0];

                  // Allow only PDFs
                  if (file && file.type === "application/pdf") {
                      uploadedFile = file;

                      // Update Upload Box Text
                      uploadText.textContent = file.name; // Show file name
                      uploadInstructions.textContent = "File uploaded successfully!";
                      uploadLabel.style.border = "2px solid #28a745"; // Green border for success

                      // Convert PDF to Base64
                      base64File = await fileToBase64(file);
                  } else {
                      alert("Only PDF files are allowed. Please upload a valid file.");
                      uploadInput.value = ""; // Clear invalid file input
                      resetUploadBox(); // Reset upload box visuals
                  }
              });

              // Function to convert file to Base64
              const fileToBase64 = (file) => {
                  return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => resolve(reader.result.split(",")[1]); // Get Base64 string
                      reader.onerror = (error) => reject(error);
                  });
              };

              // Reset Upload Box to Default
              const resetUploadBox = () => {
                  uploadText.textContent = "Upload File";
                  uploadInstructions.textContent = "Choose a PDF, DOC, or DOCX file up to 5MB";
                  uploadLabel.style.border = "2px dashed #007bff"; // Reset border color
              };

              /* ----------------- Progress Bar Update ----------------- */
              const updateProgressBar = (step) => {
                  progressBarSteps.forEach((stepEl, index) => {
                      if (index < step) {
                          stepEl.classList.add("active");
                      } else {
                          stepEl.classList.remove("active");
                      }
                  });
              };

              /* ----------------- Navigation Logic ----------------- */
              nextButton.addEventListener("click", () => {
                  if (!uploadedFile) {
                      alert("Please upload a PDF file to proceed.");
                      return;
                  }

                  uploadSection.style.display = "none";
                  jobDescSection.style.display = "block";
                  updateProgressBar(2); // Update to step 2
              });

              backButton.addEventListener("click", () => {
                  jobDescSection.style.display = "none";
                  uploadSection.style.display = "block";
                  updateProgressBar(1); // Go back to step 1
              });

              /* ----------------- Submit Button Functionality ----------------- */
              submitButton.addEventListener("click", async () => {
                  const jobDescValue = jobDescription.value.trim();

                  if (!jobDescValue) {
                      alert("Please paste the job description to continue.");
                      return;
                  }

                  if (!base64File) {
                      alert("No PDF file found. Please upload a file first.");
                      return;
                  }

                  loader.style.display = "flex"; // Show loader

                  // Prepare request payload
                  const payload = {
                      base64_file: base64File,
                      job_description: jobDescValue,
                  };

                  localStorage.setItem("dashboardData", JSON.stringify(payload));

                  // Redirect to Dashboard
                  window.location.href = "dashboard.html";
              });
          }
      );
  }
);
