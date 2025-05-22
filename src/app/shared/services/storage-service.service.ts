import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class StorageService {
    public get(key: string): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    }

    public set(key: string, value: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    }

    public remove(key: string): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    }
}