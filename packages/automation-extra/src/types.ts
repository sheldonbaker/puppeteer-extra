import type * as pw from './types/playwright'
import type * as pptr from './types/puppeteer'

export type SupportedDrivers = 'playwright' | 'puppeteer'

// There's no umbrella type for the launcher in pptr, hence we need to construct it ourselves
// The playwright equivalent is `interface BrowserType<Browser>`
export interface PuppeteerBrowserLauncher {
  /** Attaches Puppeteer to an existing Chromium instance */
  connect(options?: pptr.ConnectOptions): Promise<pptr.Browser>
  /** The default flags that Chromium will be launched with */
  defaultArgs(options?: pptr.ChromeArgOptions): string[]
  /** Path where Puppeteer expects to find bundled Chromium */
  executablePath(): string
  /** The method launches a browser instance with given arguments. The browser will be closed when the parent node.js process is closed. */
  launch(options?: pptr.LaunchOptions): Promise<pptr.Browser>
  /** This methods attaches Puppeteer to an existing Chromium instance. */
  createBrowserFetcher(options?: pptr.FetcherOptions): pptr.BrowserFetcher
}

export type PlaywrightBrowserLauncher = pw.BrowserType<pw.Browser>

export type BrowserLauncher =
  | PuppeteerBrowserLauncher
  | PlaywrightBrowserLauncher

export type Browser = pptr.Browser | pw.Browser

export type PlaywrightBrowsers = 'chromium' | 'firefox' | 'webkit'
export type PuppeteerBrowsers = 'chrome' | 'firefox' // note: chrome !== chromium

export type PlaywrightBrowser =
  | pw.ChromiumBrowser
  | pw.FirefoxBrowser
  | pw.WebKitBrowser

export type ConnectOptions = pptr.ConnectOptions | pw.BrowserTypeConnectOptions
export type LaunchOptions = pptr.LaunchOptions | pw.LaunchOptions

/** Type guard: check if current options are connect options */
export function isConnectOptions(
  options: ConnectOptions | LaunchOptions
): options is ConnectOptions {
  const yup =
    'browserURL' in (options as pptr.ConnectOptions) ||
    'browserWSEndpoint' in (options as pptr.ConnectOptions) ||
    'wsEndpoint' in (options as pw.BrowserTypeConnectOptions)
  return yup
}

// Plugins

import {
  AutomationExtraPlugin,
  LaunchContext,
  PluginLifecycleMethods
} from 'automation-extra-plugin'
import { PuppeteerExtraPlugin } from 'puppeteer-extra-plugin'

export {
  AutomationExtraPlugin,
  PluginLifecycleMethods,
  PuppeteerExtraPlugin,
  LaunchContext
} // Re-export

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp]

// AutomationExtraPlugin
export type PluginMethodNames = keyof PluginLifecycleMethods
export type PluginMethodFn<TName extends PluginMethodNames> = PropType<
  PluginLifecycleMethods,
  TName
>

// PuppeteerExtraPlugin and legacy methods we don't use in the new plugin system
export type LegacyPluginMethodNames =
  | 'onTargetCreated'
  | 'onTargetChanged'
  | 'onTargetDestroyed'
  | 'onClose'
export type LegacyPluginMethodFn<
  TName extends LegacyPluginMethodNames
> = PropType<PuppeteerExtraPlugin, TName>

export type Plugin = AutomationExtraPlugin | PuppeteerExtraPlugin
