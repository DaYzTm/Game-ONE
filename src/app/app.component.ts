import { Component } from '@angular/core';
import { GameComponent } from './game/game.component'; // Import GameComponent

@Component({
  selector: 'app-root',
  standalone: true, // Ensure standalone is true
  imports: [GameComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'infinite-runner';
}
