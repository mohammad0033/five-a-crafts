import {Component, Input} from '@angular/core';
import {NgForOf, NgStyle} from '@angular/common';
import {CategoryItem} from '../../../../models/category-item';

@Component({
  selector: 'app-home-categories-row',
  imports: [
    NgForOf,
    NgStyle
  ],
  templateUrl: './home-categories-row.component.html',
  standalone: true,
  styleUrl: './home-categories-row.component.scss'
})
export class HomeCategoriesRowComponent {
@Input() categories!: CategoryItem[]
}
