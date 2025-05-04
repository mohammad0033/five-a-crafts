import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.component.html',
  standalone: true,
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {

  constructor(
    private metaService: Meta,
    private titleService: Title // Optional: Inject Title if needed
  ) {}

  ngOnInit(): void {
    // Optional: Explicitly set title if route title isn't reliable enough
    // this.titleService.setTitle('Your Cart | Five A Crafts');

    // Add noindex tag to prevent search engine indexing
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    // ... other component initialization logic ...
  }

  ngOnDestroy(): void {
    // It's good practice to remove or reset the robots tag when leaving the component
    // This prevents it from potentially persisting if navigation logic changes later.
    this.metaService.removeTag("name='robots'");
  }
}
