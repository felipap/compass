import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  Menu,
  MenuItemConstructorOptions,
  Tray,
  app,
  nativeImage,
} from 'electron'
import path from 'path'
import { getState, store } from './store'
import { onClickCheckForUpdates, updaterState } from './updater'
import { mainWindow, prefWindow, widgetWindow } from './windows'

const SHOW_THINGS_COPY = process.env.SHOW_THINGS_COPY || false

dayjs.extend(relativeTime)

export function createTray() {
  // For a real app, you'd use a proper icon file
  // tray = new Tray(path.join(__dirname, "../../icon.png"))

  let iconPath
  if (app.isPackaged) {
    iconPath = path.join(process.resourcesPath, 'images', 'xxxTemplate.png')
  } else {
    iconPath = path.join(__dirname, '../../images', 'xxxTemplate.png')
  }
  // iconPath = path.join(__dirname, '../../images', 'whtaever')

  const icon = nativeImage.createFromPath(iconPath)
  // if you want to resize it, be careful, it creates a copy
  const trayIcon = icon.resize({ width: 16 })
  // here is the important part (has to be set on the resized version)
  trayIcon.setTemplateImage(true)

  const tray = new Tray(trayIcon)

  function getTrayMenu() {
    const state = getState()

    let template: MenuItemConstructorOptions[] = [
      {
        label: 'Show Widget',
        click: () => {
          widgetWindow!.show()
        },
      },
      {
        label: 'Keep on top',
        type: 'checkbox',
        checked: state.isWidgetPinned,
        click: () => {
          store.setState({ isWidgetPinned: !state.isWidgetPinned })
        },
      },
    ]

    template = template.concat([
      {
        label: 'Settings...',
        accelerator: 'CmdOrCtrl+,',
        click: () => {
          prefWindow!.show()
        },
      },
      { type: 'separator' },
      {
        label: `Version ${app.getVersion()}${app.isPackaged ? '' : ' (dev)'}`,
        enabled: false,
      },
    ])

    if (updaterState === 'downloaded') {
      template.push({
        label: 'Quit & install update',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit()
        },
      })
    } else {
      template.push({
        enabled: updaterState !== 'downloading',
        label:
          updaterState === 'downloading'
            ? 'Downloading update...'
            : 'Check for updates...',
        click: async () => {
          await onClickCheckForUpdates()
        },
      })
      template.push({
        label: 'Quit',
        sublabel: '⌘Q',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          // app.isQuitting = true // Do we need this?
          app.quit()
        },
      })
    }

    return template.filter(isTruthy)
  }

  function updateTrayMenu() {}

  tray.on('click', () => {
    if (SHOW_THINGS_COPY) {
      if (mainWindow!.isVisible()) {
        mainWindow!.hide()
      } else {
        mainWindow!.show()
      }
    } else {
      widgetWindow!.show()
    }
  })

  let lastTrayIconBounds: Electron.Rectangle | null = null

  tray.on('click', (event, bounds) => {
    const contextMenu = Menu.buildFromTemplate(getTrayMenu())
    tray.popUpContextMenu(contextMenu)
    lastTrayIconBounds = bounds

    // contextMenu.popup()
  })

  // Set initial menu
  updateTrayMenu()

  setInterval(() => {
    updateTrayMenu()
  }, 2000)

  // Optional: Show window when clicking the tray icon
  // tray.on("click", () => {
  //   win.isVisible() ? win.hide() : win.show()
  // })

  // Refresh the menu every minute to show updated status
  // setInterval(updateTrayMenu, 60000)

  // Click event (show/hide window)
  // tray.on("click", () => {
  //   if (win?.isVisible()) {
  //     win.hide()
  //   } else {
  //     win?.show()
  //   }
  // })

  return tray
}

type Falsy = false | 0 | '' | null | undefined
const isTruthy = <T>(x: T | Falsy): x is T => !!x
