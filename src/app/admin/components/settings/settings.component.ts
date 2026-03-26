import { Component, inject } from '@angular/core';
import { ProjectTypeEnum } from 'src/app/shared/interfaces/project-type.enum';
import { ProjectService } from '../../services/project.service';

interface ProjectOption {
    type: ProjectTypeEnum;
    title: string;
    subtitle: string;
    description: string;
    logoSrc: string;
    logoAlt: string;
    theme: 'wondrlink' | 'wondrvoices';
}

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
    public ProjectType: typeof ProjectTypeEnum = ProjectTypeEnum;
    public projectService: ProjectService = inject(ProjectService);
    public projectOptions: ProjectOption[] = [
        {
            type: ProjectTypeEnum.Wondrlink,
            title: 'wondrlink',
            subtitle: 'Core admin workspace',
            description: 'Best for posts, main site updates, and the default Wondrlink publishing context.',
            logoSrc: 'assets/img/logo-large.svg',
            logoAlt: 'Wondrlink logo',
            theme: 'wondrlink',
        },
        {
            type: ProjectTypeEnum.Wondrvoices,
            title: 'wondrvoices',
            subtitle: 'Voices and gallery workspace',
            description: 'Use this when working with Wondrvoices-specific content, feeds, and publishing flows.',
            logoSrc: 'assets/img/logo-wondrvoices.svg',
            logoAlt: 'Wondrvoices logo',
            theme: 'wondrvoices',
        },
    ];

    public selectProject(project: ProjectTypeEnum): void {
        this.projectService.change(project);
    }

    public isSelected(project: ProjectTypeEnum): boolean {
        return this.projectService.current === project;
    }
}
