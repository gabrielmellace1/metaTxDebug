// GameComponent.tsx
import React, { Component } from 'react';
import Phaser from 'phaser';
import MainScene from './MainScene';
import PopupScene from './PopupScene';
import { toast } from 'react-toastify';
import { AtlasTile } from '../../types/atlasTypes';
import Loading from "../../components/Utils/Loading"

type Props = {};


interface State {
  isMobile: boolean;
  clickableSquares: AtlasTile[];
  isVisible: boolean;
  loading: boolean;
  imageUrl: string;
}


class TownComponent extends Component<Props,State> {
  private game?: Phaser.Game;
  private gameContainerRef = React.createRef<HTMLDivElement>();
  private notificationInterval: any;

  constructor(props: Props) {
    super(props);
    // Set initial state
    this.state = {
      isMobile: window.innerWidth < 768,
      clickableSquares: [],
      isVisible: false,
      loading: true,
      imageUrl: "placeholder"
    };
}


  async componentDidMount() {
    await this.fetchSquaresData(); // Fetch data
    const imageUrl = await this.checkForNewImage();

    this.setState({ imageUrl }, () => {

    window.addEventListener('resize', this.handleResize);
    this.handleLayoutCompletion();
    

    this.startRandomNotification(); // Start notifications
    this.handleResize();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    console.log('TownComponent mounted'); // Add this line
    this.setState({ isVisible: true, loading: false }); // Add this line
    });
  }

  handleLayoutCompletion = () => {
    // This might be a timeout or a real check to see if certain elements are rendered
    setTimeout(() => {
      this.handleResize(); // Initialize resizing once everything is ready
    }, 1000); // Adjust timing based on actual layout load time
  };

  handleResize = () => {
    console.log("Resizing");
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

  async fetchSquaresData() {
    const jsonUrl = 'https://pub-7259634f7e994e1e8a46cf6cfaea5881.r2.dev/transformedTiles.json';
    const etagKey = 'squaresDataETag';
    const cachedDataKey = 'cachedSquaresData';
    const etag = localStorage.getItem(etagKey) || '';
  
    try {
      // Add timestamp to the URL to force the browser to bypass the cache for the HEAD request
      const timestamp = new Date().getTime();
      const headResponse = await fetch(`${jsonUrl}?_=${timestamp}`, { method: 'HEAD' });
      const newEtag = headResponse.headers.get('ETag');
  
      if (newEtag !== etag && newEtag) {
        // ETag has changed, fetch new data and update localStorage
        const dataResponse = await fetch(jsonUrl);
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          localStorage.setItem(etagKey, newEtag);
          localStorage.setItem(cachedDataKey, JSON.stringify(data));
          const squares: AtlasTile[] = Object.values(data.data) as AtlasTile[];
          const clickableSquares: AtlasTile[] = squares.filter((square: AtlasTile) => square.clickableURL !== null);
  
          this.setState({ clickableSquares }, () => {
            console.log('Clickable Squares:', this.state.clickableSquares);
          });
        } else {
          console.error('Failed to fetch squares data:', dataResponse.statusText);
        }
      } else {
        // ETag is the same, use cached data
        const cachedData = localStorage.getItem(cachedDataKey);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          const squares: AtlasTile[] = Object.values(data.data) as AtlasTile[];
          const clickableSquares: AtlasTile[] = squares.filter((square: AtlasTile) => square.clickableURL !== null);
  
          this.setState({ clickableSquares }, () => {
            console.log('Clickable Squares:', this.state.clickableSquares);
          });
        } else {
          console.error('No cached data available');
        }
      }
    } catch (error) {
      console.error('Error fetching squares data:', error);
      // In case of an error, try to load cached data
      const cachedData = localStorage.getItem(cachedDataKey);
      if (cachedData) {
        const data = JSON.parse(cachedData);
        const squares: AtlasTile[] = Object.values(data.data) as AtlasTile[];
        const clickableSquares: AtlasTile[] = squares.filter((square: AtlasTile) => square.clickableURL !== null);
  
        this.setState({ clickableSquares }, () => {
          console.log('Clickable Squares:', this.state.clickableSquares);
        });
      }
    }
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  async checkForNewImage() {
    const baseUrl = 'https://pub-7259634f7e994e1e8a46cf6cfaea5881.r2.dev/cryptowall.png';
    const etagKey = 'backgroundETag';
    const etag = localStorage.getItem(etagKey) || '';
  
    try {
      // Add timestamp to the URL to force the browser to bypass the cache for the HEAD request
      const timestamp = new Date().getTime();
      const response = await fetch(`${baseUrl}?_=${timestamp}`, { method: 'HEAD' });
      const newEtag = response.headers.get('ETag');
  
      if (newEtag !== etag && newEtag) {
        localStorage.setItem(etagKey, newEtag);
        // Use the ETag as a part of the query string for cache busting
        return `${baseUrl}?etag=${newEtag}`;
      }
      // Return the URL with the current ETag if it exists, otherwise use the base URL
      return etag ? `${baseUrl}?etag=${etag}` : baseUrl;
    } catch (error) {
      console.error('Error checking image ETag:', error);
      // Fallback to the most recent known version if the check fails
      return etag ? `${baseUrl}?etag=${etag}` : baseUrl;
    }
  }
  
  
  
  initializeGame = async (width: number, height: number) => {
    const { imageUrl, clickableSquares } = this.state;
  
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-game-container',
      width,
      height,
      scene: [new MainScene(imageUrl, clickableSquares), PopupScene] // Pass clickableSquares
    };
  
    this.game = new Phaser.Game(config);
  };

  componentWillUnmount() {
    console.log('TownComponent unmounted'); // Add this line
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    clearInterval(this.notificationInterval);
    if (this.game) {
      this.game.destroy(true);
    }
    this.setState({ isVisible: false }); // Add this line
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
  if (this.state.loading) {
    return <Loading />; // Show loading spinner while loading is true
  }

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





startRandomNotification = () => {
  if (this.notificationInterval) {
    clearInterval(this.notificationInterval);
  }

  this.notificationInterval = setInterval(() => {
    if (this.state.clickableSquares.length > 0) {
      const randomSquare = this.state.clickableSquares[Math.floor(Math.random() * this.state.clickableSquares.length)];
      toast.info(
        React.createElement(
          'div',
          {
            onClick: () => window.open(randomSquare.clickableURL, '_blank'),
            style: { cursor: 'pointer' }
          },
          `Someone just clicked on the link: ${randomSquare.clickableURL}`
        ), {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  }, 15000);
};

handleVisibilityChange = () => {
  if (document.hidden || !this.state.isVisible) { // Modify this line
    clearInterval(this.notificationInterval);
    console.log('Notifications paused'); // Add this line
  } else {
    this.startRandomNotification();
    console.log('Notifications resumed'); // Add this line
  }
};


}

export default TownComponent;
