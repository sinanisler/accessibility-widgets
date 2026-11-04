"use client";

import { Button, Card } from "@/components/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <Card className="mx-auto max-w-md space-y-3">
      <h1 className="text-xl font-bold">حدث خطأ غير متوقع</h1>
      <p className="text-sm text-ink-600">لم تُفقد بياناتك المحفوظة. أعد المحاولة.</p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </Card>
  );
}
