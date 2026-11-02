import { Composition } from "remotion";

export const RemotionRoot = () => {
  return (
    <Composition
      id="Demo"
      component={() => <div>Hello Remotion!</div>}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
