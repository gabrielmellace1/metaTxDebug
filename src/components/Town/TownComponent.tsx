// GameComponent.tsx
import React, { Component } from 'react';
import Phaser from 'phaser';
import MainScene from './MainScene';

type Props = {};


interface State {
  isMobile: boolean;
}


class TownComponent extends Component<Props,State> {
  private game?: Phaser.Game;
  private gameContainerRef = React.createRef<HTMLDivElement>();


  constructor(props: Props) {
    super(props);
    // Set initial state
    this.state = {
      isMobile: window.innerWidth < 768
    };
}


  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize(); // Set the initial size based on the current viewport
  }

  handleResize = () => {
    if (this.gameContainerRef.current) {
      const rect = this.gameContainerRef.current.getBoundingClientRect();
      this.gameContainerRef.current.style.height = `calc(${window.innerHeight}px - ${rect.top}px)`; // Calculate the height dynamically
      
      if (this.game) {
        // Update the Phaser game size
        this.game.scale.resize(rect.width, window.innerHeight - rect.top);
      } else {
        this.initializeGame(rect.width, window.innerHeight - rect.top);
      }
    }
  };

  initializeGame = (width: number, height: number) => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-game-container',
      width: width,
      height: height,
      scene: [MainScene]
    };

    // Initialize the Phaser game with the dynamically calculated dimensions
    this.game = new Phaser.Game(config);
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.game) {
      this.game.destroy(true);
    }
  }

  renderZoomButtons() {
    return (
        <div style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            zIndex: 100, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
        }}>
            <button onClick={() => this.scaleGame(0.1)} style={{ fontSize: '24px', padding: '10px 20px', margin: '5px' }}>+</button>
            <button onClick={() => this.scaleGame(-0.1)} style={{ fontSize: '24px', padding: '10px 20px', margin: '5px' }}>-</button>
        </div>
    );
}

scaleGame(zoomIncrement: number) {
    const scene = this.game?.scene.getScene('MainScene') as any; // Cast to any to bypass type checking
    scene?.scaleZoom(zoomIncrement);
}

render() {
  return (
      <div
          id="phaser-game-container"
          ref={this.gameContainerRef}
          style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}
      >
          {this.state.isMobile && this.renderZoomButtons()}
      </div>
  );
}


}

export default TownComponent;
