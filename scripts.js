// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Your Firebase configuration
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.getElementById('get-started-btn');
    const signUpBtn = document.getElementById('sign-up-btn');
    const productSection = document.querySelector('.product-section');
    const productCards = document.querySelectorAll('.product-card');
    const sectionTop = productSection.offsetTop;

    // Function to trigger Google Authentication
    function authenticateUser() {
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log('User signed in:', user);
                // Redirect or perform actions after successful authentication
                window.location.href = 'dashboard.html'; // Replace with the desired redirect page
            })
            .catch((error) => {
                console.error('Authentication error:', error);
            });
    }

    // Add event listeners to both buttons
    getStartedBtn.addEventListener('click', authenticateUser);
    signUpBtn.addEventListener('click', authenticateUser);

    // Function to handle stacking and unstacking of cards based on scroll position
    function handleScroll() {
        const scrollPosition = window.scrollY;
        const scrollIntoSection = scrollPosition - sectionTop;

        // Only apply stacking within the section boundaries
        if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + productSection.offsetHeight)) {
            productCards.forEach((card, index) => {
                // Set stack point based on each card's position
                const stackPoint = 180 * index; // Adjusted to match CSS top offsets for smooth stacking

                if (scrollIntoSection > stackPoint && index < 3) {
                    // Stack each card sequentially up to the third card
                    card.style.position = 'sticky';
                    card.style.top = '0'; // Fix to the top of the stack
                    card.style.transform = `translateY(0) rotate(${index % 2 === 0 ? -2 : 2}deg)`;
                } else if (scrollIntoSection <= stackPoint) {
                    // Unstack on scrolling back up, restoring original offset and rotation
                    card.style.position = 'absolute';
                    card.style.top = `${180 * index}px`;
                    card.style.transform = `rotate(${index % 2 === 0 ? -2 : 2}deg)`;
                }
            });
        }
    }

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
    window.addEventListener('scroll', throttle(handleScroll, 10));
    handleScroll(); // Initialize positions
});
