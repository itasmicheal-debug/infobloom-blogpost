/**
 * InfoBloom — Single post page
 */

(function () {
    'use strict';

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
    function incrementViews(postId) {
        postId = String(postId);
        var o = getStorage(STORAGE_VIEWS);
        o[postId] = (o[postId] || 0) + 1;
        setStorage(STORAGE_VIEWS, o);
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
    function getComments(postId) {
        var o = getStorage(STORAGE_COMMENTS);
        var arr = o[postId];
        return Array.isArray(arr) ? arr : [];
    }
    function addComment(postId, author, text) {
        postId = String(postId);
        var o = getStorage(STORAGE_COMMENTS);
        if (!Array.isArray(o[postId])) o[postId] = [];
        o[postId].push({
            id: Date.now(),
            author: String(author).trim(),
            text: String(text).trim(),
            date: new Date().toISOString()
        });
        setStorage(STORAGE_COMMENTS, o);
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getPostImageUrl(slug) {
        return 'https://picsum.photos/seed/' + encodeURIComponent(slug) + '/800/400';
    }

    var IMG_HUMAN_READING = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop';
    var IMG_LAPTOP_CODE = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop';

    var POSTS = [
        { id: 1, title: 'The art of slow reading in a fast world', category: 'life', date: '2025-03-08', slug: 'slow-reading', image: IMG_HUMAN_READING, imageAlt: 'Person reading a book',
            body: '<p>We scroll, we skim, we move on. But there’s something powerful about slowing down and reading one thing deeply.</p><p>Slow reading isn’t about speed—it’s about attention. When you give a book or an article your full focus, you remember more, think more critically, and often enjoy the experience more.</p><h2>How to start</h2><p>Pick one piece of content per day to read without distractions. Put your phone away. Set a timer if you like. The goal isn’t to finish quickly; it’s to engage fully.</p><p>Over time, this habit can improve your focus in other areas of life too.</p>' },
        { id: 2, title: 'Design systems that scale', category: 'design', date: '2025-03-05', slug: 'design-systems-scale', image: getPostImageUrl('design-systems'), imageAlt: 'Design workspace',
            body: '<p>A design system is only as good as its adoption. Here’s how to build one that teams actually use.</p><p>Start with the problems you have today: inconsistent buttons, unclear spacing, duplicate components. Document decisions as you go. Use real code and real examples.</p><h2>Keep it alive</h2><p>Treat the system as a product. Have clear ownership, feedback channels, and regular updates. When it’s easier to use the system than to build from scratch, adoption follows.</p>' },
        { id: 3, title: 'Getting started with modern JavaScript tooling', category: 'tech', date: '2025-03-02', slug: 'modern-js-tooling', image: IMG_LAPTOP_CODE, imageAlt: 'Laptop showing code on screen',
            body: '<p>Vite, ES modules, and type checking have made front-end tooling simpler. You can get a fast, typed setup without a huge config.</p><p>Start with Vite for a new project—it gives you instant HMR and sensible defaults. Add TypeScript via <code>npm create vite@latest</code> and the TypeScript template.</p><h2>Minimal config</h2><p>Resist the urge to add every plugin. Get the app running, then add tooling when you hit a real need. Less config means fewer surprises and easier upgrades.</p>' },
        { id: 4, title: 'Minimalism in UI: when less is more', category: 'design', date: '2025-02-28', slug: 'minimalism-ui', image: getPostImageUrl('minimalism-ui'), imageAlt: 'Minimal design',
            body: '<p>Removing elements can feel risky, but often it improves clarity and conversion. Users don’t need every option at once.</p><p>Focus on one primary action per screen when you can. Use progressive disclosure for secondary actions. Test with real users to see what they miss—and what they don’t.</p><h2>Constraints help</h2><p>Limiting choices can reduce cognitive load and guide users to the outcome you want. Minimalism isn’t about being bare; it’s about being intentional.</p>' },
        { id: 5, title: 'Building habits that stick', category: 'life', date: '2025-02-25', slug: 'habits-that-stick', image: getPostImageUrl('habits'), imageAlt: 'Growth and habits',
            body: '<p>Big goals often fail because they rely on motivation. Habits work when they’re small, specific, and tied to your environment.</p><p>Start with one tiny behavior: “After I pour coffee, I will read one page.” Stack it onto something you already do. Make it so small that skipping it feels silly.</p><h2>Environment design</h2><p>Make the right action easy and the wrong one harder. Put the book on the table. Remove distractions from your workspace. Your surroundings shape your behavior more than willpower.</p>' },
        { id: 6, title: 'API design best practices in 2025', category: 'tech', date: '2025-02-20', slug: 'api-design-2025', image: getPostImageUrl('api-design'), imageAlt: 'Developer and API',
            body: '<p>Good APIs are consistent, versioned, and documented. They also feel predictable to the developers who use them.</p><p>Use REST conventions when they fit: nouns for resources, HTTP methods for actions. Version in the URL or header and stick to one strategy. Return clear error payloads with codes and messages.</p><h2>Developer experience</h2><p>Provide examples, SDKs, and a sandbox. The time you spend on docs and tooling pays off in adoption and support. Treat your API as a product.</p>' }
    ];

    function formatDate(iso) {
        var d = new Date(iso);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function getPost() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        var slug = params.get('slug');
        if (id) {
            var num = parseInt(id, 10);
            return POSTS.find(function (p) { return p.id === num; });
        }
        if (slug) return POSTS.find(function (p) { return p.slug === slug; });
        return POSTS[0];
    }

    function formatCommentDate(iso) {
        var d = new Date(iso);
        var now = new Date();
        var diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' hr ago';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function renderComments(postId) {
        var list = document.getElementById('commentsList');
        var headingCount = document.getElementById('commentsHeadingCount');
        var postCountEl = document.getElementById('postCommentsCount');
        if (!list) return;
        var comments = getComments(postId);
        if (headingCount) headingCount.textContent = comments.length;
        if (postCountEl) postCountEl.textContent = comments.length;
        list.innerHTML = comments.length === 0
            ? '<li class="text-muted small">No comments yet. Be the first to comment.</li>'
            : comments.map(function (c) {
                return '<li class="comment-item mb-3 pb-3 border-bottom">' +
                    '<p class="mb-1"><strong class="small">' + escapeHtml(c.author) + '</strong> <span class="small text-muted">' + formatCommentDate(c.date) + '</span></p>' +
                    '<p class="small text-muted mb-0">' + escapeHtml(c.text) + '</p></li>';
            }).join('');
    }

    function init() {
        var post = getPost();
        if (!post) {
            document.getElementById('postTitle').textContent = 'Post not found';
            document.getElementById('postContent').innerHTML = '<p><a href="index.html">Back to home</a></p>';
            return;
        }

        var postId = post.id;
        incrementViews(postId);

        document.title = post.title + ' — InfoBloom';
        document.getElementById('postMeta').textContent = post.category;
        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postDate').textContent = formatDate(post.date);
        document.getElementById('postContent').innerHTML = post.body;

        var imgWrap = document.getElementById('postImageWrap');
        var imgEl = document.getElementById('postImage');
        var imgUrl = post.image || getPostImageUrl(post.slug);
        if (imgWrap && imgEl) {
            imgEl.src = imgUrl;
            imgEl.alt = post.imageAlt || post.title;
            imgWrap.style.display = 'block';
        }

        var views = getViews(postId);
        var likes = getLikes(postId);
        var liked = hasLiked(postId);
        var postViewsEl = document.getElementById('postViews');
        var postLikesEl = document.getElementById('postLikes');
        var postLikeBtn = document.getElementById('postLikeBtn');
        var postLikeIcon = document.getElementById('postLikeIcon');
        if (postViewsEl) postViewsEl.textContent = views;
        if (postLikesEl) postLikesEl.textContent = likes;
        if (postLikeIcon) postLikeIcon.className = 'bi me-1 ' + (liked ? 'bi-heart-fill text-danger' : 'bi-heart');

        if (postLikeBtn) {
            postLikeBtn.addEventListener('click', function () {
                toggleLike(postId);
                var newLikes = getLikes(postId);
                var newLiked = hasLiked(postId);
                if (postLikesEl) postLikesEl.textContent = newLikes;
                if (postLikeIcon) postLikeIcon.className = 'bi me-1 ' + (newLiked ? 'bi-heart-fill text-danger' : 'bi-heart');
            });
        }

        renderComments(postId);

        var form = document.getElementById('commentForm');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var author = document.getElementById('commentAuthor');
                var text = document.getElementById('commentText');
                if (!author || !text || !author.value.trim() || !text.value.trim()) return;
                addComment(postId, author.value.trim(), text.value.trim());
                author.value = '';
                text.value = '';
                renderComments(postId);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
