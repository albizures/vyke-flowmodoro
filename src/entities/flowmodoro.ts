import requestAnimationFrames from "request-animation-frames";
import { hide, setStyleVar, show } from "./html";
import { fromMilliToTime, zeroPad, type TimeValues } from "./time";
import {
  startTime,
  breakTime,
  breakTimeRatio,
  status,
  autoStartBreak,
  autoStartFocus,
} from "./value";
import { unwrap } from "@vyke/results";
import { query, select, selectIn } from "@vyke/dom";

type Elements = {
  settingsBtn: HTMLButtonElement;
  settingsPanel: HTMLDivElement;
  mainContainer: HTMLDivElement;
  titleContainer: HTMLDivElement;
  closeSettingsBtn: HTMLDivElement;
  breakTimeRatioInput: HTMLInputElement;
  autoStartBreakToggle: HTMLInputElement;
  autoStartFocusToggle: HTMLInputElement;
  alertContainer: HTMLDivElement;
  minutes: HTMLElement;
  seconds: HTMLElement;
  millis: HTMLElement;
  playBtn: HTMLButtonElement;
  stopBtn: HTMLButtonElement;
  resetBtn: HTMLButtonElement;
  pipBtn: HTMLButtonElement;
  breakTimeLabel: HTMLSpanElement;
  inBreakLabel: HTMLSpanElement;
  inFocusLabel: HTMLSpanElement;
};

type FlowmodoroArgs = {
  elements: Elements;
  inPip: boolean;
};

export function init(args: FlowmodoroArgs) {
  const { elements, inPip } = args;
  const {
    mainContainer,
    titleContainer,
    settingsBtn,
    settingsPanel,
    closeSettingsBtn,
    breakTimeRatioInput,
    autoStartBreakToggle,
    autoStartFocusToggle,
    minutes,
    seconds,
    millis,
    playBtn,
    stopBtn,
    resetBtn,
    pipBtn,
    breakTimeLabel,
    inBreakLabel,
    inFocusLabel,
    alertContainer,
  } = elements;

  if (!inPip && "documentPictureInPicture" in window) {
    show(pipBtn);
    pipBtn.onclick = () =>
      openInPip({
        elements: { mainContainer, titleContainer },
      });
  }

  breakTimeRatioInput.value = String(breakTimeRatio.value);
  breakTimeRatioInput.onchange = () => {
    const value = Number(breakTimeRatioInput.value);
    if (Number.isNaN(value)) {
      breakTimeRatioInput.value = String(breakTimeRatio.value);
    } else {
      breakTimeRatio.value = value;
    }
  };

  autoStartBreakToggle.checked = autoStartBreak.value;
  autoStartBreakToggle.onchange = () => {
    autoStartBreak.value = autoStartBreakToggle.checked;
  };

  autoStartFocusToggle.checked = autoStartFocus.value;
  autoStartFocusToggle.onchange = () => {
    autoStartFocus.value = autoStartFocusToggle.checked;
  };

  const cssNextVar = "--next";
  const cssPrevVar = "--prev";

  startTime.value;

  if (status.value === "focus") {
    const initialDelta = fromMilliToTime(Date.now() - startTime.value);
    if (initialDelta.minutes > 365) {
      status.value = "stopped-break";
      breakTime.value = 0;
    }
  }

  if (status.value === "focus") {
    run();
    showStopBtn();
    showInFocus();
  }

  if (status.value === "break") {
    run();
    showStopBtn();
    showInBreak();
  }

  if (status.value === "stopped-focus") {
    showInBreak();
    updateBreakTimeLabel(breakTime.value);
    update(fromMilliToTime(breakTime.value));
  }

  if (status.value === "stopped-break") {
    showInFocus();
  }

  function showPlayBtn() {
    show(playBtn);
    hide(stopBtn);
  }

  function showStopBtn() {
    show(stopBtn);
    hide(playBtn);
  }

  function showInFocus() {
    show(inFocusLabel);
    hide(inBreakLabel);
  }

  function showInBreak() {
    show(inBreakLabel);
    hide(inFocusLabel);
  }

  playBtn.onclick = () => {
    if (status.value === "stopped-break") {
      startFocus();
    } else {
      startBreak();
    }
  };

  function startBreak() {
    startTime.value = Date.now();
    status.value = "break";

    showInBreak();
    showStopBtn();
    run();
  }

  function startFocus() {
    startTime.value = Date.now();
    breakTime.value = 0;
    status.value = "focus";

    showInFocus();
    showStopBtn();
    run();
  }

  settingsBtn.onclick = () => {
    show(settingsPanel);
  };

  closeSettingsBtn.onclick = () => {
    hide(settingsPanel);
  };

  resetBtn.onclick = () => {
    if (status.value === "focus") {
      status.value = "stopped-break";
      breakTime.value = 0;
      showPlayBtn();
    }
    if (status.value === "break") {
      status.value = "stopped-focus";
    }
  };

  function stopFocus() {
    const delta = Date.now() - startTime.value;
    const nextBreakTime = delta / breakTimeRatio.value;
    breakTime.value = nextBreakTime;

    if (autoStartBreak.value) {
      startBreak();
    } else {
      update(fromMilliToTime(nextBreakTime));
      status.value = "stopped-focus";
      showPlayBtn();
    }
    showInBreak();
  }

  stopBtn.onclick = () => {
    if (status.value === "focus") {
      const delta = Date.now() - startTime.value;
      const nextBreakTime = delta / breakTimeRatio.value;

      if (nextBreakTime < 60 * 1000) {
        import("../entities/alert").then((module) => {
          module.openAlert({
            alertContainer,
            onContinue: stopFocus,
          });
        });
      } else {
        stopFocus();
      }
    } else if (status.value === "break") {
      status.value = "stopped-break";
      showInFocus();
      showPlayBtn();
    }
  };

  async function run() {
    for await (const _timestamp of requestAnimationFrames()) {
      let delta = 0;
      if (status.value === "break") {
        delta = startTime.value + breakTime.value - Date.now();

        if (delta < 0) {
          if (autoStartFocus.value) {
            startFocus();
          } else {
            status.value = "stopped-break";
            update(fromMilliToTime(0));
            showPlayBtn();
          }
          break;
        }
      } else if (status.value === "focus") {
        delta = Date.now() - startTime.value;

        updateBreakTimeLabel(delta);
      } else {
        break;
      }

      update(fromMilliToTime(delta));
    }
  }

  function getCurrentBreakTime(delta: number) {
    return delta / breakTimeRatio.value;
  }

  function updateBreakTimeLabel(delta: number) {
    const values = fromMilliToTime(getCurrentBreakTime(delta));
    breakTimeLabel.textContent = `${zeroPad(values.minutes)}m${zeroPad(
      values.seconds
    )}s`;
  }

  function updateNum(el: HTMLElement, next: number) {
    const prev = Number(el.dataset.prev);
    if (prev !== next) {
      setStyleVar(el, cssNextVar, `"${zeroPad(next)}"`);
      if (!Number.isNaN(prev)) {
        setStyleVar(el, cssPrevVar, `"${zeroPad(prev)}"`);
      }

      el.classList.toggle("odd");
      el.dataset.prev = `${next}`;
    } else {
      el.dataset.prev = `${next}`;
    }
  }

  function update(values: TimeValues) {
    updateNum(minutes, values.minutes);
    updateNum(seconds, values.seconds);
    millis.textContent = `${zeroPad(values.millis)}`;
  }
}

