/**
 * InfoBloom User Blog — Main app logic
 */

(function () {
    'use strict';

    // --- Storage for views, likes, comments (localStorage) ---
    var STORAGE_VIEWS = 'infobloom_views';
    var STORAGE_LIKES = 'infobloom_likes';
    var STORAGE_LIKED = 'infobloom_liked';
    var STORAGE_COMMENTS = 'infobloom_comments';

    function getStorage(key) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }
    function setStorage(key, obj) {
        try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
    }

    function getViews(postId) {
        var o = getStorage(STORAGE_VIEWS);
        return typeof o[postId] === 'number' ? o[postId] : 0;
    }
    function getLikes(postId) {
        var o = getStorage(STORAGE_LIKES);
        return typeof o[postId] === 'number' ? o[postId] : 0;
    }
    function hasLiked(postId) {
        var arr = getStorage(STORAGE_LIKED);
        return Array.isArray(arr) && arr.indexOf(String(postId)) !== -1;
    }
    function toggleLike(postId) {
        postId = String(postId);
        var likes = getStorage(STORAGE_LIKES);
        var liked = getStorage(STORAGE_LIKED);
        if (!Array.isArray(liked)) liked = [];
        var idx = liked.indexOf(postId);
        if (idx !== -1) {
            liked.splice(idx, 1);
            likes[postId] = Math.max(0, (likes[postId] || 0) - 1);
        } else {
            liked.push(postId);
            likes[postId] = (likes[postId] || 0) + 1;
        }
        setStorage(STORAGE_LIKES, likes);
        setStorage(STORAGE_LIKED, liked);
    }
    function getCommentsCount(postId) {
        var o = getStorage(STORAGE_COMMENTS);
        var arr = o[postId];
        return Array.isArray(arr) ? arr.length : 0;
    }

    // Image URL helper: Picsum fallback for generic images
    function getPostImageUrl(slug) {
        return 'https://picsum.photos/seed/' + encodeURIComponent(slug) + '/600/300';
    }

    // Specific Unsplash images for chosen articles (w=600&h=300&fit=crop)
    var IMG_HUMAN_READING = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop';
    var IMG_LAPTOP_CODE = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=300&fit=crop';

    // Mock blog posts (replace with API later)
    const POSTS = [
        {
            id: 1,
            title: 'The art of slow reading in a fast world',
            excerpt: 'Why slowing down and reading deeply can improve focus, retention, and joy—and how to build the habit.',
            category: 'life',
            date: '2025-03-08',
            slug: 'slow-reading',
            image: IMG_HUMAN_READING,
            imageAlt: 'Person reading a book',
            featured: true
        },
        {
            id: 2,
            title: 'Design systems that scale',
            excerpt: 'A practical guide to building and maintaining design systems that teams actually use.',
            category: 'design',
            date: '2025-03-05',
            slug: 'design-systems-scale',
            image: getPostImageUrl('design-systems'),
            imageAlt: 'Design workspace and components',
            featured: false
        },
        {
            id: 3,
            title: 'Getting started with modern JavaScript tooling',
            excerpt: 'Vite, ES modules, and type checking without the config fatigue.',
            category: 'tech',
            date: '2025-03-02',
            slug: 'modern-js-tooling',
            image: IMG_LAPTOP_CODE,
            imageAlt: 'Laptop showing code on screen',
            featured: false
        },
        {
            id: 4,
            title: 'Minimalism in UI: when less is more',
            excerpt: 'Stripping back the interface to improve clarity and conversion.',
            category: 'design',
            date: '2025-02-28',
            slug: 'minimalism-ui',
            image: getPostImageUrl('minimalism-ui'),
            imageAlt: 'Minimal clean design',
            featured: false
        },
        {
            id: 5,
            title: 'Building habits that stick',
            excerpt: 'Small changes and environment design for lasting behavior change.',
            category: 'life',
            date: '2025-02-25',
            slug: 'habits-that-stick',
            image: getPostImageUrl('habits'),
            imageAlt: 'Growth and habits',
            featured: false
        },
        {
            id: 6,
            title: 'API design best practices in 2025',
            excerpt: 'REST, versioning, and developer experience that developers love.',
            category: 'tech',
            date: '2025-02-20',
            slug: 'api-design-2025',
            image: getPostImageUrl('api-design'),
            imageAlt: 'Developer and API code',
            featured: false
        }
    ];

    const POSTS_PER_PAGE = 4;
    let currentCategory = 'all';
    let visibleCount = POSTS_PER_PAGE;
    let searchQuery = '';

    // DOM refs
    const postsContainer = document.getElementById('postsContainer');
    const postsLoading = document.getElementById('postsLoading');
    const postsEmpty = document.getElementById('postsEmpty');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const searchInput = document.getElementById('searchInput');
    const heroTitle = document.getElementById('heroTitle');
    const heroExcerpt = document.getElementById('heroExcerpt');
    const heroCta = document.getElementById('heroCta');
    const popularList = document.getElementById('popularList');

    function formatDate(iso) {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function getFilteredPosts() {
        return POSTS.filter(function (post) {
            const matchCategory = currentCategory === 'all' || post.category === currentCategory;
            const matchSearch = !searchQuery ||
                post.title.toLowerCase().includes(searchQuery) ||
                post.excerpt.toLowerCase().includes(searchQuery) ||
                post.category.toLowerCase().includes(searchQuery);
            return matchCategory && matchSearch;
        });
    }

    function getFeaturedPost() {
        const featured = POSTS.find(function (p) { return p.featured; });
        return featured || POSTS[0];
    }

    function renderPostCard(post) {
        var href = 'post.html?id=' + encodeURIComponent(post.id) + '&slug=' + encodeURIComponent(post.slug);
        var imgUrl = post.image || getPostImageUrl(post.slug);
        var imgAlt = post.imageAlt || post.title;
        var imageHtml = '<div class="post-card-image-wrap">' +
            '<img class="post-card-image" src="' + escapeHtml(imgUrl) + '" alt="' + escapeHtml(imgAlt) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
            '</div>';

        var views = getViews(post.id);
        var likes = getLikes(post.id);
        var commentsCount = getCommentsCount(post.id);
        var liked = hasLiked(post.id);
        var likeIcon = liked ? 'bi-heart-fill text-danger' : 'bi-heart';
        var stats = '<div class="post-card-stats d-flex align-items-center flex-wrap gap-3 mt-2 pt-2 border-top">' +
            '<span class="post-stat small text-muted"><i class="bi bi-eye me-1"></i><span class="post-views">' + views + '</span> views</span>' +
            '<button type="button" class="btn btn-like btn-sm border-0 bg-transparent text-muted p-0 small" data-post-id="' + post.id + '" aria-label="Like"><i class="bi ' + likeIcon + ' me-1"></i><span class="post-likes">' + likes + '</span> likes</button>' +
            '<a href="' + href + '#comments" class="post-stat small text-muted text-decoration-none"><i class="bi bi-chat-dots me-1"></i><span class="post-comments-count">' + commentsCount + '</span> comments</a>' +
            '</div>';

        return (
            '<div class="col-12 col-md-6" role="listitem">' +
            '<article class="card h-100 border post-card overflow-hidden" data-category="' + escapeHtml(post.category) + '" data-post-id="' + post.id + '">' +
            '<a href="' + href + '" class="post-card-link text-decoration-none text-dark">' +
            imageHtml +
            '<div class="card-body">' +
            '<p class="card-text small text-uppercase text-muted letter-spacing mb-1">' + escapeHtml(post.category) + ' · ' + formatDate(post.date) + '</p>' +
            '<h3 class="card-title h5 post-card-title">' + escapeHtml(post.title) + '</h3>' +
            '<p class="card-text text-muted small post-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
            '</div>' +
            '</a>' +
            '<div class="card-footer bg-transparent border-0 pt-0 px-3 pb-3">' + stats + '</div>' +
            '</article>' +
            '</div>'
        );
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderPosts() {
        const filtered = getFilteredPosts();
        const toShow = filtered.slice(0, visibleCount);

        postsContainer.innerHTML = toShow.map(renderPostCard).join('');
        if (postsEmpty) postsEmpty.classList.toggle('d-none', toShow.length > 0);

        const hasMore = toShow.length < filtered.length;
        if (loadMoreBtn) {
            loadMoreBtn.classList.toggle('d-none', !hasMore);
            loadMoreBtn.textContent = hasMore ? 'Load more' : (filtered.length ? "That's all" : '');
        }
    }

    function updateHero() {
        var featured = getFeaturedPost();
        var heroLink = 'post.html?id=' + encodeURIComponent(featured.id) + '&slug=' + encodeURIComponent(featured.slug);
        var heroImgUrl = featured.image || getPostImageUrl(featured.slug);
        if (heroTitle) heroTitle.textContent = featured.title;
        if (heroExcerpt) heroExcerpt.textContent = featured.excerpt;
        if (heroCta) heroCta.href = heroLink;
        var heroCtaImage = document.getElementById('heroCtaImage');
        var heroImage = document.getElementById('heroImage');
        if (heroCtaImage) heroCtaImage.href = heroLink;
        if (heroImage) {
            heroImage.src = heroImgUrl;
            heroImage.alt = featured.imageAlt || featured.title;
        }
    }

    function renderPopular() {
        if (!popularList) return;
        const top = POSTS.slice(0, 4);
        popularList.innerHTML = top.map(function (post) {
            var href = 'post.html?id=' + encodeURIComponent(post.id) + '&slug=' + encodeURIComponent(post.slug);
            return '<li><a href="' + href + '" class="popular-item d-block py-2 border-bottom text-dark text-decoration-none small">' + escapeHtml(post.title) + '</a></li>';
        }).join('');
    }

    function setupFilters() {
        document.querySelectorAll('.btn-filter').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.btn-filter').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-category') || 'all';
                visibleCount = POSTS_PER_PAGE;
                renderPosts();
            });
        });

        document.querySelectorAll('.category-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var cat = link.getAttribute('data-category');
                var filterBtn = document.querySelector('.btn-filter[data-category="' + cat + '"]');
                if (filterBtn) filterBtn.click();
            });
        });
    }

    function setupSearch() {
        if (!searchInput) return;
        var debounce;
        searchInput.addEventListener('input', function () {
            clearTimeout(debounce);
            debounce = setTimeout(function () {
                searchQuery = searchInput.value.trim().toLowerCase();
                visibleCount = POSTS_PER_PAGE;
                renderPosts();
            }, 200);
        });
    }

    function setupLoadMore() {
        if (!loadMoreBtn) return;
        loadMoreBtn.addEventListener('click', function () {
            visibleCount += POSTS_PER_PAGE;
            renderPosts();
        });
    }

    function setupNewsletter() {
        function handleSubmit(form, successEl) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var email = form.querySelector('input[type="email"]');
                if (!email || !email.value.trim()) return;
                // Simulate submit
                if (successEl) {
                    successEl.classList.remove('d-none');
                    form.reset();
                }
                var modal = bootstrap.Modal.getInstance(form.closest('.modal'));
                if (modal) modal.hide();
            });
        }

        var sidebarForm = document.getElementById('sidebarNewsletterForm');
        var modalForm = document.getElementById('modalNewsletterForm');
        var successEl = document.getElementById('newsletterSuccess');

        if (sidebarForm) handleSubmit(sidebarForm, successEl);
        if (modalForm) handleSubmit(modalForm, null);
    }

    function setupReveal() {
        var reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
        reveals.forEach(function (el) { observer.observe(el); });
    }

    function setupLikeButtons() {
        if (!postsContainer) return;
        postsContainer.addEventListener('click', function (e) {
            var btn = e.target.closest('.btn-like');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            var postId = btn.getAttribute('data-post-id');
            if (!postId) return;
            toggleLike(postId);
            var card = btn.closest('.post-card');
            if (card) {
                var likes = getLikes(postId);
                var liked = hasLiked(postId);
                var likesEls = card.querySelectorAll('.post-likes');
                var iconEl = btn.querySelector('i.bi');
                likesEls.forEach(function (el) { el.textContent = likes; });
                if (iconEl) {
                    iconEl.className = 'bi me-1 ' + (liked ? 'bi-heart-fill text-danger' : 'bi-heart');
                }
            }
        });
    }

    function init() {
        updateHero();
        renderPosts();
        renderPopular();
        setupFilters();
        setupSearch();
        setupLoadMore();
        setupNewsletter();
        setupLikeButtons();
        setupReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
