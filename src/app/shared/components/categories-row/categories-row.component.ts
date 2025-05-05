import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {CategoryItem} from '../../../features/home/models/category-item';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-categories-row',
  imports: [
    NgForOf,
    RouterLink
  ],
  templateUrl: './categories-row.component.html',
  standalone: true,
  styleUrl: './categories-row.component.scss'
})
export class CategoriesRowComponent {
@Input() categories!: CategoryItem[]
}
