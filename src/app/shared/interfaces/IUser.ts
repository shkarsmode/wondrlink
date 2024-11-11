import { UserRoleEnum } from "./UserRoleEnum";
import { UserTypeEnum } from "./UserTypeEnum";
import { CompanyTypeEnum } from "./company-type.enum";
import { PatientSituationTypeEnum } from "./patient-situation-type.enum";

export interface IUser {
    readonly id: number;
    readonly role: UserRoleEnum;
    readonly password: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone: string;
    readonly location: string;
    readonly avatar: string;
    readonly status: string;
    readonly companyName: string;
    readonly companyType: CompanyTypeEnum | null;
    readonly patientSituationType: PatientSituationTypeEnum | null;
    readonly diseaseCategory: string | null;
    readonly cancerType: string | null;
    readonly diseaseDetails: string | null;
	readonly updatedAt: Date;
    readonly position: string | null;
    readonly function?: string | null;
    readonly isMySelf: 'true' | 'false';
    fullName: string;
    additionalInfo: any;
    type: UserTypeEnum;
}
