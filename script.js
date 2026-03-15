// Emotion Symphony - Main Application
class EmotionSymphony {
    constructor() {
        // DOM Elements
        this.visualizer = document.getElementById('visualizer');
        this.ctx = this.visualizer.getContext('2d');
        this.energySlider = document.getElementById('energy');
        this.happinessSlider = document.getElementById('happiness');
        this.calmnessSlider = document.getElementById('calmness');
        this.energyValue = document.getElementById('energyValue');
        this.happinessValue = document.getElementById('happinessValue');
        this.calmnessValue = document.getElementById('calmnessValue');
        this.playButton = document.getElementById('playButton');
        this.stopButton = document.getElementById('stopButton');
        this.saveButton = document.getElementById('saveButton');
        this.compositionDisplay = document.getElementById('compositionDisplay');
        this.noteSequence = document.getElementById('noteSequence');
        this.timeline = document.getElementById('timeline');
        this.currentDateSpan = document.getElementById('currentDate');
        this.energyFill = document.getElementById('energyFill');
        this.happinessFill = document.getElementById('happinessFill');
        this.calmnessFill = document.getElementById('calmnessFill');
        this.shareModal = document.getElementById('shareModal');
        this.emotionalFingerprint = document.getElementById('emotionalFingerprint');
        this.copyShareLink = document.getElementById('copyShareLink');
        
        // Genre & Instrument Elements
        this.genreSelect = document.getElementById('genreSelect');
        this.instrumentSelect = document.getElementById('instrumentSelect');
        this.genreMood = document.getElementById('genreMood');
        
        // Duration Elements
        this.durationSelect = document.getElementById('durationSelect');
        this.minutesRemaining = document.getElementById('minutesRemaining');
        this.secondsRemaining = document.getElementById('secondsRemaining');
        this.progressBar = document.getElementById('progressBar');
        this.progressContainer = document.getElementById('progressContainer');
        this.timeRemaining = document.getElementById('timeRemaining');

        // Audio Properties
        this.synth = null;
        this.isPlaying = false;
        this.currentNotes = [];
        this.animationFrame = null;
        this.currentInstrument = 'piano';
        this.currentGenre = 'classical';
        
        // Timer Properties
        this.startTime = null;
        this.timerInterval = null;
        this.totalDuration = 300; // 5 minutes default
        this.elapsedTime = 0;
        this.melodyInterval = null;

        // Emotion History
        this.emotionHistory = this.loadHistory();
        
        // Initialize
        this.init();
    }

    init() {
        // Set current date
        this.updateCurrentDate();
        
        // Initialize Tone.js synth
        this.initSynth();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update slider displays
        this.updateSliderDisplays();
        
        // Start visualizer animation
        this.animateVisualizer();
        
        // Render history timeline
        this.renderTimeline();
        
        // Check for shared emotion in URL
        this.checkForSharedEmotion();
        
        // Update genre mood
        this.updateGenreMood();
        
        // Initialize duration display
        this.updateDurationDisplay();
    }

    initSynth() {
        // Create a polyphonic synthesizer
        this.updateInstrument(this.instrumentSelect.value);
    }

