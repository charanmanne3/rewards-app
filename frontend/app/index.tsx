import { Redirect } from "expo-router";

/** Entry route — send users to the tabbed app (avoids legacy duplicate screens). */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
