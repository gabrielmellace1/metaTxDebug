
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('background', 'cryptowall.png');
        this.load.json('squaresData', 'squares.json');  // Make sure this path is correct
    }

    create() {
        this.bg = this.setupBackground();
        this.setupInputHandlers();
        this.createInteractiveSquares();
        // Placeholder for the popup display; modify this with your implementation
        this.popup = this.add.text(0, 0, '', { 
            backgroundColor: '#000', 
            color: '#fff', 
            padding: 5,
            wordWrap: { width: 200 } // Adjust the width as necessary
        }).setOrigin(0.5, 1) // Set origin to the bottom center of the popup
          .setVisible(false);
    }

    setupBackground() {
        var bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setInteractive();
        this.cameras.main.setBounds(0, 0, 5000, 5000);
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 0);
        return bg;
    }

    setupInputHandlers() {
        this.setupDragging();
        this.setupZooming();
    }

    setupDragging() {
        let lastPointerPosition = new Phaser.Math.Vector2();
        let dragging = false;

        this.input.on('pointerdown', (pointer) => {
            if (this.bg.getBounds().contains(pointer.x, pointer.y)) {
                dragging = true;
                lastPointerPosition.set(pointer.x, pointer.y);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (dragging) {
                const dx = pointer.x - lastPointerPosition.x;
                const dy = pointer.y - lastPointerPosition.y;
                this.cameras.main.scrollX -= dx;
                this.cameras.main.scrollY -= dy;
                lastPointerPosition.set(pointer.x, pointer.y);
            }
        });

        this.input.on('pointerup', () => {
            dragging = false;
        });
    }

    setupZooming() {
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            pointer.event.preventDefault(); // Prevent the default browser behavior
    
            const zoomAmount = deltaY * -0.001; // How much we'll zoom in or out
            let newZoom = this.cameras.main.zoom + zoomAmount;
            newZoom = Phaser.Math.Clamp(newZoom, 0.1, 2); // Clamp the zoom value
    
            // The world point at the pointer's location
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            
            this.cameras.main.setZoom(newZoom); // Set the new zoom level
            
            // Calculate the new position after zooming
            const newWorldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const diffX = newWorldPoint.x - worldPoint.x;
            const diffY = newWorldPoint.y - worldPoint.y;
    
            // Adjust camera positions by the difference
            this.cameras.main.scrollX -= diffX * this.cameras.main.zoom;
            this.cameras.main.scrollY -= diffY * this.cameras.main.zoom;
        });
    }

    createInteractiveSquares() {
        const cellSize = 10; // The size of the squares
        this.squaresData = this.cache.json.get('squaresData');
        this.squaresData.forEach(square => {
            const squareGraphic = this.add.rectangle(square.x * cellSize, square.y * cellSize, cellSize, cellSize, 0x0000ff, 0)
                .setOrigin(0, 0)
                .setInteractive();

            squareGraphic.on('pointerover', () => {
                this.showPopup(square.title, squareGraphic.getTopLeft());
            });

            squareGraphic.on('pointerout', () => {
                this.hidePopup();
            });

            squareGraphic.on('pointerdown', () => {
                window.open(square.url, '_blank');
            });
        });
    }

    private showPopup(title: string, pointer: Phaser.Input.Pointer): void {
        this.popup.setText(title);
    
        const padding = 10;  // Set padding around the popup
        const popupWidth = this.popup.width;
        const popupHeight = this.popup.height;
        const cellSize = 10;  // Assuming cell size is 10 for placement reference
    
        // Calculate the popup's position based on the pointer's location
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        let popupX = worldPoint.x;
        let popupY = worldPoint.y;
    
        // Adjust if popup goes off the right edge of the screen
        if (popupX + popupWidth / 2 > this.cameras.main.width) {
            popupX = this.cameras.main.width - popupWidth / 2 - padding;
        }
    
        // Adjust if popup goes off the left edge of the screen
        if (popupX - popupWidth / 2 < 0) {
            popupX = popupWidth / 2 + padding;
        }
    
        // Check if the popup goes off the top of the screen, if so display it below the square
        if (popupY - popupHeight - padding < 0) {
            this.popup.setOrigin(0.5, 0); // Align popup origin to top-center
            popupY += cellSize + popupHeight + padding;
        } else {
            this.popup.setOrigin(0.5, 1); // Align popup origin to bottom-center
            popupY -= padding;
        }
    
        this.popup.setPosition(popupX, popupY).setVisible(true);
    }
    

    hidePopup() {
        this.popup.setVisible(false);
    }
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [MainScene]
};

var game = new Phaser.Game(config);

