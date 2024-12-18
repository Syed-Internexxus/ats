// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDvPjN4aeHU2H0UtHfOHWdLy4clx5uGR-k",
  authDomain: "internexxus-products-65a8b.firebaseapp.com",
  projectId: "internexxus-products-65a8b",
  storageBucket: "internexxus-products-65a8b.appspot.com",
  messagingSenderId: "788630683314",
  appId: "1:788630683314:web:ff6a2da1fdfee098e713ab",
  measurementId: "G-B0JLMBTZWZ"
};

document.addEventListener("DOMContentLoaded", async () => {
  // Import Firebase Modules
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js");
  const {
    getAuth,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
  } = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js");

  // Firebase Initialization
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  // Element Selectors
  const modal = document.querySelector(".modal");
  const signupLabel = document.querySelector("label.signup");
  const loginLabel = document.querySelector("label.login");
  const getStartedBtn = document.getElementById("get-started");
  const signupModalBtn = document.querySelector(".navbar nav .signup-btn");
  const loginForm = document.querySelector("form.login");
  const signupForm = document.querySelector("form.signup");
  const sliderTab = document.querySelector(".slider-tab");
  const googleLoginBtns = document.querySelectorAll(".google-btn");
  const forgotPasswordLink = document.querySelector("form.login .pass-link a");
  const authBtn = document.getElementById("auth-btn");
  const productSection = document.querySelector(".product-section");
  const productCards = document.querySelectorAll(".product-card");

  // Show and Hide Modal
  const showModal = () => modal.classList.remove("hidden");
  const hideModal = () => modal.classList.add("hidden");

  // Redirect to upload.html with user state
  const redirectToUpload = (user) => {
    const userState = JSON.stringify({ uid: user.uid, email: user.email });
    sessionStorage.setItem("userState", userState);
    window.location.href = "upload.html";
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      alert(`Welcome ${result.user.displayName}`);
      hideModal();
      redirectToUpload(result.user);
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Failed to sign in with Google.");
    }
  };

  // Email/Password Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    const email = signupForm.querySelector("input[placeholder='Email Address']").value.trim();
    const password = signupForm.querySelector("input[placeholder='Password']").value;
    const confirmPassword = signupForm.querySelector("input[placeholder='Confirm password']").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
      hideModal();
      signupForm.reset();
      redirectToUpload(userCredential.user);
    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.message);
    }
  };

  // Email/Password Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector("input[placeholder='Email Address']").value.trim();
    const password = loginForm.querySelector("input[placeholder='Password']").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("Welcome back!");
      hideModal();
      loginForm.reset();
      redirectToUpload(userCredential.user);
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message);
    }
  };

  // Password Reset Handler
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector("input[placeholder='Email Address']").value.trim();

    if (!email) {
      alert("Please enter an email address!");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (error) {
      console.error("Password Reset Error:", error);
      alert(error.message);
    }
  };

  // Auth Button Toggle Based on User State
  const updateAuthButton = (user) => {
    if (user) {
      authBtn.textContent = "Logout";
      authBtn.href = "#";
      authBtn.addEventListener("click", async () => {
        await signOut(auth);
        alert("Logged out successfully.");
      });
    } else {
      authBtn.textContent = "Sign Up";
    }
  };

  // Event Listeners
  googleLoginBtns.forEach((btn) => btn.addEventListener("click", handleGoogleLogin));
  signupForm.addEventListener("submit", handleSignup);
  loginForm.addEventListener("submit", handleLogin);
  forgotPasswordLink.addEventListener("click", handlePasswordReset);

  getStartedBtn.addEventListener("click", () => {
    showModal();
    signupLabel.click();
  });

  signupModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showModal();
    signupLabel.click();
  });

  signupLabel.addEventListener("click", () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    sliderTab.style.left = "50%";
  });

  loginLabel.addEventListener("click", () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
    sliderTab.style.left = "0%";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideModal();
  });

  onAuthStateChanged(auth, (user) => updateAuthButton(user));
  //function to handle card scroll
  function handleCardScroll() {
    const sectionTop = productSection.offsetTop;
    const sectionHeight = productSection.offsetHeight;
    const scrollY = window.scrollY;
  
    productCards.forEach((card, index) => {
      const isLastCard = index === productCards.length - 1; // Identify the last card
      const cardOffsetTop = sectionTop + index * 200; // Vertical position for each card
  
      // Handle general stacking behavior
      if (scrollY + window.innerHeight > cardOffsetTop) {
        card.style.position = "sticky";
        card.style.top = "0";
        card.style.zIndex = index + 1; // Cards progressively stack
        card.style.transform = `translateY(0) rotate(${index % 2 === 0 ? -2 : 2}deg)`;
      } else {
        // Reset position when above the scroll position
        card.style.position = "absolute";
        card.style.top = `${index * 200}px`;
        card.style.zIndex = "1";
        card.style.transform = `rotate(${index % 2 === 0 ? -2 : 2}deg)`;
      }
  
      // Ensure the last card stays at the very top
      if (isLastCard && scrollY + window.innerHeight >= sectionTop + sectionHeight - 200) {
        card.style.zIndex = productCards.length + 1; // Highest z-index
      }
    });
  }

  // Throttled Scroll Event (Throttle limit set to 100ms)
  function throttle(func, limit) {
      let inThrottle;
      return function () {
          const args = arguments;
          const context = this;
          if (!inThrottle) {
              func.apply(context, args);
              inThrottle = true;
              setTimeout(() => (inThrottle = false), limit);
          }
      };
  }

  // Attach Throttled Scroll Event
  if (productSection) {
      window.addEventListener("scroll", throttle(handleCardScroll, 100));
      handleCardScroll(); // Initialize positions on page load
  }

  // Firebase Auth State Listener
  onAuthStateChanged(auth, (user) => {
      updateAuthButton(user);
  });
});
