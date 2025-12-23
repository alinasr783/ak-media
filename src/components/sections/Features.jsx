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
        <p className="text-muted-foreground">أدوات متكاملة لعيادتك</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard icon={CalendarDays} title="حجز إلكتروني" desc="لينك حجز جاهز للإعلانات" />
        <FeatureCard icon={FileText} title="تنظيم المواعيد" desc="إدارة سهلة لكل الحجوزات" />
        <FeatureCard icon={Receipt} title="متابعة المرضى" desc="تقارير واضحة للحملات" />
        <FeatureCard icon={ShieldCheck} title="أمان وخصوصية" desc="حماية بيانات المرضى" />
        <FeatureCard icon={Stethoscope} title="تقارير مفصلة" desc="إحصائيات الحجوزات والإيرادات" />
        <FeatureCard icon={Smartphone} title="يعمل على الجوال" desc="تصميم متجاوب للهواتف" />
      </div>
    </section>
  )
}

