import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameContainer') gameContainer!: ElementRef;

  playerElement: HTMLElement | null = null;
  playerPosition = { x: 0, y: 0 }; // Position relative to the game container
  playerVelocityY = 0;
  isJumping = false;
  moveSpeed = 10; 
  jumpStrength = 20;
  gravity = 1;
  groundPosition = 0; // Y position of the ground
  gameContainerHeight = 600; // Match CSS

  // Background and Earth elements
  background1Element: HTMLElement | null = null;
  background2Element: HTMLElement | null = null;
  earth1Element: HTMLElement | null = null;
  earth2Element: HTMLElement | null = null;
  
  backgroundWidth = 0; // Width of the game container, effectively
  scrollSpeed = 2; // Constant speed for scrolling background and earth

  private gameLoopId: number | null = null;

  constructor() { }

  ngOnInit(): void {
    // DOM elements are not available here yet. Moved to ngAfterViewInit.
  }

  ngAfterViewInit(): void {
    this.playerElement = document.getElementById('player');
    this.background1Element = document.getElementById('bg1');
    this.background2Element = document.getElementById('bg2');
    this.earth1Element = document.getElementById('earth1');
    this.earth2Element = document.getElementById('earth2');

    if (!this.gameContainer || !this.playerElement || !this.background1Element || !this.background2Element || !this.earth1Element || !this.earth2Element) {
      console.error("One or more game elements are missing!");
      return;
    }
    
    this.backgroundWidth = this.gameContainer.nativeElement.offsetWidth;
    const earthHeight = this.earth1Element.offsetHeight; // Assuming earth1 has loaded and has height
    this.groundPosition = earthHeight; // Player's y is relative to bottom of container, so ground is at earthHeight

    // Initialize player position
    this.playerPosition.x = (this.backgroundWidth / 2) - (this.playerElement.offsetWidth / 2);
    this.playerPosition.y = this.groundPosition;
    this.updatePlayerElementPosition();

    // Set initial positions for scrolling elements
    this.background1Element.style.left = '0px';
    this.background2Element.style.left = this.backgroundWidth + 'px';
    this.earth1Element.style.left = '0px';
    this.earth2Element.style.left = this.backgroundWidth + 'px';
    
    // Adjust player's initial bottom based on earth height
    if (this.playerElement) {
        this.playerElement.style.bottom = `${this.groundPosition}px`;
    }


    document.addEventListener('keydown', this.handleKeyDown);
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
  }

  startGameLoop(): void {
    const gameUpdate = () => {
      this.updateGame();
      this.gameLoopId = requestAnimationFrame(gameUpdate);
    };
    this.gameLoopId = requestAnimationFrame(gameUpdate);
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.playerElement) return;

    if (event.key === 'ArrowLeft') {
      this.playerPosition.x -= this.moveSpeed;
    } else if (event.key === 'ArrowRight') {
      this.playerPosition.x += this.moveSpeed;
    } else if (event.key === ' ' && !this.isJumping) {
      this.isJumping = true;
      this.playerVelocityY = this.jumpStrength;
    }

    // Prevent player from moving out of screen bounds (horizontally)
    if (this.playerPosition.x < 0) {
      this.playerPosition.x = 0;
    } else if (this.playerPosition.x + this.playerElement.offsetWidth > this.backgroundWidth) {
      this.playerPosition.x = this.backgroundWidth - this.playerElement.offsetWidth;
    }
  }

  updateGame(): void {
    if (!this.playerElement || !this.background1Element || !this.background2Element || !this.earth1Element || !this.earth2Element) return;

    // Scroll Background
    let bg1Left = parseInt(this.background1Element.style.left, 10);
    let bg2Left = parseInt(this.background2Element.style.left, 10);

    bg1Left -= this.scrollSpeed;
    bg2Left -= this.scrollSpeed;

    if (bg1Left < -this.backgroundWidth) {
      bg1Left = bg2Left + this.backgroundWidth;
    }
    if (bg2Left < -this.backgroundWidth) {
      bg2Left = bg1Left + this.backgroundWidth;
    }

    this.background1Element.style.left = `${bg1Left}px`;
    this.background2Element.style.left = `${bg2Left}px`;

    // Scroll Earth
    let earth1Left = parseInt(this.earth1Element.style.left, 10);
    let earth2Left = parseInt(this.earth2Element.style.left, 10);

    earth1Left -= this.scrollSpeed; // Same speed as background for now
    earth2Left -= this.scrollSpeed;

    if (earth1Left < -this.backgroundWidth) {
      earth1Left = earth2Left + this.backgroundWidth;
    }
    if (earth2Left < -this.backgroundWidth) {
      earth2Left = earth1Left + this.backgroundWidth;
    }

    this.earth1Element.style.left = `${earth1Left}px`;
    this.earth2Element.style.left = `${earth2Left}px`;

    // Player Physics (Gravity and Jump)
    if (this.isJumping || this.playerPosition.y > this.groundPosition) {
      this.playerPosition.y += this.playerVelocityY;
      this.playerVelocityY -= this.gravity;
    }

    // Ground Check for Player
    if (this.playerPosition.y <= this.groundPosition) {
      this.playerPosition.y = this.groundPosition;
      this.isJumping = false;
      this.playerVelocityY = 0;
    }
    
    // Update player DOM element position
    this.updatePlayerElementPosition();
  }

  updatePlayerElementPosition(): void {
    if (this.playerElement) {
      this.playerElement.style.left = `${this.playerPosition.x}px`;
      // playerPosition.y is the position of the player's bottom edge from the container's bottom.
      this.playerElement.style.bottom = `${this.playerPosition.y}px`;
    }
  }
}
