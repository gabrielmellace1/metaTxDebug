// const app = new PIXI.Application();
//         await app.init({ width: 640, height: 360 });
//         document.body.appendChild(app.canvas);


//         let graphics = new PIXI.Graphics();
//     graphics.beginFill(0xFF0000, 1); // Solid red color
//     graphics.drawRect(100, 100, 200, 200); // Draw a rectangle to be clearly visible
//     graphics.endFill();
//     app.stage.addChild(graphics); // Add to the stage


import * as PIXI from 'https://pixijs.download/release/pixi.mjs';

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('myCanvas');

    const app = new PIXI.Application({
        view: canvas,
        width: 5000, // Size of the grid
        height: 5000,
        backgroundColor: 0x1099bb, // Light blue background for visibility
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    const container = new PIXI.Container();
    app.stage.addChild(container);

    // Create grid squares
    for (let x = 0; x < 5000; x += 10) {
        for (let y = 0; y < 5000; y += 10) {
            const square = new PIXI.Graphics();
            square.lineStyle(0.1, 0x000000, 1); // Thin black lines for the grid
            square.beginFill(0xFFFFFF, 1); // Fill color white
            square.drawRect(x, y, 10, 10); // Each square is 10x10 pixels
            square.endFill();
            container.addChild(square);
        }
    }
});
