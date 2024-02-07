# Glyphx

## Tools

### GrowthBook

How to use GrowthBHook on [RSC](https://docs.growthbook.io/guide/nextjs-and-growthbook#growthbook-on-nextjs-app-router)

```ts
import { GrowthBook } from "@growthbook/growthbook";

const growthbook = new GrowthBook({
  apiHost: "...",
  clientKey: "...",
enableDevMode: true,
trackingCallback: (experiment, result) => {
  // TODO: Use your real analytics tracking system
  console.log("Viewed Experiment", {
    experimentId: experiment.key,
    variationId: result.key,
  });
  },
});

Note: the package imported in react server components is from the node sdk at growthbook/growthbook, while for client components, it is imported from growthbook/growthbook-react.
If you see the following error: "createContext only works in Client Components. Add the "use client" directive at the top of the file to use it. Read more: https://nextjs.org/docs/messages/context-in-server-component" there is a fair chance you have committed this import error


export default async function Home() {
  await growthbook.loadFeatures();

  const isWelcomeBannerOn = growthbook.isOn("welcome-banner-01");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {isWelcomeBannerOn && <h1 className="text-4xl">Welcome!</h1>}
```

How to use GrowthBook on the [Client Side](https://docs.growthbook.io/guide/nextjs-and-growthbook#growthbook-on-nextjs-app-router)

```ts
"use client";

import {
  GrowthBook,
  GrowthBookProvider,
  useFeatureIsOn,
} from "@growthbook/growthbook-react";
import { useEffect } from "react";

const growthbook = new GrowthBook({
  apiHost: "http://localhost:3100",
  clientKey: "sdk-DxCjpOJmwJaWck",
 enableDevMode: true,
 trackingCallback: (experiment, result) => {
   // TODO: Use your real analytics tracking system
   console.log("Viewed Experiment", {
     experimentId: experiment.key,
     variationId: result.key,
   });
  },
});

const WelcomeBanner = () => {
  const enabled = useFeatureIsOn("welcome-banner");
  if (!enabled) return null;
  return <h1 className="text-4xl">Welcome!</h1>;
};

const WelcomeBannerWithGB = () => {
  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.loadFeatures();
  }, []);

  return (
    <GrowthBookProvider growthbook={growthbook}>
      <WelcomeBanner />
    </GrowthBookProvider>
  );
};

export default WelcomeBannerWithGB;
```
