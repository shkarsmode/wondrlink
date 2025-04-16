import { ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, DoCheck, Injector, Input } from '@angular/core';
import { CancerFormComponent } from 'src/app/shared/components/cancer-form/cancer-form.component';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { ArticleService } from 'src/app/shared/services/article-service.service';

@Component({
    selector: 'app-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements DoCheck {
    @Input() article: IInfo;
    private formComponentRef?: ComponentRef<CancerFormComponent>;

    constructor(
        public readonly articleService: ArticleService,
        private readonly injector: Injector,
        private readonly appRef: ApplicationRef,
        private readonly resolver: ComponentFactoryResolver
    ) {}

    public ngDoCheck(): void {
        this.addCancerFormIfItHasId();
    }

    public get isArticleTypeOfArray(): boolean {
        return typeof this.article?.content === 'object';
    }


    private addCancerFormIfItHasId(): void {
        if (location.pathname !== '/patients') return;

        const cancerForm = document.querySelector('.cancer-form');
        const formExist = document.querySelector('app-cancer-care-table');
        if (cancerForm && !formExist) {
            const factory =
                this.resolver.resolveComponentFactory(CancerFormComponent);
            this.formComponentRef = factory.create(this.injector);

            this.appRef.attachView(this.formComponentRef.hostView);
            const domElem = (this.formComponentRef.hostView as any)
                .rootNodes[0] as HTMLElement;

            cancerForm.appendChild(domElem);
        }
    }

    public ngOnDestroy(): void {
        if (this.formComponentRef) {
            this.appRef.detachView(this.formComponentRef.hostView);
            this.formComponentRef.destroy();
        }
    }
}