    updateInstrument(instrument) {
        const instruments = {
            piano: {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
            },
            guitar: {
                oscillator: { type: "sawtooth" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 }
            },
            strings: {
                oscillator: { type: "sine" },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 1.5 }
            },
            flute: {
                oscillator: { type: "sine" },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.4, release: 0.8 }
            },
            synth: {
                oscillator: { type: "sawtooth" },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 1.2 }
            },
            bell: {
                oscillator: { type: "sine" },
                envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.8 }
            },
            pad: {
                oscillator: { type: "sawtooth" },
                envelope: { attack: 0.5, decay: 0.3, sustain: 0.6, release: 2 }
            },
            bass: {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.5 }
            }
        };

        const settings = instruments[instrument] || instruments.piano;
        
        this.synth = new Tone.PolySynth(Tone.Synth, settings).toDestination();
        
        // Add effects based on genre
        this.updateGenreEffects(this.genreSelect.value);
    }

    updateGenreEffects(genre) {
        // Clear existing effects
        this.synth.disconnect();
        
        const reverb = new Tone.Reverb({
            decay: genre === 'ambient' ? 4 : genre === 'cinematic' ? 3 : 2,
            wet: genre === 'ambient' ? 0.6 : genre === 'cinematic' ? 0.4 : 0.3
        }).toDestination();
        
        const delay = new Tone.FeedbackDelay({
            delayTime: genre === 'jazz' ? '8n' : '4n',
            feedback: genre === 'electronic' ? 0.5 : 0.3,
            wet: genre === 'jazz' ? 0.3 : genre === 'electronic' ? 0.4 : 0.2
        }).toDestination();
        
        // Connect synth through effects
        this.synth.connect(reverb);
        this.synth.connect(delay);
        
        // Update visualizer class for genre-specific glow
        const visualizerContainer = this.visualizer.closest('.visualizer-container');
        if (visualizerContainer) {
            visualizerContainer.className = `visualizer-container ${genre}`;
        }
    }

    updateGenreMood() {
        const genre = this.genreSelect.value;
        const moods = {
            classical: { icon: '🎻', text: 'Elegant & Refined' },
            jazz: { icon: '🎷', text: 'Smooth & Improvised' },
            electronic: { icon: '🎛️', text: 'Energetic & Modern' },
            ambient: { icon: '🌊', text: 'Peaceful & Spacious' },
            cinematic: { icon: '🎬', text: 'Epic & Dramatic' }
        };
        
        const mood = moods[genre] || moods.classical;
        this.genreMood.innerHTML = `
            <span class="mood-icon">${mood.icon}</span>
            <span class="mood-text">${mood.text}</span>
        `;
        
        // Update class for styling
        this.genreMood.className = `genre-mood ${genre}`;
    }

    getGenreScales(genre) {
        const scales = {
            classical: {
                major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
                minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
                pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5']
            },
            jazz: {
                major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
                minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'D5'],
                blues: ['C4', 'Eb4', 'F4', 'F#4', 'G4', 'Bb4', 'C5']
            },
            electronic: {
                major: ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5'],
                minor: ['C3', 'Eb3', 'G3', 'C4', 'Eb4', 'G4', 'C5'],
                synth: ['C3', 'D3', 'F3', 'G3', 'A3', 'C4', 'D4', 'F4']
            },
            ambient: {
                major: ['C3', 'G3', 'C4', 'E4', 'G4', 'C5'],
                minor: ['C3', 'G3', 'C4', 'Eb4', 'G4', 'C5'],
                drone: ['C3', 'G3', 'C4', 'G4', 'C5']
            },
            cinematic: {
                major: ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5', 'E5'],
                minor: ['C3', 'Eb3', 'G3', 'C4', 'Eb4', 'G4', 'C5', 'Eb5'],
                epic: ['C3', 'G3', 'C4', 'G4', 'C5', 'E5', 'G5']
            }
        };
        
        return scales[genre] || scales.classical;
    }

    generateMelody(energy, happiness, calmness) {
        const genre = this.genreSelect.value;
        const scales = this.getGenreScales(genre);
        
        // Choose scale based on happiness and genre
        let scale;
        if (genre === 'jazz' && happiness > 70) {
            scale = scales.major;
        } else if (genre === 'jazz' && happiness < 30) {
            scale = scales.blues || scales.minor;
        } else if (genre === 'electronic') {
            scale = energy > 60 ? scales.synth : scales.major;
        } else if (genre === 'ambient') {
            scale = scales.drone || scales.major;
        } else if (genre === 'cinematic') {
            scale = energy > 70 ? scales.epic : scales.major;
        } else {
            scale = happiness > 60 ? scales.major : 
                   happiness < 30 ? scales.minor : scales.pentatonic || scales.major;
        }
        
        // Determine tempo based on energy and genre
        let tempo;
        switch(genre) {
            case 'jazz':
                tempo = 80 + (energy * 0.8);
                break;
            case 'electronic':
                tempo = 100 + (energy * 1.2);
                break;
            case 'ambient':
                tempo = 40 + (energy * 0.5);
                break;
            case 'cinematic':
                tempo = 60 + (energy * 1.0);
                break;
            default: // classical
                tempo = 60 + (energy * 1.2);
        }
        
        Tone.Transport.bpm.value = tempo;
        
        // Determine number of notes based on calmness and genre
        let numNotes;
        if (genre === 'jazz') {
            numNotes = Math.max(6, Math.min(16, Math.floor(calmness / 6)));
        } else if (genre === 'ambient') {
            numNotes = Math.max(3, Math.min(8, Math.floor(calmness / 12)));
        } else {
            numNotes = Math.max(4, Math.min(12, Math.floor(calmness / 8)));
        }
        
        // Generate notes with emotion-based variations
        const notes = [];
        
        for (let i = 0; i < numNotes; i++) {
            let noteIndex;
            
            // Create patterns based on genre
            if (genre === 'jazz' && i % 2 === 0) {
                noteIndex = (i * 2) % scale.length;
            } else if (genre === 'electronic') {
                noteIndex = i % 4;
            } else {
                noteIndex = Math.floor(Math.random() * scale.length);
            }
            
            let note = scale[noteIndex % scale.length];
            
            // Genre-specific variations
            if (genre === 'cinematic' && energy > 70 && Math.random() > 0.7) {
                note = note.replace('4', '5').replace('3', '4');
            }
            
            if (genre === 'jazz' && happiness < 40) {
                note += 'b';
            }
            
            if (genre === 'electronic' && Math.random() > 0.8) {
                note += '#';
            }
            
            notes.push(note);
        }
        
        return { notes, tempo };
    }

    setupEventListeners() {
        // Slider inputs
        this.energySlider.addEventListener('input', () => this.updateSliderDisplays());
        this.happinessSlider.addEventListener('input', () => this.updateSliderDisplays());
        this.calmnessSlider.addEventListener('input', () => this.updateSliderDisplays());
        
        // Genre & Instrument listeners
        this.genreSelect.addEventListener('change', () => {
            this.updateGenreMood();
            this.updateGenreEffects(this.genreSelect.value);
            if (this.isPlaying) {
                this.stopMusic();
            }
        });
        
        this.instrumentSelect.addEventListener('change', () => {
            this.updateInstrument(this.instrumentSelect.value);
            if (this.isPlaying) {
                this.stopMusic();
            }
        });
        
        // Duration change listener
        this.durationSelect.addEventListener('change', () => {
            this.updateDurationDisplay();
        });
        
        // Button clicks
        this.playButton.addEventListener('click', () => this.playEmotion());
        this.stopButton.addEventListener('click', () => this.stopMusic());
        this.saveButton.addEventListener('click', () => this.saveToday());
        
        // Share modal
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.shareModal.classList.remove('show');
            });
        }
        
        this.copyShareLink.addEventListener('click', () => this.copyShareableLink());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.shareModal) {
                this.shareModal.classList.remove('show');
            }
        });
    }

    updateSliderDisplays() {
        const energy = parseInt(this.energySlider.value);
        const happiness = parseInt(this.happinessSlider.value);
        const calmness = parseInt(this.calmnessSlider.value);
        
        // Update text values
        this.energyValue.textContent = `${energy}%`;
        this.happinessValue.textContent = `${happiness}%`;
        this.calmnessValue.textContent = `${calmness}%`;
        
        // Update indicator fills
        this.energyFill.style.width = `${energy}%`;
        this.happinessFill.style.width = `${happiness}%`;
        this.calmnessFill.style.width = `${calmness}%`;
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        this.currentDateSpan.textContent = now.toLocaleDateString('en-US', options);
    }

    // Update duration display
    updateDurationDisplay() {
        const totalSeconds = parseInt(this.durationSelect.value);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        this.minutesRemaining.textContent = minutes;
        this.secondsRemaining.textContent = seconds.toString().padStart(2, '0');
        this.totalDuration = totalSeconds;
        this.elapsedTime = 0;
        this.updateProgressBar();
    }

    // Update progress bar
    updateProgressBar() {
        const progress = (this.elapsedTime / this.totalDuration) * 100;
        this.progressBar.style.width = `${Math.min(progress, 100)}%`;
        
        // Update time display
        const remaining = this.totalDuration - this.elapsedTime;
        const minutes = Math.floor(remaining / 60);
        const seconds = Math.floor(remaining % 60);
        
        this.minutesRemaining.textContent = minutes;
        this.secondsRemaining.textContent = seconds.toString().padStart(2, '0');
        
        // Add warning classes based on time remaining
        this.timeRemaining.classList.remove('time-warning', 'time-critical');
        if (remaining <= 30 && remaining > 10) {
            this.timeRemaining.classList.add('time-warning');
        } else if (remaining <= 10) {
            this.timeRemaining.classList.add('time-critical');
        }
    }

    // Start timer
    startTimer() {
        this.startTime = Date.now() - (this.elapsedTime * 1000);
        
        this.timerInterval = setInterval(() => {
            if (!this.isPlaying) return;
            
            this.elapsedTime = (Date.now() - this.startTime) / 1000;
            
            if (this.elapsedTime >= this.totalDuration) {
                this.stopMusic();
                return;
            }
            
            this.updateProgressBar();
        }, 100);
    }

    // Start continuous melody
    startContinuousMelody() {
        const energy = parseInt(this.energySlider.value);
        const happiness = parseInt(this.happinessSlider.value);
        const calmness = parseInt(this.calmnessSlider.value);
        
        const generateAndPlay = () => {
            if (!this.isPlaying) return;
            
            const { notes, tempo } = this.generateMelody(energy, happiness, calmness);
            this.currentNotes = notes;
            
            // Display the notes
            this.displayNotes(notes);
            
            const now = Tone.now();
            let time = now;
            
            notes.forEach((note, index) => {
                let duration;
                const genre = this.genreSelect.value;
                
                if (genre === 'jazz') {
                    duration = index % 2 === 0 ? '4n' : '8n';
                } else if (genre === 'ambient') {
                    duration = '2n';
                } else if (genre === 'cinematic') {
                    duration = calmness < 30 ? '4n' : '2n';
                } else {
                    duration = calmness < 30 ? '8n' : calmness > 70 ? '2n' : '4n';
                }
                
                const velocity = happiness / 100;
                this.synth.triggerAttackRelease(note, duration, time, velocity);
                
                // Genre-specific spacing
                if (genre === 'jazz') {
                    time += 0.3;
                } else if (genre === 'ambient') {
                    time += 0.8;
                } else {
                    time += calmness < 30 ? 0.2 : calmness > 70 ? 0.8 : 0.4;
                }
            });
            
            // Calculate next generation time
            const patternDuration = (time - now) * 1000;
            setTimeout(generateAndPlay, patternDuration);
        };
        
        generateAndPlay();
    }

    async playEmotion() {
        if (this.isPlaying) {
            this.stopMusic();
        }
        
        // Update duration display
        this.updateDurationDisplay();
        
        // Start Tone.js audio context
        if (Tone.context.state !== 'running') {
            await Tone.start();
            await Tone.context.resume();
        }
        
        this.isPlaying = true;
        this.playButton.innerHTML = '<i class="fas fa-pause"></i> Playing...';
        this.playButton.classList.add('is-playing');
        
        // Start continuous melody
        this.startContinuousMelody();
        
        // Start timer
        this.startTimer();
    }

    stopMusic() {
        if (this.isPlaying) {
            this.synth.triggerRelease();
            Tone.Transport.stop();
            this.isPlaying = false;
            this.playButton.innerHTML = '<i class="fas fa-play"></i> Play My Emotion';
            this.playButton.classList.remove('is-playing');
            
            // Clear timer
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            // Reset progress
            this.elapsedTime = 0;
            this.updateProgressBar();
            
            // Remove warning classes
            this.timeRemaining.classList.remove('time-warning', 'time-critical');
        }
    }

    displayNotes(notes) {
        this.compositionDisplay.classList.remove('hidden');
        this.noteSequence.innerHTML = '';
        
        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.textContent = note.replace(/[0-9]/g, '').replace(/#/g, '♯').replace(/b/g, '♭');
            noteElement.style.animationDelay = `${index * 0.1}s`;
            
            // Color notes based on genre
            const genre = this.genreSelect.value;
            const colors = {
                classical: '#8B5CF6',
                jazz: '#F59E0B',
                electronic: '#EC4899',
                ambient: '#10B981',
                cinematic: '#3B82F6'
            };
            
            noteElement.style.background = colors[genre] || '#6366f1';
            noteElement.style.boxShadow = `0 0 15px ${colors[genre] || '#6366f1'}`;
            
            this.noteSequence.appendChild(noteElement);
        });
    }

    animateVisualizer() {
        const draw = () => {
            if (!this.ctx) return;
            
            const energy = parseInt(this.energySlider.value);
            const happiness = parseInt(this.happinessSlider.value);
            const calmness = parseInt(this.calmnessSlider.value);
            const genre = this.genreSelect.value;
            
            const width = this.visualizer.width;
            const height = this.visualizer.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const baseRadius = Math.min(width, height) * 0.3;
            
            // Clear canvas
            this.ctx.clearRect(0, 0, width, height);
            
            // Genre-specific base colors
            const genreColors = {
                classical: { hue: 260, sat: 80 },
                jazz: { hue: 40, sat: 85 },
                electronic: { hue: 320, sat: 85 },
                ambient: { hue: 160, sat: 75 },
                cinematic: { hue: 210, sat: 80 }
            };
            
            const baseColor = genreColors[genre] || genreColors.classical;
            
            // Draw multiple layers of circles
            for (let i = 0; i < 5; i++) {
                const time = Date.now() / 1000;
                const pulse = Math.sin(time * (2 + energy / 50)) * 0.1;
                const radius = baseRadius * (0.8 + i * 0.1) * (1 + pulse * (energy / 100));
                
                // Calculate color based on emotions and genre
                const hue = (baseColor.hue + happiness * 0.5 + time * 10) % 360;
                const saturation = baseColor.sat + energy * 0.2;
                const lightness = 50 + calmness * 0.2;
                
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                
                // Create gradient
                const gradient = this.ctx.createRadialGradient(
                    centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
                    centerX, centerY, radius * 1.5
                );
                
                gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
                gradient.addColorStop(1, `hsla(${hue + 40}, ${saturation}%, ${lightness}%, 0.2)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
                
                // Add orbiting particles if playing
                if (this.isPlaying) {
                    const particleCount = 8 + Math.floor(energy / 10);
                    for (let j = 0; j < particleCount; j++) {
                        const angle = (j / particleCount) * Math.PI * 2 + time * (energy / 100);
                        const x = centerX + Math.cos(angle) * radius * 1.2;
                        const y = centerY + Math.sin(angle) * radius * 1.2;
                        
                        this.ctx.beginPath();
                        this.ctx.arc(x, y, 5 + Math.sin(time * 5 + j) * 2, 0, Math.PI * 2);
                        this.ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.6)`;
                        this.ctx.fill();
                    }
                }
            }
            
            this.animationFrame = requestAnimationFrame(draw);
        };
        
        draw();
    }

    saveToday() {
        const today = new Date().toISOString().split('T')[0];
        const emotion = {
            date: today,
            energy: parseInt(this.energySlider.value),
            happiness: parseInt(this.happinessSlider.value),
            calmness: parseInt(this.calmnessSlider.value),
            genre: this.genreSelect.value,
            instrument: this.instrumentSelect.value,
            duration: parseInt(this.durationSelect.value),
            notes: this.currentNotes
        };
        
        // Check if we already have today's entry
        const existingIndex = this.emotionHistory.findIndex(e => e.date === today);
        
        if (existingIndex >= 0) {
            this.emotionHistory[existingIndex] = emotion;
        } else {
            this.emotionHistory.push(emotion);
        }
        
        // Sort by date (newest first)
        this.emotionHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Save to localStorage
        localStorage.setItem('emotionHistory', JSON.stringify(this.emotionHistory));
        
        // Update timeline
        this.renderTimeline();
        
        // Show success message
        alert('Today\'s emotion saved to your journey!');
        
        // Show share modal
        this.showShareModal(emotion);
    }

    loadHistory() {
        const saved = localStorage.getItem('emotionHistory');
        return saved ? JSON.parse(saved) : [];
    }

    renderTimeline() {
        this.timeline.innerHTML = '';
        
        if (this.emotionHistory.length === 0) {
            this.timeline.innerHTML = '<p class="no-history">Start saving your emotions to see your journey!</p>';
            return;
        }
        
        this.emotionHistory.slice(0, 14).forEach(day => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.onclick = () => this.replayDay(day);
            
            const date = new Date(day.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Genre icon
            const genreIcons = {
                classical: '🎻',
                jazz: '🎷',
                electronic: '🎛️',
                ambient: '🌊',
                cinematic: '🎬'
            };
            
            item.innerHTML = `
                <div class="timeline-date">${dateStr}</div>
                <div class="timeline-genre">${genreIcons[day.genre] || '🎵'}</div>
                <div class="timeline-emotions">
                    <div class="emotion-dot" style="background: var(--energy-color); opacity: ${day.energy / 100}"></div>
                    <div class="emotion-dot" style="background: var(--happiness-color); opacity: ${day.happiness / 100}"></div>
                    <div class="emotion-dot" style="background: var(--calmness-color); opacity: ${day.calmness / 100}"></div>
                </div>
                <div class="timeline-preview">
                    ${day.notes ? day.notes.slice(0, 3).map(n => n.replace(/[0-9]/g, '')).join(' ') : '...'}
                </div>
                ${day.duration ? `<div class="timeline-duration">${day.duration/60}min</div>` : ''}
            `;
            
            this.timeline.appendChild(item);
        });
    }

    async replayDay(day) {
        // Set sliders to that day's values
        this.energySlider.value = day.energy;
        this.happinessSlider.value = day.happiness;
        this.calmnessSlider.value = day.calmness;
        
        // Set genre and instrument
        if (day.genre) {
            this.genreSelect.value = day.genre;
            this.updateGenreMood();
            this.updateGenreEffects(day.genre);
        }
        
        if (day.instrument) {
            this.instrumentSelect.value = day.instrument;
            this.updateInstrument(day.instrument);
        }
        
        if (day.duration) {
            this.durationSelect.value = day.duration;
            this.updateDurationDisplay();
        }
        
        this.updateSliderDisplays();
        
        // Play the emotion
        await this.playEmotion();
    }

    showShareModal(emotion) {
        // Create fingerprint visualization
        this.emotionalFingerprint.innerHTML = '';
        
        const emotions = [
            { name: 'Energy', value: emotion.energy, color: 'var(--energy-color)' },
            { name: 'Happiness', value: emotion.happiness, color: 'var(--happiness-color)' },
            { name: 'Calmness', value: emotion.calmness, color: 'var(--calmness-color)' }
        ];
        
        emotions.forEach(e => {
            const bar = document.createElement('div');
            bar.className = 'fingerprint-bar';
            
            const fill = document.createElement('div');
            fill.className = 'fingerprint-fill';
            fill.style.height = `${e.value}%`;
            fill.style.background = e.color;
            fill.style.boxShadow = `0 0 20px ${e.color}`;
            
            bar.appendChild(fill);
            this.emotionalFingerprint.appendChild(bar);
        });
        
        // Add genre and duration info to modal
        const info = document.createElement('div');
        info.style.marginTop = '1rem';
        info.style.padding = '1rem';
        info.style.background = 'rgba(255,255,255,0.1)';
        info.style.borderRadius = 'var(--radius-lg)';
        info.style.textAlign = 'center';
        
        const genreIcons = {
            classical: '🎻',
            jazz: '🎷',
            electronic: '🎛️',
            ambient: '🌊',
            cinematic: '🎬'
        };
        
        const instrumentIcons = {
            piano: '🎹',
            guitar: '🎸',
            strings: '🎻',
            flute: '🎵',
            synth: '🎛️',
            bell: '🔔',
            pad: '💫',
            bass: '🎸'
        };
        
        info.innerHTML = `
            <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 0.5rem;">
                <span>${genreIcons[emotion.genre] || '🎵'} ${emotion.genre}</span>
                <span>${instrumentIcons[emotion.instrument] || '🎹'} ${emotion.instrument}</span>
                <span>⏱️ ${emotion.duration/60}min</span>
            </div>
        `;
        
        this.emotionalFingerprint.appendChild(info);
        
        this.shareModal.classList.add('show');
    }

    copyShareableLink() {
        const energy = this.energySlider.value;
        const happiness = this.happinessSlider.value;
        const calmness = this.calmnessSlider.value;
        const genre = this.genreSelect.value;
        const instrument = this.instrumentSelect.value;
        const duration = this.durationSelect.value;
        
        // Create a shareable URL with all parameters
        const url = new URL(window.location.href);
        url.searchParams.set('e', energy);
        url.searchParams.set('h', happiness);
        url.searchParams.set('c', calmness);
        url.searchParams.set('g', genre);
        url.searchParams.set('i', instrument);
        url.searchParams.set('d', duration);
        
        // Copy to clipboard
        navigator.clipboard.writeText(url.toString()).then(() => {
            alert('Share link copied to clipboard!');
        }).catch(() => {
            alert('Could not copy link. Please copy the URL manually.');
        });
    }

    checkForSharedEmotion() {
        const urlParams = new URLSearchParams(window.location.search);
        const energy = urlParams.get('e');
        const happiness = urlParams.get('h');
        const calmness = urlParams.get('c');
        const genre = urlParams.get('g');
        const instrument = urlParams.get('i');
        const duration = urlParams.get('d');
        
        if (energy && happiness && calmness) {
            this.energySlider.value = energy;
            this.happinessSlider.value = happiness;
            this.calmnessSlider.value = calmness;
            
            if (genre) {
                this.genreSelect.value = genre;
                this.updateGenreMood();
                this.updateGenreEffects(genre);
            }
            
            if (instrument) {
                this.instrumentSelect.value = instrument;
                this.updateInstrument(instrument);
            }
            
            if (duration) {
                this.durationSelect.value = duration;
                this.updateDurationDisplay();
            }
            
            this.updateSliderDisplays();
            setTimeout(() => this.playEmotion(), 500);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make sure all required elements exist
    const requiredElements = [
        'visualizer', 'energy', 'happiness', 'calmness',
        'energyValue', 'happinessValue', 'calmnessValue',
        'playButton', 'stopButton', 'saveButton',
        'compositionDisplay', 'noteSequence', 'timeline',
        'currentDate', 'energyFill', 'happinessFill', 'calmnessFill',
        'shareModal', 'emotionalFingerprint', 'copyShareLink',
        'genreSelect', 'instrumentSelect', 'genreMood',
        'durationSelect', 'minutesRemaining', 'secondsRemaining',
        'progressBar', 'progressContainer', 'timeRemaining'
    ];
    
    let allElementsExist = true;
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`Missing element: ${id}`);
            allElementsExist = false;
        }
    });
    
    if (allElementsExist) {
        new EmotionSymphony();
    } else {
        console.error('Some required elements are missing from the DOM');
    }
});
