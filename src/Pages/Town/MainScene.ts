import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    private bg!: Phaser.GameObjects.Image;
    private popup!: Phaser.GameObjects.Text;
    private dragging = false;
    private lastPointerPosition = new Phaser.Math.Vector2();
    private dragDistanceThreshold = 5;
    private lastPinchDistance: number | null = null; // Add this line to declare the property

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
        this.input.setDefaultCursor('url(assets/cursor.png), default');
        this.addGridGlareEffect();
        this.scale.on('resize', this.resizeGame, this);
    }

    private setupBackground(): Phaser.GameObjects.Image {
        const bg = this.add.image(0, 0, 'background').setOrigin(0, 0).setInteractive();
        this.cameras.main.setBounds(0, 0, 5000, 5000);
        this.cameras.main.setZoom(0.512);
        const randomX = Math.random() * 5000;  // 5000 should be replaced with the actual width if different
        const randomY = Math.random() * 5000;  // 5000 should be replaced with the actual height if different
        this.cameras.main.centerOn(randomX, randomY);
        return bg;
    }

    private setupInputHandlers(): void {
        this.setupDragging();
        this.setupZooming();
        this.setupKeyboardNavigation();
    }

    private setupDragging(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.bg.getBounds().contains(pointer.x, pointer.y)) {
                this.dragging = true;
                this.lastPointerPosition.set(pointer.x, pointer.y);
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.dragging) {
                const dx = pointer.x - this.lastPointerPosition.x;
                const dy = pointer.y - this.lastPointerPosition.y;
                this.cameras.main.scrollX -= dx;
                this.cameras.main.scrollY -= dy;
                this.lastPointerPosition.set(pointer.x, pointer.y);
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.dragging ||
                (Math.abs(pointer.downX - pointer.upX) < this.dragDistanceThreshold &&
                 Math.abs(pointer.downY - pointer.upY) < this.dragDistanceThreshold)) {
                const objects = this.input.hitTestPointer(pointer);
                const interactiveObject = objects.find(obj => obj.getData('url'));
                if (interactiveObject) {
                    window.open(interactiveObject.getData('url'), '_blank');
                }
            }
            this.dragging = false;
        });
    }

    private setupZooming(): void {
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _: any, _deltaX: number, deltaY: number) => {
            pointer.event.preventDefault();
            const zoomAmount = deltaY * -0.005;
            this.adjustZoom(zoomAmount);
        });
    
        // Handle pinch-to-zoom on touch devices
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.event instanceof TouchEvent && pointer.event.touches.length > 1) {
                this.dragging = false;  // Disable dragging when pinching
                const [touch1, touch2] = pointer.event.touches;
                this.lastPinchDistance = Phaser.Math.Distance.Between(
                    touch1.pageX, touch1.pageY, touch2.pageX, touch2.pageY
                );
                console.log('Pinch start distance:', this.lastPinchDistance);
            }
        });
    
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.event instanceof TouchEvent && pointer.event.touches.length === 2) {
                const [touch1, touch2] = pointer.event.touches;
                let currentDistance = Phaser.Math.Distance.Between(
                    touch1.pageX, touch1.pageY, touch2.pageX, touch2.pageY
                );
    
                if (this.lastPinchDistance) {
                    let distanceDiff = currentDistance - this.lastPinchDistance;
                    const zoomAmount = distanceDiff * 0.001;
                    this.adjustZoom(zoomAmount);
                    console.log('Pinching - Current Distance:', currentDistance, 'Zoom Amount:', zoomAmount);
                }
                this.lastPinchDistance = currentDistance;
            }
        });
    
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (pointer.event instanceof TouchEvent && pointer.event.touches.length < 2) {
                this.lastPinchDistance = null;
                console.log('Pinch end');
            }
        });
    }

    public scaleZoom(zoomIncrement: number) {
        this.adjustZoom(zoomIncrement);
    }
    
    
    private adjustZoom(zoomAmount: number): void {
        let newZoom = this.cameras.main.zoom + zoomAmount;
        const worldWidth = this.bg.displayWidth;
        const worldHeight = this.bg.displayHeight;
        const minZoomX = this.cameras.main.width / worldWidth;
        const minZoomY = this.cameras.main.height / worldHeight;
        const minZoom = Math.max(minZoomX, minZoomY);
        newZoom = Phaser.Math.Clamp(newZoom, minZoom, 2);
        this.cameras.main.zoomTo(newZoom, 300);
        console.log('Adjusted Zoom:', newZoom);
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

    private createInteractiveSquares(): void {
        const cellSize = 10;
        const numRows = 500;
        const gridHeight = numRows * cellSize;
        
        const squaresData = this.cache.json.get('squaresData') as Array<{ x: number, y: number, title: string, url: string }>;
        
        squaresData.forEach(square => {
            const adjustedY = gridHeight - (square.y + 1) * cellSize;
    
            const squareGraphic = this.add.rectangle(
                square.x * cellSize,
                adjustedY,
                cellSize,
                cellSize,
                0x0000ff
            ).setOrigin(0, 0).setInteractive().setData('url', square.url);
        
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
        // Glare effect implementation is commented out for now
    }
}
