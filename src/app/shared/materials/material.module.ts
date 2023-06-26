import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

const Materials = [
    MatDialogModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule
];

@NgModule({
    declarations: [],
    imports: [Materials],
    exports: [Materials]
})
export class MaterialModule {}