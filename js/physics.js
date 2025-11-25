class Pitch {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        // Start from pitcher's mound (far end)
        this.z = 0; // Distance from home plate (0 = far, 1 = home plate)
        
        // Base speed with variation for each pitch
        const speedVariation = 0.7 + Math.random() * 0.6; // 70% to 130% of base speed
        this.baseSpeed = 0.012;
        this.speed = this.baseSpeed * speedVariation;
        
        // Position on screen
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height * 0.3; // Start high (pitcher's release)
        
        // Target is home plate
        this.targetY = this.canvas.height * 0.75;
        
        // Size scales with distance
        this.baseRadius = 8;
        this.radius = this.baseRadius;
        
        // Swing timing window (made more forgiving)
        this.perfectZone = 0.92; // Perfect timing when z is around 0.92
        this.goodZoneMin = 0.82; // Expanded from 0.85 to 0.82
        this.goodZoneMax = 1.02; // Expanded from 0.98 to 1.02
        
        this.active = true;
        this.wasSwungAt = false;
    }

    update() {
        if (!this.active) return;

        // Move pitch toward home plate
        this.z += this.speed;
        
        // Scale and position based on distance
        // z goes from 0 (far) to 1+ (past home plate)
        // Enhanced scaling for better visual feedback
        const scale = Math.min(this.z * 1.5 + 0.4, 2.5); // More dramatic scaling
        this.radius = this.baseRadius * scale;
        
        // Y position interpolates from pitcher to home plate
        this.y = this.canvas.height * 0.3 + (this.targetY - this.canvas.height * 0.3) * this.z;
        
        // Ball is out of play if it goes too far past home plate
        if (this.z > 1.3) {
            this.active = false;
        }
    }

    swing() {
        if (!this.active || this.wasSwungAt) {
            return { hit: false, quality: 0, result: 'miss' };
        }

        this.wasSwungAt = true;

        // Check timing
        const timing = this.z;
        
        if (timing >= this.goodZoneMin && timing <= this.goodZoneMax) {
            // Hit!
            const perfectDistance = Math.abs(timing - this.perfectZone);
            const zoneWidth = (this.goodZoneMax - this.goodZoneMin) / 2;
            const quality = 1 - (perfectDistance / zoneWidth);
            
            // All hits are home runs!
            let result = 'homerun';
            if (quality > 0.6) { // Lowered from 0.8 to 0.6 for easier perfect hits
                result = 'perfect'; // Perfect timing!
            }
            
            this.active = false;
            return { hit: true, quality: quality, result: result };
        } else {
            // Swing and miss
            return { hit: false, quality: 0, result: 'miss' };
        }
    }

    isInStrikeZone() {
        return this.z >= this.goodZoneMin && this.z <= this.goodZoneMax;
    }
}

class Particles {
    constructor() {
        this.particles = [];
    }

    add(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 1,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // Gravity
            p.life -= 0.02;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.restore();
        });
    }

    clear() {
        this.particles = [];
    }
}
