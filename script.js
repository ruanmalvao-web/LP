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

    // Mobile Menu Toggle
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navList = document.querySelector('.nav-list');

    if (mobileMenuIcon) {
        mobileMenuIcon.addEventListener('click', () => {
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
            }
        });
    }

    // Form Submission Handler
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = leadForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new FormData(leadForm);

            fetch('send-email.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const modal = document.getElementById('successModal');
                        if (modal) {
                            modal.style.display = 'flex';
                        }
                        leadForm.reset();
                    } else {
                        alert('Erro ao enviar: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Erro de conexão ao enviar o formulário.');
                })
                .finally(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Modal Close
    const closeModal = document.getElementById('closeModal');
    const successModal = document.getElementById('successModal');

    if (closeModal && successModal) {
        closeModal.addEventListener('click', () => {
            successModal.style.display = 'none';
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            history.pushState(null, null, '#home');
        });
    }

    // Announcement Modal Logic
    const announcementModal = document.getElementById('announcementModal');
    const closeAnnouncement = document.getElementById('closeAnnouncement');
    const closeAnnouncementBtn = document.getElementById('closeAnnouncementBtn');

    if (announcementModal) {
        setTimeout(() => {
            announcementModal.style.display = 'flex';
            // Auto-close after 5 seconds (5000ms)
            setTimeout(hideAnnouncement, 5000);
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

    window.addEventListener('click', (e) => {
        if (e.target === announcementModal) {
            hideAnnouncement();
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});
