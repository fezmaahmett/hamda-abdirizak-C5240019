// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const searchForm = document.getElementById('search-form');
    const searchResults = document.getElementById('search-results');
    const playlistContainer = document.getElementById('playlist-container');
    const playlistCount = document.getElementById('playlist-count');
    const audioElement = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const currentSongInfo = document.getElementById('current-song-info');
    const editModal = document.getElementById('edit-modal');
    const shareModal = document.getElementById('share-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const editSongForm = document.getElementById('edit-song-form');
    const sharePlaylistBtn = document.getElementById('share-playlist-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const shareLinkInput = document.getElementById('share-link');
    const copyMessage = document.getElementById('copy-message');
    
    // State variables
    let playlist = JSON.parse(localStorage.getItem('musicPlaylist')) || [];
    let currentSongIndex = -1;
    let isPlaying = false;
    let editIndex = -1;
    
    // Initialize the application
    renderPlaylist();
    setupEventListeners();
    
    // Set up all event listeners
    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                
                // Update active navigation link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show selected page
                pages.forEach(page => page.classList.remove('active'));
                document.getElementById(`${targetPage}-page`).classList.add('active');
            });
        });
        
        // Search form submission
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('search-query').value.trim();
            if (query.length >= 2) {
                searchSongs(query);
            } else {
                alert('Please enter at least 2 characters to search');
            }
        });
        
        // Audio element events
        audioElement.addEventListener('timeupdate', updateProgress);
        audioElement.addEventListener('ended', playNextSong);
        audioElement.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(audioElement.duration);
        });
        
        // Player controls
        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', playPrevSong);
        nextBtn.addEventListener('click', playNextSong);
        
        // Progress bar click
        progressBar.addEventListener('click', (e) => {
            const width = progressBar.clientWidth;
            const clickX = e.offsetX;
            const duration = audioElement.duration;
            audioElement.currentTime = (clickX / width) * duration;
        });
        
        // Modal close buttons
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                editModal.style.display = 'none';
                shareModal.style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === editModal) editModal.style.display = 'none';
            if (e.target === shareModal) shareModal.style.display = 'none';
        });
        
        // Edit song form submission
        editSongForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateEditForm()) {
                const updatedSong = {
                    title: document.getElementById('edit-title').value.trim(),
                    artist: document.getElementById('edit-artist').value.trim(),
                    album: document.getElementById('edit-album').value.trim() || 'Unknown Album',
                    duration: document.getElementById('edit-duration').value.trim(),
                    audioUrl: document.getElementById('edit-audio-url').value.trim()
                };
                
                playlist[editIndex] = updatedSong;
                savePlaylist();
                renderPlaylist();
                editModal.style.display = 'none';
            }
        });
        
        // Cancel edit
        document.getElementById('cancel-edit').addEventListener('click', () => {
            editModal.style.display = 'none';
        });
        
        // Share playlist button
        sharePlaylistBtn.addEventListener('click', () => {
            const playlistData = btoa(JSON.stringify(playlist));
            const shareUrl = `${window.location.origin}${window.location.pathname}?playlist=${playlistData}`;
            shareLinkInput.value = shareUrl;
            shareModal.style.display = 'block';
        });
        
        // Copy share link
        copyLinkBtn.addEventListener('click', () => {
            shareLinkInput.select();
            document.execCommand('copy');
            copyMessage.textContent = 'Link copied to clipboard!';
            copyMessage.style.color = '#28a745';
            
            setTimeout(() => {
                copyMessage.textContent = '';
            }, 3000);
        });
        
        // Load shared playlist if URL parameter exists
        const urlParams = new URLSearchParams(window.location.search);
        const sharedPlaylist = urlParams.get('playlist');
        if (sharedPlaylist && playlist.length === 0) {
            try {
                const decodedPlaylist = JSON.parse(atob(sharedPlaylist));
                if (Array.isArray(decodedPlaylist)) {
                    playlist = decodedPlaylist;
                    savePlaylist();
                    renderPlaylist();
                    
                    // Show notification
                    setTimeout(() => {
                        alert('Shared playlist loaded successfully!');
                    }, 500);
                }
            } catch (e) {
                console.error('Error loading shared playlist:', e);
            }
        }
    }
    
    // Search for songs (mock API implementation)
    function searchSongs(query) {
        // Show loading state
        searchResults.innerHTML = '<p class="loading">Searching for songs...</p>';
        
        // Mock API delay
        setTimeout(() => {
            // Mock song data - in a real app, this would come from an API
            const mockSongs = [
                {
                    title: "Blinding Lights",
                    artist: "The Weeknd",
                    album: "After Hours",
                    duration: "3:20",
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                },
                {
                    title: "Dance Monkey",
                    artist: "Tones and I",
                    album: "The Kids Are Coming",
                    duration: "3:29",
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
                },
                {
                    title: "Watermelon Sugar",
                    artist: "Harry Styles",
                    album: "Fine Line",
                    duration: "2:54",
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
                },
                {
                    title: "Mood",
                    artist: "24kGoldn ft. Iann Dior",
                    album: "El Dorado",
                    duration: "2:21",
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
                },
                {
                    title: "Levitating",
                    artist: "Dua Lipa ft. DaBaby",
                    album: "Future Nostalgia",
                    duration: "3:23",
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
                },
                {
                    title: "Save Your Tears",
                    artist: "The Weeknd",
                    album: "After Hours",
                    duration: "3:35",
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
                }
            ];
            
            // Filter mock songs based on query (case-insensitive)
            const results = mockSongs.filter(song => 
                song.title.toLowerCase().includes(query.toLowerCase()) || 
                song.artist.toLowerCase().includes(query.toLowerCase()) ||
                song.album.toLowerCase().includes(query.toLowerCase())
            );
            
            displaySearchResults(results, query);
        }, 800);
    }
    
    // Display search results
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = `<p>No songs found for "${query}". Try another search term.</p>`;
            return;
        }
        
        let resultsHTML = `<h3>Results for "${query}":</h3>`;
        
        results.forEach((song, index) => {
            resultsHTML += `
                <div class="song-card">
                    <h4>${song.title}</h4>
                    <p>Artist: ${song.artist}</p>
                    <p>Album: ${song.album}</p>
                    <p class="duration">Duration: ${song.duration}</p>
                    <button class="add-to-playlist" data-index="${index}">
                        + Add to Playlist
                    </button>
                </div>
            `;
        });
        
        searchResults.innerHTML = resultsHTML;
        
        // Add event listeners to "Add to Playlist" buttons
        document.querySelectorAll('.add-to-playlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                addToPlaylist(results[index]);
                
                // Visual feedback
                e.target.textContent = "✓ Added!";
                e.target.disabled = true;
                setTimeout(() => {
                    e.target.textContent = "+ Add to Playlist";
                    e.target.disabled = false;
                }, 1500);
            });
            
            // Add hover effects
            button.addEventListener('mouseover', () => {
                button.style.transform = 'scale(1.05)';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.transform = 'scale(1)';
            });
        });
    }
    
    // Add song to playlist
    function addToPlaylist(song) {
        // Check if song already exists in playlist
        const exists = playlist.some(s => 
            s.title.toLowerCase() === song.title.toLowerCase() && 
            s.artist.toLowerCase() === song.artist.toLowerCase()
        );
        
        if (exists) {
            alert('This song is already in your playlist!');
            return;
        }
        
        playlist.push({...song});
        savePlaylist();
        renderPlaylist();
        
        // Show success message
        showTemporaryMessage(`"${song.title}" added to your playlist!`, 'success');
    }
    
    // Render the playlist
    function renderPlaylist() {
        // Update playlist count
        playlistCount.textContent = `(${playlist.length})`;
        
        // Clear current playlist display
        playlistContainer.innerHTML = '';
        
        // Show empty state if playlist is empty
        if (playlist.length === 0) {
            playlistContainer.innerHTML = `
                <div class="empty-playlist">
                    <p>Your playlist is empty. Search for songs above to add them!</p>
                    <div class="empty-icon">♫</div>
                </div>
            `;
            return;
        }
        
        // Create playlist items
        playlist.forEach((song, index) => {
            const isActive = index === currentSongIndex ? 'active' : '';
            const itemHTML = `
                <div class="playlist-item ${isActive}" data-index="${index}">
                    <div class="playlist-item-info">
                        <h4>${song.title}</h4>
                        <p>${song.artist} • ${song.album} • ${song.duration}</p>
                    </div>
                    <div class="playlist-item-controls">
                        <button class="playlist-btn edit-btn" data-index="${index}" title="Edit song">✎</button>
                        <button class="playlist-btn delete-btn" data-index="${index}" title="Delete song">🗑️</button>
                    </div>
                </div>
            `;
            playlistContainer.innerHTML += itemHTML;
        });
        
        // Add event listeners to playlist items
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.playlist-btn')) {
                    const index = parseInt(item.getAttribute('data-index'));
                    playSong(index);
                }
            });
            
            // Add hover effects
            item.addEventListener('mouseover', () => {
                item.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
            });
            
            item.addEventListener('mouseout', () => {
                item.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.08)';
            });
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(button.getAttribute('data-index'));
                openEditModal(index);
            });
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(button.getAttribute('data-index'));
                deleteSong(index);
            });
        });
    }
    
    // Open edit modal with song data
    function openEditModal(index) {
        editIndex = index;
        const song = playlist[index];
        
        document.getElementById('edit-title').value = song.title;
        document.getElementById('edit-artist').value = song.artist;
        document.getElementById('edit-album').value = song.album;
        document.getElementById('edit-duration').value = song.duration;
        document.getElementById('edit-audio-url').value = song.audioUrl;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        editModal.style.display = 'block';
    }
    
    // Validate edit form
    function validateEditForm() {
        let isValid = true;
        
        // Title validation
        const title = document.getElementById('edit-title').value.trim();
        if (title.length < 2) {
            document.getElementById('title-error').textContent = 'Title must be at least 2 characters';
            isValid = false;
        } else {
            document.getElementById('title-error').textContent = '';
        }
        
        // Artist validation
        const artist = document.getElementById('edit-artist').value.trim();
        if (artist.length < 2) {
            document.getElementById('artist-error').textContent = 'Artist must be at least 2 characters';
            isValid = false;
        } else {
            document.getElementById('artist-error').textContent = '';
        }
        
        // Duration validation (MM:SS format)
        const duration = document.getElementById('edit-duration').value.trim();
        const durationRegex = /^\d{1,2}:\d{2}$/;
        if (!durationRegex.test(duration)) {
            document.getElementById('duration-error').textContent = 'Duration must be in MM:SS format';
            isValid = false;
        } else {
            document.getElementById('duration-error').textContent = '';
        }
        
        // URL validation
        const audioUrl = document.getElementById('edit-audio-url').value.trim();
        try {
            new URL(audioUrl);
            document.getElementById('url-error').textContent = '';
        } catch (e) {
            document.getElementById('url-error').textContent = 'Enter a valid URL (must start with http:// or https://)';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Delete song from playlist
    function deleteSong(index) {
        const songTitle = playlist[index].title;
        if (confirm(`Are you sure you want to delete "${songTitle}" from your playlist?`)) {
            // If deleting the currently playing song, stop playback
            if (index === currentSongIndex) {
                audioElement.pause();
                currentSongIndex = -1;
                currentSongInfo.textContent = 'No song selected';
                playPauseBtn.textContent = '▶';
                isPlaying = false;
            } else if (currentSongIndex > index) {
                // Adjust current index if deleting a song before the current one
                currentSongIndex--;
            }
            
            // Remove song from playlist
            playlist.splice(index, 1);
            savePlaylist();
            renderPlaylist();
            
            // Show success message
            showTemporaryMessage(`"${songTitle}" removed from your playlist!`, 'success');
        }
    }
    
    // Play song at specific index
    function playSong(index) {
        if (playlist.length === 0) return;
        
        // Ensure index is within bounds
        if (index < 0) index = playlist.length - 1;
        if (index >= playlist.length) index = 0;
        
        currentSongIndex = index;
        const song = playlist[index];
        
        // Update audio element
        audioElement.src = song.audioUrl;
        audioElement.load();
        audioElement.play();
        
        // Update UI
        currentSongInfo.textContent = `${song.title} by ${song.artist} • ${song.album}`;
        playPauseBtn.textContent = '⏸';
        isPlaying = true;
        
        // Update active playlist item
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Show success message
        showTemporaryMessage(`Now playing: "${song.title}"`, 'info');
    }
    
    // Toggle play/pause
    function togglePlayPause() {
        if (playlist.length === 0) {
            alert('Your playlist is empty! Add some songs first.');
            return;
        }
        
        if (currentSongIndex === -1) {
            // Start playing the first song if none is selected
            playSong(0);
            return;
        }
        
        if (isPlaying) {
            audioElement.pause();
            playPauseBtn.textContent = '▶';
            isPlaying = false;
        } else {
            audioElement.play();
            playPauseBtn.textContent = '⏸';
            isPlaying = true;
        }
    }
    
    // Play previous song
    function playPrevSong() {
        if (playlist.length === 0) return;
        
        let newIndex = currentSongIndex - 1;
        if (newIndex < 0) newIndex = playlist.length - 1;
        
        playSong(newIndex);
    }
    
    // Play next song
    function playNextSong() {
        if (playlist.length === 0) return;
        
        let newIndex = currentSongIndex + 1;
        if (newIndex >= playlist.length) newIndex = 0;
        
        playSong(newIndex);
    }
    
    // Update progress bar
    function updateProgress() {
        const width = progressBar.clientWidth;
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration || 1; // Avoid division by zero
        
        // Update progress bar
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        
        // Update time display
        currentTimeEl.textContent = formatTime(currentTime);
        
        // Reset duration if not loaded
        if (!durationEl.textContent || durationEl.textContent === '0:00') {
            durationEl.textContent = formatTime(duration);
        }
    }
    
    // Format time in MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Save playlist to localStorage
    function savePlaylist() {
        localStorage.setItem('musicPlaylist', JSON.stringify(playlist));
    }
    
    // Show temporary message
    function showTemporaryMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '20px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '12px 20px';
        messageEl.style.borderRadius = '8px';
        messageEl.style.color = 'white';
        messageEl.style.fontWeight = '500';
        messageEl.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        messageEl.style.zIndex = '3000';
        messageEl.style.animation = 'fadeInOut 3s forwards';
        
        // Set color based on type
        switch(type) {
            case 'success':
                messageEl.style.background = 'linear-gradient(to right, #28a745, #20c997)';
                break;
            case 'error':
                messageEl.style.background = 'linear-gradient(to right, #dc3545, #fd7e14)';
                break;
            default:
                messageEl.style.background = 'linear-gradient(to right, #17a2b8, #007bff)';
        }
        
        // Add to body
        document.body.appendChild(messageEl);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 3000);
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            togglePlayPause();
        } else if (e.code === 'ArrowLeft') {
            playPrevSong();
        } else if (e.code === 'ArrowRight') {
            playNextSong();
        }
    });
    
    // Add form validation for edit modal
    document.getElementById('edit-title').addEventListener('input', () => {
        const title = document.getElementById('edit-title').value.trim();
        if (title.length >= 2) {
            document.getElementById('title-error').textContent = '';
        }
    });
    
    document.getElementById('edit-artist').addEventListener('input', () => {
        const artist = document.getElementById('edit-artist').value.trim();
        if (artist.length >= 2) {
            document.getElementById('artist-error').textContent = '';
        }
    });
    
    document.getElementById('edit-duration').addEventListener('input', () => {
        const duration = document.getElementById('edit-duration').value.trim();
        const durationRegex = /^\d{1,2}:\d{2}$/;
        if (durationRegex.test(duration)) {
            document.getElementById('duration-error').textContent = '';
        }
    });
    
    document.getElementById('edit-audio-url').addEventListener('input', () => {
        const audioUrl = document.getElementById('edit-audio-url').value.trim();
        try {
            new URL(audioUrl);
            document.getElementById('url-error').textContent = '';
        } catch (e) {
            // Don't show error until submit
        }
    });
    
    // Add mouseover/mouseout effects to player controls
    [playPauseBtn, prevBtn, nextBtn].forEach(btn => {
        btn.addEventListener('mouseover', () => {
            btn.style.transform = 'scale(1.15)';
        });
        
        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'scale(1)';
        });
    });
    
    // Add mouseover/mouseout effects to share button
    sharePlaylistBtn.addEventListener('mouseover', () => {
        sharePlaylistBtn.style.transform = 'translateY(-2px) scale(1.05)';
        sharePlaylistBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    });
    
    sharePlaylistBtn.addEventListener('mouseout', () => {
        sharePlaylistBtn.style.transform = 'translateY(0) scale(1)';
        sharePlaylistBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });
});