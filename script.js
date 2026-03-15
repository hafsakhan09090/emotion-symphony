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

        // Audio Properties
        this.synth = null;
        this.isPlaying = false;
        this.currentNotes = [];
        this.animationFrame = null;

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
    }

    initSynth() {
        // Create a polyphonic synthesizer with reverb for beautiful sound
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 1
            }
        }).toDestination();
        
        // Add reverb for ambient effect
        const reverb = new Tone.Reverb({
            decay: 2,
            wet: 0.3
        }).toDestination();
        
        this.synth.connect(reverb);
    }

    setupEventListeners() {
        // Slider inputs
        this.energySlider.addEventListener('input', () => this.updateSliderDisplays());
        this.happinessSlider.addEventListener('input', () => this.updateSliderDisplays());
        this.calmnessSlider.addEventListener('input', () => this.updateSliderDisplays());
        
        // Button clicks
        this.playButton.addEventListener('click', () => this.playEmotion());
        this.stopButton.addEventListener('click', () => this.stopMusic());
        this.saveButton.addEventListener('click', () => this.saveToday());
        
        // Share modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.shareModal.classList.remove('show');
        });
        
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

    generateMelody(energy, happiness, calmness) {
        const scales = {
            major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
            pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5']
        };
        
        // Choose scale based on happiness
        let scale;
        if (happiness > 70) scale = scales.major;
        else if (happiness > 30) scale = scales.pentatonic;
        else scale = scales.minor;
        
        // Determine tempo based on energy
        const tempo = 60 + (energy * 1.5);
        Tone.Transport.bpm.value = tempo;
        
        // Determine number of notes based on calmness (calmer = fewer notes)
        const numNotes = Math.max(4, Math.min(12, Math.floor(calmness / 10)));
        
        // Generate notes with emotion-based variations
        const notes = [];
        for (let i = 0; i < numNotes; i++) {
            // Random note from scale
            const noteIndex = Math.floor(Math.random() * scale.length);
            let note = scale[noteIndex];
            
            // Higher energy = higher octave sometimes
            if (energy > 70 && Math.random() > 0.7) {
                note = note.replace('4', '5');
            }
            
            // Lower calmness = more variation
            if (calmness < 30 && Math.random() > 0.5) {
                note += '#'; // Add sharps for tension
            }
            
            notes.push(note);
        }
        
        return { notes, tempo };
    }

    async playEmotion() {
        if (this.isPlaying) {
            this.stopMusic();
        }
        
        const energy = parseInt(this.energySlider.value);
        const happiness = parseInt(this.happinessSlider.value);
        const calmness = parseInt(this.calmnessSlider.value);
        
        // Generate melody
        const { notes, tempo } = this.generateMelody(energy, happiness, calmness);
        this.currentNotes = notes;
        
        // Start Tone.js audio context (required by browsers)
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        
        // Schedule notes
        const now = Tone.now();
        let time = now;
        
        notes.forEach((note, index) => {
            // Calculate duration based on calmness (calmer = longer notes)
            const duration = calmness < 30 ? '8n' : calmness > 70 ? '2n' : '4n';
            
            // Add expression based on happiness
            const velocity = happiness / 100;
            
            this.synth.triggerAttackRelease(note, duration, time, velocity);
            
            // Space notes based on energy (higher energy = faster succession)
            time += calmness < 30 ? 0.2 : calmness > 70 ? 0.8 : 0.4;
        });
        
        this.isPlaying = true;
        this.playButton.innerHTML = '<i class="fas fa-pause"></i> Playing...';
        
        // Display the notes
        this.displayNotes(notes);
        
        // Auto-stop after notes finish
        setTimeout(() => {
            this.stopMusic();
        }, (notes.length * 1000) / (tempo / 60));
    }

    stopMusic() {
        if (this.isPlaying) {
            this.synth.triggerRelease();
            Tone.Transport.stop();
            this.isPlaying = false;
            this.playButton.innerHTML = '<i class="fas fa-play"></i> Play My Emotion';
        }
    }

    displayNotes(notes) {
        this.compositionDisplay.classList.remove('hidden');
        this.noteSequence.innerHTML = '';
        
        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.textContent = note.replace('4', '').replace('5', '');
            noteElement.style.animationDelay = `${index * 0.1}s`;
            this.noteSequence.appendChild(noteElement);
        });
    }

    animateVisualizer() {
        const draw = () => {
            if (!this.ctx) return;
            
            const energy = parseInt(this.energySlider.value);
            const happiness = parseInt(this.happinessSlider.value);
            const calmness = parseInt(this.calmnessSlider.value);
            
            const width = this.visualizer.width;
            const height = this.visualizer.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const baseRadius = Math.min(width, height) * 0.3;
            
            // Clear canvas
            this.ctx.clearRect(0, 0, width, height);
            
            // Draw multiple layers of circles
            for (let i = 0; i < 5; i++) {
                const time = Date.now() / 1000;
                const pulse = Math.sin(time * (2 + energy / 50)) * 0.1;
                const radius = baseRadius * (0.8 + i * 0.1) * (1 + pulse * (energy / 100));
                
                // Calculate color based on emotions
                const hue = (happiness * 1.2 + time * 10) % 360;
                const saturation = 70 + energy * 0.3;
                const lightness = 50 + calmness * 0.3;
                
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
        
        // Show success message (you could add a toast notification here)
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
        
        this.emotionHistory.slice(0, 14).forEach(day => { // Show last 14 days
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.onclick = () => this.replayDay(day);
            
            const date = new Date(day.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            item.innerHTML = `
                <div class="timeline-date">${dateStr}</div>
                <div class="timeline-emotions">
                    <div class="emotion-dot" style="background: var(--energy-color); opacity: ${day.energy / 100}"></div>
                    <div class="emotion-dot" style="background: var(--happiness-color); opacity: ${day.happiness / 100}"></div>
                    <div class="emotion-dot" style="background: var(--calmness-color); opacity: ${day.calmness / 100}"></div>
                </div>
                <div class="timeline-preview">
                    ${day.notes ? day.notes.slice(0, 3).map(n => n.replace('4', '')).join(' ') : '...'}
                </div>
            `;
            
            this.timeline.appendChild(item);
        });
    }

    async replayDay(day) {
        // Set sliders to that day's values
        this.energySlider.value = day.energy;
        this.happinessSlider.value = day.happiness;
        this.calmnessSlider.value = day.calmness;
        
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
        
        this.shareModal.classList.add('show');
    }

    copyShareableLink() {
        const energy = this.energySlider.value;
        const happiness = this.happinessSlider.value;
        const calmness = this.calmnessSlider.value;
        
        // Create a shareable URL with emotion parameters
        const url = new URL(window.location.href);
        url.searchParams.set('e', energy);
        url.searchParams.set('h', happiness);
        url.searchParams.set('c', calmness);
        
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
        
        if (energy && happiness && calmness) {
            this.energySlider.value = energy;
            this.happinessSlider.value = happiness;
            this.calmnessSlider.value = calmness;
            
            this.updateSliderDisplays();
            setTimeout(() => this.playEmotion(), 500);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmotionSymphony();
});
