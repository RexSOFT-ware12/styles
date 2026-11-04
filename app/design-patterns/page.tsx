import SvgTraceTool from "@/components/design-patterns/SvgTraceTool";

export default function DesignPatternsPage() {
  return (
    <div className="bg-background px-4 py-8 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-18 space-y-3">
        <h1 className="text-primary leading-tighter text-4xl font-semibold tracking-tight text-balance lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
          Design Patterns
        </h1>
        <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg">
          Vector pattern artwork, traced to clean SVG from the original
          artwork — each one downloads as a ready-to-use .zip, same as every
          other digital product.
        </p>
      </div>
      <SvgTraceTool />
    </div>
  );
}
