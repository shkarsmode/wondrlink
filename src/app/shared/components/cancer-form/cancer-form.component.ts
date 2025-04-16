import { Component } from '@angular/core';

@Component({
    selector: 'app-cancer-care-table',
    template: `
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr class="header-row">
                        <th class="service-col">Service & Access</th>
                        <th *ngFor="let stage of stages">
                            <div class="stage-header">
                                <img
                                    *ngIf="stage.icon"
                                    [src]="stage.icon"
                                    alt="icon"
                                    class="icon"
                                />
                                <span>{{ stage.label }}</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let service of services" class="data-row">
                        <td class="service-name">{{ service.name }}</td>
                        <td *ngFor="let stage of stages" class="check-cell">
                            @if (service.availableIn.includes(stage.key)) {
                            <span> ✔ </span>
                            }
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    styleUrls: ['./cancer-form.component.scss'],
})
export class CancerFormComponent {
    stages = [
        {
            key: 'proactive',
            label: 'Proactive Cancer Risk Reduction',
            icon: 'assets/svg/chemistry.svg',
        },
        {
            key: 'diagnosed',
            label: 'Newly Diagnosed',
            icon: 'assets/svg/stethoscope.svg',
        },
        {
            key: 'treatment',
            label: 'Undergoing Standard Treatment',
            icon: 'assets/svg/dnk.svg',
        },
        {
            key: 'trial',
            label: 'Clinical Trial Assessment',
            icon: 'assets/svg/microscope.svg',
        },
        {
            key: 'novel',
            label: 'Exploring Novel Therapies',
            icon: 'assets/svg/key.svg',
        },
        {
            key: 'eol',
            label: 'Navigating End-of-Life Care',
            icon: 'assets/svg/handshake.svg',
        },
    ];

    services = [
        {
            name: 'Genomic & Molecular Testing',
            availableIn: [
                'proactive',
                'diagnosed',
                'treatment',
                'trial',
                'novel',
            ],
        },
        {
            name: 'Risk Reduction & Early Detection',
            availableIn: ['proactive'],
        },
        {
            name: 'Longevity & Wellness Planning',
            availableIn: ['proactive', 'diagnosed'],
        },
        {
            name: 'Medical Review & Treatment Planning',
            availableIn: ['diagnosed', 'treatment', 'trial', 'novel', 'eol'],
        },
        {
            name: 'Care Oversight & Advocacy',
            availableIn: ['diagnosed', 'treatment', 'trial', 'novel', 'eol'],
        },
        { name: 'Clinical Trials Access', availableIn: ['trial', 'novel'] },
        {
            name: 'Exclusive Access to Therapies in Development',
            availableIn: ['trial', 'novel', 'eol'],
        },
        { name: 'Personalized End-of-Life Care', availableIn: ['eol'] },
    ];
}
