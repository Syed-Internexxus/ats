// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDvPjN4aeHU2H0UtHfOHWdLy4clx5uGR-k",
  authDomain: "internexxus-products-65a8b.firebaseapp.com",
  projectId: "internexxus-products-65a8b",
  storageBucket: "internexxus-products-65a8b.appspot.com",
  messagingSenderId: "788630683314",
  appId: "1:788630683314:web:ff6a2da1fdfee098e713ab",
  measurementId: "G-B0JLMBTZWZ"
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

// Function to handle Google Authentication
function authenticateUser() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log('User signed in:', user);
            window.location.href = 'dashboard.html'; // Redirect on successful login
        })
        .catch((error) => {
            console.error('Authentication error:', error);
        });
}

// Run after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const getStartedBtn = document.getElementById('get-started-btn');
    const signUpBtn = document.getElementById('sign-up-btn');

    // Add event listeners if elements exist
    if (getStartedBtn) getStartedBtn.addEventListener('click', authenticateUser);
    if (signUpBtn) signUpBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior
        authenticateUser();
    });

    // Scroll-triggered card stacking
    const productSection = document.querySelector('.product-section');
    const productCards = document.querySelectorAll('.product-card');
    const sectionTop = productSection ? productSection.offsetTop : null;

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
});
