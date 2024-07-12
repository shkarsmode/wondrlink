export type TFormFlow = 'patients' | 'drug-developers' | 'ecosystem' | 'physicians';

export interface FlowComponentConfig {
    flow: TFormFlow,
    step: number,
    isSkipFirstStep: boolean
}
  

export function isTFormFlow(value: any): value is TFormFlow  {
    return value === 'patients' || value === 'drug-developers' || value === 'ecosystem' || value === 'physicians';
}
