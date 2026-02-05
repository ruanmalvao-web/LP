document.addEventListener('DOMContentLoaded', () => {

    // Smooth Scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu Toggle (Simplified for this demo)
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navList = document.querySelector('.nav-list');

    if (mobileMenuIcon) {
        mobileMenuIcon.addEventListener('click', () => {
            // In a real production app we would toggle a class to show/hide the menu
            // For this simple example, we'll just toggle display style or alert to user
            // Let's implement a simple slide down toggler if needed
            const currentDisplay = window.getComputedStyle(navList).display;
            if (currentDisplay === 'none') {
                navList.style.display = 'flex';
                navList.style.flexDirection = 'column';
                navList.style.position = 'absolute';
                navList.style.top = '70px';
                navList.style.left = '0';
                navList.style.width = '100%';
                navList.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
                navList.style.padding = '20px';
                navList.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            } else {
                navList.style.display = 'none';
                // Reset inline styles if going back to desktop is needed, media query handles normal desktop state
            }
        });
    }

    // Form Submission Handler
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const service = document.getElementById('service').value;
            const userMessage = document.getElementById('message').value;

            // Construct Email message
            const subject = encodeURIComponent(`Solicitação de Orçamento - ${name}`);
            const body = encodeURIComponent(
                `Nome: ${name}\n` +
                `Telefone: ${phone}\n` +
                `Serviço de Interesse: ${service}\n\n` +
                `Mensagem:\n${userMessage}`
            );

            // Open default email client
            const mailtoUrl = `mailto:contato@grupolitoralseg.com.br?subject=${subject}&body=${body}`;
            window.location.href = mailtoUrl;

            // Show Success Modal
            const modal = document.getElementById('successModal');
            if (modal) {
                modal.style.display = 'flex';
            }

            // Optional: clear form
            leadForm.reset();
        });
    }

    // Modal Close and Return to Home
    const closeModal = document.getElementById('closeModal');
    const modal = document.getElementById('successModal');

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            // Return to Home (scroll to top)
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Update URL to home without reloading
            history.pushState(null, null, '#home');
        });
    }

    // Announcement Modal Logic
    const announcementModal = document.getElementById('announcementModal');
    const closeAnnouncement = document.getElementById('closeAnnouncement');
    const closeAnnouncementBtn = document.getElementById('closeAnnouncementBtn');

    if (announcementModal) {
        // Show after a small delay for better entrance
        setTimeout(() => {
            announcementModal.style.display = 'flex';
        }, 800);
    }

    const hideAnnouncement = () => {
        if (announcementModal) {
            announcementModal.style.display = 'none';
        }
    };

    if (closeAnnouncement) {
        closeAnnouncement.addEventListener('click', hideAnnouncement);
    }
    if (closeAnnouncementBtn) {
        closeAnnouncementBtn.addEventListener('click', hideAnnouncement);
    }

    // Close modal if clicking outside the content
    window.addEventListener('click', (e) => {
        if (e.target === announcementModal) {
            hideAnnouncement();
        }
    });
});
