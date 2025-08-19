document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const authSection = document.getElementById('auth-section');
    const forumContent = document.getElementById('forum-content');
    const userDisplay = document.getElementById('user-display');
    const postInput = document.getElementById('post-input');
    const postButton = document.getElementById('post-button');
    const postsContainer = document.getElementById('posts-container');

    // Функція для збереження повідомлень в localStorage
    const savePosts = (posts) => {
        try {
            localStorage.setItem('forumPosts', JSON.stringify(posts));
        } catch (e) {
            console.error("Не вдалося зберегти дані в Local Storage:", e);
        }
    };

    // Функція для завантаження повідомлень з localStorage
    const loadPosts = () => {
        try {
            const postsString = localStorage.getItem('forumPosts');
            return postsString ? JSON.parse(postsString) : [];
        } catch (e) {
            console.error("Не вдалося завантажити дані з Local Storage:", e);
            return [];
        }
    };

    // Функція для відображення інтерфейсу в залежності від статусу входу
    const updateUI = () => {
        const username = localStorage.getItem('forumUsername');
        if (username) {
            authSection.style.display = 'none';
            forumContent.style.display = 'block';
            userDisplay.textContent = `Ви увійшли як: ${username}`;
            renderPosts();
        } else {
            authSection.style.display = 'flex';
            forumContent.style.display = 'none';
        }
    };

    // Функція для створення HTML-елемента повідомлення
    const createPostElement = (post, isReply = false) => {
        const postDiv = document.createElement('div');
        postDiv.className = isReply ? 'reply' : 'post';
        postDiv.innerHTML = `
            <p class="post-author">${isReply ? 'Відповідь від' : 'Автор'}: ${post.author}</p>
            <p class="post-text">${post.text}</p>
            ${!isReply ? `<button class="reply-button">Відповісти</button>` : ''}
            ${!isReply && post.replies ? `<div class="replies-container"></div>` : ''}
        `;

        // Обробник для кнопки "Відповісти"
        if (!isReply) {
            const replyButton = postDiv.querySelector('.reply-button');
            replyButton.addEventListener('click', () => {
                const replyText = prompt('Введіть вашу відповідь:');
                if (replyText) {
                    addReply(post.id, { author: localStorage.getItem('forumUsername'), text: replyText });
                }
            });

            // Відображення існуючих відповідей
            if (post.replies && post.replies.length > 0) {
                const repliesContainer = postDiv.querySelector('.replies-container');
                post.replies.forEach(reply => {
                    const replyElement = createPostElement(reply, true);
                    repliesContainer.appendChild(replyElement);
                });
            }
        }
        return postDiv;
    };

    // Функція для відображення всіх повідомлень
    const renderPosts = () => {
        const posts = loadPosts();
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    };

    // Функція для додавання нового повідомлення
    const addPost = (text) => {
        const posts = loadPosts();
        const newPost = {
            id: Date.now(),
            author: localStorage.getItem('forumUsername'),
            text: text,
            replies: []
        };
        posts.unshift(newPost);
        savePosts(posts);
        renderPosts();
        postInput.value = '';
    };

    // Функція для додавання відповіді
    const addReply = (postId, reply) => {
        const posts = loadPosts();
        const postToUpdate = posts.find(p => p.id === postId);
        if (postToUpdate) {
            postToUpdate.replies.push(reply);
            savePosts(posts);
            renderPosts();
        }
    };

    // Обробники подій
    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('forumUsername', username);
            updateUI();
        } else {
            alert("Будь ласка, введіть ім'я користувача.");
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('forumUsername');
        updateUI();
    });

    postButton.addEventListener('click', () => {
        const text = postInput.value.trim();
        if (text) {
            addPost(text);
        }
    });

    // Оновлюємо інтерфейс при завантаженні сторінки
    updateUI();
});