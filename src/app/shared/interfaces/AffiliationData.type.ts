import { TFormFlow } from "./TFormFlow";

export type IAffiliationData = {
    [formFlow in TFormFlow]: string[];
};
