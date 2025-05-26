import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { first } from 'rxjs';
import { FlowDialogComponent } from 'src/app/flow/components/flow-dialog/flow-dialog.component';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
    private dialogConfig: MatDialogConfig = new MatDialogConfig();
    public stats = [
        {
            value: 20000000,
            suffix: '+',
            description: 'Cancer Diagnoses (2024)',
        },
        { value: 10000000, suffix: '+', description: 'Cancer Deaths (2024)' },
        {
            text: '1 in 2',
            description:
                'Males get diagnosed with <br /> cancer in their lifetime',
        },
        {
            text: '1 in 3',
            description:
                'Females get diagnosed with <br /> cancer in their lifetime',
        },
    ];
    animatedStats: any[] = [
        {
            displayValue: '0',
            description: 'Cancer Diagnoses (2024)',
        },
        {
            displayValue: '0',
            description: 'Cancer Deaths (2024)',
        },
        {
            displayValue: '1 in 0',
            description:
                'Males get diagnosed with <br /> cancer in their lifetime',
        },
        {
            displayValue: '1 in 0',
            description:
                'Females get diagnosed with <br /> cancer in their lifetime',
        },
    ];

    constructor(private dialog: MatDialog) {}

    public ngOnInit(): void {
        this.initDialogConfig();
        setTimeout(() => {
            this.animatedStats = [];
            this.stats.forEach((stat) => {
                if (stat.value !== undefined) {
                    this.animateNumber(
                        stat.value,
                        stat.suffix || '',
                        stat.description
                    );
                } else if (stat.text) {
                    this.animateFraction(stat.text, stat.description);
                }
            });
        }, 2100);
    }

    private initDialogConfig(): void {
        this.dialogConfig.width = '850px';
        this.dialogConfig.maxWidth = '100dvw';
    }

    public openSignUpDialog(): void {
        const dialogRef = this.dialog.open(
            FlowDialogComponent,
            this.dialogConfig
        ).afterClosed().pipe(first()).subscribe(() => {
            if (typeof window !== 'undefined')
                history.pushState(null, '', `/`);
        });
    }

    public scrollDown(): void {
        window.scrollTo({
            top: window.innerHeight, // Scroll 100 pixels down from the current position
            left: 0,
            behavior: 'smooth', // Smooth scrolling,
        });
    }

    animateNumber(target: number, suffix: string, description: string) {
        const baseDuration = 2500;
        const frameRate = 20;
        const steps = baseDuration / (1000 / frameRate);
        let current = 0;

        const stat = { displayValue: '0', description };
        this.animatedStats.push(stat);

        const interval = setInterval(() => {
            let dynamicIncrement: number = 0;

            if (target >= 1_000_000 && current <= 10_000_000) {
                if (current < 1000) {
                    dynamicIncrement = 500;
                } else if (current < 10000) {
                    dynamicIncrement = 1000;
                } else if (current < 100000) {
                    dynamicIncrement = 5000;
                } else if (current < 500000) {
                    dynamicIncrement = 100000;
                } else if (current < 1000000) {
                    dynamicIncrement = 200000;
                } else if (current > 10000000) {
                    dynamicIncrement = 10000000;
                } else {
                    dynamicIncrement = 500000;
                }
            } else if (target > 10_000_000) {
                if (current >= 10_000_000) {
                    dynamicIncrement = 10_000_000;
                }
            } else {
                if (current < 1000) {
                    dynamicIncrement = 50;
                } else if (current < 10000) {
                    dynamicIncrement = 200;
                } else if (current < 100000) {
                    dynamicIncrement = 1000;
                } else if (current > 10000000) {
                    dynamicIncrement = 10000000;
                } else {
                    dynamicIncrement = 5000;
                }
            }

            current += dynamicIncrement;
            if (current >= target) {
                current = target;
                clearInterval(interval);
                stat.displayValue = this.formatShortNumber(current) + suffix;
                return;
            }

            stat.displayValue = this.formatRawNumber(current) + suffix;
        }, 1000 / frameRate);
    }

    formatRawNumber(num: number): string {
        return num.toLocaleString();
    }

    animateFraction(text: string, description: string) {
        const [first, second] = text.split(' in ');
        const target = +second;
        let current = 0;

        const stat = { displayValue: `${first} in 0`, description };
        this.animatedStats.push(stat);

        const interval = setInterval(() => {
            current += 1;
            if (current >= target) {
                current = target;
                clearInterval(interval);
                stat.displayValue = this.formatShortNumber(Math.floor(current));
            }
            stat.displayValue = `${first} in ${current}`;
        }, 600);
    }

    formatShortNumber(num: number): string {
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(0) + 'M';
        if (num >= 1_000) return (num / 1_000).toFixed(0) + 'K';
        return num.toString();
    }
}
