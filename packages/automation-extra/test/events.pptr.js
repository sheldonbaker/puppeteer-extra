'use strict'

const test = require('ava')

const PUPPETEER_ARGS = ['--no-sandbox', '--disable-setuid-sandbox']

const vanillaPuppeteer = require('puppeteer')
const { addExtra } = require('automation-extra')

const factory = (testConnect = false) => async t => {
  const PLUGIN_EVENTS = []

  let browserServer = null
  let wsEndpoint = null
  if (testConnect) {
    browserServer = await vanillaPuppeteer.launch()
    wsEndpoint = browserServer.wsEndpoint()
  }

  const launcher = addExtra(vanillaPuppeteer)
  const { AutomationExtraPlugin } = require('automation-extra-plugin')
  const pluginName = 'hello-world'

  class Plugin extends AutomationExtraPlugin {
    constructor(opts = {}) {
      super(opts)
    }
    get name() {
      return pluginName
    }

    onPluginRegistered() {
      PLUGIN_EVENTS.push('onPluginRegistered')
    }
    beforeLaunch() {
      PLUGIN_EVENTS.push('beforeLaunch')
    }
    afterLaunch() {
      PLUGIN_EVENTS.push('afterLaunch')
    }
    beforeConnect() {
      PLUGIN_EVENTS.push('beforeConnect')
    }
    afterConnect() {
      PLUGIN_EVENTS.push('afterConnect')
    }
    onBrowser() {
      PLUGIN_EVENTS.push('onBrowser')
    }
    beforeContext() {
      PLUGIN_EVENTS.push('beforeContext')
    }
    onContextCreated() {
      PLUGIN_EVENTS.push('onContextCreated')
    }
    onPageCreated() {
      PLUGIN_EVENTS.push('onPageCreated')
    }
    onPageClose() {
      PLUGIN_EVENTS.push('onPageClose')
    }
    onContextClose() {
      PLUGIN_EVENTS.push('onContextClose')
    }
    onDisconnected() {
      PLUGIN_EVENTS.push('onDisconnected')
    }
  }

  const instance = new Plugin()
  launcher.use(instance)
  t.true(PLUGIN_EVENTS.includes('onPluginRegistered'))

  let browser
  if (testConnect) {
    browser = await launcher.connect({ browserWSEndpoint: wsEndpoint })
    t.true(PLUGIN_EVENTS.includes('beforeConnect'))
    t.true(PLUGIN_EVENTS.includes('afterConnect'))
    t.true(!PLUGIN_EVENTS.includes('beforeLaunch'))
    t.true(!PLUGIN_EVENTS.includes('afterLaunch'))
  } else {
    browser = await launcher.launch({ args: PUPPETEER_ARGS })
    t.true(PLUGIN_EVENTS.includes('beforeLaunch'))
    t.true(PLUGIN_EVENTS.includes('afterLaunch'))
    t.true(!PLUGIN_EVENTS.includes('beforeConnect'))
    t.true(!PLUGIN_EVENTS.includes('afterConnect'))
  }

  t.true(PLUGIN_EVENTS.includes('onBrowser'))

  const page = await browser.newPage().catch(console.log)
  t.true(PLUGIN_EVENTS.includes('onPageCreated'))

  await page.close()
  t.true(PLUGIN_EVENTS.includes('onPageClose'))

  await browser.close().catch(console.log)
  t.true(PLUGIN_EVENTS.includes('onDisconnected'))

  if (browserServer) {
    await browserServer.close()
  }
}

test('will bind launched browser events to plugins', factory(false))

test('will bind connected browser events to plugins', factory(true))
