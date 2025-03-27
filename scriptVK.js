// ==UserScript==
// @name         VK scirt download
// @version      1
// @description  download video from vk in 1 click
// @author       shalynishka
// @match        https://vk.com/*
// @match        https://vk.ru/*
// @match        https://vkvideo.ru/*
// @run-at       document-idle
// ==/UserScript==

/**
 * VK Video Downloader
 * dev by @shalynishka
 */

class VKVideoDownloader {
  constructor() {
    this.lastUrl = location.href;
    this.checkerHasBeenCalled = false;
    this.showPanelHasBeenCalled = false;
    this.initObserver();
  }

  initObserver() {
    new MutationObserver(() => this.handleUrlChange()).observe(document.body, {
      subtree: true,
      childList: true,
    });
  }

  handleUrlChange() {
    if (location.href !== this.lastUrl) {
      this.lastUrl = location.href;
      this.checkerHasBeenCalled = false;
      this.showPanelHasBeenCalled = false;
      this.removeExistingPanel();
    }

    if (this.shouldCheckForVideo() && !this.checkerHasBeenCalled) {
      this.startVideoChecker();
    }
  }

  shouldCheckForVideo() {
    return (
      /z=(?:video|clip)/.test(location.search) ||
      /^\/(?:video|clip)[^\/s]+$/.test(location.pathname) ||
      /^\/playlist\/[\d-]+/.test(location.pathname)
    );
  }

  removeExistingPanel() {
    const oldPanel = document.querySelector("#vkVideoDownloaderPanel");
    if (oldPanel) oldPanel.remove();
  }

  startVideoChecker() {
    this.checkerHasBeenCalled = true;
    const checkerInterval = setInterval(() => {
      if (this.showPanelHasBeenCalled) {
        clearInterval(checkerInterval);
        return;
      }

      if (document.querySelector("#video_player video")) {
        this.showPanelHasBeenCalled = true;
        clearInterval(checkerInterval);
        this.createDownloadPanel();
      } else if (document.querySelector("#video_player iframe")) {
        this.showPanelHasBeenCalled = true;
        clearInterval(checkerInterval);
        this.showExternalVideoWarning();
      }
    }, 500);
  }

  createDownloadPanel() {
    const videoTitleElement = document.querySelector('.vkitHeader__header--t1vzO');
    if (!videoTitleElement) return;

    const playerVars = this.getPlayerVars();
    if (!playerVars) return;

    const videoSources = this.getAvailableVideoSources(playerVars);
    if (Object.keys(videoSources).length === 0) return;

    const downloadContainer = this.createDownloadContainer();
    const qualitySelect = this.createQualitySelect(videoSources);
    const downloadButton = this.createDownloadButton(qualitySelect);

    downloadContainer.appendChild(qualitySelect);
    downloadContainer.appendChild(downloadButton);
    videoTitleElement.appendChild(downloadContainer);
  }

  getPlayerVars() {
    const supportedWindow = typeof unsafeWindow === "undefined" ? window : unsafeWindow;
    return supportedWindow.mvcur?.player?.vars || supportedWindow.cur?.videoInlinePlayer?.vars;
  }

  getAvailableVideoSources(playerVars) {
    const qualities = {
      "2160p": playerVars.url2160,
      "1440p": playerVars.url1440,
      "1080p": playerVars.url1080,
      "720p": playerVars.url720,
      "480p": playerVars.url480,
      "360p": playerVars.url360,
      "240p": playerVars.url240,
      "144p": playerVars.url144,
    };

    return Object.fromEntries(
      Object.entries(qualities).filter(([_, url]) => typeof url !== "undefined")
    );
  }

  createDownloadContainer() {
    const container = document.createElement("div");
    container.id = "vkVideoDownloaderPanel";
    Object.assign(container.style, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginLeft: "10px",
    });

    const label = document.createElement("span");
    label.innerText = "Скачать:";
    label.style.color = "#818c99";
    container.appendChild(label);

    return container;
  }

  createQualitySelect(videoSources) {
    const select = document.createElement("select");
    Object.assign(select.style, {
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #d3d9de",
      backgroundColor: "#fff",
      color: "#000",
    });

    Object.entries(videoSources).forEach(([quality, url]) => {
      const option = document.createElement("option");
      option.value = url;
      option.text = quality;
      select.appendChild(option);
    });

    return select;
  }

  createDownloadButton(qualitySelect) {
    const button = document.createElement("button");
    button.innerText = "↓";
    Object.assign(button.style, {
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#5181b8",
      color: "#fff",
      cursor: "pointer",
    });

    button.onclick = () => {
      if (qualitySelect.value) {
        window.open(qualitySelect.value, '_blank');
      }
    };

    return button;
  }

  showExternalVideoWarning() {
    const panel = document.createElement("div");
    panel.id = "vkVideoDownloaderPanel";
    Object.assign(panel.style, {
      position: "fixed",
      left: "16px",
      bottom: "16px",
      zIndex: "2147483647",
      padding: "4px",
      color: "#fff",
      backgroundColor: "#07f",
      border: "1px solid #fff",
    });

    panel.innerText = "Видео со стороннего сайта. Воспользуйтесь инструментами для скачивания с него.";
    document.body.appendChild(panel);
  }
}


new VKVideoDownloader();
