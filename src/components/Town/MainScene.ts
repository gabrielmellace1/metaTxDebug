import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    private bg!: Phaser.GameObjects.Image;
    private popup!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MainScene' });
        
    }

    preload(): void {
        this.load.image('background', 'cryptowall.png');
        this.load.json('squaresData', 'squares.json');
    }

    create(): void {
        this.bg = this.setupBackground();
        this.setupInputHandlers();
        this.createInteractiveSquares();
        this.createPopup();
        this.input.setDefaultCursor('url(assets/cursor.png), default'); // Custom cursor
        this.addGridGlareEffect()

        this.scale.on('resize', this.resizeGame, this);
    }
    
    private setupBackground(): Phaser.GameObjects.Image {
        const bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setInteractive();
        this.cameras.main.setBounds(0, 0, 5000, 5000);
        this.cameras.main.setZoom(1);
        this.cameras.main.centerOn(0, 5000);
        return bg;
    }

    private setupInputHandlers(): void {
        this.setupDragging();
        this.setupZooming();
        this.setupKeyboardNavigation();
    }

    private setupDragging(): void {
        let lastPointerPosition = new Phaser.Math.Vector2();
        let dragging = false;

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.bg.getBounds().contains(pointer.x, pointer.y)) {
                dragging = true;
                lastPointerPosition.set(pointer.x, pointer.y);
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
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

    private setupZooming(): void {
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _: any, deltaX: number, deltaY: number) => {
            pointer.event.preventDefault();  // Prevent default scrolling behavior
    
            const zoomAmount = deltaY * -0.005;  // Adjusted sensitivity for a smoother experience
            let newZoom = this.cameras.main.zoom + zoomAmount;
    
            // Calculate the minimum zoom to prevent the canvas from showing extra space around the content
            const worldWidth = this.bg.displayWidth;  // Assuming 'bg' is your game world background with full size
            const worldHeight = this.bg.displayHeight;
            const minZoomX = this.cameras.main.width / worldWidth;
            const minZoomY = this.cameras.main.height / worldHeight;
            const minZoom = Math.max(minZoomX, minZoomY);
    
            // Use Phaser's Clamp function to ensure the zoom level is within bounds
            newZoom = Phaser.Math.Clamp(newZoom, minZoom, 2);  // Adjust max zoom level as needed
    
            // Smoothly transition to the new zoom level
            this.cameras.main.zoomTo(newZoom, 300);  // 300 milliseconds for smooth transition
        });
    }
    

    private setupKeyboardNavigation(): void {
        this.input.keyboard?.on('keydown', (event: { key: any; }) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.cameras.main.scrollY -= 100;
                    break;
                case 'ArrowDown':
                    this.cameras.main.scrollY += 100;
                    break;
                case 'ArrowLeft':
                    this.cameras.main.scrollX -= 100;
                    break;
                case 'ArrowRight':
                    this.cameras.main.scrollX += 100;
                    break;
                case '+':
                    this.cameras.main.zoomTo(this.cameras.main.zoom + 0.1, 100);
                    break;
                case '-':
                    this.cameras.main.zoomTo(this.cameras.main.zoom - 0.1, 100);
                    break;
            }
        });
    }

    //TODO: needs fix Y axis
    private createInteractiveSquares(): void {
        const cellSize = 10;
        const numRows = 500;
        const gridHeight = numRows * cellSize;
        
        const squaresData = this.cache.json.get('squaresData') as Array<{ x: number, y: number, title: string, url: string }>;
        
        console.log(`Creating squares, gridHeight: ${gridHeight}`);
        
        squaresData.forEach(square => {
            const adjustedY = gridHeight - (square.y + 1) * cellSize;
    
            console.log(`Square at (${square.x}, ${square.y}) positioned at (${square.x * cellSize}, ${adjustedY})`);
    
            const squareGraphic = this.add.rectangle(
                square.x * cellSize,
                adjustedY,
                cellSize,
                cellSize,
                0x0000ff
            ).setOrigin(0, 0).setInteractive();
        
            this.configureSquareInteraction(squareGraphic, square);
        });
    }
    
    

    private configureSquareInteraction(squareGraphic: Phaser.GameObjects.Rectangle, square: { x?: number; y?: number; title: any; url: any; }) {
        squareGraphic.on('pointerover', () => {
            this.showPopup(square.title, squareGraphic.getTopLeft());
            this.highlightSquare(squareGraphic);
            this.input.setDefaultCursor(square.url ? 'pointer' : 'not-allowed');
        });
    
        squareGraphic.on('pointerout', () => {
            this.hidePopup();
            this.input.setDefaultCursor('default'); // Reset cursor to default when not hovering
        });
    
        squareGraphic.on('pointerdown', () => {
            if (square.url) {
                window.open(square.url, '_blank'); // Only open if URL exists
            }
        });
    }
    
    private calculateGridHeight(): number {
        // This method should calculate the total height of the grid based on your game's layout or data
        // For example, if your grid has 10 rows and each cell is 10 pixels high:
        return 10 * 10; // Replace 10 with the actual number of rows if dynamic
    }
    
    

    private highlightSquare(square: Phaser.GameObjects.Rectangle): void {
        const border = this.add.graphics();
        border.lineStyle(1, 0xffff00, 1);  // Yellow color
        border.strokeRectShape(square.getBounds());
        square.on('pointerout', () => border.destroy());  // Remove border when not hovering
    }

    private createPopup(): void {
        this.popup = this.add.text(0, 0, 'Popup', {
            backgroundColor: '#000',
            color: '#fff',
            padding: { left: 10, right: 10, top: 10, bottom: 10 },
            wordWrap: { width: 200 },
            align: 'center'
        }).setOrigin(0.5, 1).setVisible(false);
    }

    private showPopup(title: string, position: Phaser.Geom.Point): void {
        this.popup.setText(title);
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        let offsetX = position.x < centerX ? 90 : -90;
        let offsetY = position.y < centerY ? 90 : -90;
        this.popup.setPosition(position.x + offsetX, position.y + offsetY);
        this.popup.setVisible(true);
    }

    private hidePopup(): void {
        this.popup.setVisible(false);
    }

    private resizeGame(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;
    
        console.log(`Resizing to ${width}x${height}`);
    
        this.scale.resize(width, height);
    
        this.cameras.main.setViewport(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, this.bg.displayWidth, this.bg.displayHeight);
    
        const minZoomX = width / this.bg.displayWidth;
        const minZoomY = height / this.bg.displayHeight;
        const minZoom = Math.max(minZoomX, minZoomY);
    
        this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, minZoom, 2);
    
        this.cameras.main.centerOn(this.bg.displayWidth / 2, this.bg.displayHeight / 2);
    }
    
    private addGridGlareEffect(): void {
        // const width = this.scale.width;
        // const height = this.scale.height;
    
        // // Create a graphics object and apply a gradient fill
        // const glare = this.add.graphics();
        // glare.fillGradientStyle(0xffffff, 0, 0xffffff, 0, 1, 0.1, 0, 0.1);
        // glare.fillRect(-width / 2, -height, width * 2, height * 2); // Extended coverage
    
        // // Animation for the glare effect with variable speed and non-linear movement
        // this.tweens.add({
        //     targets: glare,
        //     props: {
        //         x: { value: `+=${width}`, duration: 3000, ease: 'Power2.easeInOut' },
        //         y: { value: `+=${height}`, duration: 3000, ease: 'Power2.easeInOut' }
        //     },
        //     repeat: -1,
        //     yoyo: true,
        //     onStart: () => glare.alpha = Phaser.Math.FloatBetween(0.1, 0.5), // Randomize alpha on start
        //     onYoyo: () => glare.x = Phaser.Math.FloatBetween(-width / 2, 0), // Change start x on each repeat
        //     onRepeat: () => glare.alpha = Phaser.Math.FloatBetween(0.1, 0.5), // Change alpha on repeat
        // });
    }
    
    
    

    
}
