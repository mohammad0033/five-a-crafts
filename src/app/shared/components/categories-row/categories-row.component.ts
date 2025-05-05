import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Category} from '../../../core/models/category';

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
@Input() categories!: Category[]
}