type OpenInPipArgs = {
  elements: {
    mainContainer: HTMLDivElement;
    titleContainer: HTMLDivElement;
  };
};

async function openInPip(args: OpenInPipArgs) {
  const { elements } = args;
  const { mainContainer, titleContainer } = elements;
  // Open a Picture-in-Picture window.
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width: mainContainer.clientWidth,
    height: mainContainer.clientHeight,
  });

  // Add pagehide listener to handle the case of the pip window being closed using the browser X button
  pipWindow.addEventListener("pagehide", (_event) => {
    titleContainer.after(mainContainer);
    initIn(document.body, false);
  });

  // Copy style sheets over from the initial document
  // so that the player looks the same.
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules]
        .map((rule) => rule.cssText)
        .join("");
      const style = document.createElement("style");

      style.textContent = cssRules;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.type = styleSheet.type;
      link.media = styleSheet.media.toString();
      link.href = styleSheet.href!;
      pipWindow.document.head.appendChild(link);
    }
  });

  // Move the player to the Picture-in-Picture window.
  pipWindow.document.body.append(mainContainer);
  pipWindow.document.documentElement.dataset.theme =
    document.documentElement.dataset.theme;
  initIn(pipWindow.document.body, true);
}

export function initIn(element: HTMLElement, inPip: boolean) {
  const [pipBtn, mainContainer] = unwrap(
    selectIn(
      element,
      query<HTMLButtonElement>(".pip-btn"),
      query<HTMLDivElement>(".main-container")
    )
  );

  const [titleContainer] = unwrap(
    select(query<HTMLDivElement>(".title-container"))
  );

  const [
    settingsBtn,
    settingsPanel,
    closeSettingsBtn,
    breakTimeRatioInput,
    autoStartBreakToggle,
    autoStartFocusToggle,
  ] = unwrap(
    selectIn(
      element,
      query<HTMLButtonElement>(".settings-btn"),
      query<HTMLDivElement>(".settings-panel"),
      query<HTMLDivElement>(".close-settings-btn"),
      query<HTMLInputElement>(".break-time-ratio-input"),
      query<HTMLInputElement>(".auto-start-break-toggle"),
      query<HTMLInputElement>(".auto-start-focus-toggle")
    )
  );

  const [
    minutes,
    seconds,
    millis,
    playBtn,
    stopBtn,
    resetBtn,
    breakTimeLabel,
    inBreakLabel,
    inFocusLabel,
  ] = unwrap(
    selectIn(
      element,
      query<HTMLElement>(".value-minutes"),
      query<HTMLElement>(".value-seconds"),
      query<HTMLElement>(".value-millis"),
      query<HTMLButtonElement>(".play-btn"),
      query<HTMLButtonElement>(".stop-btn"),
      query<HTMLButtonElement>(".reset-btn"),
      query<HTMLSpanElement>(".break-time-label"),
      query<HTMLSpanElement>(".in-break-label"),
      query<HTMLSpanElement>(".in-focus-label")
    )
  );

  const [alertContainer] = unwrap(
    selectIn(element, query<HTMLDivElement>(".alert-container"))
  );

  init({
    inPip,
    elements: {
      titleContainer,
      mainContainer,
      minutes,
      seconds,
      millis,
      playBtn,
      stopBtn,
      resetBtn,
      breakTimeLabel,
      inBreakLabel,
      inFocusLabel,
      alertContainer,
      settingsBtn,
      settingsPanel,
      closeSettingsBtn,
      breakTimeRatioInput,
      autoStartBreakToggle,
      autoStartFocusToggle,
      pipBtn,
    },
  });
}
