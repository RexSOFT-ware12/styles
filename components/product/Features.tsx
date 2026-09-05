import { Card, CardContent } from "@/components/ui/card";
import { Download, FileCheck, RefreshCcw } from "lucide-react";

export default function Features() {
  const features = [
    { icon: Download, title: "Instant Download", desc: "Files unlock right after payment" },
    { icon: FileCheck, title: "CLO3D Ready", desc: "Comes as a ready-to-open .zprj file" },
    { icon: RefreshCcw, title: "Free Re-downloads", desc: "Get your files again anytime from your account" },
  ];
  return (
    <Card className="mb-16">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">
                  {feature.title}
                </h2>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
