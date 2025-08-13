import { Injectable } from '@angular/core';
import { ProjectTypeEnum } from 'src/app/shared/interfaces/project-type.enum';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private readonly PROJECT_TYPE_KEY = 'projectType';
    private currentType: ProjectTypeEnum = 
        (localStorage.getItem(this.PROJECT_TYPE_KEY) as ProjectTypeEnum) ?? 
        ProjectTypeEnum.Wondrlink;

    constructor() { }

    public change(project: ProjectTypeEnum): void {
        this.currentType = project;
        localStorage.setItem(this.PROJECT_TYPE_KEY, project);
    }

    public get current(): ProjectTypeEnum {
        return this.currentType;
    }
}
