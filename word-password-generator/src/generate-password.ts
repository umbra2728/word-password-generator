import { Clipboard, Toast, closeMainWindow, getPreferenceValues, showToast } from "@raycast/api";

import { buildPassword } from "./generator/build-password";
import { parsePreferences, type RawPreferences } from "./generator/preferences";

export default async function Command() {
  try {
    const preferences = getPreferenceValues<RawPreferences>();
    const config = parsePreferences(preferences);
    const result = buildPassword(config);

    await Clipboard.copy(result.password);
    await closeMainWindow();
    await showToast({
      style: Toast.Style.Success,
      title: `Copied password (${result.length} chars)`,
      message: result.password,
    });
  } catch (error) {
    await closeMainWindow();
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not generate password",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
