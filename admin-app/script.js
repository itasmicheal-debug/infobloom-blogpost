// DOM elements
const postForm = document.getElementById('postForm');
const postId = document.getElementById('postId');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const postImageFile = document.getElementById('postImageFile');
const postImageData = document.getElementById('postImageData');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewWrapper = document.getElementById('imagePreviewWrapper');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const postList = document.getElementById('postList');
const noPosts = document.getElementById('noPosts');
const charCount = document.getElementById('charCount');
const toastContainer = document.getElementById('toastContainer');
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const totalPostsEl = document.getElementById('totalPosts');
const todayPostsEl = document.getElementById('todayPosts');
const lastUpdatedEl = document.getElementById('lastUpdated');
let deleteIndex;
let allPosts = []; // Store all posts for filtering

function updateImagePreviewFromData(dataUrl) {
    if (!imagePreview || !imagePreviewWrapper) return;
    if (dataUrl) {
        imagePreview.src = dataUrl;
        imagePreviewWrapper.style.display = 'block';
    } else {
        imagePreview.src = '';
        imagePreviewWrapper.style.display = 'none';
    }
}

// Character counter
function updateCharCount() {
    charCount.textContent = `${postContent.value.length} / 500 characters`;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Update dashboard stats
function updateStats() {
    const today = new Date().toDateString();
    const todayCount = allPosts.filter(post => new Date(post.createdAt).toDateString() === today).length;
    const lastUpdated = allPosts.length > 0 ? new Date(Math.max(...allPosts.map(p => new Date(p.createdAt)))).toLocaleDateString() : '--';

    totalPostsEl.textContent = allPosts.length;
    todayPostsEl.textContent = todayCount;
    lastUpdatedEl.textContent = lastUpdated;
}

// Toggle dark mode
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const theme = document.body.getAttribute('data-bs-theme');
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon';
}

// Filter posts based on search
function filterPosts() {
    const query = searchInput.value.toLowerCase();
    const filteredPosts = allPosts.filter(post => post.title.toLowerCase().includes(query));
    renderPosts(filteredPosts);
}

// Render posts (filtered or all)
function renderPosts(posts) {
    postList.innerHTML = '';

    if (posts.length === 0) {
        noPosts.style.display = 'block';
        return;
    }

    noPosts.style.display = 'none';

    posts.forEach((post) => {
        const originalIndex = allPosts.indexOf(post);
        const row = document.createElement('tr');
        row.classList.add('fade-in-up');
        row.innerHTML = `
            <td>${post.title}</td>
            <td><span class="badge bg-secondary">${new Date(post.createdAt).toLocaleDateString()}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editPost(${originalIndex})"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePost(${originalIndex})"><i class="bi bi-trash"></i> Delete</button>
            </td>
        `;
        postList.appendChild(row);
    });
}

// Load posts from localStorage
function loadPosts() {
    allPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    updateStats();
    filterPosts(); // This will render filtered posts
}

// Save post
function savePost(event) {
    event.preventDefault();

    if (!postForm.checkValidity()) {
        postForm.classList.add('was-validated');
        return;
    }

    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const postData = {
        title: postTitle.value,
        content: postContent.value,
        createdAt: new Date().toISOString(),
        image: postImageData.value || null
    };

    const id = postId.value;
    if (id) {
        // Update existing post
        posts[id] = { ...posts[id], ...postData };
        showToast('Post updated successfully');
    } else {
        // Add new post
        posts.push(postData);
        showToast('Post saved successfully');
    }

    localStorage.setItem('blogPosts', JSON.stringify(posts));
    resetForm();
    loadPosts();
}

// Edit post
function editPost(index) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const post = posts[index];

    postId.value = index;
    postTitle.value = post.title;
    postContent.value = post.content;
    postImageData.value = post.image || '';
    updateImagePreviewFromData(post.image || '');
    updateCharCount();
    formTitle.textContent = 'Edit Post';
    submitBtn.textContent = 'Update Post';
    cancelBtn.style.display = 'inline-block';

    // Scroll to form
    document.querySelector('.card-header').scrollIntoView({ behavior: 'smooth' });
}

// Delete post (show modal)
function deletePost(index) {
    deleteIndex = index;
    deleteModal.show();
}

// Confirm delete
function confirmDelete() {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.splice(deleteIndex, 1);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    loadPosts();
    showToast('Post deleted', 'danger');
    deleteModal.hide();
}

// Reset form
function resetForm() {
    postForm.reset();
    postForm.classList.remove('was-validated');
    postId.value = '';
    if (postImageData) postImageData.value = '';
    if (postImageFile) postImageFile.value = '';
    updateImagePreviewFromData('');
    formTitle.textContent = 'Add New Post';
    submitBtn.textContent = 'Save Post';
    cancelBtn.style.display = 'none';
    updateCharCount();
}

// Event listeners
postForm.addEventListener('submit', savePost);
cancelBtn.addEventListener('click', resetForm);
postContent.addEventListener('input', updateCharCount);
themeToggle.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', filterPosts);
if (postImageFile) {
    postImageFile.addEventListener('change', function () {
        const file = postImageFile.files && postImageFile.files[0];
        if (!file) {
            postImageData.value = '';
            updateImagePreviewFromData('');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            const dataUrl = e.target && e.target.result ? String(e.target.result) : '';
            postImageData.value = dataUrl;
            updateImagePreviewFromData(dataUrl);
        };
        reader.readAsDataURL(file);
    });
}

// Initialize
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-bs-theme', savedTheme);
updateThemeIcon();
loadPosts();