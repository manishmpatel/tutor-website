// Tutors listing page functionality

let allTutors = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadTutors();
    setupFilters();
}

async function loadTutors() {
    const grid = document.getElementById('tutors-grid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');

    try {
        const response = await fetch('data/tutors.json');
        const data = await response.json();

        allTutors = data.tutors || [];
        loading.classList.add('hidden');

        if (allTutors.length === 0) {
            noResults.classList.remove('hidden');
            noResults.querySelector('p').textContent = 'No tutors available yet.';
        } else {
            renderTutors(allTutors);
            populateSubjectFilter();
        }
    } catch (error) {
        console.error('Error loading tutors:', error);
        loading.innerHTML = '<p>Error loading tutors. Please try again later.</p>';
    }
}

function renderTutors(tutors) {
    const grid = document.getElementById('tutors-grid');
    const noResults = document.getElementById('no-results');

    if (tutors.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    grid.innerHTML = tutors.map(tutor => createTutorCard(tutor)).join('');
}

function createTutorCard(tutor) {
    const initials = tutor.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const subjects = tutor.subjects.map(s => `<span class="subject-tag">${escapeHtml(s)}</span>`).join('');

    return `
        <div class="tutor-card">
            <div class="tutor-header">
                <div class="tutor-avatar">${initials}</div>
                <div class="tutor-info">
                    <h3>${escapeHtml(tutor.name)}</h3>
                    <span class="tutor-grade">${tutor.grade}th Grade</span>
                </div>
            </div>
            <div class="tutor-subjects">${subjects}</div>
            ${tutor.bio ? `<p class="tutor-bio">${escapeHtml(tutor.bio)}</p>` : ''}
            <a href="mailto:${escapeHtml(tutor.email)}" class="tutor-contact">
                ✉️ Contact ${escapeHtml(tutor.name.split(' ')[0])}
            </a>
        </div>
    `;
}

function populateSubjectFilter() {
    const subjectFilter = document.getElementById('subject-filter');
    const allSubjects = [...new Set(allTutors.flatMap(t => t.subjects))].sort();

    allSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
}

function setupFilters() {
    const searchInput = document.getElementById('search');
    const subjectFilter = document.getElementById('subject-filter');
    const gradeFilter = document.getElementById('grade-filter');

    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedSubject = subjectFilter.value;
        const selectedGrade = gradeFilter.value;

        const filtered = allTutors.filter(tutor => {
            const matchesSearch = tutor.name.toLowerCase().includes(searchTerm) ||
                tutor.subjects.some(s => s.toLowerCase().includes(searchTerm));
            const matchesSubject = !selectedSubject || tutor.subjects.includes(selectedSubject);
            const matchesGrade = !selectedGrade || tutor.grade.toString() === selectedGrade;

            return matchesSearch && matchesSubject && matchesGrade;
        });

        renderTutors(filtered);
    };

    searchInput.addEventListener('input', applyFilters);
    subjectFilter.addEventListener('change', applyFilters);
    gradeFilter.addEventListener('change', applyFilters);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
