import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'count-selector',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './count-selector.html',
  styleUrl: './count-selector.scss',
})
export class CountSelector {
  @Input() count: number = 1;

  @Output() onCountChange: EventEmitter<number> = new EventEmitter<number>();

  // countChange(value: number) {
  //   //чтобы значение, введенное стрелками, было связано со сзначением, введенным в инпуте
  //   this.count = value;
  //
  //   this.onCountChange.emit(value);
  // }

  countChange() {
    this.onCountChange.emit(this.count);
  }

  decreaseCount() {
    if (this.count > 1) {
      this.count--;
      this.countChange();
    }
  }

  increaseCount() {
      this.count++;
    this.countChange();
  }

}
