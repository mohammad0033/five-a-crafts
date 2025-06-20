import {Component, Input, OnInit} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-user-widget',
  imports: [
    NgIf,
    FaIconComponent,
    NgClass,
    TranslatePipe,
    // TranslatePipe
  ],
  templateUrl: './user-widget.component.html',
  standalone: true,
  styleUrl: './user-widget.component.scss'
})
export class UserWidgetComponent implements OnInit {
  @Input() image!:string | null
  @Input() name!:string
  @Input() phone!:string
  protected readonly faUser = faUser;
  // protected readonly faEdit = faEdit;
  currentLang!: string

  constructor(private translate: TranslateService) {
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang;
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
    });
  }
}
