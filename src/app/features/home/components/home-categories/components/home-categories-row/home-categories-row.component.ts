import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {CategoryItem} from '../../../../models/category-item';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home-categories-row',
  imports: [
    NgForOf,
    RouterLink
  ],
  templateUrl: './home-categories-row.component.html',
  standalone: true,
  styleUrl: './home-categories-row.component.scss'
})
export class HomeCategoriesRowComponent {
@Input() categories!: CategoryItem[]
}
