import Phaser from 'phaser';

export default class PopupScene extends Phaser.Scene {
    private popup!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'PopupScene', active: true });
    }

    create(): void {
        this.popup = this.add.text(0, 0, 'Popup', {
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '20px',
            padding: { left: 20, right: 20, top: 20, bottom: 20 },
            wordWrap: { width: 200 },
            align: 'center'
        }).setOrigin(0.5, 1).setVisible(false);
    }

    public showPopup(title: string, x: number, y: number): void {
        this.popup.setText(title);
        this.popup.setPosition(x, y);
        this.popup.setVisible(true);
    }

    public hidePopup(): void {
        this.popup.setVisible(false);
    }
}
