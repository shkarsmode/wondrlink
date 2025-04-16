import { AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, Injector, Input } from '@angular/core';
import { CancerFormComponent } from 'src/app/shared/components/cancer-form/cancer-form.component';
import { IInfo } from 'src/app/shared/interfaces/IInfo';
import { ArticleService } from 'src/app/shared/services/article-service.service';

@Component({
    selector: 'app-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss'],
})
export class ArticleComponent implements AfterViewInit {
    @Input() article: IInfo;
    private formComponentRef?: ComponentRef<CancerFormComponent>;

    constructor(
        public articleService: ArticleService,
        private injector: Injector,
        private appRef: ApplicationRef,
        private resolver: ComponentFactoryResolver
    ) {}

    public ngAfterViewInit(): void {
        this.addCancerFormIfItHasId();
    }

    public get isArticleTypeOfArray(): boolean {
        return typeof this.article?.content === 'object';
    }

    private addCancerFormIfItHasId(): void {
        const cancerForm = document.querySelector('.cancer-form');
        if (cancerForm) {
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
