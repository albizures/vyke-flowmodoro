import { query, selectIn } from "@vyke/dom";
import { unwrap } from "@vyke/results";
import { hide, show } from "./html";

type AlertArgs = {
  alertContainer: HTMLDivElement;
  onContinue: () => void;
};

export function openAlert(args: AlertArgs) {
  const { alertContainer, onContinue } = args;

  show(alertContainer);

  const [cancelBtn, continueBtn] = unwrap(
    selectIn(
      alertContainer,
      query<HTMLButtonElement>(".cancel-btn"),
      query<HTMLButtonElement>(".continue-btn")
    )
  );

  cancelBtn.onclick = () => {
    hide(alertContainer);
    cancelBtn.onclick = null;
    continueBtn.onclick = null;
  };

  continueBtn.onclick = () => {
    hide(alertContainer);
    onContinue();
    cancelBtn.onclick = null;
    continueBtn.onclick = null;
  };
}
