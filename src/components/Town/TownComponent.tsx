// GameComponent.tsx
import React, { Component } from 'react';
import Phaser from 'phaser';
import MainScene from './MainScene';

type Props = {};

class TownComponent extends Component<Props> {
  private game?: Phaser.Game;
  private gameContainerRef = React.createRef<HTMLDivElement>();

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

  render() {
    return (
      <div
        id="phaser-game-container"
        ref={this.gameContainerRef}
        style={{
          width: '100%',
          // Start with an arbitrary height, `handleResize` will adjust it
          height: '50vh',
          overflow: 'hidden',
        }}
      />
    );
  }
}

export default TownComponent;
