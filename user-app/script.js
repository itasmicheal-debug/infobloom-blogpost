// Load and display posts from localStorage
function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const postsContainer = document.getElementById('postsContainer');
    const noPosts = document.getElementById('noPosts');

    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        noPosts.style.display = 'block';
        return;
    }

    noPosts.style.display = 'none';

    posts.forEach((post) => {
        const postCard = document.createElement('div');
        postCard.className = 'card mb-4';
        postCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${post.title}</h5>
                <p class="card-text text-muted small">Posted on ${new Date(post.createdAt).toLocaleDateString()}</p>
                <p class="card-text">${post.content}</p>
            </div>
        `;
        postsContainer.appendChild(postCard);
    });
}

// Initialize
loadPosts();