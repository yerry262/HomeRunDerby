class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        // Setup resize handler
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    clear() {
        // Draw sky with stadium atmosphere - evening/night game
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.4);
        skyGradient.addColorStop(0, '#1a1a2e');  // Dark night sky
        skyGradient.addColorStop(0.3, '#16213e');
        skyGradient.addColorStop(0.7, '#0f3460');
        skyGradient.addColorStop(1, '#533a71');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.4);

        // Draw stadium structure (background stands) - more realistic perspective
        this.drawStadium();

        // Draw field with proper perspective from behind home plate
        const fieldGradient = this.ctx.createLinearGradient(0, this.canvas.height * 0.4, 0, this.canvas.height);
        fieldGradient.addColorStop(0, '#2d5a27');  // Darker outfield
        fieldGradient.addColorStop(0.6, '#4a7c59'); // Mid field
        fieldGradient.addColorStop(1, '#5a8c6a');   // Foreground (brighter)
        this.ctx.fillStyle = fieldGradient;
        this.ctx.fillRect(0, this.canvas.height * 0.4, this.canvas.width, this.canvas.height * 0.6);

        // Add stadium lighting effects
        this.drawStadiumLights();
    }

    drawStadium() {
        // Upper deck stands (far background)
        this.ctx.fillStyle = '#2a2a3a';
        this.ctx.fillRect(0, this.canvas.height * 0.15, this.canvas.width, 80);
        
        // Upper deck details
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(0, this.canvas.height * 0.19, this.canvas.width, 8);
        
        // Lower deck stands (curved around field)
        const lowerDeckY = this.canvas.height * 0.25;
        
        // Left field stands
        this.ctx.fillStyle = '#3a3a4a';
        this.ctx.fillRect(0, lowerDeckY, 200, 100);
        
        // Center field stands (behind pitcher)
        this.ctx.fillStyle = '#3a3a4a';
        this.ctx.fillRect(200, lowerDeckY - 20, 500, 120);
        
        // Right field stands  
        this.ctx.fillStyle = '#3a3a4a';
        this.ctx.fillRect(700, lowerDeckY, 200, 100);
        
        // Add seating sections with darker edges for depth
        this.ctx.fillStyle = '#2a2a3a';
        this.ctx.fillRect(205, lowerDeckY - 15, 490, 5);
        this.ctx.fillRect(695, lowerDeckY + 95, 5, 100);
        this.ctx.fillRect(200, lowerDeckY + 95, 5, 100);
        
        // Stadium wall behind center field
        this.ctx.fillStyle = '#4a4a5a';
        this.ctx.fillRect(250, this.canvas.height * 0.35, 400, 40);
        
        // Scoreboard
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(350, this.canvas.height * 0.2, 200, 60);
        this.ctx.fillStyle = '#2a4a2a';
        this.ctx.fillRect(360, this.canvas.height * 0.23, 180, 20);
        
        // Light towers on stadium rim
        const towerPositions = [150, 350, 550, 750];
        towerPositions.forEach(x => {
            this.ctx.fillStyle = '#5a5a5a';
            this.ctx.fillRect(x - 4, this.canvas.height * 0.1, 8, 40);
            this.ctx.fillStyle = '#4a4a4a';
            this.ctx.fillRect(x - 8, this.canvas.height * 0.1, 16, 8);
        });
    }

    drawStadiumLights() {
        // Stadium flood lights
        const lightPositions = [
            { x: 150, y: this.canvas.height * 0.1 },
            { x: 350, y: this.canvas.height * 0.1 },
            { x: 550, y: this.canvas.height * 0.1 },
            { x: 750, y: this.canvas.height * 0.1 }
        ];

        lightPositions.forEach(light => {
            // Light glow effect - more subtle for night game
            const lightGlow = this.ctx.createRadialGradient(light.x, light.y + 6, 0, light.x, light.y + 6, 120);
            lightGlow.addColorStop(0, 'rgba(255, 255, 220, 0.4)');
            lightGlow.addColorStop(0.5, 'rgba(255, 255, 200, 0.2)');
            lightGlow.addColorStop(1, 'rgba(255, 255, 180, 0)');
            this.ctx.fillStyle = lightGlow;
            this.ctx.fillRect(light.x - 120, light.y - 20, 240, 200);
        });
        
        // General field lighting
        const fieldLighting = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height * 0.3, 0,
            this.canvas.width / 2, this.canvas.height * 0.5, 400
        );
        fieldLighting.addColorStop(0, 'rgba(255, 255, 200, 0.15)');
        fieldLighting.addColorStop(1, 'rgba(255, 255, 180, 0)');
        this.ctx.fillStyle = fieldLighting;
        this.ctx.fillRect(0, this.canvas.height * 0.3, this.canvas.width, this.canvas.height * 0.4);
    }

    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * (1 + factor));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * (1 + factor));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * (1 + factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

    drawField() {
        // Draw infield dirt area with perspective
        this.ctx.fillStyle = '#8B7355';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, this.canvas.height * 0.85); // Home plate
        this.ctx.lineTo(this.canvas.width / 2 - 100, this.canvas.height * 0.65); // Third base area
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height * 0.45); // Second base area  
        this.ctx.lineTo(this.canvas.width / 2 + 100, this.canvas.height * 0.65); // First base area
        this.ctx.closePath();
        this.ctx.fill();

        // Pitcher's mound (smaller, more distant)
        this.ctx.fillStyle = '#A0926B';
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.canvas.width / 2, 
            this.canvas.height * 0.55, 
            25, 12, 0, 0, Math.PI * 2
        );
        this.ctx.fill();
        
        // Mound shading
        this.ctx.fillStyle = '#8B7D56';
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.canvas.width / 2 + 3, 
            this.canvas.height * 0.55 + 2, 
            22, 10, 0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Draw PS1-style pitcher (smaller, in distance)
        this.drawPS1Pitcher();

        // Home plate area (foreground)
        const plateX = this.canvas.width / 2;
        const plateY = this.canvas.height * 0.85;
        
        // Dirt circle around home plate
        this.ctx.fillStyle = '#8B7355';
        this.ctx.beginPath();
        this.ctx.arc(plateX, plateY, 40, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Home plate (3D effect) - larger since we're close
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(plateX, plateY - 3);
        this.ctx.lineTo(plateX - 22, plateY + 4);
        this.ctx.lineTo(plateX - 22, plateY + 16);
        this.ctx.lineTo(plateX, plateY + 22);
        this.ctx.lineTo(plateX + 22, plateY + 16);
        this.ctx.lineTo(plateX + 22, plateY + 4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Plate shadow
        this.ctx.fillStyle = '#E0E0E0';
        this.ctx.beginPath();
        this.ctx.moveTo(plateX + 3, plateY - 1);
        this.ctx.lineTo(plateX - 19, plateY + 6);
        this.ctx.lineTo(plateX - 19, plateY + 18);
        this.ctx.lineTo(plateX + 3, plateY + 24);
        this.ctx.lineTo(plateX + 25, plateY + 18);
        this.ctx.lineTo(plateX + 25, plateY + 6);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw batter's boxes (larger since closer to camera)
        this.ctx.strokeStyle = '#CCCCCC';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(plateX - 60, plateY - 15, 45, 50); // Left batter's box
        this.ctx.strokeRect(plateX + 15, plateY - 15, 45, 50); // Right batter's box

        // Draw baseline paths
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        this.ctx.lineWidth = 2;
        // First base line
        this.ctx.beginPath();
        this.ctx.moveTo(plateX, plateY);
        this.ctx.lineTo(this.canvas.width / 2 + 100, this.canvas.height * 0.65);
        this.ctx.stroke();
        // Third base line  
        this.ctx.beginPath();
        this.ctx.moveTo(plateX, plateY);
        this.ctx.lineTo(this.canvas.width / 2 - 100, this.canvas.height * 0.65);
        this.ctx.stroke();

        // Strike zone indicator (positioned between pitcher and batter)
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(
            this.canvas.width / 2 - 35,
            this.canvas.height * 0.72,
            70,
            85
        );
        
        // Strike zone depth
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            this.canvas.width / 2 - 37,
            this.canvas.height * 0.72 + 2,
            74,
            89
        );
    }

    drawPS1Pitcher() {
        // Pitcher positioned in distance on mound
        const pitcherX = this.canvas.width / 2;
        const pitcherY = this.canvas.height * 0.52;
        
        // Scale factor for distance
        const scale = 0.7;
        
        // Pitcher uniform colors
        const uniformColor = '#1E3A8A'; // Blue uniform
        const skinColor = '#D2B48C';
        const capColor = '#1E3A8A';

        // Draw pitcher body (smaller due to distance)
        // Legs
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(pitcherX - 6 * scale, pitcherY + 12 * scale, 4 * scale, 18 * scale); // Left leg
        this.ctx.fillRect(pitcherX + 2 * scale, pitcherY + 12 * scale, 4 * scale, 18 * scale); // Right leg
        
        // Leg shading
        this.ctx.fillStyle = this.darkenColor(uniformColor, 0.3);
        this.ctx.fillRect(pitcherX - 5 * scale, pitcherY + 13 * scale, 2 * scale, 17 * scale);
        this.ctx.fillRect(pitcherX + 3 * scale, pitcherY + 13 * scale, 2 * scale, 17 * scale);
        
        // Cleats
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(pitcherX - 7 * scale, pitcherY + 28 * scale, 6 * scale, 3 * scale);
        this.ctx.fillRect(pitcherX + 2 * scale, pitcherY + 28 * scale, 6 * scale, 3 * scale);

        // Torso
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(pitcherX - 8 * scale, pitcherY - 3 * scale, 16 * scale, 18 * scale);
        
        // Torso shading
        this.ctx.fillStyle = this.darkenColor(uniformColor, 0.3);
        this.ctx.fillRect(pitcherX + 5 * scale, pitcherY - 2 * scale, 3 * scale, 17 * scale);
        
        // Jersey number
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${Math.floor(10 * scale)}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('1', pitcherX, pitcherY + 7 * scale);

        // Arms in pitching motion
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(pitcherX - 12 * scale, pitcherY - 1 * scale, 6 * scale, 14 * scale); // Left arm
        this.ctx.fillRect(pitcherX + 6 * scale, pitcherY - 1 * scale, 6 * scale, 14 * scale); // Right arm (throwing)
        
        // Arm shading
        this.ctx.fillStyle = this.darkenColor(uniformColor, 0.3);
        this.ctx.fillRect(pitcherX - 11 * scale, pitcherY + 1 * scale, 2 * scale, 12 * scale);
        this.ctx.fillRect(pitcherX + 7 * scale, pitcherY + 1 * scale, 2 * scale, 12 * scale);

        // Hands/Glove
        this.ctx.fillStyle = '#8B4513'; // Glove
        this.ctx.beginPath();
        this.ctx.arc(pitcherX - 9 * scale, pitcherY + 13 * scale, 4 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = skinColor; // Throwing hand
        this.ctx.beginPath();
        this.ctx.arc(pitcherX + 9 * scale, pitcherY + 13 * scale, 3 * scale, 0, Math.PI * 2);
        this.ctx.fill();

        // Head
        this.ctx.fillStyle = skinColor;
        this.ctx.fillRect(pitcherX - 6 * scale, pitcherY - 15 * scale, 12 * scale, 13 * scale);
        
        // Head shading
        this.ctx.fillStyle = this.darkenColor(skinColor, 0.2);
        this.ctx.fillRect(pitcherX + 3 * scale, pitcherY - 14 * scale, 3 * scale, 12 * scale);

        // Baseball cap
        this.ctx.fillStyle = capColor;
        this.ctx.fillRect(pitcherX - 7 * scale, pitcherY - 19 * scale, 14 * scale, 6 * scale);
        
        // Cap bill
        this.ctx.fillRect(pitcherX - 9 * scale, pitcherY - 13 * scale, 18 * scale, 3 * scale);
        
        // Cap shading
        this.ctx.fillStyle = this.darkenColor(capColor, 0.3);
        this.ctx.fillRect(pitcherX + 4 * scale, pitcherY - 17 * scale, 3 * scale, 4 * scale);

        // Facial features (simple PS1 style)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(pitcherX - 2 * scale, pitcherY - 9 * scale, 1 * scale, 1 * scale); // Left eye
        this.ctx.fillRect(pitcherX + 1 * scale, pitcherY - 9 * scale, 1 * scale, 1 * scale); // Right eye
    }

    drawPitch(pitch) {
        if (!pitch.active) return;

        const ballX = pitch.x;
        const ballY = pitch.y;
        const ballRadius = pitch.radius;

        // Enhanced shadow with perspective
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            ballX + 8, 
            this.canvas.height * 0.82, 
            ballRadius * 1.2, 
            ballRadius * 0.4, 
            0, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Ball with more pronounced 3D shading (PS1 style)
        const ballGradient = this.ctx.createRadialGradient(
            ballX - ballRadius * 0.4, 
            ballY - ballRadius * 0.4, 
            0, 
            ballX, 
            ballY, 
            ballRadius * 1.2
        );
        ballGradient.addColorStop(0, '#FFFFFF');
        ballGradient.addColorStop(0.3, '#F8F8F8');
        ballGradient.addColorStop(0.7, '#E0E0E0');
        ballGradient.addColorStop(1, '#C0C0C0');

        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // More detailed baseball stitches (red)
        this.ctx.strokeStyle = '#CC0000';
        this.ctx.lineWidth = Math.max(1, ballRadius * 0.1);
        
        // Curved stitching pattern
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const stitchX = ballX + Math.cos(angle) * ballRadius * 0.7;
            const stitchY = ballY + Math.sin(angle) * ballRadius * 0.7;
            const stitchEndX = ballX + Math.cos(angle + 0.3) * ballRadius * 0.7;
            const stitchEndY = ballY + Math.sin(angle + 0.3) * ballRadius * 0.7;
            
            this.ctx.moveTo(stitchX, stitchY);
            this.ctx.lineTo(stitchEndX, stitchEndY);
        }
        this.ctx.stroke();

        // Strike zone flash when ball is in hitting zone (enhanced)
        if (pitch.isInStrikeZone()) {
            // Animated strike zone with pulsing effect
            const pulseIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
            this.ctx.strokeStyle = `rgba(0, 255, 0, ${pulseIntensity})`;
            this.ctx.lineWidth = 6;
            this.ctx.strokeRect(
                this.canvas.width / 2 - 35,
                this.canvas.height * 0.72,
                70,
                85
            );
            
            // Inner glow effect
            this.ctx.strokeStyle = `rgba(255, 255, 0, ${pulseIntensity * 0.5})`;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
                this.canvas.width / 2 - 33,
                this.canvas.height * 0.72 + 2,
                66,
                81
            );
        }

        // Ball trail effect for fast pitches
        if (pitch.speed > 0.01) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let i = 1; i <= 3; i++) {
                this.ctx.beginPath();
                this.ctx.arc(
                    ballX - (i * 5), 
                    ballY - (i * 2), 
                    ballRadius * (1 - i * 0.2), 
                    0, Math.PI * 2
                );
                this.ctx.fill();
            }
        }
    }

    drawBatter() {
        // Batter positioned in foreground (larger, partially visible from behind)
        const batterX = this.canvas.width / 2 + 80;
        const batterY = this.canvas.height * 0.75;

        // Scale factor for foreground position
        const scale = 1.2;

        // Batter uniform colors
        const uniformColor = '#8B0000'; // Red uniform
        const skinColor = '#D2B48C';
        const capColor = '#8B0000';
        const batColor = '#8B4513';

        // Draw PS1-style 3D batter (from behind/side view)
        // Legs (batting stance)
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(batterX - 10 * scale, batterY + 25 * scale, 8 * scale, 30 * scale); // Left leg
        this.ctx.fillRect(batterX + 2 * scale, batterY + 25 * scale, 8 * scale, 30 * scale); // Right leg
        
        // Leg shading
        this.ctx.fillStyle = this.darkenColor(uniformColor, 0.3);
        this.ctx.fillRect(batterX - 8 * scale, batterY + 27 * scale, 3 * scale, 28 * scale);
        this.ctx.fillRect(batterX + 4 * scale, batterY + 27 * scale, 3 * scale, 28 * scale);
        
        // Cleats
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(batterX - 12 * scale, batterY + 53 * scale, 10 * scale, 4 * scale);
        this.ctx.fillRect(batterX + 2 * scale, batterY + 53 * scale, 10 * scale, 4 * scale);

        // Torso (turned toward pitcher)
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(batterX - 12 * scale, batterY, 24 * scale, 30 * scale);
        
        // Torso shading
        this.ctx.fillStyle = this.darkenColor(uniformColor, 0.3);
        this.ctx.fillRect(batterX + 8 * scale, batterY + 2 * scale, 4 * scale, 28 * scale);
        
        // Jersey number (on back)
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `bold ${Math.floor(14 * scale)}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('7', batterX, batterY + 18 * scale);

        // Arms in batting stance
        this.ctx.fillStyle = uniformColor;
        this.ctx.fillRect(batterX - 20 * scale, batterY + 5 * scale, 10 * scale, 20 * scale); // Left arm
        this.ctx.fillRect(batterX + 10 * scale, batterY + 5 * scale, 10 * scale, 18 * scale); // Right arm
        
        // Arm shading
        this.ctx.fillStyle = this.darkenColor(uniformColor, 0.3);
        this.ctx.fillRect(batterX - 18 * scale, batterY + 7 * scale, 3 * scale, 18 * scale);
        this.ctx.fillRect(batterX + 12 * scale, batterY + 7 * scale, 3 * scale, 16 * scale);

        // Baseball bat (held up in batting stance)
        this.ctx.fillStyle = batColor;
        this.ctx.fillRect(batterX - 15 * scale, batterY - 35 * scale, 8 * scale, 50 * scale);
        
        // Bat shading
        this.ctx.fillStyle = this.darkenColor(batColor, 0.3);
        this.ctx.fillRect(batterX - 13 * scale, batterY - 33 * scale, 3 * scale, 48 * scale);
        
        // Bat grip
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(batterX - 14 * scale, batterY + 10 * scale, 6 * scale, 8 * scale);

        // Hands on bat
        this.ctx.fillStyle = skinColor;
        this.ctx.beginPath();
        this.ctx.arc(batterX - 12 * scale, batterY + 25 * scale, 5 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(batterX + 15 * scale, batterY + 20 * scale, 5 * scale, 0, Math.PI * 2);
        this.ctx.fill();

        // Head (partial view from behind)
        this.ctx.fillStyle = skinColor;
        this.ctx.fillRect(batterX - 8 * scale, batterY - 20 * scale, 16 * scale, 18 * scale);
        
        // Head shading
        this.ctx.fillStyle = this.darkenColor(skinColor, 0.2);
        this.ctx.fillRect(batterX + 4 * scale, batterY - 18 * scale, 4 * scale, 16 * scale);

        // Batting helmet
        this.ctx.fillStyle = capColor;
        this.ctx.fillRect(batterX - 10 * scale, batterY - 25 * scale, 20 * scale, 8 * scale);
        
        // Helmet ear flap (visible from this angle)
        this.ctx.fillRect(batterX - 12 * scale, batterY - 20 * scale, 8 * scale, 12 * scale);
        
        // Helmet shading
        this.ctx.fillStyle = this.darkenColor(capColor, 0.3);
        this.ctx.fillRect(batterX + 6 * scale, batterY - 23 * scale, 4 * scale, 6 * scale);
        this.ctx.fillRect(batterX - 10 * scale, batterY - 18 * scale, 2 * scale, 10 * scale);

        // Batting gloves
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(batterX - 17 * scale, batterY + 22 * scale, 10 * scale, 6 * scale);
        this.ctx.fillRect(batterX + 10 * scale, batterY + 17 * scale, 10 * scale, 6 * scale);

        // Show part of face/eye visible from side
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(batterX + 2 * scale, batterY - 12 * scale, 2 * scale, 2 * scale); // Visible eye
    }

    drawSwingAnimation() {
        const batterX = this.canvas.width / 2 + 80;
        const batterY = this.canvas.height * 0.75;
        const scale = 1.2;

        // Bat swing trail effect (PS1-style motion blur) - adjusted for new position
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
        this.ctx.lineWidth = 10 * scale;
        this.ctx.beginPath();
        this.ctx.arc(batterX, batterY, 70 * scale, Math.PI * 0.15, Math.PI * 0.75);
        this.ctx.stroke();
        
        // Secondary trail for depth
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        this.ctx.lineWidth = 14 * scale;
        this.ctx.beginPath();
        this.ctx.arc(batterX, batterY, 75 * scale, Math.PI * 0.2, Math.PI * 0.7);
        this.ctx.stroke();
        
        // Speed lines for dramatic effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI * 0.25 + (i * Math.PI * 0.08);
            const startX = batterX + Math.cos(angle) * 50 * scale;
            const startY = batterY + Math.sin(angle) * 50 * scale;
            const endX = batterX + Math.cos(angle) * 90 * scale;
            const endY = batterY + Math.sin(angle) * 90 * scale;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }
}
