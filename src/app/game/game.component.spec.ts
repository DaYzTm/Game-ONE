import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GameComponent } from './game.component';
import { CommonModule } from '@angular/common';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let playerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, GameComponent] // GameComponent is standalone, so import it directly
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    // It's important to call detectChanges for ngOnInit and to render the initial view
    fixture.detectChanges(); 
    playerElement = fixture.debugElement.query(By.css('#player')).nativeElement;
  });

  it('should create the game component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize player position', fakeAsync(() => {
    // ngAfterViewInit is where playerElement is set and initial position applied
    // fixture.detectChanges() in beforeEach should call ngAfterViewInit
    // We might need to wait for requestAnimationFrame if initial positioning is inside it
    tick(); // Process one frame of requestAnimationFrame if used for initial setup
    
    // Default values from component:
    // Player's initial x is (backgroundWidth / 2) - (playerElement.offsetWidth / 2)
    // backgroundWidth is gameContainer.offsetWidth. Player width is 50px.
    // gameContainer width is 800px. So, x = (800/2) - (50/2) = 400 - 25 = 375.

    // groundPosition is earthHeight (100px set in CSS).
    // playerPosition.y is groundPosition.

    // Need to ensure elements for groundPosition calculation are present or mocked.
    // For simplicity, let's check against the initial x and that y is a number.
    // A more robust test would mock element dimensions.
    
    // Manually trigger ngAfterViewInit logic related to dimensions if needed,
    // or ensure test environment provides dimensions.
    // The component's ngAfterViewInit calculates these.
    // Let's assume gameContainer width is 800px as per CSS.
    // playerElement width is 50px as per CSS.
    // earth1Element height is 100px as per CSS.

    // We must ensure the DOM elements component relies on are available and have dimensions.
    // TestBed doesn't render CSS-defined sizes unless specific configurations are made.
    // Let's mock these for predictability.
    spyOn(component.gameContainer.nativeElement, 'offsetWidth').and.returnValue(800);
    spyOn(component.playerElement!, 'offsetWidth').and.returnValue(50);
    spyOn(component.earth1Element!, 'offsetHeight').and.returnValue(100);

    // Call ngAfterViewInit again or a method that encapsulates its logic if needed,
    // or trust that the initial detectChanges and tick() were sufficient.
    // For safety, let's re-run parts of the setup or ensure it's testable.
    // The issue is that ngAfterViewInit in the component uses actual offsetWidth/Height.
    // These might be 0 in test environment if not explicitly set or css not fully applied.

    // Let's refine the expectation for playerPosition.x based on component logic
    // If gameContainer.nativeElement.offsetWidth is 0, then playerPosition.x would be -25.
    // The spy should make it 375.
    
    component.ngAfterViewInit(); // Re-call to ensure spies are used
    tick(); // Process any async operations within ngAfterViewInit

    expect(component.playerPosition.x).toBe(375); 
    expect(playerElement.style.left).toBe(component.playerPosition.x + 'px');
    
    expect(component.playerPosition.y).toBe(100); // groundPosition = earthHeight (100px)
    expect(playerElement.style.bottom).toBe(component.playerPosition.y + 'px');
  }));

  it('should move player right on ArrowRight keydown', fakeAsync(() => {
    const initialX = component.playerPosition.x;
    const moveSpeed = component.moveSpeed;

    // Dispatch ArrowRight event
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    document.dispatchEvent(event);
    
    tick(); // Allow time for event processing and requestAnimationFrame
    fixture.detectChanges(); // Update view based on new component state

    expect(component.playerPosition.x).toBe(initialX + moveSpeed);
    expect(playerElement.style.left).toBe((initialX + moveSpeed) + 'px');
  }));

  it('should initiate jump on Space keydown when not already jumping', fakeAsync(() => {
    expect(component.isJumping).toBeFalse();
    // const initialY = component.playerPosition.y; // Not directly used in this test's assertions
    const jumpStrength = component.jumpStrength; 

    // Dispatch Space event
    const event = new KeyboardEvent('keydown', { key: 'Space' });
    document.dispatchEvent(event);

    tick(); // Allow time for event processing
    fixture.detectChanges();

    expect(component.isJumping).toBeTrue();
    expect(component.playerVelocityY).toBe(jumpStrength); 
  }));

  it('should return to ground after a jump', fakeAsync(() => {
    // Ensure groundPosition is set up correctly for the test
    spyOn(component.gameContainer.nativeElement, 'offsetWidth').and.returnValue(800);
    spyOn(component.playerElement!, 'offsetWidth').and.returnValue(50);
    spyOn(component.earth1Element!, 'offsetHeight').and.returnValue(100);
    component.ngAfterViewInit(); // Ensure groundPosition is calculated with spies
    tick(); // Complete ngAfterViewInit

    const groundPosition = component.groundPosition; // Should be 100
    expect(groundPosition).toBe(100); // Verify groundPosition based on mocked values

    // Dispatch Space event to jump
    const event = new KeyboardEvent('keydown', { key: 'Space' });
    document.dispatchEvent(event);
    tick(); // Initial jump impulse

    expect(component.isJumping).toBeTrue();
    
    // Let the game loop run. updateGame is called by requestAnimationFrame in the component.
    // We need to tick to simulate passage of time for requestAnimationFrame.
    for (let i = 0; i < 300; i++) { // Simulate enough frames
        tick(16); // Advance time by approx one frame (16ms ~ 60fps)
        if (!component.isJumping && component.playerPosition.y === groundPosition) {
            break;
        }
    }
    fixture.detectChanges(); // Update view with final state
    
    expect(component.isJumping).toBeFalse();
    expect(component.playerPosition.y).toBe(groundPosition);
    expect(playerElement.style.bottom).toBe(groundPosition + 'px');
  }));
  
  afterEach(() => {
    fixture.destroy(); // This calls ngOnDestroy on the component
  });
});
