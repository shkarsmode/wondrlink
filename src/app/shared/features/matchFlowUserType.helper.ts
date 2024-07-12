import { TUserType } from "src/app/flow/flow.component";
import { TFormFlow } from "../interfaces/TFormFlow";

export function matchFlowUserType(flow: TFormFlow): TUserType {
    if(flow === 'patients') return 'Patient';
    if(flow === 'drug-developers') return 'Drug Developers';
    if(flow === 'ecosystem') return 'Ecosystem';
    return 'Physicians'
}

