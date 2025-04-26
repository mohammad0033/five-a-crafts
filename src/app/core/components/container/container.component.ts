import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';

@Component({
  selector: 'app-container',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './container.component.html',
  standalone: true,
  styleUrl: './container.component.scss'
})
export class ContainerComponent {

}
