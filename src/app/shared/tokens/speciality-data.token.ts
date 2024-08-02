import { InjectionToken } from "@angular/core";
import { ISpecialityData } from "../interfaces/SpecialityData.type";

export const SPECIALITY_DATA = new InjectionToken<ISpecialityData>('specialityData');