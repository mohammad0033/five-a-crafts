import { Inject, Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { join } from 'node:path'; // Use 'node:path' for modern Node.js
import { readFileSync } from 'node:fs'; // Use 'node:fs'
import { Observable, of } from 'rxjs';
import { SERVER_ASSETS_PATH } from '../tokens/server-assets-path.token'; // We'll create this token next

@Injectable()
export class TranslateServerLoader implements TranslateLoader {
  // Define prefix and suffix as readonly class properties with their default values.
  // They are no longer constructor parameters that DI tries to resolve.
  private prefix: string = 'i18n';
  private suffix: string = '.json';
  constructor(
    // Injects the base path to your built browser assets (e.g., dist/five-a-crafts/browser)
    @Inject(SERVER_ASSETS_PATH) private assetsPath: string
  ) {}

  public getTranslation(lang: string): Observable<any> {
    // Construct the full path to the translation file on the server's file system
    const filePath = join(this.assetsPath, this.prefix, `${lang}${this.suffix}`);
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      // console.log(`[TranslateServerLoader] Loaded translations for "${lang}" from: ${filePath}`);
      return of(data);
    } catch (e) {
      console.error(`[TranslateServerLoader] ERROR: Could not read translation file for lang "${lang}" at "${filePath}". Error: ${e}`);
      return of({}); // Return empty object on error to prevent SSR crash and allow fallback
    }
  }
}
