import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

const Materials = [
    MatDialogModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule
];

@NgModule({
    declarations: [],
    imports: [Materials],
    exports: [Materials]
})
export class MaterialModule {}