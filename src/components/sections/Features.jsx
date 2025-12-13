import { Card, CardContent, CardHeader } from "../ui/card"
import { CalendarDays, FileText, Receipt, ShieldCheck, Stethoscope, Smartphone } from "lucide-react"

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <Card className="bg-card/60 backdrop-blur border-border/60">
      <CardHeader className="flex items-center gap-3">
        <div className="size-10 rounded-[calc(var(--radius)-4px)] bg-gradient-to-br from-primary/15 to-secondary/15 text-primary grid place-items-center">
          <Icon className="size-5" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  )
}

export default function Features() {
  return (
    <section id="features" className="container py-16">
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-3xl font-bold">مميزات قوية</h2>
        <p className="text-muted-foreground">أدوات مرنة تغطي دورة حياة الزيارة بالكامل.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard icon={CalendarDays} title="جدولة مواعيد ذكية" desc="لوحة مواعيد تفاعلية لإدارة الحجز والاستقبال بسرعة ودقة." />
        <FeatureCard icon={FileText} title="ملف طبي إلكتروني EMR" desc="حفظ التاريخ المرضي والمرفقات والملاحظات لكل مريض بشكل منظم." />
        <FeatureCard icon={Receipt} title="فواتير وإيرادات" desc="إدارة الفواتير وتتبع الإيرادات مع تقارير مالية واضحة." />
        <FeatureCard icon={ShieldCheck} title="أمان وخصوصية" desc="تشفير وحماية بيانات المرضى وفق أعلى المعايير." />
        <FeatureCard icon={Stethoscope} title="روشتة PDF عبر واتساب" desc="توليد روشتة تلقائياً وطباعتها مع امكانية ارسال محتوياتها للمريض عبر واتساب." />
        <FeatureCard icon={Smartphone} title="واجهة تدعم الجوال" desc="تصميم متجاوب يعمل بسلاسة على الهواتف." />
      </div>
    </section>
  )
}

