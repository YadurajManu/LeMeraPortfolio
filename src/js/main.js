// Project sections scroll animation
const projectSections = document.querySelectorAll('.projects-section');

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

projectSections.forEach(section => {
  observer.observe(section);
}); 