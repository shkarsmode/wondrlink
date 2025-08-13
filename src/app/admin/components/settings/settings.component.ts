import { Component, inject } from '@angular/core';
import { ProjectTypeEnum } from 'src/app/shared/interfaces/project-type.enum';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
    public ProjectType: typeof ProjectTypeEnum = ProjectTypeEnum;
    public projectService: ProjectService = inject(ProjectService);

}
