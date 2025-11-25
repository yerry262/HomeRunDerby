class InputManager {
    constructor(canvas, onSwing) {
        this.canvas = canvas;
        this.onSwing = onSwing;
        this.setupListeners();
    }

    setupListeners() {
        // Mouse click
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.onSwing();
        });

        // Keyboard (Space bar)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.onSwing();
            }
        });

        // Touch (mobile)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onSwing();
        });
    }
}
